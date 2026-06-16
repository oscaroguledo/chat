package com.chatapp.repository;

import com.chatapp.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE m.chatId = :chatId ORDER BY m.createdAt DESC")
    Page<Message> findByChatId(@Param("chatId") UUID chatId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.chatId = :chatId ORDER BY m.createdAt DESC LIMIT 1")
    Optional<Message> findTopByChatIdOrderByCreatedAtDesc(@Param("chatId") UUID chatId);

    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.chatId = :chatId
          AND m.deleted = false
          AND m.sender.id != :userId
          AND m.id NOT IN (
              SELECT r.message.id FROM MessageReadReceipt r WHERE r.user.id = :userId
          )
        """)
    long countUnreadForUser(@Param("chatId") UUID chatId, @Param("userId") UUID userId);

    @Query("""
        SELECT m FROM Message m
        WHERE m.chatId = :chatId
          AND m.deleted = false
          AND m.sender.id != :userId
          AND m.id NOT IN (
              SELECT r.message.id FROM MessageReadReceipt r WHERE r.user.id = :userId
          )
        """)
    List<Message> findUnreadForUser(@Param("chatId") UUID chatId, @Param("userId") UUID userId);
}
