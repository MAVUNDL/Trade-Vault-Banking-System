package backend.resourceserver.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Table("beneficiary")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Beneficiary_Entity {
    @Id
    Long id;
    String beneficiary_id;
    String account_number;
    String code;
    String bank;
    String beneficiary_name;
    BigDecimal last_payment_amount;
    LocalDate last_payment_date;
    String cell_no;
    String email_address;
    String name;
    String reference_account_number;
    String reference_name;
    String category_id;
    String profile_id;
    Boolean faster_payment_allowed;
    LocalDateTime created_at;
}
