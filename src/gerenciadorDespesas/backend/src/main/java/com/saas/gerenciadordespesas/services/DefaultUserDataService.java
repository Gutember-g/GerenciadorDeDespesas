package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.models.Account;
import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.AccountRepository;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DefaultUserDataService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public void ensureDefaults(User user) {
        if (accountRepository.findByUserId(user.getId()).isEmpty()) {
            Account account = new Account();
            account.setName("Conta Corrente Principal");
            account.setUser(user);
            account.setType("CORRENTE");
            accountRepository.save(account);
        }

        if (categoryRepository.findByUserId(user.getId()).isEmpty()) {
            createCategory(user, "Supermercado", "EXPENSE", "ESSENTIAL", "#10b981");
            createCategory(user, "Moradia", "EXPENSE", "ESSENTIAL", "#3b82f6");
            createCategory(user, "Lazer e Restaurantes", "EXPENSE", "WANTS", "#f59e0b");
            createCategory(user, "Streaming e Assinaturas", "EXPENSE", "WANTS", "#8b5cf6");
            createCategory(user, "Transferência Poupança", "EXPENSE", "SAVINGS", "#6366f1");
            createCategory(user, "Salário", "INCOME", null, "#22c55e");
            createCategory(user, "Rendimentos", "INCOME", null, "#14b8a6");
        }
    }

    private void createCategory(User user, String name, String type, String ruleType, String color) {
        Category category = new Category();
        category.setUser(user);
        category.setName(name);
        category.setType(type);
        category.setBudgetRuleType(ruleType);
        category.setColor(color);
        categoryRepository.save(category);
    }
}
