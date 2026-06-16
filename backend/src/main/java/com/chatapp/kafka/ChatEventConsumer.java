package com.chatapp.kafka;

import com.chatapp.dto.response.MessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatEventConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = ChatEventProducer.TOPIC_MESSAGES, groupId = "chat-ws-fanout",
                   containerFactory = "kafkaListenerContainerFactory")
    public void onMessageEvent(MessageEvent event) {
        log.debug("Consuming MessageEvent: {} for chat {}", event.getEventType(), event.getChatId());
        messagingTemplate.convertAndSend(
                "/topic/chat." + event.getChatId(),
                Map.of("type", event.getEventType(), "payload", event.getPayload())
        );
    }

    @KafkaListener(topics = ChatEventProducer.TOPIC_PRESENCE, groupId = "chat-presence-fanout",
                   containerFactory = "kafkaListenerContainerFactory")
    public void onPresenceEvent(PresenceEvent event) {
        log.debug("Consuming PresenceEvent: {} for user {}", event.getEventType(), event.getUserId());
        messagingTemplate.convertAndSend(
                "/topic/presence",
                Map.of("type", event.getEventType(),
                       "userId", event.getUserId(),
                       "status", event.getStatus())
        );
    }
}
