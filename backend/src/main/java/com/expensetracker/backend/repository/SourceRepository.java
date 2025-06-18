package com.expensetracker.backend.repository;


import com.expensetracker.backend.model.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SourceRepository extends JpaRepository<Source, Integer> {
    List<Source> findByUserId(Integer userId);
}