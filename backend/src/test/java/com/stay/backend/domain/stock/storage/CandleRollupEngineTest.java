package com.stay.backend.domain.stock.storage;

import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.service.StockChartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("CandleRollupEngine 5분봉 롤업 및 콜드 스타트 워밍업 단위 테스트")
class CandleRollupEngineTest {

    @Mock
    private StockChartService stockChartService;

    private CandleRollupEngine rollupEngine;

    @BeforeEach
    void setUp() {
        rollupEngine = new CandleRollupEngine(stockChartService);
    }

    @Test
    @DisplayName("5분 윈도우가 경과하면 이전 버킷의 최종 종가가 시계열 리스트에 확정 추가된다")
    void shouldFinalizePreviousBucketWhenNewWindowStarts() {
        // given: 12:00:00 기준
        long baseTime = 1700000000000L; // 임의의 epoch millis
        long window1 = baseTime - (baseTime % (5 * 60 * 1000L));
        long window2 = window1 + (5 * 60 * 1000L); // 5분 뒤

        // when: 첫 번째 5분 윈도우 동안 체결가 3건 수신 (100.0 -> 105.0 -> 102.0)
        rollupEngine.acceptTick("NVDA", BigDecimal.valueOf(100.0), Instant.ofEpochMilli(window1 + 1000));
        rollupEngine.acceptTick("NVDA", BigDecimal.valueOf(105.0), Instant.ofEpochMilli(window1 + 2000));
        rollupEngine.acceptTick("NVDA", BigDecimal.valueOf(102.0), Instant.ofEpochMilli(window1 + 3000));

        // 두 번째 5분 윈도우 진입 (108.0 체결)
        rollupEngine.acceptTick("NVDA", BigDecimal.valueOf(108.0), Instant.ofEpochMilli(window2 + 500));

        // then: 이전 5분봉의 최종 종가 102.0이 시계열에 확정되었고, 현재 윈도우 108.0이 덧붙여져 총 2개여야 함
        List<BigDecimal> dailyCandles = rollupEngine.getDailyCandles("NVDA");
        assertThat(dailyCandles).hasSize(2);
        assertThat(dailyCandles.get(0)).isEqualByComparingTo(BigDecimal.valueOf(102.0));
        assertThat(dailyCandles.get(1)).isEqualByComparingTo(BigDecimal.valueOf(108.0));
    }

    @Test
    @DisplayName("콜드 스타트(메모리 공백) 상태에서 조회 시, KIS 차트 API를 딱 1회 백필하여 과거 캔들을 복구한다")
    void shouldWarmUpFromChartApiWhenHistoryIsEmpty() {
        // given: 증권사 차트 API가 과거 5분봉 3개를 반환하도록 모킹
        List<StockChartResponse> mockApiCandles = List.of(
                new StockChartResponse("2026-09-12 09:05", BigDecimal.valueOf(90.0), BigDecimal.valueOf(91.0), BigDecimal.valueOf(89.0), BigDecimal.ZERO, 1000L),
                new StockChartResponse("2026-09-12 09:10", BigDecimal.valueOf(92.0), BigDecimal.valueOf(93.0), BigDecimal.valueOf(91.5), BigDecimal.ZERO, 1200L),
                new StockChartResponse("2026-09-12 09:15", BigDecimal.valueOf(94.0), BigDecimal.valueOf(95.0), BigDecimal.valueOf(93.0), BigDecimal.ZERO, 1500L)
        );

        given(stockChartService.getChartData(eq("TSLA"), eq(ChartRangeType.DAY_1), any()))
                .willReturn(mockApiCandles);

        // when: 첫 조회 실행
        List<BigDecimal> candlesFirst = rollupEngine.getDailyCandles("TSLA");

        // then: 과거 3개 캔들이 메모리에 정상 복원되어야 함
        assertThat(candlesFirst).hasSize(3);
        assertThat(candlesFirst).extracting(BigDecimal::doubleValue)
                .containsExactly(90.0, 92.0, 94.0);

        // 두 번째 조회 시에는 API를 다시 부르지 않고 캐시에서 서빙 (호출 횟수 1회 유지)
        List<BigDecimal> candlesSecond = rollupEngine.getDailyCandles("TSLA");
        assertThat(candlesSecond).hasSize(3);
        verify(stockChartService, times(1)).getChartData(eq("TSLA"), eq(ChartRangeType.DAY_1), any());
    }
}
