package com.stay.backend.domain.stock.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

@DisplayName("PatternMatchingEngine 주가 패턴 코사인 유사도 수학 엔진 단위 테스트")
class PatternMatchingEngineTest {

    private PatternMatchingEngine engine;

    @BeforeEach
    void setUp() {
        engine = new PatternMatchingEngine();
    }

    private BigDecimal bd(double val) {
        return BigDecimal.valueOf(val);
    }

    @Test
    @DisplayName("완벽히 동일한 주가 궤적을 대조하면 유사도 100%(1.0)가 나온다")
    void shouldReturnPerfectSimilarityWhenPatternsAreIdentical() {
        // Given (과거 패턴과 현재 차트 캔들이 100% 동일)
        List<BigDecimal> pastPattern    = List.of(bd(100), bd(95), bd(92), bd(88), bd(93));
        List<BigDecimal> currentCandles = List.of(bd(100), bd(95), bd(92), bd(88), bd(93));

        // When
        double similarity = engine.calculateSimilarity(pastPattern, currentCandles);

        // Then (100% = 1.0)
        assertThat(similarity).isCloseTo(1.0, within(0.001));
    }

    @Test
    @DisplayName("과거 급락 후 반등 패턴과 85% 이상 유사한 파동이 오면 높은 유사도를 계산한다")
    void shouldReturnHighSimilarityForSimilarWavePattern() {
        // Given (과거 10% 급락 후 반등 파동 vs 현재 9% 급락 후 반등 파동)
        List<BigDecimal> pastPattern    = List.of(bd(100), bd(95), bd(90), bd(88), bd(94));
        List<BigDecimal> currentCandles = List.of(bd(100), bd(96), bd(91), bd(89), bd(95));

        // When
        double similarity = engine.calculateSimilarity(pastPattern, currentCandles);

        // Then (유사도 98% 이상 고정밀 판정)
        assertThat(similarity).isGreaterThanOrEqualTo(0.85);
        assertThat(similarity).isCloseTo(0.99, within(0.02));
    }

    @Test
    @DisplayName("과거 급락 패턴과 정반대인 급등 파동이 오면 유사도 0%를 반환한다")
    void shouldReturnZeroForOppositeTrend() {
        // Given (하락 파동 vs 상승 파동)
        List<BigDecimal> pastPattern    = List.of(bd(100), bd(90), bd(80), bd(70), bd(60));
        List<BigDecimal> currentCandles = List.of(bd(100), bd(110), bd(120), bd(130), bd(140));

        // When
        double similarity = engine.calculateSimilarity(pastPattern, currentCandles);

        // Then (정반대 방향은 0.0 반환)
        assertThat(similarity).isEqualTo(0.0);
    }

    @Test
    @DisplayName("실시간 캔들 개수가 과거 패턴 길이보다 부족하면 에러 없이 0.0을 반환한다")
    void shouldReturnZeroWhenCurrentCandlesAreInsufficient() {
        // Given (과거 패턴은 5개인데 실시간 캔들은 3개뿐일 때)
        List<BigDecimal> pastPattern    = List.of(bd(100), bd(95), bd(90), bd(88), bd(94));
        List<BigDecimal> currentCandles = List.of(bd(100), bd(95), bd(90));

        // When
        double similarity = engine.calculateSimilarity(pastPattern, currentCandles);

        // Then (IndexOutOfBoundsException 없이 안전하게 0.0 반환)
        assertThat(similarity).isEqualTo(0.0);
    }

    @Test
    @DisplayName("주가 변동폭(진폭)이 2배 차이나더라도 파동 형태가 동일하면 Z-정규화를 통해 높은 유사도를 반환한다")
    void shouldReturnHighSimilarityEvenWhenAmplitudeIsScaled() {
        // Given (과거는 5달러 폭 파동 vs 현재는 10달러 폭 파동이지만 형태는 동일)
        List<BigDecimal> pastPattern    = List.of(bd(100), bd(95), bd(90), bd(95), bd(100));
        List<BigDecimal> currentCandles = List.of(bd(200), bd(190), bd(180), bd(190), bd(200));

        // When
        double similarity = engine.calculateSimilarity(pastPattern, currentCandles);

        // Then (Z-정규화 덕분에 진폭이 달라도 파형이 같으므로 1.0 완벽 일치!)
        assertThat(similarity).isCloseTo(1.0, within(0.001));
    }

    @Test
    @DisplayName("1캔들의 미세한 시차(Time-lag/속도차이)가 발생하더라도 Fast-DTW 보정을 통해 85% 이상 감지한다")
    void shouldTolerateTimeLagViaFastDtw() {
        // Given (바닥을 치는 시점이 1캔들 지연된 유사 파동)
        // 과거: 100 -> 90(바닥) -> 95 -> 100 -> 105
        // 현재: 100 -> 95 -> 90(바닥: 1캔들 늦음) -> 98 -> 105
        List<BigDecimal> pastPattern    = List.of(bd(100), bd(90), bd(95), bd(100), bd(105));
        List<BigDecimal> currentCandles = List.of(bd(100), bd(95), bd(90), bd(98),  bd(105));

        // When
        double similarity = engine.calculateSimilarity(pastPattern, currentCandles);

        // Then (1:1 코사인 유사도라면 망가지지만, Fast-DTW 시차 보정으로 85% 이상 감지 성공!)
        assertThat(similarity).isGreaterThanOrEqualTo(0.85);
    }
}
