package com.saas.gerenciadordespesas.dto;

public class GoalRequestDTO {
    private String name;
    private Double targetAmount;
    private Double currentAmount;
    private String deadline;
    private String type; // EMERGENCY, TRAVEL, OTHER
    private String status; // IN_PROGRESS, COMPLETED

    public GoalRequestDTO() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getTargetAmount() { return targetAmount; }
    public void setTargetAmount(Double targetAmount) { this.targetAmount = targetAmount; }
    public Double getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(Double currentAmount) { this.currentAmount = currentAmount; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
