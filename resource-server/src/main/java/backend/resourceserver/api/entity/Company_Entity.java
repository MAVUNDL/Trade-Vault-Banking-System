package backend.resourceserver.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("companies")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Company_Entity {
    @Id
    Long id;
    String company_profile_id;
    String company_name;
    String company_owner;
    String registration_number;
    String tax_number;
    String email_address;
    String phone_number;
    LocalDateTime created_at;
}
