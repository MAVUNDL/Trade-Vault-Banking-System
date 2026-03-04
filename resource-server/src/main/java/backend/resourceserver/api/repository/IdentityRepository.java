package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.Identity;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface IdentityRepository extends CrudRepository<Identity, UUID> {
    Optional<Identity> findByLoginId(String loginId);
}