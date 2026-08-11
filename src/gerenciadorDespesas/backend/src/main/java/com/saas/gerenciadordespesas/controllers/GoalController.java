package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.dto.GoalRequestDTO;
import com.saas.gerenciadordespesas.models.Goal;
import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.repositories.TransactionRepository;
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

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals() {
        return ResponseEntity.ok(goalService.getGoalsForCurrentUser());
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody GoalRequestDTO dto) {
        return ResponseEntity.ok(goalService.createGoal(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody GoalRequestDTO dto) {
        return ResponseEntity.ok(goalService.updateGoal(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Goal> markAsCompleted(@PathVariable Long id) {
        return ResponseEntity.ok(goalService.markAsCompleted(id));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<Transaction>> getGoalTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(transactionRepository.findByGoalIdOrderByDateDesc(id));
    }
}