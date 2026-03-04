package backend.resourceserver.api.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("shipments")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Shipment_Entity {
    @Id
    Long id;
    String shipment_number;
    String indent_number;
    String ifb_reference;
    String customer_name;
    String buyer_full_name;
    String supplier_name;
    String port_of_load;
    String port_of_discharge;
    LocalDateTime ship_on_board;
    LocalDateTime eta;
    LocalDateTime delivery_date;
    String currency_code;
    BigDecimal order_value;
    BigDecimal shipped_value;
    BigDecimal paid_amount;
    String incoterm;
    String status;
    String movement_type;
    String shipment_mode;
    LocalDateTime mv_start_date;
    LocalDateTime mv_end_date;
    String vessel_name;
    String container_number;
    Integer container_count;
    String container_type;
    String load_type;
    Integer pallets;
    Integer cartons;
    String delivery_contact;
    String delivery_month;
    String delivery_year;
    String delivery_address;
    BigDecimal unit_price;
    String item_reference;
    Integer quantity;
    String description;
    BigDecimal estimated_landed_cost;
    LocalDateTime created_at;
}
