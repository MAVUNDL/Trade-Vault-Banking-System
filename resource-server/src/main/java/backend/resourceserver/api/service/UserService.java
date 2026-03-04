package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.AccountInfo_Entity;
import backend.resourceserver.api.entity.Account_Entity;
import backend.resourceserver.api.entity.Identity;
import backend.resourceserver.api.entity.UserEntity;
import backend.resourceserver.api.repository.IdentityRepository;
import backend.resourceserver.api.repository.PbUserRepository;
import backend.resourceserver.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {
    private final PbUserRepository pbUserRepository;
    private final IdentityRepository identityRepository;
    private final AuthenticationManager authenticationManager;
    private final AccountInfoService accountInfoService;
    private final AccountService accountService;
    private final JwtService jwtService;

    @Transactional // CRITICAL: Rolls back EVERYTHING if the account creation fails
    public ResponseEntity<?> createUser(String profileId, String fullName, String password) {

        // 1. Create Identity (Auth layer)
        Identity identity = Identity.builder()
                .loginId(profileId)
                .passwordHash(getPasswordEncoder().encode(password))
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        Identity savedIdentity = identityRepository.save(identity);

        // 2. Create User Profile
        UserEntity userEntity = UserEntity.builder()
                .identityId(savedIdentity.getIdentityId())
                .profileId(profileId)
                .fullName(fullName)
                .authorities(Set.of("USER"))
                .createdAt(LocalDateTime.now())
                .build();

        pbUserRepository.save(userEntity);

        // 3. Generate Day-One Default Account
        String generatedAccountNumber = "1100" + (long) (Math.random() * 1000000000L);
        String generatedAccountId = java.util.UUID.randomUUID().toString().replace("-", "");

        Account_Entity defaultAccount = new Account_Entity();
        defaultAccount.setAccount_id(generatedAccountId);
        defaultAccount.setAccount_number(generatedAccountNumber);
        defaultAccount.setAccount_name("Main Cash Account");
        defaultAccount.setProduct_name("Cash Management");
        defaultAccount.setReference_name("Main");
        defaultAccount.setProfile_id(profileId); // Link to the new user!
        defaultAccount.setKyc_compliant(false);  // Awaiting KYC
        defaultAccount.setCreated_at(LocalDateTime.now());

        accountService.createAccount(defaultAccount);

        // 4. Initialize the Ledger to ZAR 0.00
        AccountInfo_Entity info = new AccountInfo_Entity();
        info.setAccount_id(generatedAccountId);
        info.setCurrent_balance(BigDecimal.ZERO);
        info.setAvailable_balance(BigDecimal.ZERO);
        info.setCurrency("ZAR");
        info.setLast_updated_at(LocalDateTime.now());

        accountInfoService.loadNewAccountInfo(info);

        return ResponseEntity.accepted().body(Map.of("message", "Registration successful"));
    }

    public ResponseEntity<?> loginUser(String profileId, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            profileId,
                            password
                    )
            );

            UserEntity userEntity = (UserEntity) authentication.getPrincipal();
            assert userEntity != null;
            String accessToken = jwtService.generateAccessToken(userEntity);
            String refreshToken = jwtService.generateRefreshToken(userEntity);
            Map<String, String> tokens = Map.of("accessToken", accessToken, "refreshToken", refreshToken);
            return ResponseEntity.ok(tokens);

        } catch (BadCredentialsException e){
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

    }


    public PasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
