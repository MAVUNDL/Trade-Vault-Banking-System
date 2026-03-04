package backend.resourceserver.pipeline.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BeneficiaryEntity(
        String beneficiaryId,
        String accountNumber,
        String code,
        String bank,
        String beneficiaryName,
        BigDecimal lastPaymentAmount,
        LocalDate lastPaymentDate,
        String cellNo,
        String emailAddress,
        String name,
        String referenceAccountNumber,
        String referenceName,
        String categoryId,
        String profileId,
        Boolean fasterPaymentAllowed,
        LocalDateTime createdAt
) {}
