package com.stay.backend.domain.stock.controller;

import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.service.StockChartService;
import com.stay.backend.global.common.response.ApiResponse;
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

@Tag(name = "Stock Chart", description = "해외 반도체 주식 차트 시세 API")
@RestController
@RequestMapping("/api/v1/stocks")
@RequiredArgsConstructor
public class StockChartController {

    private final StockChartService stockChartService;

    @Operation(
            summary = "해외 반도체 종목 5대 탭 차트 시세 데이터 조회",
            description = "한국투자증권 Open API로부터 5대 기간 탭(1일/5분봉, 1주/일봉, 3개월/일봉, 1년/주봉, 5년/월봉)에 따른 실제 차트 시세 캔들 배열을 시간순(과거 ➔ 최신)으로 조회합니다."
    )
    @GetMapping("/{ticker}/charts")
    public ResponseEntity<ApiResponse<List<StockChartResponse>>> getStockChart(
            @Parameter(description = "종목 티커 (예: NVDA, AMD, TSM)", example = "NVDA")
            @PathVariable String ticker,

            @Parameter(description = "5대 차트 기간 탭 (DAY_1: 1일/5분봉, WEEK_1: 1주/일봉, MONTH_3: 3개월/일봉, YEAR_1: 1년/주봉, YEAR_5: 5년/월봉)", example = "MONTH_3")
            @RequestParam(required = false, defaultValue = "MONTH_3") ChartRangeType range,

            @Parameter(description = "조회 기준 일자 (YYYYMMDD, 미입력 시 당일)", example = "20260815")
            @RequestParam(required = false) String baseDate
    ) {
        List<StockChartResponse> chartData = stockChartService.getChartData(ticker, range, baseDate);
        return ResponseEntity.ok(ApiResponse.success(chartData));
    }
}
