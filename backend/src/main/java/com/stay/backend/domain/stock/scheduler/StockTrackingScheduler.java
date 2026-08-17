package com.stay.backend.domain.stock.scheduler;

import com.stay.backend.domain.notification.service.NotificationService;
import com.stay.backend.domain.stock.service.StockTrackingService;
import com.stay.backend.domain.stock.service.StockTrackingService.TrackingAlertResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 실시간 주가 흐름 패턴 및 목표가/손절가 감시 백그라운드 스케줄러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockTrackingScheduler {

    private final StockTrackingService stockTrackingService;
    private final NotificationService notificationService;

    /**
     * 1분(60,000ms) 주기로 활성 일지들을 실시간 대조 감시
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 10000)
    public void runTrackingMonitorTask() {
        try {
            List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

            if (!alerts.isEmpty()) {
                log.info("[스케줄러] 총 {}건의 STAY 다짐/목표가 알림 발생!", alerts.size());
                for (TrackingAlertResult alert : alerts) {
                    notificationService.createTrackingAlert(alert);
                }
            }
        } catch (Exception e) {
            log.error("[스케줄러] 주가 흐름 감시 작업 중 예외 발생: error={}", e.getMessage(), e);
        }
    }
}
