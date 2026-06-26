package com.saas.gerenciadordespesas.repositories;

import com.saas.gerenciadordespesas.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByAccountId(Long accountId);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email " +
           "AND t.date >= :startDate " +
           "AND t.date <= :endDate " +
           "ORDER BY t.date DESC")
    List<Transaction> findFiltered(
            @Param("email") String email,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email " +
           "AND t.date >= :startDate " +
           "AND t.date <= :endDate " +
           "AND LOWER(t.description) LIKE LOWER(CONCAT('%', :description, '%')) " +
           "ORDER BY t.date DESC")
    List<Transaction> findFilteredWithDescription(
            @Param("email") String email,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("description") String description);
}
