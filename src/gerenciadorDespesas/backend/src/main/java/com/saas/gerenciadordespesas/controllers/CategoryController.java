package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import com.saas.gerenciadordespesas.repositories.TransactionRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import com.saas.gerenciadordespesas.services.DefaultUserDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import com.saas.gerenciadordespesas.dto.CategoryRequestDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private DefaultUserDataService defaultUserDataService;

    @GetMapping
    public ResponseEntity<List<Category>> getCategories() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        defaultUserDataService.ensureDefaults(user);
        List<Category> categories = categoryRepository.findByUserId(user.getId());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody CategoryRequestDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("O nome da subcategoria é obrigatório.");
        }
        if (dto.getBudgetRuleType() == null || dto.getBudgetRuleType().trim().isEmpty()) {
            throw new IllegalArgumentException("A categoria pai associada é obrigatória.");
        }

        Category category = new Category();
        category.setUser(user);
        category.setName(dto.getName());
        category.setType(dto.getType() != null ? dto.getType() : "EXPENSE");
        category.setBudgetRuleType(dto.getBudgetRuleType());
        category.setColor(dto.getColor() != null ? dto.getColor() : "#3b82f6");
        category.setIconName(dto.getIconName());

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody CategoryRequestDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));

        if (!category.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            category.setName(dto.getName());
        }
        if (dto.getType() != null) {
            category.setType(dto.getType());
        }
        if (dto.getBudgetRuleType() != null && !dto.getBudgetRuleType().trim().isEmpty()) {
            category.setBudgetRuleType(dto.getBudgetRuleType());
        }
        if (dto.getColor() != null) {
            category.setColor(dto.getColor());
        }
        if (dto.getIconName() != null) {
            category.setIconName(dto.getIconName());
        }

        Category updated = categoryRepository.save(category);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));

        if (!category.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Unlink category from all transactions using it
        List<Transaction> transactions = transactionRepository.findByCategoryId(id);
        for (Transaction tx : transactions) {
            tx.setCategory(null);
        }
        if (!transactions.isEmpty()) {
            transactionRepository.saveAll(transactions);
        }

        categoryRepository.delete(category);
        return ResponseEntity.noContent().build();
    }
}
