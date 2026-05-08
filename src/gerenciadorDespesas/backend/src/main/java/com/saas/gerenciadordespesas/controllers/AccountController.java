package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.Account;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.AccountRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import com.saas.gerenciadordespesas.services.DefaultUserDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DefaultUserDataService defaultUserDataService;

    @GetMapping
    public ResponseEntity<List<Account>> getAccounts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        defaultUserDataService.ensureDefaults(user);
        List<Account> accounts = accountRepository.findByUserId(user.getId());
        return ResponseEntity.ok(accounts);
    }
}
