package com.saas.gerenciadordespesas.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private Double amount;
    
    private LocalDate date;

    private String description;

    private String type; // INCOME, EXPENSE

    private Boolean isInstallment = false;
    
    private Integer currentInstallment = 1;
    
    private Integer totalInstallments = 1;
    
    // An identifier to group installments together
    private String installmentGroupId; 

    public Transaction() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Boolean getIsInstallment() { return isInstallment; }
    public void setIsInstallment(Boolean isInstallment) { this.isInstallment = isInstallment; }
    public Integer getCurrentInstallment() { return currentInstallment; }
    public void setCurrentInstallment(Integer currentInstallment) { this.currentInstallment = currentInstallment; }
    public Integer getTotalInstallments() { return totalInstallments; }
    public void setTotalInstallments(Integer totalInstallments) { this.totalInstallments = totalInstallments; }
    public String getInstallmentGroupId() { return installmentGroupId; }
    public void setInstallmentGroupId(String installmentGroupId) { this.installmentGroupId = installmentGroupId; }
}
