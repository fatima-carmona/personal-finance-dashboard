package com.financetracker.service;

import com.financetracker.document.UserPreference;
import com.financetracker.dto.RegisterRequest;
import com.financetracker.entity.User;
import com.financetracker.exception.DuplicateResourceException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.UserPreferenceRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.repository.UserSessionRepository;
import com.financetracker.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserPreferenceRepository userPreferenceRepository;
    @Mock private UserSessionRepository userSessionRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_throwsDuplicateResourceException_whenUsernameAlreadyTaken() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("fatima");
        request.setEmail("fatima@example.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("fatima")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_throwsDuplicateResourceException_whenEmailAlreadyRegistered() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("taken@example.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_seedsDefaultCategoriesAndPreferences_onSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(5L);
            return u;
        });
        when(jwtUtil.generateToken(5L, "newuser")).thenReturn("fake-jwt-token");
        when(jwtUtil.extractTokenId("fake-jwt-token")).thenReturn("jti-123");
        when(jwtUtil.extractExpiration("fake-jwt-token")).thenReturn(new Date(System.currentTimeMillis() + 3600000));
        when(userPreferenceRepository.save(any(UserPreference.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.register(request);

        // 7 expense + 4 income default categories seeded
        verify(categoryRepository, times(11)).save(any());
        verify(userPreferenceRepository, times(1)).save(any(UserPreference.class));
        verify(userSessionRepository, times(1)).save(any());
    }
}
