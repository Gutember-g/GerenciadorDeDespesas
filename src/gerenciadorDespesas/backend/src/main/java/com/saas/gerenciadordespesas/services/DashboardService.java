package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.dto.CategorySummaryDTO;
import com.saas.gerenciadordespesas.dto.RuleSummaryDTO;
import com.saas.gerenciadordespesas.dto.SummaryDTO;
import com.saas.gerenciadordespesas.dto.InstallmentPurchaseDTO;
import com.saas.gerenciadordespesas.models.Goal;
import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.repositories.GoalRepository;
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

    @Autowired
    private GoalRepository goalRepository;

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
        
        LocalDate startDate = LocalDate.of(targetYear, targetMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> monthTransactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);


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

        // 1. Fatura Prevista do Cartão (Despesas de Crédito no mês)
        Double faturaPrevistaCartao = monthTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) && "CREDITO".equalsIgnoreCase(t.getPaymentMethod()))
                .mapToDouble(Transaction::getAmount)
                .sum();
        summary.setFaturaPrevistaCartao(faturaPrevistaCartao);

        // 2. Saldo acumulado na Reserva de Emergência (Metas de Emergência + Transações de Reserva não vinculadas)
        List<Goal> userGoals = goalRepository.findByUserId(userId);
        Double goalsAcumulado = userGoals.stream()
                .filter(g -> "EMERGENCY".equalsIgnoreCase(g.getType()) ||
                             (g.getName() != null && (g.getName().toLowerCase().contains("reserva") || g.getName().toLowerCase().contains("emergên"))))
                .mapToDouble(g -> g.getCurrentAmount() != null ? g.getCurrentAmount() : 0.0)
                .sum();

        Double transactionsReservaAcumulado = allTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             t.getCategory() != null &&
                             ("SAVINGS".equalsIgnoreCase(getNormalizedRuleType(t.getCategory().getBudgetRuleType())) ||
                              (t.getCategory().getName() != null && t.getCategory().getName().toLowerCase().contains("reserva"))))
                .filter(t -> t.getGoalId() == null) // Evita contagem dupla caso a transação já esteja vinculada a uma meta
                .mapToDouble(Transaction::getAmount)
                .sum();

        Double emergencyAcumulado = goalsAcumulado + transactionsReservaAcumulado;
        summary.setSaldoReservaEmergencia(emergencyAcumulado);
        summary.setEmergencyAcumulado(emergencyAcumulado);

        // 3. Reserva de Emergência: Meta (6x a média mensal dos gastos essenciais "Necessidades" nos últimos 6 meses)
        // Regra de Cálculo: Calcula 6x a média das despesas "Necessidades" (essenciais) dos últimos 6 meses disponíveis.
        // Toda vez que uma transação de "Necessidades" for criada, editada ou removida, getSummary recalcula dinamicamente.
        LocalDate sixMonthsAgoStart = startDate.minusMonths(5).withDayOfMonth(1);
        List<Transaction> sixMonthsTransactions = transactionRepository.findByUserIdAndDateBetween(userId, sixMonthsAgoStart, endDate);

        Map<String, Double> necessidadesByMonth = sixMonthsTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             t.getCategory() != null &&
                             "ESSENTIAL".equalsIgnoreCase(getNormalizedRuleType(t.getCategory().getBudgetRuleType())))
                .collect(Collectors.groupingBy(
                        t -> t.getDate().getYear() + "-" + String.format("%02d", t.getDate().getMonthValue()),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        double avgNecessidades;
        if (!necessidadesByMonth.isEmpty()) {
            double total6Months = necessidadesByMonth.values().stream().mapToDouble(Double::doubleValue).sum();
            avgNecessidades = total6Months / necessidadesByMonth.size();
        } else {
            Double totalNecessidadesMesAtivo = monthTransactions.stream()
                    .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                                 t.getCategory() != null &&
                                 "ESSENTIAL".equalsIgnoreCase(getNormalizedRuleType(t.getCategory().getBudgetRuleType())))
                    .mapToDouble(Transaction::getAmount)
                    .sum();
            avgNecessidades = totalNecessidadesMesAtivo;
        }

        Double emergencyMeta = avgNecessidades * 6;
        if (emergencyMeta == 0.0) {
            Double emergencyGoalsTarget = userGoals.stream()
                    .filter(g -> "EMERGENCY".equalsIgnoreCase(g.getType()) ||
                                 (g.getName() != null && (g.getName().toLowerCase().contains("reserva") || g.getName().toLowerCase().contains("emergên"))))
                    .mapToDouble(g -> g.getTargetAmount() != null ? g.getTargetAmount() : 0.0)
                    .sum();
            emergencyMeta = emergencyGoalsTarget > 0 ? emergencyGoalsTarget : 6000.0;
        }
        summary.setEmergencyMeta(emergencyMeta);

        Double emergencyFalta = Math.max(0.0, emergencyMeta - emergencyAcumulado);
        summary.setEmergencyFalta(emergencyFalta);
        summary.setEmergencyPercentual(emergencyMeta > 0 ? (emergencyAcumulado / emergencyMeta) * 100 : 0.0);

        // Aporte mensal médio (Média dos aportes em "Reserva" / "SAVINGS" nos últimos 6 meses)
        Map<String, Double> reservaByMonth = sixMonthsTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             t.getCategory() != null &&
                             "SAVINGS".equalsIgnoreCase(getNormalizedRuleType(t.getCategory().getBudgetRuleType())))
                .collect(Collectors.groupingBy(
                        t -> t.getDate().getYear() + "-" + String.format("%02d", t.getDate().getMonthValue()),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        double avgAporte;
        if (!reservaByMonth.isEmpty()) {
            avgAporte = reservaByMonth.values().stream().mapToDouble(Double::doubleValue).sum() / reservaByMonth.size();
        } else {
            Double totalPrioridades = monthTransactions.stream()
                    .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                                 t.getCategory() != null &&
                                 "SAVINGS".equalsIgnoreCase(getNormalizedRuleType(t.getCategory().getBudgetRuleType())))
                    .mapToDouble(Transaction::getAmount)
                    .sum();
            avgAporte = totalPrioridades > 0 ? totalPrioridades : 500.0;
        }
        Double emergencyAporteMensal = avgAporte > 0 ? avgAporte : 500.0;
        summary.setEmergencyAporteMensal(emergencyAporteMensal);

        Double emergencyPrazoEstimado = (emergencyFalta > 0 && emergencyAporteMensal > 0) ? (emergencyFalta / emergencyAporteMensal) : 0.0;
        summary.setEmergencyPrazoEstimado(emergencyPrazoEstimado);

        // 4. Meios de Pagamento do Mês
        summary.setTotalCreditoMes(faturaPrevistaCartao);
        
        Double totalDebitoPixEspecieMes = monthTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             t.getPaymentMethod() != null &&
                             !"CREDITO".equalsIgnoreCase(t.getPaymentMethod()))
                .mapToDouble(Transaction::getAmount)
                .sum();
        summary.setTotalDebitoPixEspecieMes(totalDebitoPixEspecieMes);

        // Parcelados na fatura
        Double totalParceladosFatura = monthTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             "CREDITO".equalsIgnoreCase(t.getPaymentMethod()) &&
                             t.getIsInstallment() != null &&
                             t.getIsInstallment())
                .mapToDouble(Transaction::getAmount)
                .sum();
        summary.setTotalParceladosFatura(totalParceladosFatura);

        // Categoria que mais pesa no cartão
        Map<String, Double> creditByCat = monthTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             "CREDITO".equalsIgnoreCase(t.getPaymentMethod()) &&
                             t.getCategory() != null)
                .collect(Collectors.groupingBy(t -> t.getCategory().getName(), Collectors.summingDouble(Transaction::getAmount)));
        String categoriaMaisPesadaCartao = creditByCat.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Nenhuma despesa");
        summary.setCategoriaMaisPesadaCartao(categoriaMaisPesadaCartao);

        // 5. Compras Parceladas ativas no mês
        List<InstallmentPurchaseDTO> comprasParceladas = new ArrayList<>();
        List<Transaction> activeInstallments = monthTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             t.getIsInstallment() != null &&
                             t.getIsInstallment())
                .collect(Collectors.toList());

        for (Transaction t : activeInstallments) {
            String name = t.getDescription() != null ? t.getDescription().replaceAll(" \\(\\d+/\\d+\\)$", "") : "Compra parcelada";
            Double installmentAmount = t.getAmount();
            Integer current = t.getCurrentInstallment() != null ? t.getCurrentInstallment() : 1;
            Integer total = t.getTotalInstallments() != null ? t.getTotalInstallments() : 1;
            Double remaining = Math.max(0.0, (total - current) * installmentAmount);

            // Projeção para os próximos 3 meses
            List<Double> proj = new ArrayList<>();
            for (int m = 1; m <= 3; m++) {
                if (current + m <= total) {
                    proj.add(installmentAmount);
                } else {
                    proj.add(0.0);
                }
            }
            comprasParceladas.add(new InstallmentPurchaseDTO(name, installmentAmount, current, total, remaining, proj));
        }
        summary.setComprasParceladas(comprasParceladas);

        // Regras 50-30-20
        summary.setNecessidades(calculateRuleSummary("ESSENTIAL", monthTransactions, totalReceitas, 50.0));
        summary.setDesejos(calculateRuleSummary("WANTS", monthTransactions, totalReceitas, 30.0));
        summary.setReserva(calculateRuleSummary("SAVINGS", monthTransactions, totalReceitas, 20.0));

        return summary;
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
            case "RESERVA":
            case "PRIORIDADES FINANCEIRAS":
            case "PRIORIDADES_FINANCEIRAS":
                return "Reserva";
            default:
                return "Necessidades";
        }
    }

    private RuleSummaryDTO calculateRuleSummary(String ruleType, List<Transaction> transactions, Double totalIncome, Double meta) {
        List<Transaction> ruleExpenses = transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) &&
                             t.getCategory() != null &&
                             getNormalizedRuleType(ruleType).equals(getNormalizedRuleType(t.getCategory().getBudgetRuleType())))
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

    private String getNormalizedRuleType(String ruleType) {
        if (ruleType == null) return "";
        switch (ruleType.toUpperCase()) {
            case "ESSENTIAL":
            case "NECESSIDADES":
                return "ESSENTIAL";
            case "WANTS":
            case "DESEJOS":
                return "WANTS";
            case "SAVINGS":
            case "RESERVA":
            case "PRIORIDADES FINANCEIRAS":
            case "PRIORIDADES_FINANCEIRAS":
                return "SAVINGS";
            default:
                return ruleType.toUpperCase();
        }
    }
}
