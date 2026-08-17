package com.stay.backend.domain.stock.controller;

import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.dto.StockTimelineMarkerResponse;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.service.StockChartService;
import com.stay.backend.global.common.response.ApiResponse;
import com.stay.backend.global.config.security.CurrentUserId;
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

@Tag(name = "Stock Chart", description = "해외 반도체 주식 차트 시세 및 타임라인 뱃지 API")
@RestController
@RequestMapping("/api/v1/stocks")
@RequiredArgsConstructor
public class StockChartController {

    private final StockChartService stockChartService;

    @Operation(
            summary = "해외 반도체 종목 차트 시세 데이터 조회",
            description = "한국투자증권 Open API로부터 차트 기간 범위(1일/5분봉, 1주/일봉, 3개월/일봉, 1년/주봉, 5년/월봉)에 따른 실제 차트 시세 캔들 배열을 시간순(과거 ➔ 최신)으로 조회합니다."
    )
    @GetMapping("/{ticker}/charts")
    public ResponseEntity<ApiResponse<List<StockChartResponse>>> getStockChart(
            @Parameter(description = "종목 티커 (예: NVDA, AMD, TSM)", example = "NVDA")
            @PathVariable String ticker,

            @Parameter(description = "차트 기간 범위 (DAY_1: 1일/5분봉, WEEK_1: 1주/일봉, MONTH_3: 3개월/일봉, YEAR_1: 1년/주봉, YEAR_5: 5년/월봉)", example = "MONTH_3")
            @RequestParam(required = false, defaultValue = "MONTH_3") ChartRangeType range,

            @Parameter(description = "조회 기준 일자 (YYYYMMDD, 미입력 시 당일)", example = "20260815")
            @RequestParam(required = false) String baseDate
    ) {
        List<StockChartResponse> chartData = stockChartService.getChartData(ticker, range, baseDate);
        return ResponseEntity.ok(ApiResponse.success(chartData));
    }

    @Operation(
            summary = "차트 하단 X축 타임라인 일지 마커 뱃지 목록 조회",
            description = "해당 종목의 차트 X축 날짜 레일에 꽂아줄 일자별 매수/매도/관망 일지 집계 뱃지 및 다짐 요약 리스트를 조회합니다."
    )
    @GetMapping("/{ticker}/timeline-markers")
    public ResponseEntity<ApiResponse<List<StockTimelineMarkerResponse>>> getTimelineMarkers(
            @Parameter(description = "종목 티커 (예: NVDA, AMD, TSM)", example = "NVDA")
            @PathVariable String ticker,

            @CurrentUserId Long userId
    ) {
        List<StockTimelineMarkerResponse> markers = stockChartService.getTimelineMarkers(userId, ticker);
        return ResponseEntity.ok(ApiResponse.success(markers));
    }
}
