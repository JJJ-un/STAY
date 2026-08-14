package com.stay.backend.infra.kis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

/**
 * 한국투자증권 해외주식 현재가 상세 조회 응답 DTO
 * TR ID: HHDFS76200200 / HHDFS00000300
 */
public record KisOverseasPriceResponse(
        @JsonProperty("rt_cd")
        String rtCd,

        @JsonProperty("msg_cd")
        String msgCd,

        @JsonProperty("msg1")
        String msg1,

        @JsonProperty("output")
        KisOverseasPriceOutput output
) {
    public boolean isSuccess() {
        return "0".equals(rtCd);
    }

    public record KisOverseasPriceOutput(
            @JsonProperty("rsym")
            String rsym, // 종목 코드 (예: NASDNVDA)

            @JsonProperty("last")
            String last, // 현재 체결가 (예: "128.3000")

            @JsonProperty("diff")
            String diff, // 전일대비 변동 금액 (예: "2.8000")

            @JsonProperty("rate")
            String rate, // 전일대비 등락률 (예: "2.23")

            @JsonProperty("tvol")
            String tvol, // 당일 누적 거래량 (예: "45120300")

            @JsonProperty("base")
            String base  // 전일 종가
    ) {
        public BigDecimal getLastAsBigDecimal() {
            return last != null ? new BigDecimal(last.trim()) : BigDecimal.ZERO;
        }

        public BigDecimal getDiffAsBigDecimal() {
            return diff != null ? new BigDecimal(diff.trim()) : BigDecimal.ZERO;
        }

        public BigDecimal getRateAsBigDecimal() {
            return rate != null ? new BigDecimal(rate.trim()) : BigDecimal.ZERO;
        }

        public Long getTvolAsLong() {
            return tvol != null ? Long.parseLong(tvol.trim()) : 0L;
        }
    }
}
