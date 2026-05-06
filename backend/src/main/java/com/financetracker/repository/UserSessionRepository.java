package com.financetracker.repository;

import com.financetracker.document.UserSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends MongoRepository<UserSession, String> {
    Optional<UserSession> findByTokenId(String tokenId);
    List<UserSession> findByUserId(Long userId);
    void deleteByTokenId(String tokenId);
}
