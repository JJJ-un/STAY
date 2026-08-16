package com.stay.backend.domain.journal.dto;

import com.stay.backend.domain.journal.entity.CurrencyType;
import com.stay.backend.domain.journal.entity.EmotionType;
import com.stay.backend.domain.journal.entity.HoldingPeriod;
import com.stay.backend.domain.journal.entity.TradeType;
import com.stay.backend.domain.stock.entity.ChartRangeType;
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

        @Schema(description = "매매/관망 유형 (BUY, SELL, REBALANCE, WATCH)", example = "WATCH")
        TradeType tradeType,

        @Schema(description = "실제 매매/작성 일시", example = "2026-08-14T10:30:00")
        @NotNull(message = "매매/작성 일시는 필수입니다.")
        LocalDateTime tradeDateTime,

        @Schema(description = "통화 (KRW, USD)", example = "USD")
        CurrencyType currency,

        @Schema(description = "매매 단가 (WATCH일 때는 생략 가능)", example = "125.5000")
        @Positive(message = "매매 단가는 양수여야 합니다.")
        BigDecimal price,

        @Schema(description = "매매 수량 (WATCH일 때는 생략 가능)", example = "10.0000")
        @Positive(message = "매매 수량은 양수여야 합니다.")
        BigDecimal quantity,

        @Schema(description = "총 매매 금액 (WATCH일 때는 생략 가능)", example = "1255.0000")
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

        // 4단계: 주가 흐름 패턴 스냅샷 (시스템 자동 캡처 / 선택)
        @Schema(description = "작성 당시 차트 기간 범위 (DAY_1: 1일/5분봉, WEEK_1: 1주/일봉, MONTH_3: 3개월/일봉, YEAR_1: 1년/주봉, YEAR_5: 5년/월봉)", example = "MONTH_3")
        ChartRangeType chartRangeType,

        @Schema(description = "작성 당시 차트 캔들 종가 궤적 리스트 (시스템 자동 캡처)", example = "[120.5, 122.0, 121.3, 125.0, 128.3]")
        List<BigDecimal> pricePattern,

        @Schema(description = "주가 흐름 패턴 추적 알림 활성화 여부 (기본값: true)", example = "true")
        Boolean isTracking,

        @Schema(description = "원칙 체크리스트 목록")
        List<ChecklistRequest> checklists
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
