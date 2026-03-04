package backend.resourceserver.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("account_information")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountInfo_Entity {
    @Id
    Long id;
    String account_id;
    BigDecimal current_balance;
    BigDecimal available_balance;
    String currency;
    LocalDateTime last_updated_at;
}
