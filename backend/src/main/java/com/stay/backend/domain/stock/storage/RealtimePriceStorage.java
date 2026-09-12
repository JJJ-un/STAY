package com.stay.backend.domain.stock.storage;

import com.stay.backend.infra.kis.dto.RealtimeStockPrice;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 실시간 주가 인메모리 고속 캐시 저장소
 * - 웹소켓 수신 스레드와 스케줄러/조회 스레드 간의 완전한 락-프리(Lock-Free) 동시성 지원
 * - 생산자-소비자 디커플링(Producer-Consumer Decoupling)을 통해 외부 REST API 호출 억제
 */
@Slf4j
@Component
public class RealtimePriceStorage {

    private final Map<String, RealtimeStockPrice> priceCache = new ConcurrentHashMap<>();

    /**
     * 웹소켓 체결 데이터 수신 시 최신 시세 덮어쓰기 (O(1))
     */
    public void updatePrice(String ticker, RealtimeStockPrice price) {
        if (ticker == null || ticker.isBlank() || price == null) {
            return;
        }
        String normalizedTicker = ticker.trim().toUpperCase();
        priceCache.put(normalizedTicker, price);
        log.trace("[RealtimePriceStorage] 최신 시세 갱신: ticker={}, price={}", normalizedTicker, price.currentPrice());
    }

    /**
     * 종목별 최신 실시간 시세 스냅샷 조회 (O(1))
     */
    public Optional<RealtimeStockPrice> getLatestPrice(String ticker) {
        if (ticker == null || ticker.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(priceCache.get(ticker.trim().toUpperCase()));
    }

    /**
     * 종목별 최신 현재가(BigDecimal) 단건 조회
     */
    public Optional<BigDecimal> getLatestCurrentPrice(String ticker) {
        return getLatestPrice(ticker).map(RealtimeStockPrice::currentPrice);
    }

    /**
     * 캐시 크기 (현재 추적 중인 종목 수)
     */
    public int size() {
        return priceCache.size();
    }

    /**
     * 저장소 비우기 (테스트 및 서버 리셋용)
     */
    public void clear() {
        priceCache.clear();
    }
}
