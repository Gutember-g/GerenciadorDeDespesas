package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.RefreshToken;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import com.saas.gerenciadordespesas.security.JwtUtil;
import com.saas.gerenciadordespesas.services.DefaultUserDataService;
import com.saas.gerenciadordespesas.services.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private DefaultUserDataService defaultUserDataService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${cookie.samesite:Lax}")
    private String cookieSameSite;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String nome = request.get("nome");
        String senha = request.get("senha");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já cadastrado");
        }

        User user = new User();
        user.setName(nome);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(senha));
        userRepository.save(user);
        defaultUserDataService.ensureDefaults(user);

        String token = jwtUtil.generateToken(user.getEmail());
        ResponseCookie cookie = createJwtCookie(token);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        ResponseCookie refreshCookie = createRefreshTokenCookie(refreshToken.getToken());

        Map<String, String> response = new HashMap<>();
        response.put("nome", user.getName());
        response.put("email", user.getEmail());
        response.put("token", token);
        response.put("accessToken", token);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("senha");

        System.out.println("[AUTH] Tentativa de login para o e-mail: " + email);
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            System.out.println("[AUTH] Autenticação bem-sucedida para o e-mail: " + email);
        } catch (Exception e) {
            System.err.println("[AUTH] Falha na autenticação para " + email + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas: " + e.getMessage());
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail());
        ResponseCookie cookie = createJwtCookie(token);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        ResponseCookie refreshCookie = createRefreshTokenCookie(refreshToken.getToken());

        Map<String, String> response = new HashMap<>();
        response.put("nome", user.getName());
        response.put("email", user.getEmail());
        response.put("token", token);
        response.put("accessToken", token);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshTokenValue,
            @RequestHeader(name = "X-Requested-With", required = false) String requestedWith) {

        if (requestedWith == null || (!requestedWith.equalsIgnoreCase("XMLHttpRequest") && !requestedWith.equalsIgnoreCase("Fetch"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Proteção CSRF: Requisição de refresh negada por ausência de cabeçalho anti-CSRF");
        }

        if (refreshTokenValue == null || refreshTokenValue.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token ausente");
        }

        var tokenOpt = refreshTokenService.findByToken(refreshTokenValue);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token inválido");
        }

        RefreshToken oldToken = tokenOpt.get();

        try {
            RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(oldToken);
            User user = newRefreshToken.getUser();
            String newAccessToken = jwtUtil.generateToken(user.getEmail());
            ResponseCookie newRefreshCookie = createRefreshTokenCookie(newRefreshToken.getToken());

            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("token", newAccessToken);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                    .body(response);
        } catch (IllegalStateException e) {
            // Reuso de token detectado: limpa cookie e revoga sessões
            ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/api/auth/refresh")
                    .maxAge(0)
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                    .body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "refreshToken", required = false) String refreshTokenValue) {
        if (refreshTokenValue != null && !refreshTokenValue.trim().isEmpty()) {
            refreshTokenService.revokeToken(refreshTokenValue);
        }

        ResponseCookie jwtCookie = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite(cookieSameSite)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth/refresh")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body("Logout realizado com sucesso");
    }

    private ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from("jwt_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ofHours(8))
                .sameSite(cookieSameSite)
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .sameSite("Strict")
                .build();
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if ("anonymousUser".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Não autorizado");
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        String newName = request.get("nome");
        if (newName != null && !newName.trim().isEmpty()) {
            user.setName(newName);
        }

        String newEmail = request.get("email");
        boolean emailChanged = false;
        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equalsIgnoreCase(user.getEmail())) {
            if (userRepository.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já cadastrado por outro usuário");
            }
            user.setEmail(newEmail);
            emailChanged = true;
        }
        
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("nome", user.getName());
        response.put("email", user.getEmail());
        
        if (emailChanged) {
            String token = jwtUtil.generateToken(user.getEmail());
            ResponseCookie cookie = createJwtCookie(token);
            response.put("token", token);
            response.put("accessToken", token);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if ("anonymousUser".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Não autorizado");
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        String currentPassword = request.get("senhaAtual");
        String newPassword = request.get("novaSenha");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Senha atual e nova senha são obrigatórias");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Senha atual incorreta");
        }

        if (newPassword.trim().length() < 8) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("A nova senha deve ter no mínimo 8 caracteres");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        ResponseCookie cookie = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite(cookieSameSite)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Senha alterada com sucesso");
    }
}
