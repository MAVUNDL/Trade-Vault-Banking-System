package backend.resourceserver.pipeline.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionEntity(
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