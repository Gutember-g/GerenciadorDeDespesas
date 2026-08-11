package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.dto.GoalRequestDTO;
import com.saas.gerenciadordespesas.models.Goal;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.GoalRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Goal> getGoalsForCurrentUser() {
        User user = getCurrentUser();
        return goalRepository.findByUserId(user.getId());
    }

    public Goal createGoal(GoalRequestDTO dto) {
        User user = getCurrentUser();
        Goal goal = new Goal();
        goal.setUser(user);
        goal.setName(dto.getName());
        goal.setTargetAmount(dto.getTargetAmount());
        double current = dto.getCurrentAmount() != null ? dto.getCurrentAmount() : 0.0;
        goal.setCurrentAmount(current);
        goal.setType(dto.getType());
        goal.setDeadline(dto.getDeadline());
        boolean isCompleted = current >= dto.getTargetAmount();
        goal.setStatus(isCompleted ? "COMPLETED" : "IN_PROGRESS");
        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, GoalRequestDTO dto) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setName(dto.getName());
        goal.setTargetAmount(dto.getTargetAmount());
        double current = dto.getCurrentAmount() != null ? dto.getCurrentAmount() : goal.getCurrentAmount();
        goal.setCurrentAmount(current);
        goal.setType(dto.getType());
        goal.setDeadline(dto.getDeadline());
        if (dto.getStatus() != null) {
            goal.setStatus(dto.getStatus());
        } else {
            goal.setStatus(current >= dto.getTargetAmount() ? "COMPLETED" : "IN_PROGRESS");
        }
        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }

    public Goal markAsCompleted(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setCurrentAmount(goal.getTargetAmount());
        goal.setStatus("COMPLETED");
        return goalRepository.save(goal);
    }

    public void adjustGoalAmount(Long goalId, double delta) {
        if (goalId == null) return;
        goalRepository.findById(goalId).ifPresent(goal -> {
            double newAmount = Math.max(0.0, goal.getCurrentAmount() + delta);
            goal.setCurrentAmount(newAmount);
            goal.setStatus(newAmount >= goal.getTargetAmount() ? "COMPLETED" : "IN_PROGRESS");
            goalRepository.save(goal);
        });
    }
}