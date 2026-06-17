package com.chatapp.service;

import com.chatapp.dto.request.LoginRequest;
import com.chatapp.dto.request.RegisterRequest;
import com.chatapp.dto.response.AuthResponse;
import com.chatapp.dto.response.UserResponse;
import com.chatapp.entity.RefreshToken;
import com.chatapp.entity.User;
import com.chatapp.exception.ConflictException;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.exception.AppException;
import com.chatapp.repository.RefreshTokenRepository;
import com.chatapp.config.JwtProperties;
import com.chatapp.repository.UserRepository;
import com.chatapp.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already in use");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .status("online")
                .build();
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", req.getEmail()));
        user.setStatus("online");
        user.setLastSeen(Instant.now());
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AppException("Invalid refresh token", HttpStatus.UNAUTHORIZED));
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new AppException("Refresh token expired", HttpStatus.UNAUTHORIZED);
        }
        User user = stored.getUser();
        refreshTokenRepository.delete(stored);
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String rawRefresh = jwtTokenProvider.generateRefreshToken();

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(rawRefresh)
                .expiresAt(Instant.now().plusMillis(jwtProperties.getRefreshExpiryMs()))
                .build();
        refreshTokenRepository.save(rt);

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(rawRefresh)
                .user(toUserResponse(user))
                .build();
    }

    public static UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .avatarUrl(u.getAvatarUrl())
                .bio(u.getBio())
                .status(u.getStatus())
                .lastSeen(u.getLastSeen())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
