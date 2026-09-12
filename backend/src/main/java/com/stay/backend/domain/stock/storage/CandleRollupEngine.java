package com.stay.backend.domain.stock.storage;

import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.service.StockChartService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 5분봉 종가 실시간 롤업(Rollup) 및 콜드 스타트 워밍업 엔진
 * - 오버엔지니어링(고가/저가/거래량) 배제: 패턴 매칭에 필요한 '5분 종가(Close)' 시계열만 초경량 관리
 * - synchronized (this) 제거: ConcurrentHashMap.compute() 기반의 종목별 락-프리 원자적 윈도우 제어
 * - 콜드 스타트 방어: 서버 기동 시 KIS 차트 API 1회 백필(Warm-up)로 빈틈없는 연속성 보장
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CandleRollupEngine {

    private final StockChartService stockChartService;

    // 5분 윈도우 밀리초 (5분 = 300,000ms)
    public static final long BUCKET_INTERVAL_MILLIS = 5 * 60 * 1000L;
    // 당일 최대 5분봉 보관 개수 (정규장 78개 + 여유 버퍼)
    public static final int MAX_CANDLE_HISTORY = 100;

    // 종목별 완성된 5분봉 종가 시계열 리스트 (오직 종가만 저장)
    private final Map<String, List<BigDecimal>> candleHistoryMap = new ConcurrentHashMap<>();
    // 종목별 현재 진행 중인 5분 버퍼 (시작 시각 + 가장 최신 체결가)
    private final Map<String, FiveMinPriceBuffer> currentBufferMap = new ConcurrentHashMap<>();

    /**
     * 5분 종가 임시 버퍼 (군더더기 없는 초경량 구조)
     */
    @Getter
    public static class FiveMinPriceBuffer {
        private final long startTimeMillis;
        private volatile BigDecimal lastPrice;

        public FiveMinPriceBuffer(long startTimeMillis, BigDecimal initialPrice) {
            this.startTimeMillis = startTimeMillis;
            this.lastPrice = initialPrice;
        }

        public void updateLastPrice(BigDecimal price) {
            this.lastPrice = price;
        }
    }

    /**
     * 웹소켓 체결가 수신 시 5분 종가 갱신 (synchronized 전체 락 완전 제거)
     * - ConcurrentHashMap.compute()로 종목별로만 원자적 마감 처리
     * - 고가/저가/거래량 연산 배제: 오직 최신 체결가 덮어쓰기만 수행
     */
    public void acceptTick(String ticker, BigDecimal price, Instant timestamp) {
        if (ticker == null || ticker.isBlank() || price == null) {
            return;
        }

        String normalizedTicker = ticker.trim().toUpperCase();
        long epochMilli = timestamp != null ? timestamp.toEpochMilli() : System.currentTimeMillis();
        long bucketStartTime = epochMilli - (epochMilli % BUCKET_INTERVAL_MILLIS);

        // 종목별 Key에 대해서만 마이크로 원자적 연산 수행 (다른 종목 스레드 차단 0%)
        currentBufferMap.compute(normalizedTicker, (k, currentBuffer) -> {
            // 1. 새로운 5분 윈도우 시작 (이전 5분 종가 확정 및 새 버퍼 교체)
            if (currentBuffer == null || currentBuffer.getStartTimeMillis() < bucketStartTime) {
                if (currentBuffer != null && currentBuffer.getLastPrice() != null) {
                    List<BigDecimal> history = candleHistoryMap.computeIfAbsent(
                            normalizedTicker, key -> new CopyOnWriteArrayList<>()
                    );
                    history.add(currentBuffer.getLastPrice());
                    if (history.size() > MAX_CANDLE_HISTORY) {
                        history.remove(0);
                    }
                    log.debug("[CandleRollupEngine] 5분 종가 마감: ticker={}, close={}",
                            normalizedTicker, currentBuffer.getLastPrice());
                }
                return new FiveMinPriceBuffer(bucketStartTime, price);
            }

            // 2. 동일 5분 윈도우 내에서는 대소 비교 없이 최신 가격으로 단순 덮어쓰기
            currentBuffer.updateLastPrice(price);
            return currentBuffer;
        });
    }

    /**
     * 특정 종목의 당일 5분봉 종가 시계열 조회
     * - 완성된 캔들 리스트 + (현재 실시간 진행 중인 5분의 최신가) 결합 반환
     */
    public List<BigDecimal> getDailyCandles(String ticker) {
        if (ticker == null || ticker.isBlank()) {
            return Collections.emptyList();
        }

        String normalizedTicker = ticker.trim().toUpperCase();

        // 콜드 스타트 방어: 메모리가 비어있으면 차트 API로 1회 백필
        if (!candleHistoryMap.containsKey(normalizedTicker) || candleHistoryMap.get(normalizedTicker).isEmpty()) {
            warmUpFromChartApi(normalizedTicker);
        }

        List<BigDecimal> history = candleHistoryMap.getOrDefault(normalizedTicker, Collections.emptyList());
        List<BigDecimal> result = new ArrayList<>(history);

        // 현재 실시간 5분의 최신 가격을 맨 뒤에 붙여 완벽한 실시간 파동 완성
        FiveMinPriceBuffer currentBuffer = currentBufferMap.get(normalizedTicker);
        if (currentBuffer != null && currentBuffer.getLastPrice() != null) {
            result.add(currentBuffer.getLastPrice());
        }

        return result;
    }

    /**
     * [콜드 스타트 백필] KIS 차트 API를 딱 1회만 호출하여 과거 5분봉 종가 히스토리 적재
     */
    public void warmUpFromChartApi(String ticker) {
        String normalizedTicker = ticker.trim().toUpperCase();

        // 종목별 computeIfAbsent로 1회만 안전하게 적재
        candleHistoryMap.computeIfAbsent(normalizedTicker, k -> {
            List<BigDecimal> history = new CopyOnWriteArrayList<>();
            try {
                log.info("[CandleRollupEngine] 콜드 스타트 감지: 차트 API 1회 백필 시작: ticker={}", normalizedTicker);
                List<StockChartResponse> chartData = stockChartService.getChartData(normalizedTicker, ChartRangeType.DAY_1, null);

                if (chartData != null && !chartData.isEmpty()) {
                    for (StockChartResponse candle : chartData) {
                        if (candle != null && candle.price() != null) {
                            history.add(candle.price());
                        }
                    }
                    log.info("[CandleRollupEngine] 콜드 스타트 백필 완료: ticker={}, 로드된 5분봉={}",
                            normalizedTicker, history.size());
                }
            } catch (Exception e) {
                log.warn("[CandleRollupEngine] 콜드 스타트 백필 실패 (빈 상태 유지): ticker={}, error={}",
                        normalizedTicker, e.getMessage());
            }
            return history;
        });
    }

    /**
     * 메모리 초기화 (테스트용)
     */
    public void clear() {
        candleHistoryMap.clear();
        currentBufferMap.clear();
    }
}
