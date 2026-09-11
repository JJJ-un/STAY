package com.stay.backend.domain.stock.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

/**
 * 주가 흐름(시계열 파동) 고정밀 패턴 매칭 엔진
 * - Z-Score 정규화 (Z-Normalization): 주가 절대 레벨 및 진폭 왜곡 방어
 * - O(N) Sakoe-Chiba Band Fast-DTW: 1~2캔들 시차(Time-lag / 속도 차이) 선형 보정
 * - Z-정규화 유클리드 거리 ➔ 피어슨 상관계수 등가 변환 공식: r = 1 - (D^2 / 2N)
 */
@Slf4j
@Component
public class PatternMatchingEngine {

    // 유효한 파동 분석을 위한 최소 캔들 개수
    private static final int MIN_CANDLE_SIZE = 5;

    // Fast-DTW 워핑 윈도우 크기 (1~2캔들의 미세 시차 허용, O(N * (2w + 1)) = O(N) 보장)
    private static final int WARPING_WINDOW = 1;

    /**
     * 과거 일지 주가 패턴과 현재 실시간 차트 파동 간의 유사도 계산 (0.0 ~ 1.0)
     *
     * @param targetPattern 과거 일지 작성 당시의 주가 궤적 리스트
     * @param currentCandles 현재 실시간 차트의 주가 궤적 리스트
     * @return Z-정규화 및 O(N) Fast-DTW 보정 유사도 (0.0 ~ 1.0, 1.0은 100% 완벽 일치)
     */
    public double calculateSimilarity(List<BigDecimal> targetPattern, List<BigDecimal> currentCandles) {
        if (targetPattern == null || currentCandles == null) {
            return 0.0;
        }

        int targetSize = targetPattern.size();
        if (targetSize < MIN_CANDLE_SIZE || currentCandles.size() < targetSize) {
            return 0.0;
        }

        // 1. 현재 차트에서 과거 패턴 길이와 동일한 최신 N개 캔들 슬라이싱
        List<BigDecimal> slicedCurrent = currentCandles.subList(currentCandles.size() - targetSize, currentCandles.size());

        // 2. Z-Score 정규화 (평균 0, 표준편차 1로 변환하여 진폭 및 주가 레벨 왜곡 제거)
        double[] zPattern = zNormalize(targetPattern);
        double[] zCurrent = zNormalize(slicedCurrent);

        if (zPattern == null || zCurrent == null) {
            return 0.0;
        }

        // 3. 트렌드 방향성 검증 (하락 vs 상승의 정반대 파동인 경우 즉시 0.0 반환)
        double dotProduct = 0.0;
        for (int i = 0; i < targetSize; i++) {
            dotProduct += zPattern[i] * zCurrent[i];
        }
        if (dotProduct <= 0.0) {
            return 0.0; // 정반대 방향 추세
        }

        // 4. O(N) Sakoe-Chiba Band Fast-DTW 정규화 거리 계산
        double dtwDistance = calculateFastDtwDistance(zPattern, zCurrent, WARPING_WINDOW);

        // 5. Z-정규화 유클리드 거리 ➔ 피어슨 상관계수(유사도) 수학적 변환 공식: r = 1 - (D^2 / 2N)
        double similarity = 1.0 - (Math.pow(dtwDistance, 2) / (2.0 * targetSize));

        // 6. 완벽 일치(거리 0) 및 0.0 ~ 1.0 범위 제한
        if (dtwDistance < 1e-6) {
            similarity = 1.0;
        }

        double finalSimilarity = Math.max(0.0, Math.min(1.0, similarity));

        log.debug("주가 패턴 고정밀 매칭 완료: targetSize={}, dtwDistance={}, similarity={}",
                targetSize, dtwDistance, finalSimilarity);

        return finalSimilarity;
    }

    /**
     * 시계열 데이터를 Z-Score 정규화 (Z = (X - μ) / σ)
     */
    public double[] zNormalize(List<BigDecimal> prices) {
        if (prices == null || prices.isEmpty()) {
            return null;
        }

        int n = prices.size();
        double sum = 0.0;
        double[] raw = new double[n];

        for (int i = 0; i < n; i++) {
            raw[i] = prices.get(i).doubleValue();
            sum += raw[i];
        }

        double mean = sum / n;

        double varianceSum = 0.0;
        for (int i = 0; i < n; i++) {
            varianceSum += Math.pow(raw[i] - mean, 2);
        }

        double stdDev = Math.sqrt(varianceSum / n);

        // 수평 플랫 차트(변동폭 0)인 경우 0으로 나누기 방어
        if (stdDev < 1e-9) {
            return new double[n]; // 모두 0.0
        }

        double[] zScores = new double[n];
        for (int i = 0; i < n; i++) {
            zScores[i] = (raw[i] - mean) / stdDev;
        }

        return zScores;
    }

    /**
     * Sakoe-Chiba Band 제한 기법을 적용한 O(N) 선형 시간 Fast-DTW 유클리드 거리 계산
     *
     * @param a Z-정규화된 시계열 A
     * @param b Z-정규화된 시계열 B
     * @param w 워핑 윈도우 허용 반경 (Sakoe-Chiba Band폭)
     * @return 시간 축 왜곡이 보정된 최소 워핑 누적 거리
     */
    public double calculateFastDtwDistance(double[] a, double[] b, int w) {
        int n = a.length;
        int m = b.length;

        // DP 테이블 초기화 (Double.POSITIVE_INFINITY로 마스킹)
        double[][] dtw = new double[n + 1][m + 1];
        for (int i = 0; i <= n; i++) {
            Arrays.fill(dtw[i], Double.POSITIVE_INFINITY);
        }
        dtw[0][0] = 0.0;

        int window = Math.max(w, Math.abs(n - m));

        for (int i = 1; i <= n; i++) {
            int jStart = Math.max(1, i - window);
            int jEnd = Math.min(m, i + window);

            for (int j = jStart; j <= jEnd; j++) {
                double cost = Math.pow(a[i - 1] - b[j - 1], 2); // 1차원 유클리드 제곱 거리

                double minPrev = Math.min(
                        dtw[i - 1][j],       // 삽입
                        Math.min(
                                dtw[i][j - 1],   // 삭제
                                dtw[i - 1][j - 1] // 매칭
                        )
                );

                dtw[i][j] = cost + minPrev;
            }
        }

        return Math.sqrt(dtw[n][m]);
    }
}
