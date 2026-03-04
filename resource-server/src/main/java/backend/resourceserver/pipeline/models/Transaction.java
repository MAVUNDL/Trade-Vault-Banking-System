package backend.resourceserver.pipeline.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Transaction(
        String accountId,
        String type,
        String transactionType,
        String status,
        String description,
        String cardNumber,
        LocalDate postingDate,
        LocalDate valueDate,
        LocalDate actionDate,
        LocalDate transactionDate,
        BigDecimal amount,
        BigDecimal runningBalance,
        String uuid
) {}