package com.stay.backend.domain.stock.dto;

import com.stay.backend.domain.stock.entity.ChartRangeType;

import java.math.BigDecimal;

/**
 * 주가 감시 스케줄러 배치 전용 초경량 DTO 프로젝션
 * (Over-fetching 방지: Journal 엔티티 전체 대신 판정에 필수적인 필드만 영속성 컨텍스트를 거치지 않고 직접 조회)
 */
public record TrackingTargetDto(
        Long journalId,
        Long userId,
        String ticker,
        BigDecimal stockCurrentPrice,
        BigDecimal targetPrice,
        BigDecimal stopLossPrice,
        String stayMessage,
        ChartRangeType chartRangeType,
        String pricePattern,
        Double similarityThreshold,
        Boolean isTracking
) {}
