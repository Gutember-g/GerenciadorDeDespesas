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
        if (dto.getStatus() != null) {
            transaction.setStatus(dto.getStatus());
        }
        transaction.setCardId("CREDITO".equals(transaction.getPaymentMethod()) ? dto.getCardId() : null);
        transaction.setIsRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : false);
        transaction.setDueDay(dto.getDueDay());
        transaction.setRecurrenceEndDate(dto.getRecurrenceEndDate());

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

        if (transaction.getIsRecurring() != null && transaction.getIsRecurring()) {
            String recurringGroupId = UUID.randomUUID().toString();
            int dueDay = transaction.getDueDay() != null ? transaction.getDueDay() : transaction.getDate().getDayOfMonth();
            LocalDate firstDate = transaction.getDate();
            
            // Adjust the day of the first date to match dueDay
            int lengthOfFirstMonth = firstDate.lengthOfMonth();
            LocalDate adjustedFirstDate = firstDate.withDayOfMonth(Math.min(dueDay, lengthOfFirstMonth));
            
            LocalDate recurrenceEndDate = transaction.getRecurrenceEndDate();
            int maxMonths = 24; // Default limit if no end date is provided
            
            LocalDate currentDate = adjustedFirstDate;
            int count = 0;
            
            while (true) {
                if (recurrenceEndDate != null) {
                    if (currentDate.isAfter(recurrenceEndDate)) {
                        break;
                    }
                } else {
                    if (count >= maxMonths) {
                        break;
                    }
                }
                
                Transaction recurringTx = new Transaction();
                recurringTx.setUser(transaction.getUser());
                recurringTx.setAccount(transaction.getAccount());
                recurringTx.setCategory(transaction.getCategory());
                recurringTx.setParentCategory(transaction.getParentCategory());
                recurringTx.setPaymentMethod(transaction.getPaymentMethod());
                recurringTx.setType(transaction.getType());
                recurringTx.setDescription(transaction.getDescription());
                recurringTx.setAmount(transaction.getAmount());
                recurringTx.setDate(currentDate);
                recurringTx.setIsInstallment(false);
                recurringTx.setTotalInstallments(1);
                recurringTx.setCurrentInstallment(1);
                recurringTx.setStatus(transaction.getStatus());
                recurringTx.setCardId(transaction.getCardId());
                
                // Recurrence details
                recurringTx.setIsRecurring(true);
                recurringTx.setRecurringGroupId(recurringGroupId);
                recurringTx.setDueDay(dueDay);
                recurringTx.setRecurrenceEndDate(recurrenceEndDate);
                
                transactionsToSave.add(recurringTx);
                
                // Advance by 1 month
                count++;
                LocalDate nextMonthDate = adjustedFirstDate.plusMonths(count);
                int lengthOfNextMonth = nextMonthDate.lengthOfMonth();
                currentDate = nextMonthDate.withDayOfMonth(Math.min(dueDay, lengthOfNextMonth));
            }
        } else if (transaction.getIsInstallment() != null && transaction.getIsInstallment() && transaction.getTotalInstallments() > 1) {
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
                installment.setStatus(transaction.getStatus());
                installment.setCardId(transaction.getCardId());

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
        
        LocalDate startDate;
        LocalDate endDate;

        if (month != null && year != null) {
            startDate = LocalDate.of(year, month, 1);
            endDate = startDate.plusMonths(1).minusDays(1);
        } else if (year != null) {
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
        } else {
            startDate = LocalDate.of(1970, 1, 1);
            endDate = LocalDate.of(2099, 12, 31);
        }

        if (description != null && !description.trim().isEmpty()) {
            return transactionRepository.findFilteredWithDescription(email, startDate, endDate, description);
        } else {
            return transactionRepository.findFiltered(email, startDate, endDate);
        }
    }

    public Transaction updateTransactionFromDTO(Long id, TransactionRequestDTO dto, boolean editAllFuture) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (editAllFuture && transaction.getIsInstallment() && transaction.getInstallmentGroupId() != null) {
            List<Transaction> futureInstallments = transactionRepository.findByInstallmentGroupIdAndCurrentInstallmentGreaterThanEqual(
                    transaction.getInstallmentGroupId(), transaction.getCurrentInstallment());

            Category category = categoryRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            Account account = accountRepository.findById(dto.getContaId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            LocalDate currentBaseDate = transaction.getDate();
            LocalDate newBaseDate = dto.getDataPrimeiraParcela();
            long daysDifference = 0;
            if (newBaseDate != null && currentBaseDate != null) {
                daysDifference = java.time.temporal.ChronoUnit.DAYS.between(currentBaseDate, newBaseDate);
            }

            Long newCardId = "CREDITO".equals(dto.getMeioPagamento()) ? dto.getCardId() : null;
            for (Transaction inst : futureInstallments) {
                String newDesc = dto.getDescricao();
                if (inst.getIsInstallment() && inst.getTotalInstallments() > 1) {
                    if (!newDesc.contains("(" + inst.getCurrentInstallment() + "/")) {
                        newDesc = newDesc + " (" + inst.getCurrentInstallment() + "/" + inst.getTotalInstallments() + ")";
                    }
                }
                inst.setDescription(newDesc);
                inst.setAmount(dto.getValorTotal());
                inst.setCategory(category);
                inst.setAccount(account);
                inst.setParentCategory(getPortugueseParentCategory(category.getBudgetRuleType()));
                inst.setPaymentMethod(dto.getMeioPagamento() != null ? dto.getMeioPagamento() : "DEBITO");
                inst.setCardId(newCardId);
                inst.setType("CREDITO".equals(dto.getTipo()) ? "INCOME" : "EXPENSE");
                if (dto.getStatus() != null) {
                    inst.setStatus(dto.getStatus());
                }

                if (daysDifference != 0 && inst.getDate() != null) {
                    inst.setDate(inst.getDate().plusDays(daysDifference));
                }
            }

            transactionRepository.saveAll(futureInstallments);
            return transaction;
        } else if (editAllFuture && transaction.getIsRecurring() && transaction.getRecurringGroupId() != null) {
            List<Transaction> futureTransactions = transactionRepository.findByRecurringGroupIdAndDateGreaterThanEqual(
                    transaction.getRecurringGroupId(), transaction.getDate());

            Category category = categoryRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            Account account = accountRepository.findById(dto.getContaId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            LocalDate currentBaseDate = transaction.getDate();
            LocalDate newBaseDate = dto.getDataPrimeiraParcela();
            long daysDifference = 0;
            if (newBaseDate != null && currentBaseDate != null) {
                daysDifference = java.time.temporal.ChronoUnit.DAYS.between(currentBaseDate, newBaseDate);
            }

            Long newCardId = "CREDITO".equals(dto.getMeioPagamento()) ? dto.getCardId() : null;
            for (Transaction rt : futureTransactions) {
                rt.setDescription(dto.getDescricao());
                rt.setAmount(dto.getValorTotal());
                rt.setCategory(category);
                rt.setAccount(account);
                rt.setParentCategory(getPortugueseParentCategory(category.getBudgetRuleType()));
                rt.setPaymentMethod(dto.getMeioPagamento() != null ? dto.getMeioPagamento() : "DEBITO");
                rt.setCardId(newCardId);
                rt.setType("CREDITO".equals(dto.getTipo()) ? "INCOME" : "EXPENSE");
                if (dto.getStatus() != null) {
                    rt.setStatus(dto.getStatus());
                }

                if (daysDifference != 0 && rt.getDate() != null) {
                    rt.setDate(rt.getDate().plusDays(daysDifference));
                }

                rt.setDueDay(dto.getDueDay() != null ? dto.getDueDay() : rt.getDueDay());
                rt.setRecurrenceEndDate(dto.getRecurrenceEndDate());
            }

            transactionRepository.saveAll(futureTransactions);
            return transaction;
        } else {
            Category category = categoryRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            Account account = accountRepository.findById(dto.getContaId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            transaction.setDescription(dto.getDescricao());
            transaction.setAmount(dto.getValorTotal());
            transaction.setDate(dto.getDataPrimeiraParcela());
            transaction.setCategory(category);
            transaction.setAccount(account);
            transaction.setParentCategory(getPortugueseParentCategory(category.getBudgetRuleType()));
            transaction.setPaymentMethod(dto.getMeioPagamento() != null ? dto.getMeioPagamento() : "DEBITO");
            transaction.setCardId("CREDITO".equals(transaction.getPaymentMethod()) ? dto.getCardId() : null);
            transaction.setType("CREDITO".equals(dto.getTipo()) ? "INCOME" : "EXPENSE");
            if (dto.getStatus() != null) {
                transaction.setStatus(dto.getStatus());
            }

            return transactionRepository.save(transaction);
        }
    }

    public void deleteTransaction(Long id, boolean deleteAllFuture) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (deleteAllFuture && transaction.getIsInstallment() && transaction.getInstallmentGroupId() != null) {
            List<Transaction> futureInstallments = transactionRepository.findByInstallmentGroupIdAndCurrentInstallmentGreaterThanEqual(
                    transaction.getInstallmentGroupId(), transaction.getCurrentInstallment());
            transactionRepository.deleteAll(futureInstallments);
        } else if (deleteAllFuture && transaction.getIsRecurring() && transaction.getRecurringGroupId() != null) {
            List<Transaction> futureTransactions = transactionRepository.findByRecurringGroupIdAndDateGreaterThanEqual(
                    transaction.getRecurringGroupId(), transaction.getDate());
            transactionRepository.deleteAll(futureTransactions);
        } else {
            transactionRepository.delete(transaction);
        }
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
