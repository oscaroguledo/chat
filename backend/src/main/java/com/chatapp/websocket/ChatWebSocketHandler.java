package com.chatapp.websocket;

import com.chatapp.kafka.ChatEventProducer;
import com.chatapp.kafka.PresenceEvent;
import com.chatapp.security.UserPrincipal;
import com.chatapp.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;
    private final PresenceService presenceService;
    private final ChatEventProducer eventProducer;

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        Principal principal = extractPrincipal(event.getMessage().getHeaders().get("simpUser", Principal.class));
        if (principal instanceof UsernamePasswordAuthenticationToken auth &&
            auth.getPrincipal() instanceof UserPrincipal up) {
            UUID userId = up.getId();
            presenceService.markOnline(userId);
            eventProducer.publishPresence(PresenceEvent.builder()
                    .eventType("USER_ONLINE").userId(userId).status("online").timestamp(Instant.now()).build());
            log.debug("User {} connected via WebSocket", userId);
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = sha.getUser();
        if (principal instanceof UsernamePasswordAuthenticationToken auth &&
            auth.getPrincipal() instanceof UserPrincipal up) {
            UUID userId = up.getId();
            presenceService.markOffline(userId);
            eventProducer.publishPresence(PresenceEvent.builder()
                    .eventType("USER_OFFLINE").userId(userId).status("offline").timestamp(Instant.now()).build());
            log.debug("User {} disconnected from WebSocket", userId);
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingEvent event, Principal principal) {
        UUID userId = extractUserId(principal);
        if (userId == null) return;
        messagingTemplate.convertAndSend(
                "/topic/chat." + event.getChatId(),
                Map.of("type", "TYPING", "userId", userId, "typing", event.isTyping())
        );
    }

    @MessageMapping("/chat.read")
    public void handleRead(@Payload Map<String, String> payload, Principal principal) {
        UUID userId = extractUserId(principal);
        if (userId == null) return;
        messagingTemplate.convertAndSend(
                "/topic/chat." + payload.get("chatId"),
                Map.of("type", "MESSAGES_READ", "userId", userId, "chatId", payload.get("chatId"))
        );
    }

    private UUID extractUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth &&
            auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getId();
        }
        return null;
    }

    private Principal extractPrincipal(Principal p) { return p; }
}
