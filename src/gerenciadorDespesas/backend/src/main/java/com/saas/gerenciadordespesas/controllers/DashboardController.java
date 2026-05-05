package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary/{userId}")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long userId) {
        Map<String, Object> summary = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(summary);
    }
}
