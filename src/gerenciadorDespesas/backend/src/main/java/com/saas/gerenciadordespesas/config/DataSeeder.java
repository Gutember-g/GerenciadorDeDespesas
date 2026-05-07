package com.saas.gerenciadordespesas.config;

import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.models.Account;
import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.repositories.AccountRepository;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed base user
            User user = new User();
            user.setName("Usuário Teste");
            user.setEmail("admin@gerenciasaas.com");
            user.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(user);

            // Seed base account
            Account acc = new Account();
            acc.setName("Conta Corrente Principal");
            acc.setUser(user);
            acc.setType("CORRENTE");
            accountRepository.save(acc);

            // Seed categories
            createCategory(user, "Supermercado", "EXPENSE", "ESSENTIAL", "#10b981");
            createCategory(user, "Moradia", "EXPENSE", "ESSENTIAL", "#3b82f6");
            createCategory(user, "Lazer e Restaurantes", "EXPENSE", "WANTS", "#f59e0b");
            createCategory(user, "Streaming e Assinaturas", "EXPENSE", "WANTS", "#8b5cf6");
            createCategory(user, "Transferência Poupança", "EXPENSE", "SAVINGS", "#6366f1");
            createCategory(user, "Salário", "INCOME", null, "#22c55e");
            createCategory(user, "Rendimentos", "INCOME", null, "#14b8a6");
            
            System.out.println("✅ Banco de dados populado via DataSeeder.");
        }
    }

    private void createCategory(User user, String name, String type, String ruleType, String color) {
        Category cat = new Category();
        cat.setUser(user);
        cat.setName(name);
        cat.setType(type);
        cat.setBudgetRuleType(ruleType);
        cat.setColor(color);
        categoryRepository.save(cat);
    }
}
