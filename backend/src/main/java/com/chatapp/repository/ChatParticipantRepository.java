package com.chatapp.repository;

import com.chatapp.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, UUID> {
    boolean existsByChatIdAndUserId(UUID chatId, UUID userId);
    Optional<ChatParticipant> findByChatIdAndUserId(UUID chatId, UUID userId);
    List<ChatParticipant> findByChatId(UUID chatId);
}
