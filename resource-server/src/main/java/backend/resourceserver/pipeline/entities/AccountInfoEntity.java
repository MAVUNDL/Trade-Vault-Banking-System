package backend.resourceserver.pipeline.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountInfoEntity(
        String accountId,
        BigDecimal currentBalance,
        BigDecimal availableBalance,
        String currency,
        LocalDateTime lastUpdatedAt
){}