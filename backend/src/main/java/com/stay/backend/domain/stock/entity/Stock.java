package com.stay.backend.domain.stock.entity;

import com.stay.backend.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "stocks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Stock extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String ticker;

    @Column(name = "current_price", nullable = false, precision = 15, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "change_price", nullable = false, precision = 15, scale = 4)
    private BigDecimal changePrice;

    @Column(name = "change_rate", nullable = false, precision = 8, scale = 2)
    private BigDecimal changeRate;

    @Column(nullable = false)
    private Long volume;

    @Column(name = "market_cap")
    private Long marketCap;

    @Builder
    public Stock(String name, String ticker, BigDecimal currentPrice, BigDecimal changePrice, BigDecimal changeRate, Long volume, Long marketCap) {
        this.name = name;
        this.ticker = ticker;
        this.currentPrice = currentPrice;
        this.changePrice = changePrice;
        this.changeRate = changeRate;
        this.volume = volume;
        this.marketCap = marketCap;
    }

    public void updatePriceAndVolume(BigDecimal currentPrice, BigDecimal changePrice, BigDecimal changeRate, Long volume) {
        this.currentPrice = currentPrice;
        this.changePrice = changePrice;
        this.changeRate = changeRate;
        this.volume = volume;
    }

    public void updateMarketCap(Long marketCap) {
        this.marketCap = marketCap;
    }
}
