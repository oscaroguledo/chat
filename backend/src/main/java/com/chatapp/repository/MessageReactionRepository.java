package com.chatapp.repository;

import com.chatapp.entity.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, UUID> {
    List<MessageReaction> findByMessageId(UUID messageId);
    boolean existsByMessageIdAndUserIdAndEmoji(UUID messageId, UUID userId, String emoji);
    @Transactional
    void deleteByMessageIdAndUserIdAndEmoji(UUID messageId, UUID userId, String emoji);
}
