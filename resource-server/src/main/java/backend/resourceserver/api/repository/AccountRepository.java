package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.Account_Entity;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class AccountRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<Account_Entity> getAllAccountsByProfileId(String profileId) {
        String sql = "select * from account where profile_id = ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Account_Entity.class), profileId);
    }

    public Optional<Account_Entity> getAccountByAccountId(String accountId, String profileId) {
        String sql = "select * from account where account_id = ? and profile_id = ?";
        List<Account_Entity> accounts = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Account_Entity.class), accountId,  profileId);
        return accounts.stream().findFirst();
    }

    public Optional<Account_Entity> getAccountByAccountNo(String accountNo) {
        String sql = "select * from account where account_number = ?";
        List<Account_Entity> accounts = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Account_Entity.class), accountNo);
        return accounts.stream().findFirst();
    }

    public void insertAccount(Account_Entity account_entity) {
        String sql = """
                insert into account(
                       account_id,
                       account_number,
                       account_name,
                       reference_name,
                       product_name,
                       kyc_compliant,
                       profile_id,
                       created_at
                )  values(?,?,?,?,?,?,?,?)
                """;
        jdbcTemplate.update(
                sql,
                account_entity.getAccount_id(),
                account_entity.getAccount_number(),
                account_entity.getAccount_name(),
                account_entity.getReference_name(),
                account_entity.getProduct_name(),
                account_entity.getKyc_compliant(),
                account_entity.getProfile_id(),
                account_entity.getCreated_at()
        );
    }

    public void deleteAccountByAccountId(String accountId, String profileId) {
        String sql = "delete from account where account_id = ? and profile_id = ?";
        jdbcTemplate.update(sql, accountId,  profileId);
    }
}