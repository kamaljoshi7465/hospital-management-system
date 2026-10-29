package com.hospital.hospital_management_system.auth;

import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RevokedTokenCleanup {
    private final RevokedTokenRepository revokedTokens;
    public RevokedTokenCleanup(RevokedTokenRepository revokedTokens) { this.revokedTokens = revokedTokens; }
    @Scheduled(fixedDelayString = "${app.jwt.revoked-token-cleanup-ms:3600000}")
    @Transactional
    public void removeExpiredRevocations() { revokedTokens.deleteByExpiresAtBefore(Instant.now()); }
}
