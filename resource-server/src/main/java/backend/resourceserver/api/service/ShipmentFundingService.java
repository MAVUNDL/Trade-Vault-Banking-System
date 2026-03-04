package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.ShipmentFunding_Entity;
import backend.resourceserver.api.repository.ShipmentFundingRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class ShipmentFundingService {
    private final ShipmentFundingRepository shipmentFundingRepository;

    public ResponseEntity<?> retrieveAllShipmentFundingForCompanyId(String companyId){
        List<ShipmentFunding_Entity> companyFunding = shipmentFundingRepository.getAllShipmentFundingByCompanyId(companyId);
        if(companyFunding.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("shipment-fundings",companyFunding));
    }

    public ResponseEntity<?> retrieveShipmentFundingByShipmentId(String company_id, String shipment_id){
        return shipmentFundingRepository.getShipmentFundingByShipmentId(shipment_id, company_id)
                .map(shipment_funding -> ResponseEntity.ok(Map.of("shipment-funding", shipment_funding)))
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> createNewShipmentFunding(ShipmentFunding_Entity shipmentFunding){
        shipmentFundingRepository.AddShipmentFunding(shipmentFunding);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?> addFundingToShipment(String companyId,String shipmentId, BigDecimal fundingAmount){
        boolean accepted = shipmentFundingRepository.addFundingToShipment(companyId,shipmentId, fundingAmount);
        if(accepted){
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.unprocessableContent().build();
        }
    }
}
