package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.UserEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface PbUserRepository extends CrudRepository<UserEntity, UUID> {
    Optional<UserEntity> findByProfileId(String profileId);

}
