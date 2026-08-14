package com.stay.backend.domain.journal.dto;

import com.stay.backend.domain.journal.entity.CurrencyType;
import com.stay.backend.domain.journal.entity.EmotionType;
import com.stay.backend.domain.journal.entity.HoldingPeriod;
import com.stay.backend.domain.journal.entity.TradeType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "주식일지 작성 요청 DTO")
public record JournalCreateRequest(

        // 1단계: 매매 사실 (Fact)
        @Schema(description = "종목 ID (PK)", example = "1")
        @NotNull(message = "종목 ID는 필수입니다.")
        Long stockId,

        @Schema(description = "매매 유형 (BUY, SELL, REBALANCE)", example = "BUY")
        @NotNull(message = "매매 유형은 필수입니다.")
        TradeType tradeType,

        @Schema(description = "실제 매매 일시", example = "2026-08-14T10:30:00")
        @NotNull(message = "매매 일시는 필수입니다.")
        LocalDateTime tradeDateTime,

        @Schema(description = "통화 (KRW, USD)", example = "USD")
        CurrencyType currency,

        @Schema(description = "매매 단가", example = "125.5000")
        @NotNull(message = "매매 단가는 필수입니다.")
        @Positive(message = "매매 단가는 양수여야 합니다.")
        BigDecimal price,

        @Schema(description = "매매 수량", example = "10.0000")
        @NotNull(message = "매매 수량은 필수입니다.")
        @Positive(message = "매매 수량은 양수여야 합니다.")
        BigDecimal quantity,

        @Schema(description = "총 매매 금액", example = "1255.0000")
        @NotNull(message = "총 매매 금액은 필수입니다.")
        @Positive(message = "총 매매 금액은 양수여야 합니다.")
        BigDecimal totalPrice,

        // 2단계: 매매 원칙 (Rule)
        @Schema(description = "익절 목표가", example = "150.0000")
        BigDecimal targetPrice,

        @Schema(description = "손절 기준가", example = "110.0000")
        BigDecimal stopLossPrice,

        @Schema(description = "목표 보유 기간 (SHORT, MEDIUM, LONG)", example = "LONG")
        HoldingPeriod holdingPeriod,

        // 3단계: 심리 & STAY 다짐
        @Schema(description = "매매 당시 감정 (CONFIDENCE, FOMO, PANIC, GREED, NONE)", example = "CONFIDENCE")
        EmotionType emotion,

        @Schema(description = "매매 근거 메모", example = "실적 발표 후 AI 칩 수요 증가 전망 확인 진입")
        String reasonMemo,

        @Schema(description = "미래의 나에게 보내는 STAY 다짐 메시지", example = "목표가 150달러 도달 전까지 절대 뇌동매도 금지!")
        @NotBlank(message = "STAY 다짐 메시지는 필수입니다.")
        String stayMessage,

        @Schema(description = "원칙 체크리스트 목록")
        List<ChecklistRequest> checklists,

        @Schema(description = "피드 공개 여부 (기본값: false)", example = "false")
        Boolean isPublic
) {
    @Schema(description = "원칙 체크리스트 항목 DTO")
    public record ChecklistRequest(
            @Schema(description = "체크 항목 내용", example = "분할 매수 원칙을 지켰는가?")
            @NotBlank(message = "체크리스트 내용은 필수입니다.")
            String content,

            @Schema(description = "체크 여부", example = "true")
            Boolean isChecked
    ) {}
}
