package com.saas.gerenciadordespesas.models;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    private String type; // INCOME, EXPENSE
    
    private String budgetRuleType; // ESSENTIAL, WANTS, SAVINGS (50-30-20 Rule)

    private String color;

    public Category() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getBudgetRuleType() { return budgetRuleType; }
    public void setBudgetRuleType(String budgetRuleType) { this.budgetRuleType = budgetRuleType; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
