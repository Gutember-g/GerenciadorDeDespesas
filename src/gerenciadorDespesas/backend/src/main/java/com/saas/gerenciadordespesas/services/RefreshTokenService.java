package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.models.RefreshToken;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${jwt.refresh.expiration-days:7}")
    private long refreshTokenExpirationDays;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plus(Duration.ofDays(refreshTokenExpirationDays)));
        refreshToken.setRevoked(false);
        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public boolean isExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }

    @Transactional
    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
        if (oldToken.isRevoked()) {
            // Detecção de reuso: revoga todas as sessões do usuário
            refreshTokenRepository.revokeAllByUser(oldToken.getUser());
            throw new IllegalStateException("Reuso de token detectado. Todas as sessões foram revogadas por segurança.");
        }

        if (isExpired(oldToken)) {
            oldToken.setRevoked(true);
            refreshTokenRepository.save(oldToken);
            throw new IllegalArgumentException("Refresh Token expirado.");
        }

        // Revoga o token antigo utilizado
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        // Gera e persiste o novo Refresh Token (rotação)
        return createRefreshToken(oldToken.getUser());
    }

    @Transactional
    public void revokeToken(String token) {
        if (token != null && !token.trim().isEmpty()) {
            refreshTokenRepository.findByToken(token).ifPresent(t -> {
                t.setRevoked(true);
                refreshTokenRepository.save(t);
            });
        }
    }
}
