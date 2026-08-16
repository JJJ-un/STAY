package com.stay.backend.infra.kis.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * 한국투자증권 해외주식 기간별 시세 (일/주/월봉) 응답 DTO (TR: HHDFS76240000)
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record KisChartPriceResponse(
        @JsonProperty("rt_cd")
        String rtCd,

        @JsonProperty("msg1")
        String msg1,

        @JsonProperty("output2")
        List<KisChartItem> output2
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KisChartItem(
            @JsonProperty("xymd") String xymd,      // 캔들 일자 (YYYYMMDD)
            @JsonProperty("clos") String clos,      // 종가
            @JsonProperty("open") String open,      // 시가
            @JsonProperty("high") String high,      // 고가
            @JsonProperty("low") String low,        // 저가
            @JsonProperty("tvol") String tvol,      // 해당 캔들 거래량
            @JsonProperty("rate") String rate,      // 등락률 (%)
            @JsonProperty("sign") String sign       // 대비구분
    ) {}
}
