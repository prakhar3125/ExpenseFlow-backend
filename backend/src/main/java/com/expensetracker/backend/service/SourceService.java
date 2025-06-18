package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.SourceDto;
import com.expensetracker.backend.model.Source;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.SourceRepository;
import com.expensetracker.backend.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SourceService {

    private final SourceRepository sourceRepository;
    private final ExpenseRepository expenseRepository;

    public List<SourceDto> getSourcesByUserId(Integer userId) {
        return sourceRepository.findByUserId(userId).stream()
                .map(source -> convertToDto(source, userId))
                .collect(Collectors.toList());
    }

    // Add create, update, and delete methods here...

    private SourceDto convertToDto(Source source, Integer userId) {
        SourceDto dto = new SourceDto();
        dto.setId(source.getId());
        dto.setName(source.getName());
        dto.setType(source.getType().name());
        dto.setInitialBalance(source.getInitialBalance());
        dto.setColor(source.getColor());
        dto.setAlertThreshold(source.getAlertThreshold());
        dto.setActive(source.isActive());
        dto.setDescription(source.getDescription());

        // Calculate current balance by summing expenses for this source
        BigDecimal totalExpenses = expenseRepository.findByUserIdAndSourceIdInAndTransactionDateBetween(
                        userId, List.of(source.getId()), LocalDate.MIN, LocalDate.MAX)
                .stream()
                .map(e -> e.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setCurrentBalance(source.getInitialBalance().subtract(totalExpenses));

        return dto;
    }
}

