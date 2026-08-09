package com.saas.gerenciadordespesas.dto;

public class GoalAllocationDTO {
    private Long accountId;
    private Double amount;

    public GoalAllocationDTO() {
    }

    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}
