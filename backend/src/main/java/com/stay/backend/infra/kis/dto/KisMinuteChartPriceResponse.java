package com.stay.backend.infra.kis.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * 한국투자증권 해외주식 분봉 시세 응답 DTO (TR: HHDFS76950200)
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record KisMinuteChartPriceResponse(
        @JsonProperty("rt_cd")
        String rtCd,

        @JsonProperty("msg1")
        String msg1,

        @JsonProperty("output2")
        List<KisMinuteItem> output2
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KisMinuteItem(
            @JsonProperty("kymd") String kymd,      // 한국 기준 일자 (YYYYMMDD)
            @JsonProperty("khms") String khms,      // 한국 기준 시간 (HHMMSS)
            @JsonProperty("open") String open,      // 시가
            @JsonProperty("high") String high,      // 고가
            @JsonProperty("low") String low,        // 저가
            @JsonProperty("last") String last,      // 종가 (체결가)
            @JsonProperty("evol") String evol,      // 체결량 (거래량)
            @JsonProperty("eamt") String eamt       // 체결대금
    ) {}
}
