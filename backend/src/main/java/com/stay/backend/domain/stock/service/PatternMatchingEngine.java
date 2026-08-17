package com.stay.backend.domain.stock.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * 주가 흐름(시계열 파동) 누적 등락률 기반 코사인 유사도 매칭 수학 엔진
 */
@Slf4j
@Component
public class PatternMatchingEngine {

    // 유효한 파동 분석을 위한 최소 캔들 개수
    private static final int MIN_CANDLE_SIZE = 5;

    /**
     * 과거 일지 주가 패턴과 현재 실시간 차트 파동 간의 유사도 계산 (0.0 ~ 1.0)
     *
     * @param targetPattern 과거 일지 작성 당시의 주가 궤적 리스트
     * @param currentCandles 현재 실시간 차트의 주가 궤적 리스트
     * @return 코사인 유사도 (0.0 ~ 1.0, 1.0은 100% 완벽 일치)
     */
    public double calculateSimilarity(List<BigDecimal> targetPattern, List<BigDecimal> currentCandles) {
        if (targetPattern == null || currentCandles == null) {
            return 0.0;
        }

        int targetSize = targetPattern.size();
        if (targetSize < MIN_CANDLE_SIZE || currentCandles.size() < targetSize) {
            return 0.0;
        }

        // 1. 현재 차트에서 과거 패턴 길이와 동일한 최신 N개 캔들 추출 (슬라이딩 윈도우)
        List<BigDecimal> slicedCurrent = currentCandles.subList(currentCandles.size() - targetSize, currentCandles.size());

        // 2. 맨 첫 캔들(0%) 기준 누적 등락률 벡터 생성
        double[] vectorA = toCumulativeReturnVector(targetPattern);
        double[] vectorB = toCumulativeReturnVector(slicedCurrent);

        if (vectorA == null || vectorB == null) {
            return 0.0;
        }

        // 3. 코사인 유사도 연산 (-1.0 ~ +1.0 ➔ 0.0 ~ 1.0 정규화)
        double similarity = cosineSimilarity(vectorA, vectorB);

        log.debug("주가 패턴 유사도 연산 완료: targetSize={}, similarity={}", targetSize, similarity);

        return Math.max(0.0, Math.min(1.0, similarity));
    }

    /**
     * 캔들 가격 리스트를 '첫 캔들 0% 기준 누적 등락률 벡터'로 변환
     * 공식: r_i = ((P_i - P_0) / P_0) * 100
     */
    public double[] toCumulativeReturnVector(List<BigDecimal> prices) {
        if (prices == null || prices.isEmpty()) {
            return null;
        }

        double basePrice = prices.get(0).doubleValue();
        if (basePrice <= 0) {
            return null; // 0원 이하 비정상 가격 방어
        }

        double[] vector = new double[prices.size()];
        for (int i = 0; i < prices.size(); i++) {
            double currentPrice = prices.get(i).doubleValue();
            vector[i] = ((currentPrice - basePrice) / basePrice) * 100.0;
        }

        return vector;
    }

    /**
     * 두 1차원 벡터의 코사인 유사도(Cosine Similarity) 계산
     * 공식: (A · B) / (||A|| * ||B||)
     */
    public double cosineSimilarity(double[] vectorA, double[] vectorB) {
        if (vectorA.length != vectorB.length || vectorA.length == 0) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        // 플랫 차트(변동폭 0) 또는 분모가 0인 경우 수학적 NaN 에러 방어
        if (normA <= 0.0 || normB <= 0.0) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

        // 부동소수점 오차 보정 (-1.0 ~ 1.0 범위 제한)
        if (Double.isNaN(similarity)) {
            return 0.0;
        }

        return similarity;
    }
}
