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
     * 작업 종료 후 60,000ms 지연을 두고 활성 일지를 다시 확인
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 10000)
    public void runTrackingMonitorTask() {
        try {
            List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

            if (!alerts.isEmpty()) {
                log.info("[스케줄러] 총 {}건의 STAY 다짐/목표가 알림 발생!", alerts.size());
                for (TrackingAlertResult alert : alerts) {
                    try {
                        notificationService.createTrackingAlert(alert);
                        stockTrackingService.acknowledgeAlert(alert);
                    } catch (Exception e) {
                        stockTrackingService.releaseAlert(alert);
                        log.error("알림 저장 실패, 다음 감시에서 재시도: journalId={}", alert.journalId(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("[스케줄러] 주가 흐름 감시 작업 중 예외 발생: error={}", e.getMessage(), e);
        }
    }
}
