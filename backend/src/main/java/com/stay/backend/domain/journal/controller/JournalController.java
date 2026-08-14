package com.stay.backend.domain.journal.controller;

import com.stay.backend.domain.journal.dto.JournalCreateRequest;
import com.stay.backend.domain.journal.dto.JournalDetailResponse;
import com.stay.backend.domain.journal.dto.JournalResponse;
import com.stay.backend.domain.journal.dto.JournalUpdateRequest;
import com.stay.backend.domain.journal.entity.TradeType;
import com.stay.backend.domain.journal.service.JournalService;
import com.stay.backend.global.common.response.ApiResponse;
import com.stay.backend.global.config.security.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Journal", description = "주식일지 API")
@RestController
@RequestMapping("/api/v1/journals")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @Operation(summary = "주식일지 작성", description = "1~3단계 매매 데이터, STAY 다짐, 원칙 체크리스트를 포함한 주식일지를 작성합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createJournal(
            @CurrentUserId Long userId,
            @Valid @RequestBody JournalCreateRequest request
    ) {
        Long journalId = journalService.createJournal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(journalId));
    }

    @Operation(summary = "내 주식일지 목록 조회", description = "로그인한 유저의 주식일지 목록을 최신순으로 조회합니다. (매매 유형별 필터링 지원)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<JournalResponse>>> getMyJournals(
            @CurrentUserId Long userId,
            @RequestParam(required = false) TradeType tradeType
    ) {
        List<JournalResponse> journals = journalService.getMyJournals(userId, tradeType);
        return ResponseEntity.ok(ApiResponse.success(journals));
    }

    @Operation(summary = "주식일지 단건 상세 조회", description = "특정 주식일지의 1~3단계 전체 정보와 체크리스트 목록을 조회합니다. (비공개 일지는 작성자만 조회 가능)")
    @GetMapping("/{journalId}")
    public ResponseEntity<ApiResponse<JournalDetailResponse>> getJournalDetail(
            @PathVariable Long journalId,
            @CurrentUserId Long userId
    ) {
        JournalDetailResponse detail = journalService.getJournalDetail(journalId, userId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @Operation(summary = "주식일지 수정", description = "작성된 주식일지의 매매 사실, 원칙, STAY 다짐, 공개 여부를 수정합니다. (작성자 본인만 가능)")
    @PutMapping("/{journalId}")
    public ResponseEntity<ApiResponse<Void>> updateJournal(
            @PathVariable Long journalId,
            @CurrentUserId Long userId,
            @Valid @RequestBody JournalUpdateRequest request
    ) {
        journalService.updateJournal(journalId, userId, request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "주식일지 삭제", description = "특정 주식일지를 논리 삭제(Soft Delete)합니다. (작성자 본인만 가능)")
    @DeleteMapping("/{journalId}")
    public ResponseEntity<ApiResponse<Void>> deleteJournal(
            @PathVariable Long journalId,
            @CurrentUserId Long userId
    ) {
        journalService.deleteJournal(journalId, userId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
