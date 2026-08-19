package com.stay.backend.infra.kis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

/**
 * 한국투자증권 해외주식 현재가 상세 조회 응답 DTO
 * TR ID: HHDFS76200200
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
            String rsym, // 실시간조회종목코드 (예: NASDNVDA)

            @JsonProperty("last")
            String last, // 현재가

            @JsonProperty("base")
            String base, // 전일종가

            @JsonProperty("t_xdif")
            String diff, // 전일대비 변동금액 (한투 공식 필드: t_xdif)

            @JsonProperty("t_xrat")
            String rate, // 당일 등락률 % (한투 공식 필드: t_xrat)

            @JsonProperty("tvol")
            String tvol, // 거래량

            @JsonProperty("tomv")
            String tomv, // 시가총액

            @JsonProperty("open")
            String open, // 시가

            @JsonProperty("high")
            String high, // 고가

            @JsonProperty("low")
            String low // 저가
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
