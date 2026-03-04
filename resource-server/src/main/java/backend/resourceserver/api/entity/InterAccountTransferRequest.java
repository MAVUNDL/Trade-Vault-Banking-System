package backend.resourceserver.api.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InterAccountTransferRequest {
    private String sourceAccountId;
    private String destinationAccountId;
    private BigDecimal amount;
    private String description;
}
