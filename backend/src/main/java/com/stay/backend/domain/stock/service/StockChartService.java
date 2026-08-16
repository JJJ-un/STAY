package com.stay.backend.domain.stock.service;

import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import com.stay.backend.infra.kis.KisChartApiClient;
import com.stay.backend.infra.kis.dto.KisChartPriceResponse;
import com.stay.backend.infra.kis.dto.KisMinuteChartPriceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 5대 탭 해외 반도체 차트 시세 데이터 제공 비즈니스 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StockChartService {

    private final KisChartApiClient kisChartApiClient;

    /**
     * 특정 종목의 5대 탭 차트 데이터 조회 (과거 ➔ 최신 시간순 정렬)
     *
     * @param ticker 종목 티커 (예: NVDA, AMD, TSM)
     * @param range 5대 기간 탭 (DAY_1, WEEK_1, MONTH_3, YEAR_1, YEAR_5)
     * @param baseDate 기준 일자 (YYYYMMDD, nullable)
     * @return 시간순 정렬된 캔들/시세 응답 리스트
     */
    public List<StockChartResponse> getChartData(String ticker, ChartRangeType range, String baseDate) {
        if (ticker == null || ticker.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        String normalizedTicker = ticker.trim().toUpperCase();
        ChartRangeType targetRange = (range != null) ? range : ChartRangeType.MONTH_3;

        log.debug("차트 데이터 조회 시작: ticker={}, range={}, baseDate={}", normalizedTicker, targetRange, baseDate);

        List<StockChartResponse> chartList = new ArrayList<>();

        if (targetRange.isMinute()) {
            // 1. 당일 5분봉 조회 (DAY_1)
            KisMinuteChartPriceResponse minuteResponse = kisChartApiClient.fetchMinuteChart(
                    normalizedTicker,
                    targetRange.getMinuteInterval()
            );

            if (minuteResponse != null && minuteResponse.output2() != null) {
                chartList = minuteResponse.output2().stream()
                        .map(StockChartResponse::fromMinuteItem)
                        .toList();
            }
        } else {
            // 2. 기간별 시세 조회 (WEEK_1: 1주일봉, MONTH_3: 3개월일봉, YEAR_1: 1년주봉, YEAR_5: 5년월봉)
            KisChartPriceResponse periodResponse = kisChartApiClient.fetchPeriodChart(
                    normalizedTicker,
                    targetRange.getKisGubnCode(),
                    baseDate
            );

            if (periodResponse != null && periodResponse.output2() != null) {
                chartList = periodResponse.output2().stream()
                        .map(StockChartResponse::fromPeriodItem)
                        .toList();
            }
        }

        // 한투 원본은 최신순(내림차순)이므로, 차트 렌더링을 위해 과거 ➔ 최신(오름차순)으로 반전 정렬
        List<StockChartResponse> result = new ArrayList<>(chartList);
        Collections.reverse(result);

        log.info("차트 데이터 가공 완료: ticker={}, range={}, 총 캔들 수={}", normalizedTicker, targetRange, result.size());

        return result;
    }
}
