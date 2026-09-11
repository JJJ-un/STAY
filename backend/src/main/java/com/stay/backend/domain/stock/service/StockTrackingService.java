package com.stay.backend.domain.stock.service;

import com.stay.backend.domain.journal.entity.Journal;
import com.stay.backend.domain.journal.repository.JournalRepository;
import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import com.stay.backend.global.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 실시간 주가 흐름 패턴 감시 및 다짐/목표가 알림 트리거 서비스
 * - 목표가/손절가 감시: 차트 API 호출 없이 DB 실시간 현재가로 0.001초 판정
 * - 주가 패턴 감시: Caffeine 중앙 캐시 연동으로 외부 증권사 API 중복 호출 차단
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockTrackingService {

    private final JournalRepository journalRepository;
    private final StockChartService stockChartService;
    private final PatternMatchingEngine patternMatchingEngine;

    // 중복 알림 폭탄 방지용 쿨다운 맵 (일지 ID -> 마지막 알림 발송 시각, 쿨다운: 30분)
    private final Map<Long, Instant> alertCooldownMap = new ConcurrentHashMap<>();
    private static final Duration ALERT_COOLDOWN_DURATION = Duration.ofMinutes(30);

    /**
     * 알림 판정 결과 DTO (내부 도메인용)
     */
    public record TrackingAlertResult(
            Long journalId,
            Long userId,
            String ticker,
            String stayMessage,
            double similarity,
            boolean isPatternMatched,
            boolean isTargetReached,
            boolean isStopLossReached,
            BigDecimal currentPrice,
            BigDecimal targetPrice,
            BigDecimal stopLossPrice
    ) {}

    /**
     * 전체 추적 활성화 일지들을 실시간으로 감시하고 알림 대상 목록 반환
     * (순수 목표가/손절가 일지는 차트 API 호출 없이 즉시 처리, 패턴 일지는 Caffeine 캐시 활용)
     */
    public List<TrackingAlertResult> checkAllActiveTrackingJournals() {
        List<Journal> activeJournals = journalRepository.findAllActiveTrackingJournals();
        if (activeJournals.isEmpty()) {
            return Collections.emptyList();
        }

        log.info("추적 활성 일지 감시 시작: 총 {}건", activeJournals.size());

        // 동일 회차 내 종목별 최신 가격 일관성 유지용 맵
        Map<String, BigDecimal> latestPriceMap = new ConcurrentHashMap<>();

        return activeJournals.stream()
                .map(journal -> evaluateJournal(journal, latestPriceMap))
                .filter(result -> result != null && (result.isPatternMatched() || result.isTargetReached() || result.isStopLossReached()))
                .filter(this::isNotCoolingDown) // 중복 알림 쿨다운 체크
                .toList();
    }

    /**
     * 단일 일지에 대한 목표가/손절가 및 주가 흐름 패턴 도달 여부 평가
     */
    private TrackingAlertResult evaluateJournal(Journal journal, Map<String, BigDecimal> latestPriceMap) {
        if (journal == null) {
            return null;
        }

        String ticker = journal.getStock().getTicker();
        boolean hasPatternTracking = Boolean.TRUE.equals(journal.getIsTracking()) && journal.getPricePattern() != null;
        boolean hasTargetOrStopLoss = journal.getTargetPrice() != null || journal.getStopLossPrice() != null;

        // 패턴 추적도 없고 목표가/손절가도 없으면 검사 대상 아님
        if (!hasPatternTracking && !hasTargetOrStopLoss) {
            return null;
        }

        double similarity = 0.0;
        boolean isPatternMatched = false;
        BigDecimal currentPrice = latestPriceMap != null && latestPriceMap.containsKey(ticker)
                ? latestPriceMap.get(ticker)
                : journal.getStock().getCurrentPrice();

        // 1. [패턴 추적 활성화 일지]: Caffeine 중앙 캐시에서 캔들 조회 후 코사인 유사도 연산
        if (hasPatternTracking) {
            List<BigDecimal> targetPattern = JsonUtil.parsePricePattern(journal.getPricePattern());
            if (!targetPattern.isEmpty()) {
                ChartRangeType rangeType = journal.getChartRangeType() != null ? journal.getChartRangeType() : ChartRangeType.MONTH_3;

                // stockChartService는 @Cacheable로 캐싱되어 있어 외부 API를 매번 부르지 않고 중앙 캐시에서 0ms 반환
                List<StockChartResponse> chartData = stockChartService.getChartData(ticker, rangeType, null);
                if (chartData != null && !chartData.isEmpty()) {
                    List<BigDecimal> currentCandles = chartData.stream()
                            .map(StockChartResponse::price)
                            .toList();

                    similarity = patternMatchingEngine.calculateSimilarity(targetPattern, currentCandles);
                    double threshold = journal.getSimilarityThreshold() != null ? journal.getSimilarityThreshold() : 0.85;
                    isPatternMatched = (similarity >= threshold);

                    // 차트가 존재하면 해당 기간의 가장 최신 종가를 currentPrice로 채택 및 맵 동기화
                    currentPrice = currentCandles.get(currentCandles.size() - 1);
                    if (latestPriceMap != null) {
                        latestPriceMap.put(ticker, currentPrice);
                    }
                }
            }
        }

        // 2. [목표가 / 손절가 도달 판정]: 실시간 현재가와 직접 비교 (차트 API 불필요)
        boolean isTargetReached = false;
        boolean isStopLossReached = false;

        if (currentPrice != null) {
            if (journal.getTargetPrice() != null && currentPrice.compareTo(journal.getTargetPrice()) >= 0) {
                isTargetReached = true;
            }
            if (journal.getStopLossPrice() != null && currentPrice.compareTo(journal.getStopLossPrice()) <= 0) {
                isStopLossReached = true;
            }
        }

        // 3. 알림 발생 조건에 하나라도 부합하는지 확인
        if (isPatternMatched || isTargetReached || isStopLossReached) {
            log.info("[추적 알림 감지] journalId={}, ticker={}, similarity={}% (패턴일치={}), 현재가={}, 목표가={}, 손절가={}",
                    journal.getId(), ticker, String.format("%.2f", similarity * 100),
                    isPatternMatched, currentPrice, journal.getTargetPrice(), journal.getStopLossPrice());
        }

        return new TrackingAlertResult(
                journal.getId(),
                journal.getUser().getId(),
                ticker,
                journal.getStayMessage(),
                similarity,
                isPatternMatched,
                isTargetReached,
                isStopLossReached,
                currentPrice,
                journal.getTargetPrice(),
                journal.getStopLossPrice()
        );
    }

    /**
     * 단건 일지 ID로 실시간 추적 상태 분석 (수동 확인용)
     */
    public TrackingAlertResult checkSingleJournal(Long journalId) {
        Journal journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOURNAL_NOT_FOUND));

        return evaluateJournal(journal, null);
    }

    /**
     * 동일 일지 중복 알림 쿨다운 검사 (30분 이내 재발송 차단)
     */
    private boolean isNotCoolingDown(TrackingAlertResult result) {
        Instant now = Instant.now();
        Instant lastAlert = alertCooldownMap.get(result.journalId());

        if (lastAlert == null || Duration.between(lastAlert, now).compareTo(ALERT_COOLDOWN_DURATION) >= 0) {
            alertCooldownMap.put(result.journalId(), now);
            return true;
        }

        log.debug("중복 알림 쿨다운 차단: journalId={}, 경과시간={}분",
                result.journalId(), Duration.between(lastAlert, now).toMinutes());
        return false;
    }
}
