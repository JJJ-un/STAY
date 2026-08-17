package com.stay.backend.domain.notification.controller;

import com.stay.backend.domain.notification.dto.NotificationResponse;
import com.stay.backend.domain.notification.entity.NotificationType;
import com.stay.backend.domain.notification.service.NotificationService;
import com.stay.backend.global.common.response.ApiResponse;
import com.stay.backend.global.config.security.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Notification", description = "알림 API")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "내 알림 목록 조회", description = "로그인한 유저의 알림 목록을 최신순으로 조회합니다. (안읽음만 보기, 유형별 필터링 지원)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            @CurrentUserId Long userId,
            @Parameter(description = "안 읽은 알림만 조회 여부", example = "false")
            @RequestParam(required = false) Boolean unreadOnly,
            @Parameter(description = "알림 유형별 필터링 (PATTERN_MATCHED, TARGET_PRICE_HIT, STOP_LOSS_HIT)")
            @RequestParam(required = false) NotificationType type
    ) {
        List<NotificationResponse> notifications = notificationService.getMyNotifications(userId, unreadOnly, type);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @Operation(summary = "안 읽은 알림 개수 조회", description = "상단 종 아이콘에 표시할 안 읽은 알림 개수를 조회합니다.")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Integer>> getUnreadCount(
            @CurrentUserId Long userId
    ) {
        int unreadCount = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(unreadCount));
    }

    @Operation(summary = "알림 단건 읽음 처리", description = "특정 알림을 읽음(isRead=true) 상태로 변경합니다.")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long notificationId,
            @CurrentUserId Long userId
    ) {
        notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "알림 전체 읽음 일괄 처리", description = "내 모든 안 읽은 알림을 한 번에 읽음 처리합니다.")
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @CurrentUserId Long userId
    ) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
