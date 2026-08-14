package com.stay.backend.infra.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SSE(Server-Sent Events) 연결 관리 및 브로드캐스팅 매니저
 */
@Slf4j
@Component
public class SseEmitterManager {

    // 30분 타임아웃 설정
    private static final Long DEFAULT_TIMEOUT = 30 * 60 * 1000L;

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    /**
     * 클라이언트의 실시간 SSE 스트리밍 구독 생성
     */
    public SseEmitter subscribe(String clientId) {
        String emitterId = (clientId != null && !clientId.isBlank())
                ? clientId + "_" + UUID.randomUUID()
                : UUID.randomUUID().toString();

        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        emitters.put(emitterId, emitter);

        log.info("SSE 연결 등록: emitterId={}, 현재 연결 수={}", emitterId, emitters.size());

        // 생명주기 콜백 등록 (완료, 타임아웃, 에러 발생 시 메모리에서 자동 제거)
        emitter.onCompletion(() -> removeEmitter(emitterId, "Completion"));
        emitter.onTimeout(() -> removeEmitter(emitterId, "Timeout"));
        emitter.onError(e -> removeEmitter(emitterId, "Error: " + e.getMessage()));

        // 503 Service Unavailable 방지를 위한 최초 연결 확인 더미 이벤트 전송
        sendToClient(emitterId, emitter, "CONNECTED", "SSE stream connected successfully.");

        return emitter;
    }

    /**
     * 연결된 모든 클라이언트에게 실시간 데이터 일괄 전송 (브로드캐스팅)
     */
    public void broadcast(String eventName, Object data) {
        if (emitters.isEmpty()) {
            return;
        }

        emitters.forEach((id, emitter) -> sendToClient(id, emitter, eventName, data));
    }

    /**
     * 30초마다 Nginx 및 프록시 타임아웃 방지를 위한 하트비트(Ping) 전송
     */
    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) {
            return;
        }
        broadcast("PING", "heartbeat");
    }

    private void sendToClient(String emitterId, SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(emitterId)
                    .name(eventName)
                    .data(data));
        } catch (IOException | IllegalStateException e) {
            log.warn("SSE 데이터 전송 실패로 인한 연결 해제: emitterId={}", emitterId);
            removeEmitter(emitterId, "Send failed");
        }
    }

    private void removeEmitter(String emitterId, String reason) {
        SseEmitter removed = emitters.remove(emitterId);
        if (removed != null) {
            log.info("SSE 연결 정리: emitterId={}, 이유={}, 남은 연결 수={}", emitterId, reason, emitters.size());
        }
    }

    public int getConnectedClientCount() {
        return emitters.size();
    }
}
