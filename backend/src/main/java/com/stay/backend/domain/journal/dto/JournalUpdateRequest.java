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

@Schema(description = "주식일지 수정 요청 DTO")
public record JournalUpdateRequest(

        // 1단계 오타 수정 지원 (매매 사실)
        @Schema(description = "매매 유형 (BUY, SELL, REBALANCE)", example = "BUY")
        @NotNull(message = "매매 유형은 필수입니다.")
        TradeType tradeType,

        @Schema(description = "실제 매매 일시", example = "2026-08-14T10:30:00")
        @NotNull(message = "매매 일시는 필수입니다.")
        LocalDateTime tradeDateTime,

        @Schema(description = "통화 (KRW, USD)", example = "USD")
        CurrencyType currency,

        @Schema(description = "매매 단가", example = "130.0000")
        @NotNull(message = "매매 단가는 필수입니다.")
        @Positive(message = "매매 단가는 양수여야 합니다.")
        BigDecimal price,

        @Schema(description = "매매 수량", example = "15.0000")
        @NotNull(message = "매매 수량은 필수입니다.")
        @Positive(message = "매매 수량은 양수여야 합니다.")
        BigDecimal quantity,

        @Schema(description = "총 매매 금액", example = "1950.0000")
        @NotNull(message = "총 매매 금액은 필수입니다.")
        @Positive(message = "총 매매 금액은 양수여야 합니다.")
        BigDecimal totalPrice,

        // 2단계: 매매 원칙 수정
        @Schema(description = "익절 목표가", example = "160.0000")
        BigDecimal targetPrice,

        @Schema(description = "손절 기준가", example = "115.0000")
        BigDecimal stopLossPrice,

        @Schema(description = "목표 보유 기간 (SHORT, MEDIUM, LONG)", example = "MEDIUM")
        HoldingPeriod holdingPeriod,

        // 3단계: 심리 & STAY 다짐 수정
        @Schema(description = "매매 당시 감정 (CONFIDENCE, FOMO, PANIC, GREED, NONE)", example = "CONFIDENCE")
        EmotionType emotion,

        @Schema(description = "매매 근거 메모", example = "추가 매수 및 목표가 상향 조정")
        String reasonMemo,

        @Schema(description = "미래의 나에게 보내는 STAY 다짐 메시지", example = "목표가 160달러까지 분할 익절 원칙 준수!")
        @NotBlank(message = "STAY 다짐 메시지는 필수입니다.")
        String stayMessage,

        @Schema(description = "피드 공개 여부", example = "true")
        @NotNull(message = "공개 여부는 필수입니다.")
        Boolean isPublic,

        @Schema(description = "주가 흐름 및 목표가 추적 활성화 여부 (토글 ON/OFF, null인 경우 기존 상태 유지)", example = "true")
        Boolean isTracking
) {}
