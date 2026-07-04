package com.saas.gerenciadordespesas.controllers;

import com.saas.gerenciadordespesas.models.CreditCard;
import com.saas.gerenciadordespesas.models.User;
import com.saas.gerenciadordespesas.repositories.CreditCardRepository;
import com.saas.gerenciadordespesas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
public class CreditCardController {

    @Autowired
    private CreditCardRepository creditCardRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CreditCard>> getCards() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        List<CreditCard> cards = creditCardRepository.findByUserId(user.getId());
        return ResponseEntity.ok(cards);
    }

    @PostMapping
    public ResponseEntity<CreditCard> createCard(@RequestBody Map<String, Object> cardData) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        CreditCard card = new CreditCard();
        card.setUser(user);
        card.setName((String) cardData.get("name"));
        card.setBrand((String) cardData.get("brand"));
        
        Object limitObj = cardData.get("limitAmount");
        if (limitObj instanceof Number) {
            card.setLimitAmount(((Number) limitObj).doubleValue());
        } else if (limitObj instanceof String) {
            card.setLimitAmount(Double.parseDouble((String) limitObj));
        }

        card.setClosingDay(((Number) cardData.get("closingDay")).intValue());
        card.setDueDay(((Number) cardData.get("dueDay")).intValue());
        card.setColorTheme((String) cardData.get("colorTheme"));

        CreditCard saved = creditCardRepository.save(card);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCard(@PathVariable Long id, @RequestBody Map<String, Object> cardData) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        CreditCard card = creditCardRepository.findById(id).orElse(null);
        if (card == null) {
            return ResponseEntity.notFound().build();
        }

        if (!card.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Você não tem permissão para alterar este cartão.");
        }

        card.setName((String) cardData.get("name"));
        card.setBrand((String) cardData.get("brand"));

        Object limitObj = cardData.get("limitAmount");
        if (limitObj instanceof Number) {
            card.setLimitAmount(((Number) limitObj).doubleValue());
        } else if (limitObj instanceof String) {
            card.setLimitAmount(Double.parseDouble((String) limitObj));
        }

        card.setClosingDay(((Number) cardData.get("closingDay")).intValue());
        card.setDueDay(((Number) cardData.get("dueDay")).intValue());
        card.setColorTheme((String) cardData.get("colorTheme"));

        CreditCard saved = creditCardRepository.save(card);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCard(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        CreditCard card = creditCardRepository.findById(id).orElse(null);
        if (card == null) {
            return ResponseEntity.notFound().build();
        }

        if (!card.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Você não tem permissão para remover este cartão.");
        }

        creditCardRepository.delete(card);
        return ResponseEntity.noContent().build();
    }
}
