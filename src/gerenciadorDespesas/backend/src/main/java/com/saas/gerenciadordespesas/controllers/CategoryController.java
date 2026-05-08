package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import com.saas.gerenciadordespesas.services.DefaultUserDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
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
}
