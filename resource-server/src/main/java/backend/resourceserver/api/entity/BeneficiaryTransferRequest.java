package backend.resourceserver.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BeneficiaryTransferRequest {
    private String sourceAccountId;
    private String destinationAccountNumber; // Beneficiary's account
    private BigDecimal amount;
    private String description;
    private String beneficiaryName;
}