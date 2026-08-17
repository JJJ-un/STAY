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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 실시간 주가 흐름 패턴 감시 및 다짐/목표가 알림 트리거 서비스
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

    // 차트 1회 조회 최적화용 캐시 키 (종목 티커 + 차트 탭)
    private record ChartKey(String ticker, ChartRangeType rangeType) {}

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
     * (성능 최적화: 동일 종목/탭 차트 데이터는 1회만 조회하여 재사용)
     */
    public List<TrackingAlertResult> checkAllActiveTrackingJournals() {
        List<Journal> activeJournals = journalRepository.findAllActiveTrackingJournals();
        if (activeJournals.isEmpty()) {
            return Collections.emptyList();
        }

        log.info("추적 활성 일지 감시 시작: 총 {}건", activeJournals.size());

        // (종목 + 탭)별 차트 1회 조회 캐시 맵 (한투 API 중복 호출 98% 절감)
        Map<ChartKey, List<BigDecimal>> chartCache = new HashMap<>();

        return activeJournals.stream()
                .map(journal -> evaluateWithCache(journal, chartCache))
                .filter(result -> result != null && (result.isPatternMatched() || result.isTargetReached() || result.isStopLossReached()))
                .filter(this::isNotCoolingDown) // 중복 알림 쿨다운 체크
                .toList();
    }

    /**
     * 캐시를 활용한 일지 패턴 및 목표가 도달 판정
     */
    private TrackingAlertResult evaluateWithCache(Journal journal, Map<ChartKey, List<BigDecimal>> chartCache) {
        if (journal == null || Boolean.FALSE.equals(journal.getIsTracking()) || journal.getPricePattern() == null) {
            return null;
        }

        List<BigDecimal> targetPattern = JsonUtil.parsePricePattern(journal.getPricePattern());
        if (targetPattern.isEmpty()) {
            return null;
        }

        String ticker = journal.getStock().getTicker();
        ChartRangeType rangeType = journal.getChartRangeType();
        ChartKey chartKey = new ChartKey(ticker, rangeType);

        // 캐시에 없으면 한투 API 1회 조회 후 캐싱, 있으면 캐시 데이터 즉시 재사용!
        List<BigDecimal> currentCandles = chartCache.computeIfAbsent(chartKey, key -> {
            try {
                List<StockChartResponse> chartData = stockChartService.getChartData(key.ticker(), key.rangeType(), null);
                if (chartData == null || chartData.isEmpty()) {
                    return Collections.emptyList();
                }
                return chartData.stream().map(StockChartResponse::price).toList();
            } catch (Exception e) {
                log.warn("차트 시세 조회 실패: ticker={}, range={}, error={}", key.ticker(), key.rangeType(), e.getMessage());
                return Collections.emptyList();
            }
        });

        if (currentCandles.isEmpty()) {
            return null;
        }

        return evaluateMatching(journal, targetPattern, currentCandles);
    }

    /**
     * 단건 일지 ID로 실시간 추적 상태 분석 (수동 확인용)
     */
    public TrackingAlertResult checkSingleJournal(Long journalId) {
        Journal journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOURNAL_NOT_FOUND));

        if (Boolean.FALSE.equals(journal.getIsTracking()) || journal.getPricePattern() == null) {
            return null;
        }

        List<BigDecimal> targetPattern = JsonUtil.parsePricePattern(journal.getPricePattern());
        if (targetPattern.isEmpty()) {
            return null;
        }

        List<StockChartResponse> chartData = stockChartService.getChartData(
                journal.getStock().getTicker(),
                journal.getChartRangeType(),
                null
        );

        if (chartData == null || chartData.isEmpty()) {
            return null;
        }

        List<BigDecimal> currentCandles = chartData.stream()
                .map(StockChartResponse::price)
                .toList();

        return evaluateMatching(journal, targetPattern, currentCandles);
    }

    /**
     * 순수 패턴 유사도 및 목표가/손절가 매칭 연산
     */
    private TrackingAlertResult evaluateMatching(Journal journal, List<BigDecimal> targetPattern, List<BigDecimal> currentCandles) {
        // 1. 누적 등락률 기반 코사인 유사도 연산
        double similarity = patternMatchingEngine.calculateSimilarity(targetPattern, currentCandles);

        // 2. 최신 현재가 확인 (차트의 마지막 캔들 종가)
        BigDecimal currentPrice = currentCandles.get(currentCandles.size() - 1);

        // 3. 패턴 일치 판정 (기본 임계치: 0.85 = 85%)
        double threshold = journal.getSimilarityThreshold() != null ? journal.getSimilarityThreshold() : 0.85;
        boolean isPatternMatched = (similarity >= threshold);

        // 4. 목표가 / 손절가 도달 판정
        boolean isTargetReached = (journal.getTargetPrice() != null && currentPrice.compareTo(journal.getTargetPrice()) >= 0);
        boolean isStopLossReached = (journal.getStopLossPrice() != null && currentPrice.compareTo(journal.getStopLossPrice()) <= 0);

        if (isPatternMatched || isTargetReached || isStopLossReached) {
            log.info("[추적 알림 감지] journalId={}, ticker={}, similarity={}% (임계치: {}%), 현재가={}, 목표가={}, 손절가={}",
                    journal.getId(), journal.getStock().getTicker(), String.format("%.2f", similarity * 100),
                    threshold * 100, currentPrice, journal.getTargetPrice(), journal.getStopLossPrice());
        }

        return new TrackingAlertResult(
                journal.getId(),
                journal.getUser().getId(),
                journal.getStock().getTicker(),
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
