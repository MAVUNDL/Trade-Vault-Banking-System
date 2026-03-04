package backend.resourceserver.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("shipment_funding")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShipmentFunding_Entity {
    @Id
    Long id;
    String shipment_number;
    String company_profile_id;
    BigDecimal funding_required;
    BigDecimal funding_raised;
    String funding_status;
    LocalDateTime created_at;
    LocalDateTime updated_at;
}
