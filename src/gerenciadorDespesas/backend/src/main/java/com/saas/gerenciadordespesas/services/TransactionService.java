package com.saas.gerenciadordespesas.services;

import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> createTransaction(Transaction transaction) {
        List<Transaction> transactionsToSave = new ArrayList<>();

        if (transaction.getIsInstallment() != null && transaction.getIsInstallment() && transaction.getTotalInstallments() > 1) {
            String groupId = UUID.randomUUID().toString();
            Double installmentAmount = transaction.getAmount() / transaction.getTotalInstallments();
            
            for (int i = 1; i <= transaction.getTotalInstallments(); i++) {
                Transaction installment = new Transaction();
                installment.setUser(transaction.getUser());
                installment.setAccount(transaction.getAccount());
                installment.setCategory(transaction.getCategory());
                installment.setType(transaction.getType());
                installment.setDescription(transaction.getDescription() + " (" + i + "/" + transaction.getTotalInstallments() + ")");
                
                // Add months based on the installment number
                installment.setDate(transaction.getDate().plusMonths(i - 1));
                
                installment.setAmount(installmentAmount);
                installment.setIsInstallment(true);
                installment.setTotalInstallments(transaction.getTotalInstallments());
                installment.setCurrentInstallment(i);
                installment.setInstallmentGroupId(groupId);

                transactionsToSave.add(installment);
            }
        } else {
            // Not grouped, just one standard transaction
            transaction.setIsInstallment(false);
            transaction.setTotalInstallments(1);
            transaction.setCurrentInstallment(1);
            transactionsToSave.add(transaction);
        }

        return transactionRepository.saveAll(transactionsToSave);
    }
    
    public List<Transaction> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId);
    }
}
