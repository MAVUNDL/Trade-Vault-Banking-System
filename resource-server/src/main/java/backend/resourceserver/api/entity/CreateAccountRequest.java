package backend.resourceserver.api.entity;

import lombok.Data;

@Data
public class CreateAccountRequest {
    private String accountName;
    private String productName;
}