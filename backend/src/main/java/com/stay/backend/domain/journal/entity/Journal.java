package com.stay.backend.domain.journal.entity;

import com.stay.backend.domain.stock.entity.ChartRangeType;
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

    // 1단계: 매매 사실 (WATCH 관망 시 price, quantity, totalPrice는 null 허용)
    @Enumerated(EnumType.STRING)
    @Column(name = "trade_type", nullable = false, length = 20)
    private TradeType tradeType;

    @Column(name = "trade_date_time", nullable = false)
    private LocalDateTime tradeDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CurrencyType currency;

    @Column(precision = 15, scale = 4)
    private BigDecimal price;

    @Column(precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "total_price", precision = 15, scale = 4)
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

    // 4단계: 주가 흐름 패턴 추적 & 차트 기간 범위 스냅샷
    @Enumerated(EnumType.STRING)
    @Column(name = "chart_range_type", length = 20)
    private ChartRangeType chartRangeType; // 작성 당시 차트 기간 범위 (DAY_1, MONTH_3 등)

    @Column(name = "price_pattern", columnDefinition = "TEXT")
    private String pricePattern;

    @Column(name = "is_tracking", nullable = false)
    private Boolean isTracking = true;

    @Column(name = "similarity_threshold", nullable = false)
    private Double similarityThreshold = 0.85;

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
                   EmotionType emotion, String reasonMemo, String stayMessage,
                   ChartRangeType chartRangeType, String pricePattern, Boolean isTracking, Double similarityThreshold,
                   Boolean isPublic) {
        this.user = user;
        this.stock = stock;
        this.tradeType = tradeType != null ? tradeType : TradeType.WATCH;
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
        this.chartRangeType = chartRangeType;
        this.pricePattern = pricePattern;
        this.isTracking = isTracking != null ? isTracking : (pricePattern != null && !pricePattern.isBlank());
        this.similarityThreshold = similarityThreshold != null ? similarityThreshold : 0.85;
        this.isPublic = isPublic != null ? isPublic : false;
        this.likeCount = 0;
    }

    public void updateJournal(TradeType tradeType, LocalDateTime tradeDateTime, CurrencyType currency,
                              BigDecimal price, BigDecimal quantity, BigDecimal totalPrice,
                              BigDecimal targetPrice, BigDecimal stopLossPrice, HoldingPeriod holdingPeriod,
                              EmotionType emotion, String reasonMemo, String stayMessage,
                              Boolean isTracking, Boolean isPublic) {
        if (tradeType != null) this.tradeType = tradeType;
        if (tradeDateTime != null) this.tradeDateTime = tradeDateTime;
        if (currency != null) this.currency = currency;
        if (price != null) this.price = price;
        if (quantity != null) this.quantity = quantity;
        if (totalPrice != null) this.totalPrice = totalPrice;
        this.targetPrice = targetPrice;
        this.stopLossPrice = stopLossPrice;
        if (holdingPeriod != null) this.holdingPeriod = holdingPeriod;
        this.emotion = emotion != null ? emotion : EmotionType.NONE;
        this.reasonMemo = reasonMemo;
        this.stayMessage = stayMessage;
        if (isTracking != null) {
            this.isTracking = isTracking;
        }
        if (isPublic != null) {
            this.isPublic = isPublic;
        }
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
