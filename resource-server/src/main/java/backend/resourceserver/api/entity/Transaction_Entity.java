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
@Table("transactions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Transaction_Entity {
    @Id
    Long id;
    String account_id;
    String type;
    String transaction_type;
    String status;
    String description;
    String card_number;
    LocalDate posting_date;
    LocalDate value_date;
    LocalDate action_date;
    LocalDate transaction_date;
    BigDecimal amount;
    BigDecimal running_balance;
    String uuid;
}
