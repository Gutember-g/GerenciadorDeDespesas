package com.saas.gerenciadordespesas.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.saas.gerenciadordespesas.models.Account;
import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.AccountRepository;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;

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
        try {
            System.out.println("🔍 Testando conexão com o banco de dados...");
            // Realiza uma operação simples de contagem para validar a comunicação
            long count = userRepository.count();
            System.out.println("📡 Conexão estabelecida com sucesso! Total de usuários no banco: " + count);

            if (count == 0) {
                System.out.println("🌱 Banco vazio. Inicializando sementes de dados...");
                
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
                // Necessidades (24 subcategorias)
                createCategory(user, "Aluguel", "EXPENSE", "Necessidades", "#3b82f6");
                createCategory(user, "Condomínio", "EXPENSE", "Necessidades", "#3b82f6");
                createCategory(user, "Prestação (financiamento)", "EXPENSE", "Necessidades", "#3b82f6");
                createCategory(user, "Luz", "EXPENSE", "Necessidades", "#3b82f6");
                createCategory(user, "Água", "EXPENSE", "Necessidades", "#3b82f6");
                createCategory(user, "Gás", "EXPENSE", "Necessidades", "#3b82f6");
                createCategory(user, "Internet", "EXPENSE", "Necessidades", "#3b82f6");
                createCategory(user, "Telefone básico", "EXPENSE", "Necessidades", "#3b82f6");
                createCategory(user, "Mercado", "EXPENSE", "Necessidades", "#10b981");
                createCategory(user, "Itens de casa", "EXPENSE", "Necessidades", "#10b981");
                createCategory(user, "Marmita de trabalho", "EXPENSE", "Necessidades", "#10b981");
                createCategory(user, "Combustível", "EXPENSE", "Necessidades", "#06b6d4");
                createCategory(user, "Ônibus", "EXPENSE", "Necessidades", "#06b6d4");
                createCategory(user, "Metrô", "EXPENSE", "Necessidades", "#06b6d4");
                createCategory(user, "App de transporte (necessário)", "EXPENSE", "Necessidades", "#06b6d4");
                createCategory(user, "Plano de saúde", "EXPENSE", "Necessidades", "#ef4444");
                createCategory(user, "Farmácia", "EXPENSE", "Necessidades", "#ef4444");
                createCategory(user, "Consultas médicas", "EXPENSE", "Necessidades", "#ef4444");
                createCategory(user, "Exames", "EXPENSE", "Necessidades", "#ef4444");
                createCategory(user, "Remédios", "EXPENSE", "Necessidades", "#ef4444");
                createCategory(user, "Mensalidade escolar", "EXPENSE", "Necessidades", "#a855f7");
                createCategory(user, "Material escolar", "EXPENSE", "Necessidades", "#a855f7");
                createCategory(user, "Transporte escolar", "EXPENSE", "Necessidades", "#a855f7");
                createCategory(user, "Gastos com dependentes", "EXPENSE", "Necessidades", "#ec4899");

                // Desejos (18 subcategorias)
                createCategory(user, "Restaurante", "EXPENSE", "Desejos", "#f59e0b");
                createCategory(user, "Bar", "EXPENSE", "Desejos", "#f59e0b");
                createCategory(user, "Delivery", "EXPENSE", "Desejos", "#f59e0b");
                createCategory(user, "Viagem", "EXPENSE", "Desejos", "#f43f5e");
                createCategory(user, "Passeio", "EXPENSE", "Desejos", "#f43f5e");
                createCategory(user, "Streaming", "EXPENSE", "Desejos", "#6366f1");
                createCategory(user, "Música (assinatura)", "EXPENSE", "Desejos", "#6366f1");
                createCategory(user, "Aplicativos pagos", "EXPENSE", "Desejos", "#6366f1");
                createCategory(user, "Roupas", "EXPENSE", "Desejos", "#ec4899");
                createCategory(user, "Calçados", "EXPENSE", "Desejos", "#ec4899");
                createCategory(user, "Acessórios", "EXPENSE", "Desejos", "#ec4899");
                createCategory(user, "Celular (upgrade)", "EXPENSE", "Desejos", "#14b8a6");
                createCategory(user, "Gadgets", "EXPENSE", "Desejos", "#14b8a6");
                createCategory(user, "Beleza e estética", "EXPENSE", "Desejos", "#ec4899");
                createCategory(user, "Academia", "EXPENSE", "Desejos", "#10b981");
                createCategory(user, "Presentes", "EXPENSE", "Desejos", "#f43f5e");
                createCategory(user, "Compras por impulso", "EXPENSE", "Desejos", "#ef4444");
                createCategory(user, "Lazer", "EXPENSE", "Desejos", "#f59e0b");

                // Prioridades financeiras (10 subcategorias)
                createCategory(user, "Reserva de emergência", "EXPENSE", "Prioridades financeiras", "#eab308");
                createCategory(user, "Quitação de dívidas", "EXPENSE", "Prioridades financeiras", "#ef4444");
                createCategory(user, "Investimentos", "EXPENSE", "Prioridades financeiras", "#10b981");
                createCategory(user, "Previdência", "EXPENSE", "Prioridades financeiras", "#10b981");
                createCategory(user, "Entrada de imóvel", "EXPENSE", "Prioridades financeiras", "#3b82f6");
                createCategory(user, "Compra de carro", "EXPENSE", "Prioridades financeiras", "#06b6d4");
                createCategory(user, "Intercâmbio", "EXPENSE", "Prioridades financeiras", "#a855f7");
                createCategory(user, "Viagem futura (meta)", "EXPENSE", "Prioridades financeiras", "#f43f5e");
                createCategory(user, "Projeto pessoal", "EXPENSE", "Prioridades financeiras", "#6366f1");
                createCategory(user, "Projeto profissional", "EXPENSE", "Prioridades financeiras", "#6366f1");

                // Receitas
                createCategory(user, "Salário", "INCOME", "Necessidades", "#22c55e");
                createCategory(user, "Rendimentos", "INCOME", "Necessidades", "#14b8a6");
                
                System.out.println("✅ Banco de dados populado com sucesso via DataSeeder.");
            }
        } catch (Exception e) {
            System.err.println("❌ ERRO CRÍTICO: Não foi possível conectar ao banco de dados.");
            System.err.println("👉 Verifique seu application.properties e o checklist em 'DB_CONNECTION_CHECKLIST.md'.");
            System.err.println("Mensagem técnica: " + e.getMessage());
            throw e; // Interrompe a subida do servidor em caso de erro no banco
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
