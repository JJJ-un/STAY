package com.stay.backend.domain.journal.entity;

import com.stay.backend.domain.stock.entity.Stock;
import com.stay.backend.domain.user.entity.User;
import com.stay.backend.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "journals")
@SQLDelete(sql = "UPDATE journals SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Journal extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    // 1단계: 매매 사실
    @Enumerated(EnumType.STRING)
    @Column(name = "trade_type", nullable = false, length = 20)
    private TradeType tradeType;

    @Column(name = "trade_date_time", nullable = false)
    private LocalDateTime tradeDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CurrencyType currency;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal price;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 4)
    private BigDecimal totalPrice;

    // 2단계: 매매 원칙
    @Column(name = "target_price", precision = 15, scale = 4)
    private BigDecimal targetPrice;

    @Column(name = "stop_loss_price", precision = 15, scale = 4)
    private BigDecimal stopLossPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "holding_period", length = 20)
    private HoldingPeriod holdingPeriod;

    // 3단계: 심리 & STAY
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EmotionType emotion;

    @Column(name = "reason_memo", columnDefinition = "TEXT")
    private String reasonMemo;

    @Column(name = "stay_message", nullable = false, columnDefinition = "TEXT")
    private String stayMessage;

    // 커뮤니티/피드 설정
    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    @Column(name = "like_count", nullable = false)
    private int likeCount;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public Journal(User user, Stock stock, TradeType tradeType, LocalDateTime tradeDateTime,
                   CurrencyType currency, BigDecimal price, BigDecimal quantity, BigDecimal totalPrice,
                   BigDecimal targetPrice, BigDecimal stopLossPrice, HoldingPeriod holdingPeriod,
                   EmotionType emotion, String reasonMemo, String stayMessage, Boolean isPublic) {
        this.user = user;
        this.stock = stock;
        this.tradeType = tradeType;
        this.tradeDateTime = tradeDateTime;
        this.currency = currency != null ? currency : CurrencyType.USD;
        this.price = price;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.targetPrice = targetPrice;
        this.stopLossPrice = stopLossPrice;
        this.holdingPeriod = holdingPeriod;
        this.emotion = emotion != null ? emotion : EmotionType.NONE;
        this.reasonMemo = reasonMemo;
        this.stayMessage = stayMessage;
        this.isPublic = isPublic != null ? isPublic : true;
        this.likeCount = 0;
    }

    public void updateJournal(BigDecimal targetPrice, BigDecimal stopLossPrice,
                              EmotionType emotion, String reasonMemo, String stayMessage, boolean isPublic) {
        this.targetPrice = targetPrice;
        this.stopLossPrice = stopLossPrice;
        this.emotion = emotion;
        this.reasonMemo = reasonMemo;
        this.stayMessage = stayMessage;
        this.isPublic = isPublic;
    }

    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
}
