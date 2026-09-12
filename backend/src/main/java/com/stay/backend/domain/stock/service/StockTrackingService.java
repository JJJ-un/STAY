package com.stay.backend.domain.stock.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.stay.backend.domain.journal.repository.JournalRepository;
import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.dto.TrackingTargetDto;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.storage.RealtimePriceStorage;
import com.stay.backend.global.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 실시간 주가 흐름 패턴 감시 및 다짐/목표가 알림 트리거 서비스
 * - JPA Over-fetching 차단: 경량 TrackingTargetDto 프로젝션으로 필요한 필드만 직접 인출
 * - JSON 파싱 메모이제이션: Caffeine In-Memory Cache로 반복 역직렬화 CPU 부하 및 Minor GC 완벽 방어
 * - 종목(Ticker) 기준 그룹핑 & 병렬 파이프라인: N+1 중복 차트 조회 제거 및 멀티코어 100% 활용
 * - 웹소켓 인메모리 시세(RealtimePriceStorage) 우선 판정: 외부 API 호출 0회 및 초저지연 평가
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockTrackingService {

    private final JournalRepository journalRepository;
    private final StockChartService stockChartService;
    private final PatternMatchingEngine patternMatchingEngine;
    private final RealtimePriceStorage realtimePriceStorage;

    // 중복 알림 폭탄 방지용 쿨다운 맵 (일지 ID -> 마지막 알림 발송 시각, 쿨다운: 30분)
    private final Map<Long, Instant> alertCooldownMap = new ConcurrentHashMap<>();
    private static final Duration ALERT_COOLDOWN_DURATION = Duration.ofMinutes(30);

    // 과거 패턴 JSON 역직렬화 결과 인메모리 메모이제이션 캐시 (일지 ID -> 파싱된 캔들 종가 리스트)
    // - 매 분마다 Jackson 파서를 반복 호출하는 CPU 부하 및 Minor GC 단기 객체 양산 원천 방어 (LRU 10,000건, TTL 24시간)
    private final Cache<Long, List<BigDecimal>> patternCache = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofHours(24))
            .build();

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

    // 청크 분할 단위 (1바가지 당 1,000건씩 컨베이어 벨트 처리)
    public static final int CHUNK_SIZE = 1000;

    /**
     * 전체 추적 활성화 일지들을 실시간으로 감시하고 알림 대상 목록 반환
     * (No-Offset Keyset 커서 청크 페이징 + 종목별 그룹핑 멀티코어 병렬 파이프라인)
     */
    public List<TrackingAlertResult> checkAllActiveTrackingJournals() {
        List<TrackingAlertResult> allAlerts = new ArrayList<>();
        Long lastJournalId = 0L;
        Pageable pageable = PageRequest.of(0, CHUNK_SIZE);
        int totalProcessed = 0;

        while (true) {
            // 1. [Reader] lastJournalId보다 큰 1,000건을 인덱스 커서로 0ms 조회 (OFFSET 슬로우 쿼리 원천 차단)
            List<TrackingTargetDto> chunk = journalRepository.findActiveTrackingTargetsChunk(lastJournalId, pageable);
            if (chunk == null || chunk.isEmpty()) {
                break;
            }

            totalProcessed += chunk.size();

            // 2. [Processor] 해당 청크(1,000건)를 종목별로 그룹핑하여 멀티코어 병렬 평가
            Map<String, List<TrackingTargetDto>> targetsByTicker = chunk.stream()
                    .collect(Collectors.groupingBy(TrackingTargetDto::ticker));

            List<TrackingAlertResult> chunkAlerts = targetsByTicker.entrySet().parallelStream()
                    .flatMap(entry -> evaluateTickerTargets(entry.getKey(), entry.getValue()).stream())
                    .filter(result -> result != null && (result.isPatternMatched() || result.isTargetReached() || result.isStopLossReached()))
                    .filter(this::isNotCoolingDown) // 중복 알림 쿨다운 체크
                    .toList();

            allAlerts.addAll(chunkAlerts);

            // 3. [Cursor Update] 이번 청크의 마지막 journalId로 책갈피 갱신
            lastJournalId = chunk.get(chunk.size() - 1).journalId();

            // 청크 사이즈(1,000건)보다 적게 가져왔다면 더 이상 읽을 데이터가 없는 마지막 청크이므로 즉시 종료
            if (chunk.size() < CHUNK_SIZE) {
                break;
            }
        }

        if (totalProcessed > 0) {
            log.info("추적 활성 일지 감시 완료: 총 {}건 검사, 알림 발생 {}건", totalProcessed, allAlerts.size());
        }

        return allAlerts;
    }

    /**
     * 동일 종목에 속한 일지 그룹을 1번의 차트 캐시 조회로 일괄 평가
     */
    private List<TrackingAlertResult> evaluateTickerTargets(String ticker, List<TrackingTargetDto> targets) {
        if (targets == null || targets.isEmpty()) {
            return Collections.emptyList();
        }

        // 해당 종목의 기본 현재가 (첫 번째 DTO의 DB 현재가 기준)
        BigDecimal defaultCurrentPrice = targets.get(0).stockCurrentPrice();

        // 패턴 추적 일지들이 요구하는 ChartRangeType별 최신 캔들 캐시 맵 (차트 조회 중복 1회로 압축)
        Map<ChartRangeType, List<BigDecimal>> chartDataByRange = new EnumMap<>(ChartRangeType.class);

        for (TrackingTargetDto target : targets) {
            boolean hasPattern = Boolean.TRUE.equals(target.isTracking()) && target.pricePattern() != null;
            if (hasPattern) {
                ChartRangeType rangeType = target.chartRangeType() != null ? target.chartRangeType() : ChartRangeType.MONTH_3;
                chartDataByRange.computeIfAbsent(rangeType, r -> {
                    List<StockChartResponse> chartData = stockChartService.getChartData(ticker, r, null);
                    if (chartData != null && !chartData.isEmpty()) {
                        return chartData.stream()
                                .map(StockChartResponse::price)
                                .toList();
                    }
                    return Collections.emptyList();
                });
            }
        }

        // 1. [웹소켓 인메모리 시세 우선] 외부 API 호출 0회, O(1) 초고속 조회
        // 2. 만약 소켓 시세가 아직 없으면, 차트 데이터 최신 종가 확인
        // 3. 둘 다 없으면 DB의 기본 stockCurrentPrice로 안전하게 폴백
        BigDecimal resolvedCurrentPrice = realtimePriceStorage.getLatestCurrentPrice(ticker)
                .orElseGet(() -> {
                    for (List<BigDecimal> candles : chartDataByRange.values()) {
                        if (candles != null && !candles.isEmpty()) {
                            return candles.get(candles.size() - 1);
                        }
                    }
                    return defaultCurrentPrice;
                });

        BigDecimal finalPrice = resolvedCurrentPrice;
        List<TrackingAlertResult> results = new ArrayList<>(targets.size());

        for (TrackingTargetDto target : targets) {
            TrackingAlertResult result = evaluateSingleTarget(target, finalPrice, chartDataByRange);
            if (result != null) {
                results.add(result);
            }
        }

        return results;
    }

    /**
     * 단일 일지 DTO 평가 (메모이제이션 패턴 캐시 및 목표가 판정)
     */
    private TrackingAlertResult evaluateSingleTarget(
            TrackingTargetDto target,
            BigDecimal currentPrice,
            Map<ChartRangeType, List<BigDecimal>> chartDataByRange
    ) {
        boolean hasPatternTracking = Boolean.TRUE.equals(target.isTracking()) && target.pricePattern() != null;
        boolean hasTargetOrStopLoss = target.targetPrice() != null || target.stopLossPrice() != null;

        if (!hasPatternTracking && !hasTargetOrStopLoss) {
            return null;
        }

        double similarity = 0.0;
        boolean isPatternMatched = false;

        // 1. [패턴 추적 판정]: In-Memory 메모이제이션 캐시 활용 (매 분 Jackson 파싱 방어)
        if (hasPatternTracking) {
            List<BigDecimal> targetPattern = patternCache.get(target.journalId(), id -> JsonUtil.parsePricePattern(target.pricePattern()));
            if (targetPattern != null && !targetPattern.isEmpty()) {
                ChartRangeType rangeType = target.chartRangeType() != null ? target.chartRangeType() : ChartRangeType.MONTH_3;
                List<BigDecimal> currentCandles = chartDataByRange.get(rangeType);

                if (currentCandles != null && !currentCandles.isEmpty()) {
                    similarity = patternMatchingEngine.calculateSimilarity(targetPattern, currentCandles);
                    double threshold = target.similarityThreshold() != null ? target.similarityThreshold() : 0.85;
                    isPatternMatched = (similarity >= threshold);
                }
            }
        }

        // 2. [목표가 / 손절가 도달 판정]: 실시간 현재가와 직접 비교 (차트 API 불필요)
        boolean isTargetReached = false;
        boolean isStopLossReached = false;

        if (currentPrice != null) {
            if (target.targetPrice() != null && currentPrice.compareTo(target.targetPrice()) >= 0) {
                isTargetReached = true;
            }
            if (target.stopLossPrice() != null && currentPrice.compareTo(target.stopLossPrice()) <= 0) {
                isStopLossReached = true;
            }
        }

        // 3. 알림 발생 조건에 하나라도 부합하는지 확인
        if (isPatternMatched || isTargetReached || isStopLossReached) {
            log.info("[추적 알림 감지] journalId={}, ticker={}, similarity={}% (패턴일치={}), 현재가={}, 목표가={}, 손절가={}",
                    target.journalId(), target.ticker(), String.format("%.2f", similarity * 100),
                    isPatternMatched, currentPrice, target.targetPrice(), target.stopLossPrice());
        }

        return new TrackingAlertResult(
                target.journalId(),
                target.userId(),
                target.ticker(),
                target.stayMessage(),
                similarity,
                isPatternMatched,
                isTargetReached,
                isStopLossReached,
                currentPrice,
                target.targetPrice(),
                target.stopLossPrice()
        );
    }

    /**
     * 일지 수정/삭제 시 패턴 캐시 무효화 (데이터 일관성 보장)
     */
    public void invalidatePatternCache(Long journalId) {
        if (journalId != null) {
            patternCache.invalidate(journalId);
        }
    }

    /**
     * 중복 알림 방지 쿨다운 검사
     */
    private boolean isNotCoolingDown(TrackingAlertResult result) {
        if (result == null || result.journalId() == null) {
            return false;
        }

        Instant now = Instant.now();
        Instant lastSent = alertCooldownMap.get(result.journalId());

        if (lastSent != null && Duration.between(lastSent, now).compareTo(ALERT_COOLDOWN_DURATION) < 0) {
            log.debug("알림 쿨다운 중으로 발송 스킵: journalId={}, 경과={}초",
                    result.journalId(), Duration.between(lastSent, now).toSeconds());
            return false;
        }

        alertCooldownMap.put(result.journalId(), now);
        return true;
    }
}
