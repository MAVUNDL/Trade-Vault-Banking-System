package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.Investments_Entity;
import backend.resourceserver.api.repository.InvestmentsRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class InvestmentsService {
    private final InvestmentsRepository investmentsRepository;

    public ResponseEntity<?> retrieveAllInvestmentsForInvestorId(String accountId, String investorId){
        List<Investments_Entity> investments = investmentsRepository.getAllInvestmentsByInvestorId(accountId, investorId);
        if(investments.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("investments", investments));
    }

    public ResponseEntity<?> addNewInvestment(Investments_Entity investments_entity){
        investmentsRepository.AddNewInvestment(investments_entity);
        return ResponseEntity.ok().build();
    }
}
