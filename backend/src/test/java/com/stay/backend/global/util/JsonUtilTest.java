package com.stay.backend.global.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JsonUtil 주가 패턴 직렬화/역직렬화 단위 테스트")
class JsonUtilTest {

    @Test
    @DisplayName("캔들 가격 리스트를 JSON 문자열로 정확히 변환하여 저장한다")
    void shouldSerializePriceListToJson() {
        // 1. Given (준비: 유저가 일지에 기록한 캔들 가격 리스트)
        List<BigDecimal> prices = List.of(
                new BigDecimal("128.50"),
                new BigDecimal("126.30"),
                new BigDecimal("124.10"),
                new BigDecimal("125.80"),
                new BigDecimal("127.90")
        );

        // 2. When (실행: DB 저장을 위한 JSON 직렬화)
        String json = JsonUtil.toJson(prices);

        // 3. Then (검증: 올바른 JSON 배열 포맷인지 확인)
        assertThat(json).isEqualTo("[128.50,126.30,124.10,125.80,127.90]");
    }

    @Test
    @DisplayName("DB에 저장된 JSON 문자열을 원래의 BigDecimal 캔들 리스트로 오차 없이 복원한다")
    void shouldParseJsonToExactBigDecimalList() {
        // 1. Given (준비: DB price_pattern 컬럼에 들어있는 JSON)
        String json = "[128.50,126.30,124.10,125.80,127.90]";

        // 2. When (실행: 스케줄러가 파싱 복원)
        List<BigDecimal> result = JsonUtil.parsePricePattern(json);

        // 3. Then (검증: 5개 캔들과 소수점 가격이 100% 동일하게 복원되었는지 확인)
        assertThat(result).hasSize(5);
        assertThat(result.get(0)).isEqualByComparingTo("128.50");
        assertThat(result.get(1)).isEqualByComparingTo("126.30");
        assertThat(result.get(2)).isEqualByComparingTo("124.10");
        assertThat(result.get(3)).isEqualByComparingTo("125.80");
        assertThat(result.get(4)).isEqualByComparingTo("127.90");
    }

    @Test
    @DisplayName("null 또는 빈 문자열이 들어와도 에러 없이 안전하게 빈 리스트를 반환한다")
    void shouldReturnEmptyListWhenInputIsNullOrEmpty() {
        // When & Then (예외 없이 빈 리스트 [] 반환 방어)
        assertThat(JsonUtil.parsePricePattern(null)).isEmpty();
        assertThat(JsonUtil.parsePricePattern("")).isEmpty();
        assertThat(JsonUtil.parsePricePattern("   ")).isEmpty();
    }

    @Test
    @DisplayName("깨진 JSON 형식이 들어와도 서버가 죽지 않고 안전하게 빈 리스트를 반환한다")
    void shouldReturnEmptyListWhenJsonIsMalformed() {
        // When & Then (문법 에러 방어)
        assertThat(JsonUtil.parsePricePattern("[128.50, invalid_number]")).isEmpty();
    }
}
