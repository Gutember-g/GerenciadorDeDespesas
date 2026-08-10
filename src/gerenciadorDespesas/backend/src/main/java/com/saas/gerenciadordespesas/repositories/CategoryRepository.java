package com.saas.gerenciadordespesas.repositories;

import com.saas.gerenciadordespesas.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);
    Optional<Category> findByUserIdAndName(Long userId, String name);
    List<Category> findByUserIdAndIsSystem(Long userId, Boolean isSystem);
}
