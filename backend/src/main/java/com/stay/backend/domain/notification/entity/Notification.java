package com.stay.backend.domain.notification.entity;

import com.stay.backend.domain.user.entity.User;
import com.stay.backend.global.common.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    // 알림 수신자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 연관된 주식일지 ID (클릭 시 상세 일지 페이지 이동용)
    @Column(name = "journal_id", nullable = false)
    private Long journalId;

    // 종목 티커 (예: NVDA)
    @Column(name = "ticker", length = 20, nullable = false)
    private String ticker;

    // 알림 유형 (PATTERN_MATCHED, TARGET_PRICE_HIT, STOP_LOSS_HIT)
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", length = 30, nullable = false)
    private NotificationType type;

    // 알림 제목
    @Column(name = "title", length = 100, nullable = false)
    private String title;

    // 미래의 나에게 보내는 STAY 다짐 메시지
    @Column(name = "stay_message", columnDefinition = "TEXT", nullable = false)
    private String stayMessage;

    // 알림 발생 당시 실시간 체결가
    @Column(name = "current_price", precision = 19, scale = 4)
    private BigDecimal currentPrice;

    // 목표가 / 손절가
    @Column(name = "target_price", precision = 19, scale = 4)
    private BigDecimal targetPrice;

    // 읽음 여부 (기본값: false)
    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Builder
    public Notification(User user, Long journalId, String ticker, NotificationType type,
                        String title, String stayMessage, BigDecimal currentPrice,
                        BigDecimal targetPrice) {
        this.user = user;
        this.journalId = journalId;
        this.ticker = ticker;
        this.type = type;
        this.title = title;
        this.stayMessage = stayMessage;
        this.currentPrice = currentPrice;
        this.targetPrice = targetPrice;
        this.isRead = false;
    }

    /**
     * 알림 읽음 처리
     */
    public void markAsRead() {
        this.isRead = true;
    }
}
