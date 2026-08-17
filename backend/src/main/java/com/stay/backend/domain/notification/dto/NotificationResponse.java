package com.stay.backend.domain.notification.dto;

import com.stay.backend.domain.notification.entity.Notification;
import com.stay.backend.domain.notification.entity.NotificationType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "알림 목록 및 단건 조회 응답 DTO")
public record NotificationResponse(
        @Schema(description = "알림 ID (PK)", example = "1")
        Long notificationId,

        @Schema(description = "연관된 주식일지 ID (클릭 시 상세 이동용)", example = "1")
        Long journalId,

        @Schema(description = "종목 티커", example = "NVDA")
        String ticker,

        @Schema(description = "알림 유형", example = "PATTERN_MATCHED")
        NotificationType type,

        @Schema(description = "알림 제목", example = "엔비디아 과거 주가 흐름 재현!")
        String title,

        @Schema(description = "미래의 나에게 보내는 STAY 다짐 메시지", example = "목표가 150달러 도달 전까지 절대 뇌동매도 금지!")
        String stayMessage,

        @Schema(description = "알림 발생 당시 실시간 체결가", example = "128.3000")
        BigDecimal currentPrice,

        @Schema(description = "목표가 / 손절가", example = "150.0000")
        BigDecimal targetPrice,

        @Schema(description = "읽음 여부", example = "false")
        boolean isRead,

        @Schema(description = "알림 발생 일시", example = "2026-08-17T10:30:00")
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getJournalId(),
                notification.getTicker(),
                notification.getType(),
                notification.getTitle(),
                notification.getStayMessage(),
                notification.getCurrentPrice(),
                notification.getTargetPrice(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
