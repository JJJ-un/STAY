package com.stay.backend.domain.stock.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 프론트엔드 5대 차트 기간 탭 및 캔들 매핑 Enum
 */
@Getter
@RequiredArgsConstructor
public enum ChartRangeType {
    DAY_1("1일", "5분봉", true, 5, null),
    WEEK_1("1주", "일봉", false, 0, "0"),
    MONTH_3("3개월", "일봉", false, 0, "0"),
    YEAR_1("1년", "주봉", false, 0, "1"),
    YEAR_5("5년", "월봉", false, 0, "2");

    private final String description;
    private final String candleType;
    private final boolean isMinute;     // 분봉 API 호출 여부 (DAY_1만 true)
    private final int minuteInterval;   // 분봉 간격 (5분)
    private final String kisGubnCode;   // 한투 기간별시세 GUBN 파라미터 (0: 일봉, 1: 주봉, 2: 월봉)
}
