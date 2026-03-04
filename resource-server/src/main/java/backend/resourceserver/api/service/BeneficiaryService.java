package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.Beneficiary_Entity;
import backend.resourceserver.api.repository.BeneficiaryRepository;
import backend.resourceserver.pipeline.models.Beneficiary;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class BeneficiaryService {
    private final BeneficiaryRepository beneficiaryRepository;

    public ResponseEntity<?> retrieveAllBeneficiariesForProfileId(String profileId){
        List<Beneficiary_Entity> beneficiaries = beneficiaryRepository.getAllBeneficiariesByProfileId(profileId);
        if(beneficiaries.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("beneficiaries",beneficiaries));
    }

    public ResponseEntity<?> addBeneficiary(Beneficiary_Entity beneficiary){
        beneficiaryRepository.addNewBeneficiary(beneficiary);
        return ResponseEntity.ok().build();
    }

    public void updateLastPayment(String beneficiaryId, BigDecimal amount){
        beneficiaryRepository.lastPaymentUpdate(beneficiaryId, amount);
    }

    public ResponseEntity<?> removeBeneficiary(String beneficiaryId, String profileId){
        beneficiaryRepository.removeBeneficiaryByBeneficiaryId(beneficiaryId, profileId);
        return ResponseEntity.ok().build();
    }
}
