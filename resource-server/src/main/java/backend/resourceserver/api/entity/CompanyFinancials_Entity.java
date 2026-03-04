package backend.resourceserver.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("company_financials")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyFinancials_Entity {
    @Id
    Long id;
    String company_id;
    BigDecimal current_balance;
    BigDecimal available_balance;
    LocalDateTime last_updated;
}
