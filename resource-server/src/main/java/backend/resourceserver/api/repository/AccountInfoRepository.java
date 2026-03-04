package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.AccountInfo_Entity;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class AccountInfoRepository {
    private final JdbcTemplate jdbcTemplate;

    public Optional<AccountInfo_Entity> getAccountInfoByAccountId(String accountId, String profileId) {
        String sql = "select i.* from account_information i join account a on i.account_id = a.account_id where a.account_id = ? and  a.profile_id = ?";
        List<AccountInfo_Entity> accountInfo =  jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(AccountInfo_Entity.class), accountId, profileId);
        return accountInfo.stream().findFirst();
    }

    public void addNewAccountInfo(AccountInfo_Entity accountInfo){
        String sql = """
                insert into account_information(
                    account_id,
                    current_balance,
                    available_balance,
                    currency,
                    last_updated_at
                ) values (?,?,?,?,?)
                """;
        jdbcTemplate.update(
                sql,
                accountInfo.getAccount_id(),
                accountInfo.getCurrent_balance(),
                accountInfo.getAvailable_balance(),
                accountInfo.getCurrency(),
                accountInfo.getLast_updated_at()
        );
    }

    public void updateAccountBalance(String accountId, String profileId, BigDecimal balance){
        String sql = """
            UPDATE account_information\s
            SET available_balance = available_balance + ?,\s
                current_balance = current_balance + ?\s
            FROM account a\s
            WHERE account_information.account_id = a.account_id\s
              AND a.account_id = ?\s
              AND a.profile_id = ?\s
              AND (available_balance + ?) >= 0
           \s""";

        // Notice we pass 'balance' a 3rd time at the end to satisfy the new WHERE clause
        int rowsUpdated = jdbcTemplate.update(sql, balance, balance, accountId, profileId, balance);

        // If no rows were updated, it means either the account doesn't belong to the user,
        // OR they didn't have enough money.
        if (rowsUpdated == 0) {
            throw new RuntimeException("Insufficient funds to complete this transaction.");
        }
    }

}
