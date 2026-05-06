package com.financetracker.repository;

import com.financetracker.entity.Transaction;
import com.financetracker.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    /**
     * Complex filtering query: supports optional category, type, and date-range
     * filters simultaneously (NULL params are ignored via COALESCE-style checks).
     */
    @Query("""
        SELECT t FROM Transaction t
        WHERE t.userId = :userId
          AND (:categoryId IS NULL OR t.categoryId = :categoryId)
          AND (:type IS NULL OR t.type = :type)
          AND (:startDate IS NULL OR t.transactionDate >= :startDate)
          AND (:endDate IS NULL OR t.transactionDate <= :endDate)
        ORDER BY t.transactionDate DESC, t.id DESC
        """)
    Page<Transaction> findWithFilters(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    /** Sum of income/expense within a date range, for summary cards. */
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        WHERE t.userId = :userId AND t.type = :type
          AND t.transactionDate BETWEEN :startDate AND :endDate
        """)
    BigDecimal sumByUserAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /** Category-level breakdown (spend per category) for pie/bar charts. */
    @Query("""
        SELECT c.id, c.name, c.color, COALESCE(SUM(t.amount), 0), COUNT(t.id)
        FROM Transaction t JOIN Category c ON t.categoryId = c.id
        WHERE t.userId = :userId AND t.type = :type
          AND t.transactionDate BETWEEN :startDate AND :endDate
        GROUP BY c.id, c.name, c.color
        ORDER BY SUM(t.amount) DESC
        """)
    List<Object[]> sumGroupedByCategory(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /** Monthly totals (income vs expense) for a trend chart, last N months. */
    @Query(value = """
        SELECT DATE_FORMAT(transaction_date, '%Y-%m') AS ym,
               type,
               SUM(amount) AS total
        FROM transactions
        WHERE user_id = :userId
          AND transaction_date >= :startDate
        GROUP BY ym, type
        ORDER BY ym ASC
        """, nativeQuery = true)
    List<Object[]> monthlyTotals(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);
}
