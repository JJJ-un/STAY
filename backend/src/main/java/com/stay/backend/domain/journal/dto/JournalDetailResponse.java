package com.stay.backend.domain.journal.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stay.backend.domain.journal.entity.CurrencyType;
import com.stay.backend.domain.journal.entity.EmotionType;
import com.stay.backend.domain.journal.entity.HoldingPeriod;
import com.stay.backend.domain.journal.entity.Journal;
import com.stay.backend.domain.journal.entity.JournalChecklist;
import com.stay.backend.domain.journal.entity.TradeType;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Schema(description = "주식일지 단건 상세 조회용 전체 응답 DTO")
public record JournalDetailResponse(
        @Schema(description = "주식일지 ID (PK)", example = "1")
        Long journalId,

        // 작성자 정보
        @Schema(description = "작성자 정보")
        AuthorInfo author,

        // 종목 정보
        @Schema(description = "종목 상세 정보")
        StockInfo stock,

        // 1단계: 매매 사실 (Fact)
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

        // 2단계: 매매 원칙 (Rule)
        @Schema(description = "익절 목표가", example = "150.0000")
        BigDecimal targetPrice,

        @Schema(description = "손절 기준가", example = "110.0000")
        BigDecimal stopLossPrice,

        @Schema(description = "목표 보유 기간", example = "LONG")
        HoldingPeriod holdingPeriod,

        // 3단계: 심리 & STAY 다짐
        @Schema(description = "매매 당시 감정", example = "CONFIDENCE")
        EmotionType emotion,

        @Schema(description = "매매 근거 메모 전문", example = "실적 발표 후 AI 칩 수요 증가 전망 확인 진입")
        String reasonMemo,

        @Schema(description = "미래의 나에게 보내는 STAY 다짐 메시지", example = "목표가 150달러 도달 전까지 절대 뇌동매도 금지!")
        String stayMessage,

        // 4단계: 주가 흐름 패턴 스냅샷
        @Schema(description = "작성 당시 차트 기간 범위 (DAY_1: 1일/5분봉, WEEK_1: 1주/일봉, MONTH_3: 3개월/일봉, YEAR_1: 1년/주봉, YEAR_5: 5년/월봉)", example = "MONTH_3")
        ChartRangeType chartRangeType,

        @Schema(description = "작성 당시 주가 흐름 궤적 리스트", example = "[120.5, 122.0, 121.3, 125.0, 128.3]")
        List<BigDecimal> pricePattern,

        @Schema(description = "주가 흐름 패턴 추적 여부", example = "true")
        Boolean isTracking,

        @Schema(description = "알림 트리거 임계치", example = "0.85")
        Double similarityThreshold,

        // 원칙 체크리스트 목록
        @Schema(description = "매수 전 원칙 체크리스트 목록")
        List<ChecklistResponse> checklists,

        @Schema(description = "일지 작성 일시", example = "2026-08-14T10:35:00")
        LocalDateTime createdAt,

        @Schema(description = "일지 최종 수정 일시", example = "2026-08-14T11:00:00")
        LocalDateTime updatedAt
) {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Schema(description = "작성자 정보 DTO")
    public record AuthorInfo(
            @Schema(description = "작성자 ID", example = "1")
            Long userId,

            @Schema(description = "작성자 닉네임", example = "엔비디아올인")
            String nickname,

            @Schema(description = "프로필 이미지 URL")
            String profileImageUrl
    ) {}

    @Schema(description = "종목 정보 DTO")
    public record StockInfo(
            @Schema(description = "종목 ID", example = "1")
            Long stockId,

            @Schema(description = "종목명", example = "NVIDIA (엔비디아)")
            String name,

            @Schema(description = "종목 티커", example = "NVDA")
            String ticker
    ) {}

    @Schema(description = "체크리스트 항목 응답 DTO")
    public record ChecklistResponse(
            @Schema(description = "체크리스트 ID", example = "1")
            Long checklistId,

            @Schema(description = "체크 항목 내용", example = "분할 매수 원칙을 준수했는가?")
            String content,

            @Schema(description = "체크 여부", example = "true")
            boolean isChecked
    ) {
        public static ChecklistResponse from(JournalChecklist checklist) {
            return new ChecklistResponse(
                    checklist.getId(),
                    checklist.getContent(),
                    checklist.isChecked()
            );
        }
    }

    public static JournalDetailResponse of(Journal journal, List<JournalChecklist> checklists) {
        List<BigDecimal> parsedPattern = parsePatternJson(journal.getPricePattern());

        return new JournalDetailResponse(
                journal.getId(),
                new AuthorInfo(
                        journal.getUser().getId(),
                        journal.getUser().getNickname(),
                        journal.getUser().getProfileImageUrl()
                ),
                new StockInfo(
                        journal.getStock().getId(),
                        journal.getStock().getName(),
                        journal.getStock().getTicker()
                ),
                journal.getTradeType(),
                journal.getTradeDateTime(),
                journal.getCurrency(),
                journal.getPrice(),
                journal.getQuantity(),
                journal.getTotalPrice(),
                journal.getTargetPrice(),
                journal.getStopLossPrice(),
                journal.getHoldingPeriod(),
                journal.getEmotion(),
                journal.getReasonMemo(),
                journal.getStayMessage(),
                journal.getChartRangeType(),
                parsedPattern,
                journal.getIsTracking(),
                journal.getSimilarityThreshold(),
                checklists.stream().map(ChecklistResponse::from).toList(),
                journal.getCreatedAt(),
                journal.getUpdatedAt()
        );
    }

    private static List<BigDecimal> parsePatternJson(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<BigDecimal>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
