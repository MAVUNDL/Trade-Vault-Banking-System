package backend.resourceserver.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("identities")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Identity {
    @Id
    private UUID identityId;
    private String loginId;
    private String passwordHash;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
