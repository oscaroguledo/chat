package com.chatapp.repository;

import com.chatapp.entity.MessageReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageReadReceiptRepository extends JpaRepository<MessageReadReceipt, UUID> {
    boolean existsByMessageIdAndUserId(UUID messageId, UUID userId);
    List<MessageReadReceipt> findByMessageId(UUID messageId);
}
