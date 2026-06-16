package com.chatapp.service;

import com.chatapp.dto.request.UpdateProfileRequest;
import com.chatapp.dto.response.UserResponse;
import com.chatapp.entity.User;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getProfile(UUID userId) {
        return toResponse(findById(userId));
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest req) {
        User user = findById(userId);
        if (req.getName() != null) user.setName(req.getName());
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getStatus() != null) user.setStatus(req.getStatus());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateAvatar(UUID userId, String avatarUrl) {
        User user = findById(userId);
        user.setAvatarUrl(avatarUrl);
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> searchUsers(String query, UUID excludeId) {
        return userRepository.searchByNameOrEmail(query, excludeId)
                .stream().map(this::toResponse).toList();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private UserResponse toResponse(User u) {
        return AuthService.toUserResponse(u);
    }
}
