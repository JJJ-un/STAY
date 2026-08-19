package com.stay.backend.domain.stock.service;

import com.stay.backend.domain.stock.dto.StockResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class StockSseService {

    // SSE 기본 타임아웃: 30분 (밀리초 단위)
    private static final Long DEFAULT_TIMEOUT = 30L * 60 * 1000;

    // 동시 접속 멀티스레드 환경에서 안전한 시청자(Emitter) 명단 저장소
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * 1. 클라이언트 주가 실시간 스트림 구독 (시청자 입장)
     */
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 명단에 추가
        this.emitters.add(emitter);
        log.info("새로운 주가 SSE 스트림 연결 수립. 현재 활성 시청자 수: {}", emitters.size());

        // 연결 종료, 타임아웃, 에러 발생 시 명단에서 자동 제거 (메모리 누수 원천 차단)
        emitter.onCompletion(() -> removeEmitter(emitter, "Completion"));
        emitter.onTimeout(() -> removeEmitter(emitter, "Timeout"));
        emitter.onError((e) -> removeEmitter(emitter, "Error: " + e.getMessage()));

        // 최초 연결 확인용 더미 핑 전송 (503 Service Unavailable 방지)
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("주가 실시간 SSE 스트림 연결 성공"));
        } catch (IOException e) {
            log.warn("최초 연결 확인 이벤트 전송 실패, Emitter 제거: {}", e.getMessage());
            removeEmitter(emitter, "Initial Connect Failed");
        }

        return emitter;
    }

    /**
     * 2. 전체 해외 반도체 8대 종목 실시간 시세 일괄 브로드캐스트
     */
    public void broadcastStockPrices(List<StockResponse> stocks) {
        if (emitters.isEmpty() || stocks == null || stocks.isEmpty()) {
            return;
        }

        log.debug("전체 종목 실시간 시세 브로드캐스트 시작. 수신 대상: {}명", emitters.size());

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("stock-prices")
                        .data(stocks));
            } catch (Exception e) {
                log.warn("시세 브로드캐스트 실패 클라이언트 감지, Emitter 제거: {}", e.getMessage());
                removeEmitter(emitter, "Broadcast Failed");
            }
        }
    }

    /**
     * 3. 특정 단일 종목 실시간 호가/체결 변동 브로드캐스트
     */
    public void broadcastSingleStock(StockResponse stock) {
        if (emitters.isEmpty() || stock == null) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("stock-price-update")
                        .data(stock));
            } catch (Exception e) {
                removeEmitter(emitter, "Single Broadcast Failed");
            }
        }
    }

    /**
     * Emitter 안전 제거 헬퍼
     */
    private void removeEmitter(SseEmitter emitter, String reason) {
        boolean removed = this.emitters.remove(emitter);
        if (removed) {
            log.info("주가 SSE Emitter 제거 완료 (사유: {}). 남은 활성 시청자 수: {}", reason, emitters.size());
        }
    }
}
