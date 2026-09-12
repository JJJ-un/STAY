package com.stay.backend.infra.sse;

import com.stay.backend.domain.stock.dto.StockResponse;
import com.stay.backend.domain.stock.entity.Stock;
import com.stay.backend.domain.stock.repository.StockRepository;
import com.stay.backend.domain.stock.storage.RealtimePriceStorage;
import com.stay.backend.infra.kis.KisStockService;
import com.stay.backend.infra.kis.dto.RealtimeStockPrice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 한국투자증권 실시간 시세 수신 및 SSE 브로드캐스팅 & DB 동기화 컴포넌트
 * - 1순위: 웹소켓 인메모리 저장소(RealtimePriceStorage) 시세를 활용하여 외부 REST API 호출 차단
 * - 2순위 (폴백): 메모리에 시세가 없을 때만 KIS REST API 단건 호출
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockPriceBroadcaster {

    private final SseEmitterManager sseEmitterManager;
    private final KisStockService kisStockService;
    private final StockRepository stockRepository;
    private final RealtimePriceStorage realtimePriceStorage;

    /**
     * 5초마다 해외 반도체 종목 실제 시세를 조회하여 DB 갱신 및 화면 스트리밍 전송
     * (접속 중인 클라이언트가 없을 때는 리소스 절약을 위해 실행 스킵)
     */
    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void broadcastStockPrices() {
        int clientCount = sseEmitterManager.getConnectedClientCount();
        if (clientCount == 0) {
            return;
        }

        List<Stock> stocks = stockRepository.findAll();
        if (stocks.isEmpty()) {
            return;
        }

        List<StockResponse> updatedStockResponses = new ArrayList<>();

        for (Stock stock : stocks) {
            try {
                String ticker = stock.getTicker();

                // 1. [웹소켓 인메모리 우선] 메모리 캐시에 최신 체결가가 있으면 REST 호출 0회 생략
                RealtimeStockPrice realtimePrice = realtimePriceStorage.getLatestPrice(ticker)
                        .orElseGet(() -> {
                            // 2. [폴백] 메모리에 없을 때만 1회성 REST API 호출
                            log.debug("소켓 메모리 시세 부재로 REST API 폴백: ticker={}", ticker);
                            RealtimeStockPrice fallbackPrice = kisStockService.getRealtimePrice(ticker);
                            realtimePriceStorage.updatePrice(ticker, fallbackPrice);
                            return fallbackPrice;
                        });

                // DB 엔티티 실시간 체결가/변동/등락/거래량 동기화
                stock.updatePriceAndVolume(
                        realtimePrice.currentPrice(),
                        realtimePrice.changePrice(),
                        realtimePrice.changeRate(),
                        realtimePrice.volume()
                );

                updatedStockResponses.add(StockResponse.from(stock));
            } catch (Exception e) {
                log.warn("종목 시세 갱신 실패 (스킵): ticker={}, error={}", stock.getTicker(), e.getMessage());
            }
        }

        // 연결된 모든 프론트엔드 화면으로 실시간 시세 일괄 푸시
        if (!updatedStockResponses.isEmpty()) {
            sseEmitterManager.broadcast("STOCK_PRICE_UPDATE", updatedStockResponses);
            log.debug("SSE 시세 브로드캐스팅 완료: 전송 종목 수={}, 수신 클라이언트 수={}",
                    updatedStockResponses.size(), clientCount);
        }
    }
}
