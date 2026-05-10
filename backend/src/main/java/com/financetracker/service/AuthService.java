package com.financetracker.service;

import com.financetracker.document.UserPreference;
import com.financetracker.document.UserSession;
import com.financetracker.dto.AuthResponse;
import com.financetracker.dto.LoginRequest;
import com.financetracker.dto.RegisterRequest;
import com.financetracker.entity.Category;
import com.financetracker.entity.TransactionType;
import com.financetracker.entity.User;
import com.financetracker.exception.DuplicateResourceException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.UserPreferenceRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.repository.UserSessionRepository;
import com.financetracker.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    private static final List<String> DEFAULT_EXPENSE_CATEGORIES =
            List.of("Groceries", "Rent", "Utilities", "Transportation", "Entertainment", "Dining Out", "Healthcare");
    private static final List<String> DEFAULT_INCOME_CATEGORIES =
            List.of("Salary", "Freelance", "Investments", "Other Income");

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        user = userRepository.save(user);

        seedDefaultCategories(user.getId());

        userPreferenceRepository.save(UserPreference.builder().userId(user.getId()).build());

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        recordSession(user.getId(), token, null);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        recordSession(user.getId(), token, httpRequest);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    private void seedDefaultCategories(Long userId) {
        DEFAULT_EXPENSE_CATEGORIES.forEach(name -> categoryRepository.save(
                Category.builder().userId(userId).name(name).type(TransactionType.EXPENSE).color("#f97316").build()));
        DEFAULT_INCOME_CATEGORIES.forEach(name -> categoryRepository.save(
                Category.builder().userId(userId).name(name).type(TransactionType.INCOME).color("#22c55e").build()));
    }

    private void recordSession(Long userId, String token, HttpServletRequest httpRequest) {
        UserSession session = UserSession.builder()
                .userId(userId)
                .tokenId(jwtUtil.extractTokenId(token))
                .userAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : "unknown")
                .ipAddress(httpRequest != null ? httpRequest.getRemoteAddr() : "unknown")
                .createdAt(Instant.now())
                .expiresAt(jwtUtil.extractExpiration(token).toInstant())
                .lastActiveAt(Instant.now())
                .build();
        userSessionRepository.save(session);
    }
}
