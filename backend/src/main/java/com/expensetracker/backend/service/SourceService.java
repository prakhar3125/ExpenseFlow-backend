package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.SourceDto;
import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.model.Source;
import com.expensetracker.backend.model.SourceType;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.SourceRepository;
import com.expensetracker.backend.repository.UserRepository;
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
    private final UserRepository userRepository;

    public List<SourceDto> getSourcesByUserId(Integer userId) {
        return sourceRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public SourceDto createSource(Integer userId, SourceDto sourceDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Source source = new Source();
        source.setUser(user);
        source.setName(sourceDto.getName());
        source.setType(SourceType.valueOf(sourceDto.getType()));
        source.setInitialBalance(sourceDto.getInitialBalance());
        source.setColor(sourceDto.getColor());

        Source savedSource = sourceRepository.save(source);
        return convertToDto(savedSource);
    }

    public SourceDto updateSource(Integer userId, Integer sourceId, SourceDto sourceDto) {
        Source source = sourceRepository.findById(sourceId)
                .filter(s -> s.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Source not found or user not authorized"));

        source.setName(sourceDto.getName());
        source.setType(SourceType.valueOf(sourceDto.getType()));
        source.setInitialBalance(sourceDto.getInitialBalance());
        source.setColor(sourceDto.getColor());
        source.setAlertThreshold(sourceDto.getAlertThreshold());
        source.setActive(sourceDto.isActive());
        source.setDescription(sourceDto.getDescription());

        Source updatedSource = sourceRepository.save(source);
        return convertToDto(updatedSource);
    }

    // FIXED: Updated the delete logic.
    public void deleteSource(Integer userId, Integer sourceId) {
        // First, ensure the source belongs to the authenticated user.
        Source source = sourceRepository.findById(sourceId)
                .filter(s -> s.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Source not found or user not authorized"));

        // Before deleting the source, find and delete all expenses associated with it.
        List<Expense> expensesToDelete = expenseRepository.findByUserIdAndSourceIdInAndTransactionDateBetween(
                userId, List.of(sourceId), LocalDate.MIN, LocalDate.MAX
        );
        expenseRepository.deleteAll(expensesToDelete);

        // Now that the child 'expense' records are gone, it's safe to delete the 'source'.
        sourceRepository.delete(source);
    }

    private SourceDto convertToDto(Source source) {
        SourceDto dto = new SourceDto();
        dto.setId(source.getId());
        dto.setName(source.getName());
        dto.setType(source.getType().name());
        dto.setInitialBalance(source.getInitialBalance());
        dto.setColor(source.getColor());
        dto.setAlertThreshold(source.getAlertThreshold());
        dto.setActive(source.isActive());
        dto.setDescription(source.getDescription());

        BigDecimal totalExpenses = expenseRepository.sumAmountBySourceId(source.getId());
        dto.setCurrentBalance(source.getInitialBalance().subtract(totalExpenses));

        return dto;
    }
}
