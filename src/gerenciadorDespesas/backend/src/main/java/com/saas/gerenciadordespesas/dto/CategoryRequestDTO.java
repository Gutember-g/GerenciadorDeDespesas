package com.saas.gerenciadordespesas.dto;

public class CategoryRequestDTO {
    private String name;
    private String type; // INCOME, EXPENSE
    private String budgetRuleType; // Necessidades, Desejos, Prioridades financeiras
    private String color;

    public CategoryRequestDTO() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBudgetRuleType() {
        return budgetRuleType;
    }

    public void setBudgetRuleType(String budgetRuleType) {
        this.budgetRuleType = budgetRuleType;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
