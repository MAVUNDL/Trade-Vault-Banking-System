package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.Account_Entity;
import backend.resourceserver.api.entity.Transaction_Entity;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@AllArgsConstructor
public class TransactionRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<Transaction_Entity> getAllTransactionsByAccountId(String account_id, String profile_id) {
        String sql = "select t.* from transactions t join account a on a.account_id = t.account_id  where a.account_id = ? and  a.profile_id = ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Transaction_Entity.class),account_id, profile_id);
    }

    public void insertNewTransaction(Transaction_Entity transaction_entity) {
        String sql = """
                insert into transactions(
                    account_id,
                    type,
                    transaction_type,
                    status,
                    description,
                    card_number,
                    posting_date,
                    value_date,
                    action_date,
                    transaction_date,
                    amount,
                    running_balance,
                    uuid
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
                """;
        jdbcTemplate.update(
                sql,
                transaction_entity.getAccount_id(),
                transaction_entity.getType(),
                transaction_entity.getTransaction_type(),
                transaction_entity.getStatus(),
                transaction_entity.getDescription(),
                transaction_entity.getCard_number(),
                transaction_entity.getPosting_date(),
                transaction_entity.getValue_date(),
                transaction_entity.getAction_date(),
                transaction_entity.getTransaction_date(),
                transaction_entity.getAmount(),
                transaction_entity.getRunning_balance(),
                transaction_entity.getUuid()
        );
    }
}
