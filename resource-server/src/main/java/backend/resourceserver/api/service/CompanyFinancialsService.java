package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.CompanyFinancials_Entity;
import backend.resourceserver.api.repository.CompanyFinancialsRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@AllArgsConstructor
public class CompanyFinancialsService {
    private  final CompanyFinancialsRepository companyFinancialsRepository;

    public ResponseEntity<?> retrieveAllCompanyFinancialsForCompanyId(String companyId){
        return companyFinancialsRepository.getCompanyFinancialsByCompanyId(companyId)
                .map(companyFinancials -> ResponseEntity.ok(Map.of("company-financials", companyFinancials)))
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> insertNewCompanyFinancial(CompanyFinancials_Entity companyFinancial){
        companyFinancialsRepository.addNewCompanyFinancial(companyFinancial);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?> updateCompanyBalance(String companyId, BigDecimal balance){
        companyFinancialsRepository.updateCompanyBalance(companyId, balance);
        return ResponseEntity.ok().build();
    }
}
