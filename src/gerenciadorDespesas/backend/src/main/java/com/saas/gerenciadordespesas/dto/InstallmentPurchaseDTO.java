package com.saas.gerenciadordespesas.dto;

import java.util.List;

public class InstallmentPurchaseDTO {
    private String name;
    private Double installmentAmount;
    private Integer currentInstallment;
    private Integer totalInstallments;
    private Double remainingBalance;
    private List<Double> projection; // Projeção para os próximos meses (mês+1, mês+2, mês+3)

    public InstallmentPurchaseDTO() {
    }

    public InstallmentPurchaseDTO(String name, Double installmentAmount, Integer currentInstallment, Integer totalInstallments, Double remainingBalance, List<Double> projection) {
        this.name = name;
        this.installmentAmount = installmentAmount;
        this.currentInstallment = currentInstallment;
        this.totalInstallments = totalInstallments;
        this.remainingBalance = remainingBalance;
        this.projection = projection;
    }

    // Getters e Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getInstallmentAmount() { return installmentAmount; }
    public void setInstallmentAmount(Double installmentAmount) { this.installmentAmount = installmentAmount; }
    public Integer getCurrentInstallment() { return currentInstallment; }
    public void setCurrentInstallment(Integer currentInstallment) { this.currentInstallment = currentInstallment; }
    public Integer getTotalInstallments() { return totalInstallments; }
    public void setTotalInstallments(Integer totalInstallments) { this.totalInstallments = totalInstallments; }
    public Double getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(Double remainingBalance) { this.remainingBalance = remainingBalance; }
    public List<Double> getProjection() { return projection; }
    public void setProjection(List<Double> projection) { this.projection = projection; }
}
