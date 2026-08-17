package com.stay.backend.domain.journal.dto;

import com.stay.backend.domain.journal.entity.CurrencyType;
import com.stay.backend.domain.journal.entity.EmotionType;
import com.stay.backend.domain.journal.entity.Journal;
import com.stay.backend.domain.journal.entity.TradeType;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "주식일지 목록 조회용 요약 응답 DTO")
public record JournalResponse(
        @Schema(description = "주식일지 ID (PK)", example = "1")
        Long journalId,

        @Schema(description = "종목 ID", example = "1")
        Long stockId,

        @Schema(description = "종목명", example = "NVIDIA (엔비디아)")
        String stockName,

        @Schema(description = "종목 티커", example = "NVDA")
        String ticker,

        @Schema(description = "매매 유형", example = "BUY")
        TradeType tradeType,

        @Schema(description = "실제 매매 일시", example = "2026-08-14T10:30:00")
        LocalDateTime tradeDateTime,

        @Schema(description = "통화", example = "USD")
        CurrencyType currency,

        @Schema(description = "매매 단가", example = "125.5000")
        BigDecimal price,

        @Schema(description = "매매 수량", example = "10.0000")
        BigDecimal quantity,

        @Schema(description = "총 매매 금액", example = "1255.0000")
        BigDecimal totalPrice,

        @Schema(description = "익절 목표가", example = "150.0000")
        BigDecimal targetPrice,

        @Schema(description = "손절 기준가", example = "110.0000")
        BigDecimal stopLossPrice,

        @Schema(description = "매매 당시 감정", example = "CONFIDENCE")
        EmotionType emotion,

        @Schema(description = "미래의 나에게 보내는 STAY 다짐 메시지", example = "목표가 150달러 도달 전까지 절대 뇌동매도 금지!")
        String stayMessage,

        @Schema(description = "작성 당시 차트 기간 범위 (DAY_1: 1일/5분봉, WEEK_1: 1주/일봉, MONTH_3: 3개월/일봉, YEAR_1: 1년/주봉, YEAR_5: 5년/월봉)", example = "MONTH_3")
        ChartRangeType chartRangeType,

        @Schema(description = "주가 흐름 패턴 추적 여부", example = "true")
        Boolean isTracking,

        @Schema(description = "일지 작성 일시", example = "2026-08-14T10:35:00")
        LocalDateTime createdAt
) {
    public static JournalResponse from(Journal journal) {
        return new JournalResponse(
                journal.getId(),
                journal.getStock().getId(),
                journal.getStock().getName(),
                journal.getStock().getTicker(),
                journal.getTradeType(),
                journal.getTradeDateTime(),
                journal.getCurrency(),
                journal.getPrice(),
                journal.getQuantity(),
                journal.getTotalPrice(),
                journal.getTargetPrice(),
                journal.getStopLossPrice(),
                journal.getEmotion(),
                journal.getStayMessage(),
                journal.getChartRangeType(),
                journal.getIsTracking(),
                journal.getCreatedAt()
        );
    }
}
