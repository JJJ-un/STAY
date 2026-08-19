package com.stay.backend.infra.kis;

import com.stay.backend.domain.stock.dto.StockResponse;
import com.stay.backend.domain.stock.service.StockSseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.math.BigDecimal;

/**
 * 한국투자증권 실시간 웹소켓 체결 데이터(HDFSCNT0) 수신 및 파싱 핸들러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KisWebSocketHandler extends TextWebSocketHandler {

    private final StockSseService stockSseService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("한투 실시간 웹소켓 세션 연결 성공: sessionId={}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();

        // 1. JSON 형태의 등록 응답 또는 PINGPONG 패킷 처리
        if (payload.startsWith("{")) {
            log.debug("한투 웹소켓 시스템 메시지 수신: {}", payload);
            return;
        }

        // 2. 실시간 체결 데이터 (파이프 '|' 구분자 패킷)
        // 포맷: 0|HDFSCNT0|001|DNASNVDA^...
        try {
            String[] parts = payload.split("\\|");
            if (parts.length < 4) {
                return;
            }

            String trId = parts[1];
            if ("HDFSCNT0".equals(trId)) {
                parseAndBroadcastOverseasPrice(parts[3]);
            }
        } catch (Exception e) {
            log.error("한투 실시간 체결 데이터 파싱 오류: payload={}, error={}", payload, e.getMessage());
        }
    }

    /**
     * 해외주식 체결가(HDFSCNT0) 캐럿(^) 구분자 데이터 파싱 및 SSE 브로드캐스트
     */
    private void parseAndBroadcastOverseasPrice(String dataSection) {
        String[] fields = dataSection.split("\\^");
        if (fields.length < 16) {
            return;
        }

        try {
            // 한투 HDFSCNT0 필드 인덱스 매핑:
            // fields[0]: RSYM (예: DNASNVDA, DNYSAMD 등)
            // fields[11]: LAST (현재 체결가)
            // fields[13]: DIFF (전일 대비 변동금액)
            // fields[14]: RATE (전일 대비 등락률 %)
            // fields[20]: TVOL (당일 누적 거래량)

            String rawSymbol = fields[0]; // e.g. DNASNVDA
            String ticker = extractTicker(rawSymbol);

            BigDecimal currentPrice = new BigDecimal(fields[11].trim());
            BigDecimal changePrice = new BigDecimal(fields[13].trim());
            BigDecimal changeRate = new BigDecimal(fields[14].trim());
            Long volume = Long.parseLong(fields[20].trim());

            // 정제된 DTO 구성
            StockResponse stockResponse = new StockResponse(
                    null, // stockId
                    ticker, // stockName
                    ticker, // ticker
                    currentPrice,
                    changePrice,
                    changeRate,
                    volume,
                    0L // marketCap
            );

            log.debug("한투 실시간 체결가 수신: ticker={}, 현재가={}, 등락률={}%",
                    ticker, currentPrice, changeRate);

            // 우리 백엔드 SSE Emitter를 통해 프론트엔드로 즉시 밀어넣기
            stockSseService.broadcastSingleStock(stockResponse);
        } catch (Exception e) {
            log.warn("해외주식 실시간 체결 세부 파싱 실패: data={}, error={}", dataSection, e.getMessage());
        }
    }

    /**
     * 한투 RSYM(DNASNVDA 등)에서 순수 티커(NVDA) 추출
     */
    private String extractTicker(String rawSymbol) {
        if (rawSymbol == null || rawSymbol.length() < 5) {
            return rawSymbol != null ? rawSymbol : "";
        }
        // "DNASNVDA" -> "NVDA", "DNYSTSM" -> "TSM"
        return rawSymbol.substring(4);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("한투 실시간 웹소켓 전송 에러: sessionId={}, error={}", session.getId(), exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.warn("한투 실시간 웹소켓 세션 종료: sessionId={}, status={}", session.getId(), status);
    }
}
