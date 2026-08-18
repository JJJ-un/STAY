package com.stay.backend.domain.journal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stay.backend.domain.journal.dto.JournalCreateRequest;
import com.stay.backend.domain.journal.dto.JournalDetailResponse;
import com.stay.backend.domain.journal.dto.JournalResponse;
import com.stay.backend.domain.journal.dto.JournalUpdateRequest;
import com.stay.backend.domain.journal.entity.Journal;
import com.stay.backend.domain.journal.entity.JournalChecklist;
import com.stay.backend.domain.journal.entity.TradeType;
import com.stay.backend.domain.journal.repository.JournalChecklistRepository;
import com.stay.backend.domain.journal.repository.JournalRepository;
import com.stay.backend.domain.stock.entity.Stock;
import com.stay.backend.domain.stock.repository.StockRepository;
import com.stay.backend.domain.user.entity.User;
import com.stay.backend.domain.user.repository.UserRepository;
import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import com.stay.backend.global.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JournalService {

    private final JournalRepository journalRepository;
    private final JournalChecklistRepository journalChecklistRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;

    // 1. 주식일지 작성
    @Transactional
    public Long createJournal(Long userId, JournalCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Stock stock = stockRepository.findById(request.stockId())
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

        // 엣지 방어: 주가 흐름 패턴 리스트를 JSON 문자열로 직렬화 (최소 5개 이상 캔들일 때만 유효 패턴 인정)
        String pricePatternJson = (request.pricePattern() != null && request.pricePattern().size() >= 5)
                ? JsonUtil.toJson(request.pricePattern())
                : null;
        boolean isTrackingActive = (pricePatternJson != null && Boolean.TRUE.equals(request.isTracking()));

        // 매매/관망 기본 유형 방어 (기본값: WATCH)
        TradeType targetTradeType = request.tradeType() != null ? request.tradeType() : TradeType.WATCH;

        // BUY/SELL/REBALANCE인 경우 총 금액 자동 계산 보정
        BigDecimal calculatedTotalPrice = request.totalPrice();
        if (calculatedTotalPrice == null && request.price() != null && request.quantity() != null) {
            calculatedTotalPrice = request.price().multiply(request.quantity());
        }

        Journal journal = Journal.builder()
                .user(user)
                .stock(stock)
                .tradeType(targetTradeType)
                .tradeDateTime(request.tradeDateTime())
                .currency(request.currency())
                .price(request.price())
                .quantity(request.quantity())
                .totalPrice(calculatedTotalPrice)
                .targetPrice(request.targetPrice())
                .stopLossPrice(request.stopLossPrice())
                .holdingPeriod(request.holdingPeriod())
                .emotion(request.emotion())
                .reasonMemo(request.reasonMemo())
                .stayMessage(request.stayMessage())
                .chartRangeType(request.chartRangeType())
                .pricePattern(pricePatternJson)
                .isTracking(isTrackingActive)
                .build();

        Journal savedJournal = journalRepository.save(journal);

        // 원칙 체크리스트 목록 일괄 저장
        if (request.checklists() != null && !request.checklists().isEmpty()) {
            List<JournalChecklist> checklists = request.checklists().stream()
                    .map(item -> JournalChecklist.builder()
                            .journal(savedJournal)
                            .content(item.content())
                            .isChecked(item.isChecked())
                            .build())
                    .toList();
            journalChecklistRepository.saveAll(checklists);
        }

        log.info("주식일지 작성 완료: journalId={}, userId={}, stockTicker={}, tradeType={}, isTracking={}",
                savedJournal.getId(), userId, stock.getTicker(), targetTradeType, isTrackingActive);

        return savedJournal.getId();
    }

    // 2. 내 주식일지 목록 조회 (전체 / 유형별 필터링)
    public List<JournalResponse> getMyJournals(Long userId, TradeType tradeType) {
        List<Journal> journals;

        if (tradeType == null) {
            journals = journalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            journals = journalRepository.findByUserIdAndTradeTypeOrderByCreatedAtDesc(userId, tradeType);
        }

        return journals.stream()
                .map(JournalResponse::from)
                .toList();
    }

    // 3. 주식일지 단건 상세 조회 (비공개 권한 검증 포함)
    public JournalDetailResponse getJournalDetail(Long journalId, Long currentUserId) {
        Journal journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOURNAL_NOT_FOUND));

        // 비공개 일지인 경우 작성자 본인만 열람 가능
        if (!journal.isPublic() && (currentUserId == null || !journal.getUser().getId().equals(currentUserId))) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_JOURNAL_ACCESS);
        }

        List<JournalChecklist> checklists = journalChecklistRepository.findByJournalId(journalId);

        return JournalDetailResponse.of(journal, checklists);
    }

    // 4. 주식일지 수정
    @Transactional
    public void updateJournal(Long journalId, Long currentUserId, JournalUpdateRequest request) {
        Journal journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOURNAL_NOT_FOUND));

        // 작성자 본인 검증
        validateJournalAuthor(journal, currentUserId);

        journal.updateJournal(
                request.tradeType(),
                request.tradeDateTime(),
                request.currency(),
                request.price(),
                request.quantity(),
                request.totalPrice(),
                request.targetPrice(),
                request.stopLossPrice(),
                request.holdingPeriod(),
                request.emotion(),
                request.reasonMemo(),
                request.stayMessage(),
                journal.getIsTracking(),
                request.isPublic()
        );

        log.info("주식일지 수정 완료: journalId={}, userId={}", journalId, currentUserId);
    }

    // 5. 주식일지 삭제 (Soft Delete)
    @Transactional
    public void deleteJournal(Long journalId, Long currentUserId) {
        Journal journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOURNAL_NOT_FOUND));

        // 작성자 본인 검증
        validateJournalAuthor(journal, currentUserId);

        journalRepository.delete(journal);

        log.info("주식일지 삭제(Soft Delete) 완료: journalId={}, userId={}", journalId, currentUserId);
    }

    private void validateJournalAuthor(Journal journal, Long currentUserId) {
        if (!journal.getUser().getId().equals(currentUserId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_JOURNAL_ACCESS);
        }
    }
}
