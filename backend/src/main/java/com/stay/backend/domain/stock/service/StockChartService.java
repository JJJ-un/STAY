package com.stay.backend.domain.stock.service;

import com.stay.backend.domain.journal.entity.Journal;
import com.stay.backend.domain.journal.entity.TradeType;
import com.stay.backend.domain.journal.repository.JournalRepository;
import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.dto.StockTimelineMarkerResponse;
import com.stay.backend.domain.stock.dto.StockTimelineMarkerResponse.JournalSummary;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import com.stay.backend.infra.kis.KisChartApiClient;
import com.stay.backend.infra.kis.dto.KisChartPriceResponse;
import com.stay.backend.infra.kis.dto.KisMinuteChartPriceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 차트 기간 범위별 해외 반도체 차트 시세 데이터 및 X축 타임라인 뱃지 제공 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockChartService {

    private final KisChartApiClient kisChartApiClient;
    private final JournalRepository journalRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 특정 종목의 차트 데이터 조회 (과거 ➔ 최신 시간순 정렬)
     *
     * @param ticker 종목 티커 (예: NVDA, AMD, TSM)
     * @param range 차트 기간 탭 (DAY_1, WEEK_1, MONTH_3, YEAR_1, YEAR_5)
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

    /**
     * 특정 종목의 차트 하단 X축 타임라인 일지 마커 뱃지 목록 조회 (날짜별 집계)
     *
     * @param userId 로그인 사용자 ID
     * @param ticker 종목 티커 (예: NVDA)
     * @return 날짜별 집계된 뱃지 마커 리스트 (시간 오름차순)
     */
    public List<StockTimelineMarkerResponse> getTimelineMarkers(Long userId, String ticker) {
        if (ticker == null || ticker.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        String normalizedTicker = ticker.trim().toUpperCase();

        // 1. 해당 유저가 이 종목에 작성한 일지들을 시간순으로 조회
        List<Journal> journals = journalRepository.findByUserIdAndStockTickerOrderByTradeDateTimeAsc(userId, normalizedTicker);
        if (journals.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. 날짜(YYYY-MM-DD)별로 일지들을 그룹화 (순서 유지를 위해 LinkedHashMap 사용)
        Map<String, List<Journal>> groupedByDate = new LinkedHashMap<>();
        for (Journal journal : journals) {
            String dateKey = (journal.getTradeDateTime() != null)
                    ? journal.getTradeDateTime().format(DATE_FORMATTER)
                    : journal.getCreatedAt().format(DATE_FORMATTER);

            groupedByDate.computeIfAbsent(dateKey, k -> new ArrayList<>()).add(journal);
        }

        // 3. 날짜별 매수/매도/관망 카운트 집계 및 DTO 조립
        List<StockTimelineMarkerResponse> markers = new ArrayList<>();
        for (Map.Entry<String, List<Journal>> entry : groupedByDate.entrySet()) {
            String date = entry.getKey();
            List<Journal> dateJournals = entry.getValue();

            int buyCount = 0;
            int sellCount = 0;
            int watchCount = 0;

            List<JournalSummary> summaries = new ArrayList<>();
            for (Journal j : dateJournals) {
                if (j.getTradeType() == TradeType.BUY) {
                    buyCount++;
                } else if (j.getTradeType() == TradeType.SELL) {
                    sellCount++;
                } else if (j.getTradeType() == TradeType.WATCH) {
                    watchCount++;
                }
                summaries.add(JournalSummary.from(j));
            }

            markers.add(new StockTimelineMarkerResponse(
                    date,
                    dateJournals.size(),
                    buyCount,
                    sellCount,
                    watchCount,
                    summaries
            ));
        }

        log.info("차트 타임라인 마커 집계 완료: userId={}, ticker={}, 마커 날짜 수={}, 총 일지 수={}",
                userId, normalizedTicker, markers.size(), journals.size());

        return markers;
    }
}
