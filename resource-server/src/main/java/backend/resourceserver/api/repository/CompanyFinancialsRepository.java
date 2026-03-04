package backend.resourceserver.api.repository;


import backend.resourceserver.api.entity.CompanyFinancials_Entity;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class CompanyFinancialsRepository {
    private final JdbcTemplate jdbcTemplate;

    public Optional<CompanyFinancials_Entity> getCompanyFinancialsByCompanyId(String company_id){
        String sql = "select * from company_financials where company_id = ?";
        List<CompanyFinancials_Entity> financials = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(CompanyFinancials_Entity.class));
        return financials.stream().findFirst();
    }

    public void addNewCompanyFinancial(CompanyFinancials_Entity companyFinancial){
        String sql = """
                insert into company_financials(
                    company_id,
                    current_balance,
                    available_balance,
                    last_updated_at
                ) values (?,?,?,?)
                """;
        jdbcTemplate.update(
                sql,
                companyFinancial.getCompany_id(),
                companyFinancial.getCurrent_balance(),
                companyFinancial.getAvailable_balance(),
                companyFinancial.getLast_updated()
        );
    }

    public void updateCompanyBalance(String company_id, BigDecimal balance){
        String sql = "update company_financials  as c set current_balance = c.current_balance + ? , available_balance = c.available_balance + ?, last_updated = ? where company_id = ?";
        jdbcTemplate.update(sql,balance, balance, LocalDateTime.now(), company_id);
    }
}
