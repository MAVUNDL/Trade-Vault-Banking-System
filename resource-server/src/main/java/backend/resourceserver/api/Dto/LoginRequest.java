package backend.resourceserver.api.Dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String profileId;
    private String password;
}