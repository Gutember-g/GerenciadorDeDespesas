package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.Transaction;
import com.saas.gerenciadordespesas.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUser(@PathVariable Long userId) {
        List<Transaction> transactions = transactionService.getTransactionsByUser(userId);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<List<Transaction>> createTransaction(@RequestBody Transaction transaction) {
        List<Transaction> created = transactionService.createTransaction(transaction);
        return ResponseEntity.ok(created);
    }
}
