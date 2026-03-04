package backend.resourceserver.api.Dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String profileId;
    private String fullName;
    private String password;
}