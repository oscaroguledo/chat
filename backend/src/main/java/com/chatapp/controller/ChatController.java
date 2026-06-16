package com.chatapp.controller;

import com.chatapp.dto.request.CreateChatRequest;
import com.chatapp.dto.response.ApiResponse;
import com.chatapp.dto.response.ChatResponse;
import com.chatapp.security.UserPrincipal;
import com.chatapp.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateChatRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(chatService.createChat(principal.getId(), req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(chatService.getUserChats(principal.getId())));
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ApiResponse<ChatResponse>> get(
            @PathVariable UUID chatId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(chatService.getChat(chatId, principal.getId())));
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID chatId,
            @AuthenticationPrincipal UserPrincipal principal) {
        chatService.deleteChat(chatId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Chat deleted", null));
    }
}
