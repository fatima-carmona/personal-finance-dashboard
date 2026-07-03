package com.financetracker.service;

import com.financetracker.dto.CategoryRequest;
import com.financetracker.dto.CategoryResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.TransactionType;
import com.financetracker.exception.DuplicateResourceException;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private static final Long USER_ID = 1L;

    @Test
    void create_throwsDuplicateResourceException_whenNameAlreadyExistsForUser() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Groceries");
        request.setType(TransactionType.EXPENSE);

        when(categoryRepository.existsByUserIdAndNameIgnoreCase(USER_ID, "Groceries")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> categoryService.create(USER_ID, request));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void create_savesAndReturnsCategory_whenNameIsUnique() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Freelance Income");
        request.setType(TransactionType.INCOME);
        request.setColor("#22c55e");

        when(categoryRepository.existsByUserIdAndNameIgnoreCase(USER_ID, "Freelance Income")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category c = invocation.getArgument(0);
            c.setId(10L);
            return c;
        });

        CategoryResponse response = categoryService.create(USER_ID, request);

        assertEquals(10L, response.getId());
        assertEquals("Freelance Income", response.getName());
        assertEquals(TransactionType.INCOME, response.getType());
    }

    @Test
    void delete_throwsResourceNotFoundException_whenCategoryDoesNotBelongToUser() {
        when(categoryRepository.findByIdAndUserId(99L, USER_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.delete(USER_ID, 99L));
        verify(categoryRepository, never()).delete(any());
    }
}
