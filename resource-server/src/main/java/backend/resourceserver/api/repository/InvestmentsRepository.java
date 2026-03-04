package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.Investments_Entity;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@AllArgsConstructor
public class InvestmentsRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<Investments_Entity> getAllInvestmentsByInvestorId(String accountId, String investor_id) {
        String sql = "select i.* from investments i join account a on a.account_id = i.investor_account_id where a.account_id = ? and a.profile_id = ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Investments_Entity.class),accountId, investor_id);
    }

    public void AddNewInvestment(Investments_Entity investments_entity) {
        String sql = """
                insert into investments(
                    shipment_number,
                    investor_profile_id,
                    investor_account_id,
                    amount,
                    status,
                    created_at
                ) values(?,?,?,?,?,?)
                """;
        jdbcTemplate.update(
                sql,
                investments_entity.getShipment_number(),
                investments_entity.getInvestor_profile_id(),
                investments_entity.getInvestor_account_id(),
                investments_entity.getAmount(),
                investments_entity.getStatus(),
                investments_entity.getCreated_at()
        );
    }
}
