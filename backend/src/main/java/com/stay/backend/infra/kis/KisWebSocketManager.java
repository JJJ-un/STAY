package com.stay.backend.infra.kis;

import com.stay.backend.domain.stock.entity.Stock;
import com.stay.backend.domain.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 한국투자증권 실시간 웹소켓 세션 수립, 8대(및 확장) 종목 체결 구독, 자동 재연결 총괄 매니저
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KisWebSocketManager {

    private final KisAuthManager kisAuthManager;
    private final KisWebSocketHandler kisWebSocketHandler;
    private final StockRepository stockRepository;

    @Value("${koreainvest.api.websocket-url:ws://ops.koreainvestment.com:21000}")
    private String wsUrl;

    private WebSocketSession currentSession;
    private boolean isConnecting = false;

    /**
     * 1. 스프링 서버 기동 완료 시 비동기로 한투 웹소켓 연결 시작
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        CompletableFuture.runAsync(this::connectAndSubscribe);
    }

    /**
     * 2. 한투 웹소켓 연결 수립 및 DB 종목 일괄 실시간 체결 구독
     */
    public synchronized void connectAndSubscribe() {
        if (currentSession != null && currentSession.isOpen()) {
            return;
        }
        if (isConnecting) {
            return;
        }

        isConnecting = true;
        try {
            log.info("한국투자증권(KIS) 실시간 웹소켓 연결 시도: wsUrl={}", wsUrl);

            // 1) 웹소켓 접속키(Approval Key) 발급
            String approvalKey = kisAuthManager.getWebSocketApprovalKey();
            if (approvalKey == null || approvalKey.isBlank()) {
                log.warn("한투 웹소켓 Approval Key 발급 실패로 연결을 보류합니다.");
                return;
            }

            // 2) 소켓 연결 수립
            StandardWebSocketClient client = new StandardWebSocketClient();
            this.currentSession = client.execute(kisWebSocketHandler, wsUrl).get();
            log.info("한투 실시간 웹소켓 연결 수립 완료: sessionId={}", currentSession.getId());

            // 3) DB에 등록된 모든 종목 실시간 체결(HDFSCNT0) 동적 구독 등록
            subscribeAllStocks(currentSession, approvalKey);

        } catch (Exception e) {
            log.error("한투 실시간 웹소켓 연결/구독 실패: {}", e.getMessage());
            this.currentSession = null;
        } finally {
            isConnecting = false;
        }
    }

    /**
     * 3. DB에 등록된 모든 종목(8개든 80개든) 실시간 체결 일괄 구독 등록
     */
    private void subscribeAllStocks(WebSocketSession session, String approvalKey) {
        List<Stock> stocks = stockRepository.findAll();
        if (stocks.isEmpty()) {
            log.warn("DB에 등록된 종목이 없어 한투 웹소켓 구독을 건너뜁니다.");
            return;
        }

        log.info("DB 등록 종목 총 {}개 한투 웹소켓 실시간 체결(HDFSCNT0) 구독 등록 시작", stocks.size());

        for (Stock stock : stocks) {
            try {
                String trKey = buildTrKey(stock.getTicker());
                String subscribeJson = buildSubscribeJson(approvalKey, trKey);

                session.sendMessage(new TextMessage(subscribeJson));
                log.info("한투 실시간 체결 구독 등록 요청 전송: ticker={}, trKey={}", stock.getTicker(), trKey);

                // 한투 요청 폭주 방지를 위해 0.1초 미세 딜레이
                Thread.sleep(100);
            } catch (Exception e) {
                log.error("종목 [{}] 웹소켓 구독 등록 실패: {}", stock.getTicker(), e.getMessage());
            }
        }
    }

    /**
     * 한투 HDFSCNT0 tr_key 생성 (D + 거래소코드 + 티커)
     * 예: NVDA -> DNASNVDA, TSM -> DNYSTSM
     */
    private String buildTrKey(String ticker) {
        String upperTicker = ticker.trim().toUpperCase();
        if ("TSM".equals(upperTicker)) {
            return "DNYSTSM"; // 뉴욕거래소(NYSE) 상장 ADR
        }
        return "DNAS" + upperTicker; // 나스닥(NASDAQ) 기본
    }

    /**
     * 한투 실시간 웹소켓 표준 등록 JSON 페이로드 생성
     */
    private String buildSubscribeJson(String approvalKey, String trKey) {
        return String.format("""
                {
                  "header": {
                    "approval_key": "%s",
                    "custtype": "P",
                    "tr_type": "1",
                    "content-type": "utf-8"
                  },
                  "body": {
                    "input": {
                      "tr_id": "HDFSCNT0",
                      "tr_key": "%s"
                    }
                  }
                }
                """, approvalKey, trKey);
    }

    /**
     * 4. 연결 상태 헬스체크 및 자동 재연결 스케줄러 (15초 주기)
     */
    @Scheduled(fixedDelay = 15000)
    public void checkAndReconnect() {
        if (currentSession == null || !currentSession.isOpen()) {
            log.info("한투 웹소켓 세션 단절 감지. 자동 재연결을 시도합니다.");
            connectAndSubscribe();
        }
    }
}
