package backend.resourceserver.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("investments")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Investments_Entity {
    @Id
    Long id;
    String shipment_number;
    String investor_profile_id;
    String investor_account_id;
    BigDecimal amount;
    String status;
    LocalDateTime created_at;
}
