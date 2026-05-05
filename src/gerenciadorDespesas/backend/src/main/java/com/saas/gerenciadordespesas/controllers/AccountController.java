package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.Account;
import com.saas.gerenciadordespesas.repositories.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping
    public ResponseEntity<List<Account>> getAccounts() {
        // Hardcoded User ID 1 for MVP as per requirements
        List<Account> accounts = accountRepository.findByUserId(1L);
        return ResponseEntity.ok(accounts);
    }
}
