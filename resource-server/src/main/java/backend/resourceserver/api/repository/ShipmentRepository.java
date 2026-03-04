package backend.resourceserver.api.repository;

import backend.resourceserver.api.entity.Shipment_Entity;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@AllArgsConstructor
public class ShipmentRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<Shipment_Entity> getAllShipmentsLinkedToCompanyOwner(String companyOwner){
        String sql = "select * from shipments where lower(buyer_full_name) = ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Shipment_Entity.class), companyOwner.toLowerCase());
    }


    public void deleteShipmentLinkedToShipmenNumber(String shipmentNumber, String companyOwner){
        String sql = "delete from shipments using companies where companies.company_owner = shipments.buyer_full_name and  shipments.shipment_number = ? and companies.company_owner = ?";
        jdbcTemplate.update(sql, shipmentNumber,  companyOwner.toLowerCase(), companyOwner.toLowerCase());
    }

    public void deleteAllShipmentsLinkedToCompany(String companyOwner){
        String sql = "delete from shipments  using companies where companies.company_owner = shipments.buyer_full_name  and companies.company_owner = ? and  shipments.buyer_full_name = ?";
        jdbcTemplate.update(sql, companyOwner.toLowerCase(), companyOwner.toLowerCase());
    }

    public void addNewShipment(Shipment_Entity shipment) {

        String sql = """
            insert into shipments(
                shipment_number,
                indent_number,
                ifb_reference,
                customer_name,
                buyer_full_name,
                supplier_name,
                port_of_load,
                port_of_discharge,
                delivery_address,
                ship_on_board,
                eta,
                delivery_date,
                mv_start_date,
                mv_end_date,
                currency_code,
                order_value,
                shipped_value,
                paid_amount,
                unit_price,
                estimated_landed_cost,
                incoterm,
                status,
                movement_type,
                shipment_mode,
                vessel_name,
                container_number,
                container_count,
                container_type,
                load_type,
                pallets,
                cartons,
                item_reference,
                quantity,
                description,
                delivery_contact,
                delivery_month,
                delivery_year,
                created_at
            ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """;

        jdbcTemplate.update(
                sql,
                shipment.getShipment_number(),
                shipment.getIndent_number(),
                shipment.getIfb_reference(),
                shipment.getCustomer_name(),
                shipment.getBuyer_full_name(),
                shipment.getSupplier_name(),
                shipment.getPort_of_load(),
                shipment.getPort_of_discharge(),
                shipment.getDelivery_address(),
                shipment.getShip_on_board(),
                shipment.getEta(),
                shipment.getDelivery_date(),
                shipment.getMv_start_date(),
                shipment.getMv_end_date(),
                shipment.getCurrency_code(),
                shipment.getOrder_value(),
                shipment.getShipped_value(),
                shipment.getPaid_amount(),
                shipment.getUnit_price(),
                shipment.getEstimated_landed_cost(),
                shipment.getIncoterm(),
                shipment.getStatus(),
                shipment.getMovement_type(),
                shipment.getShipment_mode(),
                shipment.getVessel_name(),
                shipment.getContainer_number(),
                shipment.getContainer_count(),
                shipment.getContainer_type(),
                shipment.getLoad_type(),
                shipment.getPallets(),
                shipment.getCartons(),
                shipment.getItem_reference(),
                shipment.getQuantity(),
                shipment.getDescription(),
                shipment.getDelivery_contact(),
                shipment.getDelivery_month(),
                shipment.getDelivery_year(),
                shipment.getCreated_at()
        );
    }

}
