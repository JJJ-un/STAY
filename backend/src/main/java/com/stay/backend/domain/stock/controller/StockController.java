package com.stay.backend.domain.stock.controller;

import com.stay.backend.global.common.response.ApiResponse;
import com.stay.backend.infra.kis.KisStockService;
import com.stay.backend.infra.kis.dto.RealtimeStockPrice;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Stock", description = "주식 종목 및 시세 API")
@RestController
@RequestMapping("/api/v1/stocks")
@RequiredArgsConstructor
public class StockController {

    private final KisStockService kisStockService;

    @Operation(summary = "해외 반도체 종목 실시간 시세 조회", description = "한국투자증권 Open API로부터 100% 실제 해외 반도체 종목 실시간 현재가, 변동금액, 등락률, 거래량을 조회합니다.")
    @GetMapping("/{ticker}/realtime-price")
    public ResponseEntity<ApiResponse<RealtimeStockPrice>> getRealtimePrice(
            @Parameter(description = "종목 티커 (예: NVDA, AMD, TSM 등)", example = "NVDA")
            @PathVariable String ticker
    ) {
        RealtimeStockPrice realtimePrice = kisStockService.getRealtimePrice(ticker);
        return ResponseEntity.ok(ApiResponse.success(realtimePrice));
    }
}
