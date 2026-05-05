package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    public Map<String, Object> getDashboardSummary(Long userId) {
        List<Transaction> allTransactions = transactionRepository.findByUserId(userId);
        
        LocalDate now = LocalDate.now();
        List<Transaction> currentMonthTransactions = allTransactions.stream()
                .filter(t -> t.getDate() != null &&
                             t.getDate().getMonth() == now.getMonth() &&
                             t.getDate().getYear() == now.getYear())
                .collect(Collectors.toList());

        Double balance = allTransactions.stream()
                .mapToDouble(t -> "INCOME".equalsIgnoreCase(t.getType()) ? t.getAmount() : -t.getAmount())
                .sum();

        Double incomeThisMonth = currentMonthTransactions.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();
                
        Double expensesThisMonth = currentMonthTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        Double essentialSum = 0.0;
        Double wantsSum = 0.0;
        Double savingsSum = 0.0;

        for (Transaction t : currentMonthTransactions) {
            if ("EXPENSE".equalsIgnoreCase(t.getType()) && t.getCategory() != null) {
                String rule = t.getCategory().getBudgetRuleType();
                if ("ESSENTIAL".equalsIgnoreCase(rule)) {
                    essentialSum += t.getAmount();
                } else if ("WANTS".equalsIgnoreCase(rule)) {
                    wantsSum += t.getAmount();
                } else if ("SAVINGS".equalsIgnoreCase(rule)) {
                    savingsSum += t.getAmount();
                }
            }
        }

        double baseIncome = incomeThisMonth > 0 ? incomeThisMonth : (expensesThisMonth > 0 ? expensesThisMonth : 1);
        
        Map<String, Double> rule503020 = new HashMap<>();
        rule503020.put("essential", (essentialSum / baseIncome) * 100);
        rule503020.put("wants", (wantsSum / baseIncome) * 100);
        
        // As vezes SAVINGS pode ser cadastrado como INCOME "Transferência" ou despesa. 
        // Assumindo que o usuário registra o depósito na poupança como EXPENSE associado à SAVINGS rule.
        rule503020.put("savings", (savingsSum / baseIncome) * 100);

        Map<String, Object> summary = new HashMap<>();
        summary.put("balance", balance);
        summary.put("incomeThisMonth", incomeThisMonth);
        summary.put("expensesThisMonth", expensesThisMonth);
        summary.put("rule503020", rule503020);

        return summary;
    }
}
