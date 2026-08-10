package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.dto.GoalRequestDTO;
import com.saas.gerenciadordespesas.models.Account;
import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.models.Goal;
import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.AccountRepository;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import com.saas.gerenciadordespesas.repositories.GoalRepository;
import com.saas.gerenciadordespesas.repositories.TransactionRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DefaultUserDataService defaultUserDataService;

    public List<Goal> getGoalsForCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return goalRepository.findByUserId(user.getId());
    }

    public Goal createGoal(GoalRequestDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setName(dto.getName());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setCurrentAmount(dto.getCurrentAmount() != null ? dto.getCurrentAmount() : 0.0);
        goal.setDeadline(dto.getDeadline());
        goal.setType(dto.getType() != null ? dto.getType() : "EMERGENCY");
        
        boolean isCompleted = goal.getCurrentAmount() >= goal.getTargetAmount();
        goal.setStatus(isCompleted ? "COMPLETED" : "IN_PROGRESS");

        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, GoalRequestDTO dto) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meta não encontrada"));

        goal.setName(dto.getName());
        goal.setTargetAmount(dto.getTargetAmount());
        if (dto.getCurrentAmount() != null) {
            goal.setCurrentAmount(dto.getCurrentAmount());
        }
        goal.setDeadline(dto.getDeadline());
        if (dto.getType() != null) {
            goal.setType(dto.getType());
        }
        
        boolean isCompleted = goal.getCurrentAmount() >= goal.getTargetAmount();
        goal.setStatus(isCompleted ? "COMPLETED" : "IN_PROGRESS");

        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meta não encontrada"));
        goalRepository.delete(goal);
    }

    @Transactional
    public Goal allocateToGoal(Long goalId, Long accountId, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("O valor de alocação deve ser maior que zero.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Meta não encontrada"));

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));

        Double currentAccBalance = account.getBalance() != null ? account.getBalance() : 0.0;
        if (currentAccBalance < amount) {
            throw new IllegalArgumentException("Saldo insuficiente na conta selecionada.");
        }

        // Debita da conta
        account.setBalance(currentAccBalance - amount);
        accountRepository.save(account);

        // Incrementa acumulado da meta
        Double newCurrent = (goal.getCurrentAmount() != null ? goal.getCurrentAmount() : 0.0) + amount;
        goal.setCurrentAmount(newCurrent);
        if (newCurrent >= goal.getTargetAmount()) {
            goal.setStatus("COMPLETED");
        }
        goalRepository.save(goal);

        // Garante categoria de sistema
        defaultUserDataService.ensureSystemCategories(user);
        Category systemCategory = categoryRepository.findByUserIdAndName(user.getId(), "Transferência para Meta")
                .orElseThrow(() -> new RuntimeException("Categoria de sistema 'Transferência para Meta' não encontrada"));

        // Cria transação de auditoria (saída)
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAccount(account);
        tx.setCategory(systemCategory);
        tx.setParentCategory("Prioridades financeiras");
        tx.setPaymentMethod("DEBITO");
        tx.setAmount(amount);
        tx.setDate(LocalDate.now());
        tx.setDescription("Transferência para meta: " + goal.getName());
        tx.setType("EXPENSE");
        tx.setStatus("RECEIVED");

        transactionRepository.save(tx);

        return goal;
    }

    @Transactional
    public Goal redeemFromGoal(Long goalId, Long accountId, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("O valor de resgate deve ser maior que zero.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Meta não encontrada"));

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));

        Double currentGoalAmount = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : 0.0;
        if (amount > currentGoalAmount) {
            throw new IllegalArgumentException("O valor a resgatar é superior ao acumulado da meta.");
        }

        // Subtrai do acumulado da meta
        Double newCurrent = currentGoalAmount - amount;
        goal.setCurrentAmount(newCurrent);
        if (newCurrent < goal.getTargetAmount()) {
            goal.setStatus("IN_PROGRESS");
        }
        goalRepository.save(goal);

        // Credita na conta de destino
        Double currentAccBalance = account.getBalance() != null ? account.getBalance() : 0.0;
        account.setBalance(currentAccBalance + amount);
        accountRepository.save(account);

        // Garante categoria de sistema
        defaultUserDataService.ensureSystemCategories(user);
        Category systemCategory = categoryRepository.findByUserIdAndName(user.getId(), "Resgate de Meta")
                .orElseThrow(() -> new RuntimeException("Categoria de sistema 'Resgate de Meta' não encontrada"));

        // Cria transação de auditoria (entrada)
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAccount(account);
        tx.setCategory(systemCategory);
        tx.setParentCategory("Prioridades financeiras");
        tx.setPaymentMethod("PIX");
        tx.setAmount(amount);
        tx.setDate(LocalDate.now());
        tx.setDescription("Resgate de meta: " + goal.getName());
        tx.setType("INCOME");
        tx.setStatus("RECEIVED");

        transactionRepository.save(tx);

        return goal;
    }
}
