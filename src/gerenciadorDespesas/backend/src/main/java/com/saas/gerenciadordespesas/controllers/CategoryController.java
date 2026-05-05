package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getCategories() {
        // Hardcoded User ID 1 for MVP as per requirements
        List<Category> categories = categoryRepository.findByUserId(1L);
        return ResponseEntity.ok(categories);
    }
}
