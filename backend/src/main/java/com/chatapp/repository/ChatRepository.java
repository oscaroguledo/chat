package com.chatapp.repository;

import com.chatapp.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {

    @Query("""
        SELECT c FROM Chat c
        JOIN c.participants p
        WHERE p.user.id = :userId
        ORDER BY c.updatedAt DESC
        """)
    List<Chat> findByParticipantId(@Param("userId") UUID userId);

    @Query("""
        SELECT c FROM Chat c
        JOIN c.participants p1
        JOIN c.participants p2
        WHERE c.type = 'direct'
          AND p1.user.id = :userId
          AND p2.user.id = :otherId
        """)
    Optional<Chat> findDirectChatBetween(@Param("userId") UUID userId, @Param("otherId") UUID otherId);
}
