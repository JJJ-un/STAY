package com.stay.backend.domain.notification.service;

import com.stay.backend.domain.notification.dto.NotificationResponse;
import com.stay.backend.domain.notification.entity.Notification;
import com.stay.backend.domain.notification.entity.NotificationType;
import com.stay.backend.domain.notification.repository.NotificationRepository;
import com.stay.backend.domain.stock.service.StockTrackingService.TrackingAlertResult;
import com.stay.backend.domain.user.entity.User;
import com.stay.backend.domain.user.repository.UserRepository;
import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 주가 감시 스케줄러에서 감지된 결과를 알림 DB에 저장
     */
    @Transactional
    public void createTrackingAlert(TrackingAlertResult alert) {
        User user = userRepository.findById(alert.userId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        NotificationType type = determineNotificationType(alert);

        Notification notification = Notification.builder()
                .user(user)
                .journalId(alert.journalId())
                .ticker(alert.ticker())
                .type(type)
                .stayMessage(alert.stayMessage())
                .currentPrice(alert.currentPrice())
                .targetPrice(alert.isTargetReached() ? alert.targetPrice() : alert.stopLossPrice())
                .build();

        notificationRepository.save(notification);
        log.info("[알림 저장 완료] userId={}, journalId={}, ticker={}, type={}",
                alert.userId(), alert.journalId(), alert.ticker(), type);
    }

    /**
     * 내 알림 목록 조회 (필터링: 전체, 안읽음만, 유형별)
     */
    public List<NotificationResponse> getMyNotifications(Long userId, Boolean unreadOnly, NotificationType type) {
        List<Notification> notifications;

        if (Boolean.TRUE.equals(unreadOnly)) {
            notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        } else if (type != null) {
            notifications = notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return notifications.stream()
                .map(NotificationResponse::from)
                .toList();
    }

    /**
     * 안 읽은 알림 개수 조회 (상단 뱃지용)
     */
    public int getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * 알림 단건 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.HANDLE_ACCESS_DENIED);
        }

        notification.markAsRead();
    }

    /**
     * 내 모든 알림 전체 읽음 일괄 처리
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    private NotificationType determineNotificationType(TrackingAlertResult alert) {
        if (alert.isTargetReached()) {
            return NotificationType.TARGET_PRICE_HIT;
        } else if (alert.isStopLossReached()) {
            return NotificationType.STOP_LOSS_HIT;
        } else {
            return NotificationType.PATTERN_MATCHED;
        }
    }
}
