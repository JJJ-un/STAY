package com.stay.backend.domain.journal.repository;

import com.stay.backend.domain.journal.entity.Journal;
import com.stay.backend.domain.journal.entity.TradeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JournalRepository extends JpaRepository<Journal, Long> {

    // 특정 유저의 전체 주식일지 최신순 조회
    List<Journal> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 특정 유저의 매매 유형별 일지 조회 (BUY, SELL, REBALANCE)
    List<Journal> findByUserIdAndTradeTypeOrderByCreatedAtDesc(Long userId, TradeType tradeType);

    // 공개 피드 리스트 최신순 페이징 (Fetch Join으로 작성자 및 종목 정보 한방 쿼리)
    @Query("SELECT j FROM Journal j JOIN FETCH j.user JOIN FETCH j.stock WHERE j.isPublic = true ORDER BY j.createdAt DESC")
    Page<Journal> findAllPublicFeeds(Pageable pageable);

    // 공개 피드 리스트 공감순 페이징
    @Query("SELECT j FROM Journal j JOIN FETCH j.user JOIN FETCH j.stock WHERE j.isPublic = true ORDER BY j.likeCount DESC, j.createdAt DESC")
    Page<Journal> findAllPublicFeedsByLikes(Pageable pageable);

    // 추천 다짐 롤링 카세트 상위 N개 (공개 일지 중 최신 다짐)
    @Query("SELECT j FROM Journal j JOIN FETCH j.stock WHERE j.isPublic = true AND j.stayMessage IS NOT NULL ORDER BY j.createdAt DESC")
    List<Journal> findTopRecommendedCommitments(Pageable pageable);
}
