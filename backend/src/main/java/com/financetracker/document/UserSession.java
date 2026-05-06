package com.financetracker.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Tracks active login sessions in MongoDB. Storing sessions here (rather
 * than in MySQL) keeps high-write, ephemeral session churn off the
 * relational schema used for financial reporting.
 */
@Document(collection = "user_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSession {

    @Id
    private String id;

    private Long userId;

    @Indexed
    private String tokenId; // JWT ID (jti) this session corresponds to

    private String userAgent;

    private String ipAddress;

    private Instant createdAt;

    private Instant expiresAt;

    private Instant lastActiveAt;
}
