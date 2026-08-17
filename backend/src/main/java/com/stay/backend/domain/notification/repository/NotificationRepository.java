package com.stay.backend.domain.notification.repository;

import com.stay.backend.domain.notification.entity.Notification;
import com.stay.backend.domain.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 1. 특정 유저의 전체 알림 목록 최신순 조회
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 2. [필터링 1] 안 읽은 알림만 최신순 조회
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // 3. [필터링 2] 특정 유형(주가 흐름, 목표가 등)별 알림 최신순 조회
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);

    // 4. 특정 유저의 안 읽은 알림 개수 카운트 (상단 뱃지용 [🔴 N])
    int countByUserIdAndIsReadFalse(Long userId);

    // 5. 특정 유저의 모든 알림 전체 읽음 일괄 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);
}
