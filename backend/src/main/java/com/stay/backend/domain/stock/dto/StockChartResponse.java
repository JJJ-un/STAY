package com.stay.backend.domain.stock.dto;

import com.stay.backend.infra.kis.dto.KisChartPriceResponse;
import com.stay.backend.infra.kis.dto.KisMinuteChartPriceResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "선/영역 차트 시세 데이터 응답 DTO")
public record StockChartResponse(
        @Schema(description = "일시 (일봉: YYYY-MM-DD, 분봉: YYYY-MM-DD HH:mm:ss)", example = "2026-08-15")
        String dateTime,

        @Schema(description = "해당 시점 주가 (종가/체결가)", example = "128.3000")
        BigDecimal price,

        @Schema(description = "해당 기간 최고가 (툴팁용)", example = "129.0000")
        BigDecimal high,

        @Schema(description = "해당 기간 최저가 (툴팁용)", example = "124.8000")
        BigDecimal low,

        @Schema(description = "전일대비 등락률 (%)", example = "2.23")
        BigDecimal rate,

        @Schema(description = "거래량", example = "45120300")
        Long volume
) {
    /**
     * 한투 기간별 시세 (일/주/월봉) 캔들 변환
     */
    public static StockChartResponse fromPeriodItem(KisChartPriceResponse.KisChartItem item) {
        String formattedDate = formatDate(item.xymd());
        return new StockChartResponse(
                formattedDate,
                parseBigDecimal(item.clos()),
                parseBigDecimal(item.high()),
                parseBigDecimal(item.low()),
                parseBigDecimal(item.rate()),
                parseLong(item.tvol())
        );
    }

    /**
     * 한투 분봉 시세 (5분봉) 캔들 변환
     */
    public static StockChartResponse fromMinuteItem(KisMinuteChartPriceResponse.KisMinuteItem item) {
        String formattedDateTime = formatDateTime(item.kymd(), item.khms());
        return new StockChartResponse(
                formattedDateTime,
                parseBigDecimal(item.last()),
                parseBigDecimal(item.high()),
                parseBigDecimal(item.low()),
                BigDecimal.ZERO, // 분봉은 rate 필드가 없으므로 0 기본 처리
                parseLong(item.evol())
        );
    }

    private static String formatDate(String ymd) {
        if (ymd == null || ymd.length() != 8) return ymd;
        return ymd.substring(0, 4) + "-" + ymd.substring(4, 6) + "-" + ymd.substring(6, 8);
    }

    private static String formatDateTime(String ymd, String hms) {
        String date = formatDate(ymd);
        if (hms == null || hms.length() < 6) return date;
        String time = hms.substring(0, 2) + ":" + hms.substring(2, 4) + ":" + hms.substring(4, 6);
        return date + " " + time;
    }

    private static BigDecimal parseBigDecimal(String val) {
        if (val == null || val.isBlank()) return BigDecimal.ZERO;
        try {
            return new BigDecimal(val.trim());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private static Long parseLong(String val) {
        if (val == null || val.isBlank()) return 0L;
        try {
            return Long.parseLong(val.trim());
        } catch (Exception e) {
            return 0L;
        }
    }
}
