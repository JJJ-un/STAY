package com.stay.backend.infra.kis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

/**
 * 한국투자증권 해외주식 현재가 체결 조회 응답 DTO
 * TR ID: HHDFS00000300
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
            String rsym, // 종목코드 (예: NASDNVDA)

            @JsonProperty("last")
            String last, // 현재 체결가 (달러 $)

            @JsonProperty("base")
            String base, // 전일 종가 (달러 $)

            @JsonProperty("diff")
            String diff, // 전일대비 변동금액 (순수 달러 $)

            @JsonProperty("rate")
            String rate, // 전일대비 등락률 (%)

            @JsonProperty("tvol")
            String tvol, // 당일 누적 거래량

            @JsonProperty("open")
            String open, // 시가

            @JsonProperty("high")
            String high, // 고가

            @JsonProperty("low")
            String low, // 저가

            @JsonProperty("tomv")
            String tomv, // 시가총액

            @JsonProperty("pvol")
            String pvol // 전일 거래량
    ) {
        public BigDecimal getLastAsBigDecimal() {
            return (last != null && !last.isBlank())
                    ? new BigDecimal(last.trim().replace("+", ""))
                    : BigDecimal.ZERO;
        }

        public BigDecimal getDiffAsBigDecimal() {
            return (diff != null && !diff.isBlank())
                    ? new BigDecimal(diff.trim().replace("+", ""))
                    : BigDecimal.ZERO;
        }

        public BigDecimal getRateAsBigDecimal() {
            return (rate != null && !rate.isBlank())
                    ? new BigDecimal(rate.trim().replace("+", ""))
                    : BigDecimal.ZERO;
        }

        public Long getTvolAsLong() {
            return (tvol != null && !tvol.isBlank())
                    ? Long.parseLong(tvol.trim())
                    : 0L;
        }
    }
}
