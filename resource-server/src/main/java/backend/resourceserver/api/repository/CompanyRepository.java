package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.Company_Entity;
import lombok.AllArgsConstructor;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class CompanyRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<Company_Entity> getAllCompanies(){
        String sql = "select * from companies";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Company_Entity.class));
    }

    public Optional<Company_Entity> getCompanyByCompanyProfileId(String CompanyProfileId){
        String sql = "select * from companies where company_profile_id = ?";
        List<Company_Entity> companies = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Company_Entity.class), CompanyProfileId);
        return companies.stream().findFirst();
    }

    public void addNewCompany(Company_Entity company_entity){
        String sql = """
                insert into companies(
                    company_profile_id,
                    company_name,
                    company_owner,
                    registration_number,
                    tax_number,
                    email_address,
                    phone_number,
                    created_at
                ) values(?,?,?,?,?,?,?)
                """;
        jdbcTemplate.update(
                sql,
                company_entity.getCompany_profile_id(),
                company_entity.getCompany_name(),
                company_entity.getCompany_owner(),
                company_entity.getRegistration_number(),
                company_entity.getTax_number(),
                company_entity.getEmail_address(),
                company_entity.getPhone_number(),
                company_entity.getCreated_at()
        );
    }

    public void deleteCompanyByCompanyProfileId(String company_profile_id){
        String sql = "delete from companies where company_profile_id = ?";
        jdbcTemplate.update(sql, company_profile_id);
    }
}
