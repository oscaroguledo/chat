package com.chatapp.controller;

import com.chatapp.dto.request.AddReactionRequest;
import com.chatapp.dto.request.SendMessageRequest;
import com.chatapp.dto.response.ApiResponse;
import com.chatapp.dto.response.MessageResponse;
import com.chatapp.dto.response.PageResponse;
import com.chatapp.entity.Attachment;
import com.chatapp.security.UserPrincipal;
import com.chatapp.service.FileStorageService;
import com.chatapp.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats/{chatId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> list(
            @PathVariable UUID chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.getMessages(chatId, principal.getId(), page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> send(
            @PathVariable UUID chatId,
            @Valid @RequestBody SendMessageRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        MessageResponse msg = messageService.sendMessage(chatId, principal.getId(), req, null);
        return ResponseEntity.ok(ApiResponse.ok(msg));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<MessageResponse>> sendWithFile(
            @PathVariable UUID chatId,
            @RequestParam("type") String type,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "replyToId", required = false) UUID replyToId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {

        String url = fileStorageService.upload(file, "chat/" + chatId);
        Attachment attachment = Attachment.builder()
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .url(url)
                .build();

        SendMessageRequest req = new SendMessageRequest();
        req.setType(type);
        req.setContent(content);
        req.setReplyToId(replyToId);

        MessageResponse msg = messageService.sendMessage(chatId, principal.getId(), req, List.of(attachment));
        return ResponseEntity.ok(ApiResponse.ok(msg));
    }

    @PatchMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> edit(
            @PathVariable UUID chatId,
            @PathVariable UUID messageId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                messageService.editMessage(messageId, principal.getId(), body.get("content"))));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID chatId,
            @PathVariable UUID messageId,
            @AuthenticationPrincipal UserPrincipal principal) {
        messageService.deleteMessage(messageId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Message deleted", null));
    }

    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<ApiResponse<Void>> react(
            @PathVariable UUID chatId,
            @PathVariable UUID messageId,
            @Valid @RequestBody AddReactionRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        messageService.addReaction(messageId, principal.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Reaction toggled", null));
    }

    @PostMapping("/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable UUID chatId,
            @AuthenticationPrincipal UserPrincipal principal) {
        messageService.markRead(chatId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Messages marked as read", null));
    }
}
