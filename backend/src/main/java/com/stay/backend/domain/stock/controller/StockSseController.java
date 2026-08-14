package com.stay.backend.domain.stock.controller;

import com.stay.backend.global.config.security.CurrentUserId;
import com.stay.backend.infra.sse.SseEmitterManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Tag(name = "Stock SSE", description = "실시간 주식 시세 스트리밍 API")
@RestController
@RequestMapping("/api/v1/stocks")
@RequiredArgsConstructor
public class StockSseController {

    private final SseEmitterManager sseEmitterManager;

    @Operation(summary = "실시간 해외 반도체 시세 SSE 스트림 구독", description = "한국투자증권 실시간 체결 시세를 5초 간격으로 푸시받는 Server-Sent Events(SSE) 스트림을 연결합니다.")
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamStockPrices(@CurrentUserId Long userId) {
        String clientId = (userId != null) ? "user_" + userId : "guest";
        return sseEmitterManager.subscribe(clientId);
    }
}
