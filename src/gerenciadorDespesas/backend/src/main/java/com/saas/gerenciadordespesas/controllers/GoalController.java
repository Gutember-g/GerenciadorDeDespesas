package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.dto.GoalAllocationDTO;
import com.saas.gerenciadordespesas.dto.GoalRequestDTO;
import com.saas.gerenciadordespesas.models.Goal;
import com.saas.gerenciadordespesas.services.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals() {
        List<Goal> goals = goalService.getGoalsForCurrentUser();
        return ResponseEntity.ok(goals);
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody GoalRequestDTO dto) {
        Goal created = goalService.createGoal(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody GoalRequestDTO dto) {
        Goal updated = goalService.updateGoal(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/allocate")
    public ResponseEntity<Goal> allocateToGoal(@PathVariable Long id, @RequestBody GoalAllocationDTO dto) {
        Goal updated = goalService.allocateToGoal(id, dto.getAccountId(), dto.getAmount());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<Goal> redeemFromGoal(@PathVariable Long id, @RequestBody GoalAllocationDTO dto) {
        Goal updated = goalService.redeemFromGoal(id, dto.getAccountId(), dto.getAmount());
        return ResponseEntity.ok(updated);
    }
}
