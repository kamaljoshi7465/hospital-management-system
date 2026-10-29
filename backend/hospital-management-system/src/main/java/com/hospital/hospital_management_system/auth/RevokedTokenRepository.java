package com.hospital.hospital_management_system.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, String> {
    boolean existsByTokenId(String tokenId);
    void deleteByExpiresAtBefore(Instant time);
}
