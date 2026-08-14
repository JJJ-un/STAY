package com.stay.backend.domain.stock.dto;

import com.stay.backend.domain.stock.entity.Stock;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "메인 화면 주식 종목 응답 DTO")
public record StockResponse(
        @Schema(description = "종목 ID (PK)", example = "1")
        Long stockId,

        @Schema(description = "종목명", example = "엔비디아 (NVIDIA)")
        String name,

        @Schema(description = "종목 티커", example = "NVDA")
        String ticker,

        @Schema(description = "현재 체결가", example = "128.3000")
        BigDecimal currentPrice,

        @Schema(description = "전일대비 변동 금액", example = "2.8000")
        BigDecimal changePrice,

        @Schema(description = "전일대비 등락률 (%)", example = "2.23")
        BigDecimal changeRate,

        @Schema(description = "당일 누적 거래량", example = "45120300")
        Long volume,

        @Schema(description = "시가총액", example = "3150000000000")
        Long marketCap
) {
    public static StockResponse from(Stock stock) {
        return new StockResponse(
                stock.getId(),
                stock.getName(),
                stock.getTicker(),
                stock.getCurrentPrice(),
                stock.getChangePrice(),
                stock.getChangeRate(),
                stock.getVolume(),
                stock.getMarketCap()
        );
    }
}
