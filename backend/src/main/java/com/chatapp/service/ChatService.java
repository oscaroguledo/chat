package com.chatapp.service;

import com.chatapp.dto.request.CreateChatRequest;
import com.chatapp.dto.response.ChatResponse;
import com.chatapp.dto.response.MessageResponse;
import com.chatapp.entity.*;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.exception.UnauthorizedException;
import com.chatapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final MessageReadReceiptRepository readReceiptRepository;
    private final MessageService messageService;

    @Transactional
    public ChatResponse createChat(UUID currentUserId, CreateChatRequest req) {
        if ("direct".equals(req.getType())) {
            UUID otherId = req.getParticipantIds().stream()
                    .filter(id -> !id.equals(currentUserId))
                    .findFirst().orElse(req.getParticipantIds().get(0));
            Optional<Chat> existing = chatRepository.findDirectChatBetween(currentUserId, otherId);
            if (existing.isPresent()) return toResponse(existing.get(), currentUserId);
        }

        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", currentUserId));

        Chat chat = Chat.builder()
                .type(req.getType())
                .name(req.getName())
                .description(req.getDescription())
                .createdBy(creator)
                .build();
        chat = chatRepository.save(chat);

        addParticipant(chat, creator, "admin");
        for (UUID uid : req.getParticipantIds()) {
            if (!uid.equals(currentUserId)) {
                User u = userRepository.findById(uid)
                        .orElseThrow(() -> new ResourceNotFoundException("User", uid));
                addParticipant(chat, u, "member");
            }
        }
        return toResponse(chat, currentUserId);
    }

    public List<ChatResponse> getUserChats(UUID userId) {
        return chatRepository.findByParticipantId(userId)
                .stream().map(c -> toResponse(c, userId)).toList();
    }

    public ChatResponse getChat(UUID chatId, UUID userId) {
        Chat chat = findById(chatId);
        assertParticipant(chat, userId);
        return toResponse(chat, userId);
    }

    @Transactional
    public void deleteChat(UUID chatId, UUID userId) {
        Chat chat = findById(chatId);
        ChatParticipant cp = participantRepository.findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() -> new UnauthorizedException("Not a member"));
        if (!"admin".equals(cp.getRole())) throw new UnauthorizedException("Only admins can delete chats");
        chatRepository.delete(chat);
    }

    public Chat findById(UUID chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat", chatId));
    }

    public void assertParticipant(Chat chat, UUID userId) {
        boolean member = participantRepository.existsByChatIdAndUserId(chat.getId(), userId);
        if (!member) throw new UnauthorizedException("Not a member of this chat");
    }

    private void addParticipant(Chat chat, User user, String role) {
        ChatParticipant cp = ChatParticipant.builder()
                .chat(chat).user(user).role(role).build();
        participantRepository.save(cp);
    }

    public ChatResponse toResponse(Chat chat, UUID currentUserId) {
        List<ChatParticipant> participants = participantRepository.findByChatId(chat.getId());
        Message lastMsg = messageRepository.findTopByChatIdOrderByCreatedAtDesc(chat.getId()).orElse(null);
        int unread = lastMsg != null
                ? (int) messageRepository.countUnreadForUser(chat.getId(), currentUserId)
                : 0;

        return ChatResponse.builder()
                .id(chat.getId())
                .type(chat.getType())
                .name(chat.getName())
                .description(chat.getDescription())
                .avatarUrl(chat.getAvatarUrl())
                .createdBy(chat.getCreatedBy() != null ? AuthService.toUserResponse(chat.getCreatedBy()) : null)
                .participants(participants.stream().map(p -> ChatResponse.ParticipantResponse.builder()
                        .id(p.getUser().getId())
                        .name(p.getUser().getName())
                        .email(p.getUser().getEmail())
                        .avatarUrl(p.getUser().getAvatarUrl())
                        .status(p.getUser().getStatus())
                        .role(p.getRole())
                        .build()).toList())
                .lastMessage(lastMsg != null ? messageService.toResponse(lastMsg) : null)
                .unreadCount(unread)
                .createdAt(chat.getCreatedAt())
                .updatedAt(chat.getUpdatedAt())
                .build();
    }
}
