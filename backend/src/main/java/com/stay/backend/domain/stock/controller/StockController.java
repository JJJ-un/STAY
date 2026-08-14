package com.stay.backend.domain.stock.controller;

import com.stay.backend.domain.stock.dto.StockResponse;
import com.stay.backend.domain.stock.entity.StockSortType;
import com.stay.backend.domain.stock.service.StockService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Stock", description = "주식 종목 및 시세 API")
@RestController
@RequestMapping("/api/v1/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final KisStockService kisStockService;

    @Operation(summary = "메인 화면 해외 반도체 종목 목록 조회", description = "메인 화면에 표시할 해외 반도체 종목 목록을 조회합니다. 탭 정렬(거래량순, 상승률순, 하락률순, 시총순) 및 종목명/티커 검색을 지원합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<StockResponse>>> getStocks(
            @Parameter(description = "정렬 기준 (VOLUME, GAINERS, LOSERS, MARKET_CAP)", example = "VOLUME")
            @RequestParam(required = false, defaultValue = "VOLUME") StockSortType sort,

            @Parameter(description = "검색어 (종목명 또는 티커)", example = "NVDA")
            @RequestParam(required = false) String keyword
    ) {
        List<StockResponse> stocks = stockService.getStocks(sort, keyword);
        return ResponseEntity.ok(ApiResponse.success(stocks));
    }

    @Operation(summary = "종목 단건 상세 조회 (ID 기준)", description = "특정 종목의 상세 정보(현재가, 변동폭, 등락률, 거래량 등)를 조회합니다.")
    @GetMapping("/{stockId}")
    public ResponseEntity<ApiResponse<StockResponse>> getStockDetail(
            @Parameter(description = "종목 ID (PK)", example = "1")
            @PathVariable Long stockId
    ) {
        StockResponse stock = stockService.getStockDetail(stockId);
        return ResponseEntity.ok(ApiResponse.success(stock));
    }

    @Operation(summary = "종목 단건 상세 조회 (티커 기준)", description = "티커(심볼)를 기준으로 특정 종목의 상세 정보를 조회합니다.")
    @GetMapping("/ticker/{ticker}")
    public ResponseEntity<ApiResponse<StockResponse>> getStockByTicker(
            @Parameter(description = "종목 티커 (예: NVDA, AMD, TSM)", example = "NVDA")
            @PathVariable String ticker
    ) {
        StockResponse stock = stockService.getStockByTicker(ticker);
        return ResponseEntity.ok(ApiResponse.success(stock));
    }

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
