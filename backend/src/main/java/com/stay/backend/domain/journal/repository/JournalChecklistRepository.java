package com.stay.backend.domain.journal.repository;

import com.stay.backend.domain.journal.entity.JournalChecklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JournalChecklistRepository extends JpaRepository<JournalChecklist, Long> {

    List<JournalChecklist> findByJournalId(Long journalId);

    void deleteByJournalId(Long journalId);
}
