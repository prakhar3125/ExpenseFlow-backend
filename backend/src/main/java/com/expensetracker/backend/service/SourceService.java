package com.expensetracker.backend.service;
import com.expensetracker.backend.dto.SourceDto;
import com.expensetracker.backend.model.Source;
import com.expensetracker.backend.model.SourceType;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.SourceRepository;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
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

    // FIXED: The balance calculation now uses the new, dedicated repository method.
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

        // Use the new repository method for a reliable calculation
        BigDecimal totalExpenses = expenseRepository.sumAmountBySourceId(source.getId());
        dto.setCurrentBalance(source.getInitialBalance().subtract(totalExpenses));

        return dto;
    }
}
