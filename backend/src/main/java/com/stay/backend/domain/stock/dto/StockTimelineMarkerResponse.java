package com.stay.backend.domain.stock.dto;

import com.stay.backend.domain.journal.entity.EmotionType;
import com.stay.backend.domain.journal.entity.Journal;
import com.stay.backend.domain.journal.entity.TradeType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "차트 하단 X축 타임라인 일지 마커 응답 DTO")
public record StockTimelineMarkerResponse(
        @Schema(description = "해당 일자 (YYYY-MM-DD)", example = "2026-08-15")
        String date,

        @Schema(description = "해당 일자의 총 일지 수", example = "3")
        int totalCount,

        @Schema(description = "해당 일자의 매수 일지 수", example = "1")
        int buyCount,

        @Schema(description = "해당 일자의 매도 일지 수", example = "0")
        int sellCount,

        @Schema(description = "해당 일자의 관망 일지 수", example = "2")
        int watchCount,

        @Schema(description = "해당 일자에 작성된 일지/다짐 요약 목록 (마커 클릭 시 팝업에 표시)")
        List<JournalSummary> journals
) {
    @Schema(description = "타임라인 마커 팝업용 일지 요약 DTO")
    public record JournalSummary(
            @Schema(description = "일지 ID (PK, 클릭 시 상세 페이지 이동용)", example = "1")
            Long journalId,

            @Schema(description = "매매 유형", example = "BUY")
            TradeType tradeType,

            @Schema(description = "매매 당시 감정", example = "CONFIDENCE")
            EmotionType emotion,

            @Schema(description = "미래의 나에게 보내는 STAY 다짐 메시지", example = "목표가 150달러 도달 전까지 절대 뇌동매도 금지!")
            String stayMessage,

            @Schema(description = "실제 매매/작성 일시", example = "2026-08-15T10:30:00")
            LocalDateTime tradeDateTime
    ) {
        public static JournalSummary from(Journal journal) {
            return new JournalSummary(
                    journal.getId(),
                    journal.getTradeType(),
                    journal.getEmotion(),
                    journal.getStayMessage(),
                    journal.getTradeDateTime()
            );
        }
    }
}
