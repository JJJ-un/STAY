package com.stay.backend.global.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

/**
 * 전역 JSON 직렬화 / 역직렬화 공통 유틸리티
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class JsonUtil {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<List<BigDecimal>> BIG_DECIMAL_LIST_TYPE = new TypeReference<>() {};

    /**
     * 주가 흐름 패턴 JSON 문자열을 List<BigDecimal>로 안전하게 파싱
     */
    public static List<BigDecimal> parsePricePattern(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return OBJECT_MAPPER.readValue(json, BIG_DECIMAL_LIST_TYPE);
        } catch (Exception e) {
            log.warn("주가 패턴 JSON 파싱 실패: json={}, error={}", json, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 객체를 JSON 문자열로 직렬화
     */
    public static String toJson(Object object) {
        if (object == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(object);
        } catch (Exception e) {
            log.warn("JSON 직렬화 실패: object={}, error={}", object, e.getMessage());
            return null;
        }
    }
}
