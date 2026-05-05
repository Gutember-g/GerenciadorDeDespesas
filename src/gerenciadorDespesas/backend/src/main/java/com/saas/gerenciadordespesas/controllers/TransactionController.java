package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.dto.TransactionRequestDTO;
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

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String descricao) {
        List<Transaction> transactions = transactionService.getFilteredTransactions(month, year, descricao);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUser(@PathVariable Long userId) {
        List<Transaction> transactions = transactionService.getTransactionsByUser(userId);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<List<Transaction>> createTransaction(@RequestBody TransactionRequestDTO transactionDTO) {
        List<Transaction> created = transactionService.createTransactionFromDTO(transactionDTO);
        return ResponseEntity.ok(created);
    }
}
