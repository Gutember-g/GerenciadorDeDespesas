package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import com.saas.gerenciadordespesas.security.JwtUtil;
import com.saas.gerenciadordespesas.services.DefaultUserDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
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

        Map<String, String> response = new HashMap<>();
        response.put("nome", user.getName());
        response.put("email", user.getEmail());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("senha");

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas");
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail());
        ResponseCookie cookie = createJwtCookie(token);

        Map<String, String> response = new HashMap<>();
        response.put("nome", user.getName());
        response.put("email", user.getEmail());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logout realizado com sucesso");
    }

    private ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from("jwt_token", token)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(Duration.ofHours(8))
                .sameSite("Lax")
                .build();
    }
}
