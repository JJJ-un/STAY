package com.stay.backend.domain.notification.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * STAY 핵심 알림 유형 열거형
 */
@Getter
@RequiredArgsConstructor
public enum NotificationType {

    PATTERN_MATCHED("주가 흐름 재현 알림"),
    TARGET_PRICE_HIT("익절 목표가 도달 알림"),
    STOP_LOSS_HIT("손절 기준가 도달 알림");

    private final String description;
}
