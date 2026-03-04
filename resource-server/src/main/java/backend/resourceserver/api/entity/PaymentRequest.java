package backend.resourceserver.api.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private String sourceAccountId;
    private String destinationAccountNumber;
    private String description;
    private BigDecimal amount;
    private String beneficiaryId;
}