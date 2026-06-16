package com.chatapp.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatEventProducer {

    static final String TOPIC_MESSAGES = "chat.messages";
    static final String TOPIC_PRESENCE = "chat.presence";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishMessage(MessageEvent event) {
        String key = event.getChatId().toString();
        kafkaTemplate.send(TOPIC_MESSAGES, key, event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish MessageEvent: {}", ex.getMessage());
                    } else {
                        log.debug("Published MessageEvent to partition {}", result.getRecordMetadata().partition());
                    }
                });
    }

    public void publishPresence(PresenceEvent event) {
        String key = event.getUserId().toString();
        kafkaTemplate.send(TOPIC_PRESENCE, key, event)
                .whenComplete((result, ex) -> {
                    if (ex != null) log.error("Failed to publish PresenceEvent: {}", ex.getMessage());
                });
    }
}
