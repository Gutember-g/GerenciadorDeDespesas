package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.dto.TransactionRequestDTO;
import com.saas.gerenciadordespesas.models.Account;
import com.saas.gerenciadordespesas.models.Category;
import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.AccountRepository;
import com.saas.gerenciadordespesas.repositories.CategoryRepository;
import com.saas.gerenciadordespesas.repositories.TransactionRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Transaction> createTransactionFromDTO(TransactionRequestDTO dto) {
        if (dto.getCategoriaId() == null) {
            throw new IllegalArgumentException("A subcategoria é obrigatória.");
        }

        Transaction transaction = new Transaction();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Account account = accountRepository.findById(dto.getContaId()).orElseThrow(() -> new RuntimeException("Account not found"));
        Category category = categoryRepository.findById(dto.getCategoriaId()).orElseThrow(() -> new RuntimeException("Category not found"));

        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setParentCategory(getPortugueseParentCategory(category.getBudgetRuleType()));
        if (dto.getNumeroParcelas() != null && dto.getNumeroParcelas() > 1) {
            transaction.setPaymentMethod("CREDITO");
        } else {
            transaction.setPaymentMethod(dto.getMeioPagamento() != null ? dto.getMeioPagamento() : "DEBITO");
        }
        transaction.setDescription(dto.getDescricao());
        transaction.setAmount(dto.getValorTotal());
        transaction.setDate(dto.getDataPrimeiraParcela());
        transaction.setType("CREDITO".equals(dto.getTipo()) ? "INCOME" : "EXPENSE");
        transaction.setIsInstallment(dto.getNumeroParcelas() > 1);
        transaction.setTotalInstallments(dto.getNumeroParcelas());

        return createTransaction(transaction);
    }

    public List<Transaction> createTransaction(Transaction transaction) {
        List<Transaction> transactionsToSave = new ArrayList<>();

        if (transaction.getCategory() == null) {
            throw new IllegalArgumentException("A subcategoria é obrigatória.");
        }
        if (transaction.getParentCategory() == null) {
            transaction.setParentCategory(getPortugueseParentCategory(transaction.getCategory().getBudgetRuleType()));
        }

        if (transaction.getIsInstallment() != null && transaction.getIsInstallment() && transaction.getTotalInstallments() > 1) {
            String groupId = UUID.randomUUID().toString();
            Double installmentAmount = transaction.getAmount() / transaction.getTotalInstallments();
            
            for (int i = 1; i <= transaction.getTotalInstallments(); i++) {
                Transaction installment = new Transaction();
                installment.setUser(transaction.getUser());
                installment.setAccount(transaction.getAccount());
                installment.setCategory(transaction.getCategory());
                installment.setParentCategory(transaction.getParentCategory());
                installment.setPaymentMethod(transaction.getPaymentMethod());
                installment.setType(transaction.getType());
                installment.setDescription(transaction.getDescription() + " (" + i + "/" + transaction.getTotalInstallments() + ")");
                
                // Add months based on the installment number
                installment.setDate(transaction.getDate().plusMonths(i - 1));
                
                installment.setAmount(installmentAmount);
                installment.setIsInstallment(true);
                installment.setTotalInstallments(transaction.getTotalInstallments());
                installment.setCurrentInstallment(i);
                installment.setInstallmentGroupId(groupId);

                transactionsToSave.add(installment);
            }
        } else {
            // Not grouped, just one standard transaction
            transaction.setIsInstallment(false);
            transaction.setTotalInstallments(1);
            transaction.setCurrentInstallment(1);
            transactionsToSave.add(transaction);
        }

        return transactionRepository.saveAll(transactionsToSave);
    }
    
    public List<Transaction> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getFilteredTransactions(Integer month, Integer year, String description) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        LocalDate startDate = null;
        LocalDate endDate = null;
        
        if (month != null && year != null) {
            startDate = LocalDate.of(year, month, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        } else if (month != null) {
            int currentYear = LocalDate.now().getYear();
            startDate = LocalDate.of(currentYear, month, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        } else if (year != null) {
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
        }
        
        return transactionRepository.findFiltered(email, startDate, endDate, description);
    }

    private String getPortugueseParentCategory(String ruleType) {
        if (ruleType == null) return "Necessidades";
        switch (ruleType.toUpperCase()) {
            case "ESSENTIAL":
            case "NECESSIDADES":
                return "Necessidades";
            case "WANTS":
            case "DESEJOS":
                return "Desejos";
            case "SAVINGS":
            case "PRIORIDADES FINANCEIRAS":
            case "PRIORIDADES_FINANCEIRAS":
                return "Prioridades financeiras";
            default:
                return "Necessidades";
        }
    }
}
