package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.Beneficiary_Entity;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
@AllArgsConstructor
public class BeneficiaryRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<Beneficiary_Entity> getAllBeneficiariesByProfileId(String profile_id){
        String sql = "select * from beneficiary where profile_id = ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Beneficiary_Entity.class),profile_id);
    }

    public void lastPaymentUpdate(String beneficiaryId, BigDecimal amount) {
        String sql = " UPDATE beneficiary SET last_payment_date = NOW(), last_payment_amount = ? WHERE beneficiary_id = ?";

        int rowsAffected = jdbcTemplate.update(sql,amount, beneficiaryId);

        if (rowsAffected == 0) {
            throw new RuntimeException(
                    "Failed to update last payment date. Beneficiary not found: " + beneficiaryId
            );
        }
    }

    public void addNewBeneficiary(Beneficiary_Entity beneficiary){
        String sql = """
                insert into beneficiary(
                    beneficiary_id,
                    account_number,
                    code,
                    bank,
                    beneficiary_name,
                    last_payment_amount,
                    last_payment_date,
                    cell_no,
                    email_address,
                    name,
                    reference_account_number,
                    reference_name,
                    category_id,
                    profile_id,
                    faster_payment_allowed,
                    created_at
                ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """;
        jdbcTemplate.update(
                sql,
                beneficiary.getBeneficiary_id(),
                beneficiary.getAccount_number(),
                beneficiary.getCode(),
                beneficiary.getBank(),
                beneficiary.getBeneficiary_name(),
                beneficiary.getLast_payment_amount(),
                beneficiary.getLast_payment_date(),
                beneficiary.getCell_no(),
                beneficiary.getEmail_address(),
                beneficiary.getName(),
                beneficiary.getReference_account_number(),
                beneficiary.getReference_name(),
                beneficiary.getCategory_id(),
                beneficiary.getProfile_id(),
                beneficiary.getFaster_payment_allowed(),
                beneficiary.getCreated_at()
        );
    }

    public void removeBeneficiaryByBeneficiaryId(String beneficiary_id, String profileId){
        String sql = "delete from beneficiary where beneficiary_id = ? and  profile_id = ?";
        jdbcTemplate.update(sql,beneficiary_id);
    }
}
