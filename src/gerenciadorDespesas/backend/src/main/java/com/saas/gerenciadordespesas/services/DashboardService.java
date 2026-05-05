package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.dto.CategorySummaryDTO;
import com.saas.gerenciadordespesas.dto.RuleSummaryDTO;
import com.saas.gerenciadordespesas.dto.SummaryDTO;
import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    public Map<String, Object> getDashboardSummary(Long userId) {
        // Keeping legacy method for compatibility if needed, but we should probably migrate
        LocalDate now = LocalDate.now();
        SummaryDTO dto = getSummary(userId, now.getMonthValue(), now.getYear());

        // Map back to the old format if necessary, or just return the new one in a Map
        Map<String, Object> legacyMap = new HashMap<>();
        legacyMap.put("balance", dto.getSaldoTotal());
        legacyMap.put("incomeThisMonth", dto.getTotalReceitas());
        legacyMap.put("expensesThisMonth", dto.getTotalDespesas());

        Map<String, Double> rule503020 = new HashMap<>();
        rule503020.put("essential", dto.getNecessidades().getPercentualReal());
        rule503020.put("wants", dto.getDesejos().getPercentualReal());
        rule503020.put("savings", dto.getReserva().getPercentualReal());
        legacyMap.put("rule503020", rule503020);

        return legacyMap;
    }

    public SummaryDTO getSummary(Long userId, Integer month, Integer year) {
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();

        final int targetMonth = month;
        final int targetYear = year;

        List<Transaction> allTransactions = transactionRepository.findByUserId(userId);
        
        List<Transaction> monthTransactions = allTransactions.stream()
                .filter(t -> t.getDate() != null &&
                             t.getDate().getMonthValue() == targetMonth &&
                             t.getDate().getYear() == targetYear)
                .collect(Collectors.toList());

        Double totalReceitas = monthTransactions.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();
                
        Double totalDespesas = monthTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        SummaryDTO summary = new SummaryDTO();
        summary.setMesReferencia(String.format("%d-%02d", targetYear, targetMonth));
        summary.setTotalReceitas(totalReceitas);
        summary.setTotalDespesas(totalDespesas);
        summary.setSaldoTotal(totalReceitas - totalDespesas);

        summary.setNecessidades(calculateRuleSummary("ESSENTIAL", monthTransactions, totalReceitas, 50.0));
        summary.setDesejos(calculateRuleSummary("WANTS", monthTransactions, totalReceitas, 30.0));
        summary.setReserva(calculateRuleSummary("SAVINGS", monthTransactions, totalReceitas, 20.0));

        return summary;
    }

    private RuleSummaryDTO calculateRuleSummary(String ruleType, List<Transaction> transactions, Double totalIncome, Double meta) {
        List<Transaction> ruleExpenses = transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             t.getCategory() != null &&
                             ruleType.equalsIgnoreCase(t.getCategory().getBudgetRuleType()))
                .collect(Collectors.toList());

        Double valorGasto = ruleExpenses.stream().mapToDouble(Transaction::getAmount).sum();
        
        Map<String, Double> categoryTotals = new HashMap<>();
        for (Transaction t : ruleExpenses) {
            String catName = t.getCategory().getName();
            categoryTotals.put(catName, categoryTotals.getOrDefault(catName, 0.0) + t.getAmount());
        }

        List<CategorySummaryDTO> categorias = categoryTotals.entrySet().stream()
                .map(e -> new CategorySummaryDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(CategorySummaryDTO::getValor).reversed())
                .collect(Collectors.toList());

        Double percentualReal = (totalIncome > 0) ? (valorGasto / totalIncome) * 100 : 0.0;

        return new RuleSummaryDTO(valorGasto, percentualReal, meta, categorias);
    }
}
