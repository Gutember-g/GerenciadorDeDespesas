package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import com.saas.gerenciadordespesas.services.DefaultUserDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import com.saas.gerenciadordespesas.dto.CategoryRequestDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

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

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }
}
