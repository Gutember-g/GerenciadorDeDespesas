package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.dto.SummaryDTO;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import com.saas.gerenciadordespesas.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<SummaryDTO> getSummary(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        SummaryDTO summary = dashboardService.getSummary(user.getId(), month, year);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/dashboard/summary/{userId}")
    public ResponseEntity<Map<String, Object>> getLegacySummary(@PathVariable Long userId) {
        Map<String, Object> summary = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(summary);
    }
}
