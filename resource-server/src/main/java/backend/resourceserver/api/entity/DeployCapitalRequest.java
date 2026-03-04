package backend.resourceserver.api.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DeployCapitalRequest {
    private String sourceAccountId;
    private String shipmentNumber;
    private String companyProfileId;
    private BigDecimal amount;
}