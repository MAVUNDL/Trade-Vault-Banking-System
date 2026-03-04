package backend.resourceserver.security.provider;

import backend.resourceserver.api.entity.Identity;
import backend.resourceserver.api.entity.UserEntity;
import backend.resourceserver.api.repository.IdentityRepository;
import backend.resourceserver.api.repository.PbUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AuthProvider implements AuthenticationProvider {

    private final IdentityRepository identityRepository;
    private final PbUserRepository pbUserRepository;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {

        String profileId = authentication.getName();

        if (authentication.getCredentials() == null) {
            throw new BadCredentialsException("Missing credentials");
        }

        String password = authentication.getCredentials().toString();

        Identity identity = identityRepository.findByLoginId(profileId)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!getPasswordEncoder().matches(password, identity.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        UserEntity userEntity = pbUserRepository.findByProfileId(profileId)
                .orElseThrow(() -> new InternalAuthenticationServiceException(
                        "User data integrity violation: Identity exists but PbUser missing"));

        // Dynamically build authorities from user's stored roles
        List<SimpleGrantedAuthority> authorities =
                userEntity.getAuthorities().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(
                userEntity,
                null,
                authorities
        );
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

    private PasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
