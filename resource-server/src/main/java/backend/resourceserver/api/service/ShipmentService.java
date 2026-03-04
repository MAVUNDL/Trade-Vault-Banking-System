package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.Shipment_Entity;
import backend.resourceserver.api.repository.ShipmentRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class ShipmentService {
    private final ShipmentRepository shipmentRepository;

    public ResponseEntity<?> retrieveAllShipmentsForCompany(String companyOwner){
        System.out.println(companyOwner);
        List<Shipment_Entity> shipments = shipmentRepository.getAllShipmentsLinkedToCompanyOwner(companyOwner.toLowerCase().trim());
        if(shipments.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("shipments", shipments));
    }

    public ResponseEntity<?> insertNewShipment(Shipment_Entity shipment){
        shipmentRepository.addNewShipment(shipment);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?> removeShipmentByShipmentNumber(String shipmentNumber, String companyOwner){
        shipmentRepository.deleteShipmentLinkedToShipmenNumber(shipmentNumber, companyOwner);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?> removeAllShipmentsForCompany(String companyName){
        shipmentRepository.deleteAllShipmentsLinkedToCompany(companyName);
        return ResponseEntity.ok().build();
    }
}
