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

    @Column(name = "parent_category")
    private String parentCategory;

    @Column(name = "payment_method")
    private String paymentMethod;

    private Double amount;
    
    private LocalDate date;

    private String description;

    private String type; // INCOME, EXPENSE

    private Boolean isInstallment = false;
    
    private Integer currentInstallment = 1;
    
    private Integer totalInstallments = 1;
    
    // An identifier to group installments together
    private String installmentGroupId; 

    private String status = "RECEIVED"; // RECEIVED or PENDING

    @Column(name = "card_id")
    private Long cardId;

    private Boolean isRecurring = false;

    private String recurringGroupId;

    private Integer dueDay;

    private LocalDate recurrenceEndDate;

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

    public String getParentCategory() { return parentCategory; }
    public void setParentCategory(String parentCategory) { this.parentCategory = parentCategory; }

    public String getSubcategoria() {
        return this.category != null ? this.category.getName() : null;
    }

    public String getCategoria() {
        if (this.parentCategory != null) {
            return this.parentCategory;
        }
        if (this.category != null) {
            return mapToPortugueseParentCategory(this.category.getBudgetRuleType());
        }
        return null;
    }

    public Double getValor() {
        return this.amount;
    }

    public LocalDate getData() {
        return this.date;
    }

    private String mapToPortugueseParentCategory(String ruleType) {
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

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getMeioPagamento() {
        if (this.paymentMethod == null) return "Débito";
        switch (this.paymentMethod.toUpperCase()) {
            case "CREDITO":
                return "Crédito";
            case "DEBITO":
                return "Débito";
            case "PIX":
                return "Pix";
            case "DINHEIRO":
                return "Espécie";
            default:
                return this.paymentMethod;
        }
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getCardId() { return cardId; }
    public void setCardId(Long cardId) { this.cardId = cardId; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }
    public String getRecurringGroupId() { return recurringGroupId; }
    public void setRecurringGroupId(String recurringGroupId) { this.recurringGroupId = recurringGroupId; }
    public Integer getDueDay() { return dueDay; }
    public void setDueDay(Integer dueDay) { this.dueDay = dueDay; }
    public LocalDate getRecurrenceEndDate() { return recurrenceEndDate; }
    public void setRecurrenceEndDate(LocalDate recurrenceEndDate) { this.recurrenceEndDate = recurrenceEndDate; }
}
