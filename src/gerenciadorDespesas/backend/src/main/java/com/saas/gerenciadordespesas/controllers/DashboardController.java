package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.dto.SummaryDTO;
import com.saas.gerenciadordespesas.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<SummaryDTO> getSummary(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        // Hardcoded User ID 1 for MVP
        SummaryDTO summary = dashboardService.getSummary(1L, month, year);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/dashboard/summary/{userId}")
    public ResponseEntity<Map<String, Object>> getLegacySummary(@PathVariable Long userId) {
        Map<String, Object> summary = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(summary);
    }
}
