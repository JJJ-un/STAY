package com.stay.backend.infra.kis.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "실시간 주식 시세 DTO")
public record RealtimeStockPrice(
        @Schema(description = "종목 티커", example = "NVDA")
        String ticker,

        @Schema(description = "현재 체결가", example = "128.3000")
        BigDecimal currentPrice,

        @Schema(description = "전일대비 변동 금액", example = "2.8000")
        BigDecimal changePrice,

        @Schema(description = "등락률 (%)", example = "2.23")
        BigDecimal changeRate,

        @Schema(description = "당일 누적 거래량", example = "45120300")
        Long volume
) {}
