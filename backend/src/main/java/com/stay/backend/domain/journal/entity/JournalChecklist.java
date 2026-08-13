package com.stay.backend.domain.journal.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "journal_checklists")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JournalChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_id", nullable = false)
    private Journal journal;

    @Column(nullable = false, length = 255)
    private String content;

    @Column(name = "is_checked", nullable = false)
    private boolean isChecked;

    @Builder
    public JournalChecklist(Journal journal, String content, Boolean isChecked) {
        this.journal = journal;
        this.content = content;
        this.isChecked = isChecked != null ? isChecked : false;
    }

    public void updateChecked(boolean isChecked) {
        this.isChecked = isChecked;
    }
}
