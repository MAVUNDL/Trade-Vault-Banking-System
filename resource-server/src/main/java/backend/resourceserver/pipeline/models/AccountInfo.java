package backend.resourceserver.pipeline.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AccountInfo(
        String accountId,
        BigDecimal currentBalance,
        BigDecimal availableBalance,
        String currency
) {}