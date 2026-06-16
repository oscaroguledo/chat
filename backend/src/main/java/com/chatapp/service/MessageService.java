package com.chatapp.service;

import com.chatapp.dto.request.AddReactionRequest;
import com.chatapp.dto.request.SendMessageRequest;
import com.chatapp.dto.response.*;
import com.chatapp.entity.*;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.exception.UnauthorizedException;
import com.chatapp.kafka.ChatEventProducer;
import com.chatapp.kafka.MessageEvent;
import com.chatapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatParticipantRepository participantRepository;
    private final MessageReactionRepository reactionRepository;
    private final MessageReadReceiptRepository readReceiptRepository;
    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatEventProducer eventProducer;

    @Transactional
    public MessageResponse sendMessage(UUID chatId, UUID senderId, SendMessageRequest req,
                                        List<Attachment> attachments) {
        assertParticipant(chatId, senderId);
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", senderId));

        Message msg = Message.builder()
                .chatId(chatId)
                .sender(sender)
                .type(req.getType())
                .content(req.getContent())
                .build();

        if (req.getReplyToId() != null) {
            messageRepository.findById(req.getReplyToId()).ifPresent(msg::setReplyTo);
        }
        msg = messageRepository.save(msg);

        if (attachments != null && !attachments.isEmpty()) {
            for (Attachment a : attachments) {
                a.setMessage(msg);
                attachmentRepository.save(a);
            }
            msg.setAttachments(attachments);
        }

        MessageResponse response = toResponse(msg);

        // Publish to Kafka for fan-out
        eventProducer.publishMessage(MessageEvent.builder()
                .eventType("MESSAGE_SENT")
                .chatId(chatId)
                .messageId(msg.getId())
                .senderId(senderId)
                .payload(response)
                .timestamp(Instant.now())
                .build());

        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<MessageResponse> getMessages(UUID chatId, UUID userId, int page, int size) {
        assertParticipant(chatId, userId);
        Page<Message> msgPage = messageRepository.findByChatId(chatId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.<MessageResponse>builder()
                .content(msgPage.getContent().stream().map(this::toResponse).toList())
                .page(page).size(size)
                .totalElements(msgPage.getTotalElements())
                .totalPages(msgPage.getTotalPages())
                .last(msgPage.isLast())
                .build();
    }

    @Transactional
    public MessageResponse editMessage(UUID messageId, UUID userId, String content) {
        Message msg = findById(messageId);
        if (!msg.getSender().getId().equals(userId)) throw new UnauthorizedException("Cannot edit another user's message");
        msg.setContent(content);
        msg.setEdited(true);
        msg = messageRepository.save(msg);
        MessageResponse response = toResponse(msg);
        broadcastToChat(msg.getChatId(), "MESSAGE_UPDATED", response);
        return response;
    }

    @Transactional
    public void deleteMessage(UUID messageId, UUID userId) {
        Message msg = findById(messageId);
        if (!msg.getSender().getId().equals(userId)) throw new UnauthorizedException("Cannot delete another user's message");
        msg.setDeleted(true);
        msg.setContent(null);
        messageRepository.save(msg);
        broadcastToChat(msg.getChatId(), "MESSAGE_DELETED", Map.of("messageId", messageId, "chatId", msg.getChatId()));
    }

    @Transactional
    public void addReaction(UUID messageId, UUID userId, AddReactionRequest req) {
        Message msg = findById(messageId);
        assertParticipant(msg.getChatId(), userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
        boolean exists = reactionRepository.existsByMessageIdAndUserIdAndEmoji(messageId, userId, req.getEmoji());
        if (exists) {
            reactionRepository.deleteByMessageIdAndUserIdAndEmoji(messageId, userId, req.getEmoji());
        } else {
            MessageReaction reaction = MessageReaction.builder()
                    .message(msg).user(user).emoji(req.getEmoji()).build();
            reactionRepository.save(reaction);
        }
        broadcastToChat(msg.getChatId(), "REACTION_UPDATED", toResponse(findById(messageId)));
    }

    @Transactional
    public void markRead(UUID chatId, UUID userId) {
        assertParticipant(chatId, userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
        List<Message> unread = messageRepository.findUnreadForUser(chatId, userId);
        for (Message msg : unread) {
            if (!readReceiptRepository.existsByMessageIdAndUserId(msg.getId(), userId)) {
                MessageReadReceipt receipt = MessageReadReceipt.builder()
                        .message(msg).user(user).build();
                readReceiptRepository.save(receipt);
            }
        }
        broadcastToChat(chatId, "MESSAGES_READ", Map.of("chatId", chatId, "userId", userId));
    }

    public MessageResponse toResponse(Message msg) {
        List<Attachment> attachments = attachmentRepository.findByMessageId(msg.getId());
        List<MessageReaction> reactions = reactionRepository.findByMessageId(msg.getId());
        List<UUID> readBy = readReceiptRepository.findByMessageId(msg.getId())
                .stream().map(r -> r.getUser().getId()).toList();

        Map<String, List<MessageReaction>> grouped = reactions.stream()
                .collect(Collectors.groupingBy(MessageReaction::getEmoji));

        List<ReactionResponse> reactionResponses = grouped.entrySet().stream()
                .map(e -> ReactionResponse.builder()
                        .emoji(e.getKey())
                        .userIds(e.getValue().stream().map(r -> r.getUser().getId()).toList())
                        .count(e.getValue().size())
                        .build())
                .toList();

        MessageResponse.MessageResponseBuilder builder = MessageResponse.builder()
                .id(msg.getId())
                .chatId(msg.getChatId())
                .sender(msg.getSender() != null ? AuthService.toUserResponse(msg.getSender()) : null)
                .type(msg.getType())
                .content(msg.isDeleted() ? null : msg.getContent())
                .deleted(msg.isDeleted())
                .edited(msg.isEdited())
                .replyToId(msg.getReplyTo() != null ? msg.getReplyTo().getId() : null)
                .attachments(attachments.stream().map(this::toAttachmentResponse).toList())
                .reactions(reactionResponses)
                .readBy(readBy)
                .createdAt(msg.getCreatedAt())
                .updatedAt(msg.getUpdatedAt());

        if (msg.getReplyTo() != null) {
            builder.replyTo(toResponse(msg.getReplyTo()));
        }
        return builder.build();
    }

    private AttachmentResponse toAttachmentResponse(Attachment a) {
        return AttachmentResponse.builder()
                .id(a.getId())
                .fileName(a.getFileName())
                .fileSize(a.getFileSize())
                .mimeType(a.getMimeType())
                .url(a.getUrl())
                .thumbnailUrl(a.getThumbnailUrl())
                .duration(a.getDuration())
                .width(a.getWidth())
                .height(a.getHeight())
                .build();
    }

    private Message findById(UUID id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message", id));
    }

    private void assertParticipant(UUID chatId, UUID userId) {
        if (!participantRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new UnauthorizedException("Not a member of this chat");
        }
    }

    private void broadcastToChat(UUID chatId, String type, Object payload) {
        messagingTemplate.convertAndSend("/topic/chat." + chatId,
                Map.of("type", type, "payload", payload));
    }
}
