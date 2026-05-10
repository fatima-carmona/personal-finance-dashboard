package com.financetracker.service;

import com.financetracker.dto.CategorySummaryDTO;
import com.financetracker.dto.DashboardSummaryDTO;
import com.financetracker.dto.MonthlyTrendDTO;
import com.financetracker.entity.TransactionType;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;

    /**
     * Builds the dashboard summary: totals for the given period, top
     * spending categories, and a 6-month income/expense trend — all
     * powered by the aggregation queries in TransactionRepository.
     */
    public DashboardSummaryDTO getDashboardSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        BigDecimal totalIncome = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate);

        List<CategorySummaryDTO> topExpenseCategories = transactionRepository
                .sumGroupedByCategory(userId, TransactionType.EXPENSE, startDate, endDate)
                .stream()
                .map(row -> CategorySummaryDTO.builder()
                        .categoryId((Long) row[0])
                        .categoryName((String) row[1])
                        .categoryColor((String) row[2])
                        .total((BigDecimal) row[3])
                        .transactionCount((Long) row[4])
                        .build())
                .limit(8)
                .toList();

        LocalDate sixMonthsAgo = YearMonth.from(endDate).minusMonths(5).atDay(1);
        List<Object[]> rawMonthly = transactionRepository.monthlyTotals(userId, sixMonthsAgo);

        Map<String, MonthlyTrendDTO> trendMap = new LinkedHashMap<>();
        YearMonth cursor = YearMonth.from(sixMonthsAgo);
        YearMonth end = YearMonth.from(endDate);
        while (!cursor.isAfter(end)) {
            String key = cursor.toString();
            trendMap.put(key, MonthlyTrendDTO.builder().month(key).income(BigDecimal.ZERO).expense(BigDecimal.ZERO).build());
            cursor = cursor.plusMonths(1);
        }

        for (Object[] row : rawMonthly) {
            String month = (String) row[0];
            String type = (String) row[1];
            BigDecimal total = (BigDecimal) row[2];
            MonthlyTrendDTO dto = trendMap.get(month);
            if (dto == null) continue;
            if ("INCOME".equals(type)) dto.setIncome(total);
            else dto.setExpense(total);
        }

        return DashboardSummaryDTO.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome.subtract(totalExpense))
                .topExpenseCategories(topExpenseCategories)
                .monthlyTrend(List.copyOf(trendMap.values()))
                .build();
    }
}
