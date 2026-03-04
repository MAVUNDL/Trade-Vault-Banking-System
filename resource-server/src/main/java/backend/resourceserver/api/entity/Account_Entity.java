package backend.resourceserver.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("account")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Account_Entity {
    @Id
    Long id;
    String account_id;
    String account_number;
    String account_name;
    String reference_name;
    String product_name;
    Boolean kyc_compliant;
    String profile_id;
    LocalDateTime created_at;
}
