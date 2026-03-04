package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.ShipmentFunding_Entity;
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
public class ShipmentFundingRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<ShipmentFunding_Entity> getAllShipmentFundingByCompanyId(String company_id){
        String sql = "select * from shipment_funding where shipment_funding.company_profile_id = ?";
        return  jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ShipmentFunding_Entity.class), company_id);
    }

    public Optional<ShipmentFunding_Entity> getShipmentFundingByShipmentId(String shipment_id, String company_id){
        String sql = "select * from shipment_funding join companies on companies.company_profile_id = shipment_funding.company_profile_id where companies.company_profile_id = ? and shipment_funding.shipment_id = ?";
        List<ShipmentFunding_Entity> shipments = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ShipmentFunding_Entity.class), company_id, shipment_id);
        return shipments.stream().findFirst();
    }

    public void AddShipmentFunding(ShipmentFunding_Entity shipmentFundingEntity){
        String sql = """
                insert into shipment_funding(
                    shipment_number,
                    company_profile_id,
                    funding_required,
                    funding_raised,
                    funding_status,
                    created_at,
                    updated_at
                ) values(?,?,?,?,?,?,?)
                """;
        jdbcTemplate.update(
                sql,
                shipmentFundingEntity.getShipment_number(),
                shipmentFundingEntity.getCompany_profile_id(),
                shipmentFundingEntity.getFunding_required(),
                shipmentFundingEntity.getFunding_raised(),
                shipmentFundingEntity.getFunding_status(),
                shipmentFundingEntity.getCreated_at(),
                shipmentFundingEntity.getUpdated_at()
        );
    }

    public boolean addFundingToShipment(String companyId, String shipmentNumber, BigDecimal fundingAmount) {

        String sql = """
                UPDATE shipment_funding
                SET\s
                    funding_raised = funding_raised + ?,
                    updated_at = ?,
                    funding_status = CASE
                        WHEN funding_required = 0 THEN 'NOT_REQUIRED'
                        WHEN funding_raised + ? >= funding_required THEN 'FUNDED'
                        ELSE 'OPEN'
                    END
                FROM companies
                WHERE companies.company_profile_id = shipment_funding.company_profile_id
                  AND companies.company_profile_id = ?
                  AND shipment_funding.shipment_number = ?
                  AND funding_status != 'CLOSED'
                  AND funding_raised < funding_required
                  AND ? <= (funding_required - funding_raised)
           \s""";

        int rowsUpdated = jdbcTemplate.update(
                sql,
                fundingAmount,
                LocalDateTime.now(),
                fundingAmount,
                companyId,
                shipmentNumber,
                fundingAmount
        );

        return rowsUpdated > 0;
    }
}
