package backend.resourceserver.pipeline.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Beneficiary(
        String beneficiaryId,
        String accountNumber,
        String code,
        String bank,
        String beneficiaryName,
        String lastPaymentAmount,
        String lastPaymentDate,
        String cellNo,
        String emailAddress,
        String name,
        String referenceAccountNumber,
        String referenceName,
        String categoryId,
        String profileId,
        Boolean fasterPaymentAllowed
) {}
