package com.financetracker.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // @Value fields aren't populated without a Spring context, so set them directly
        ReflectionTestUtils.setField(jwtUtil, "secret", "test-secret-key-for-unit-tests-minimum-256-bits-long-enough");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 3600000L); // 1 hour
    }

    @Test
    void generatedToken_containsCorrectUsernameAndUserId() {
        String token = jwtUtil.generateToken(42L, "fatima");

        assertEquals("fatima", jwtUtil.extractUsername(token));
        assertEquals(42L, jwtUtil.extractUserId(token));
    }

    @Test
    void isTokenValid_returnsTrueForMatchingUsernameAndUnexpiredToken() {
        String token = jwtUtil.generateToken(1L, "testuser");

        assertTrue(jwtUtil.isTokenValid(token, "testuser"));
    }

    @Test
    void isTokenValid_returnsFalseForMismatchedUsername() {
        String token = jwtUtil.generateToken(1L, "testuser");

        assertFalse(jwtUtil.isTokenValid(token, "someone-else"));
    }

    @Test
    void expiredToken_isRejectedAsInvalid() {
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", -1000L); // already expired
        String token = jwtUtil.generateToken(1L, "testuser");

        assertThrows(io.jsonwebtoken.ExpiredJwtException.class,
                () -> jwtUtil.isTokenValid(token, "testuser"));
    }

    @Test
    void tokenId_isUniquePerToken() {
        String tokenA = jwtUtil.generateToken(1L, "testuser");
        String tokenB = jwtUtil.generateToken(1L, "testuser");

        assertNotEquals(jwtUtil.extractTokenId(tokenA), jwtUtil.extractTokenId(tokenB));
    }
}
