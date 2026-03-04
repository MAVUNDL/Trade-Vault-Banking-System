package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.Company_Entity;
import backend.resourceserver.api.repository.CompanyRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;

    public ResponseEntity<?> retrieveAllCompanies(){
        List<Company_Entity> companies = companyRepository.getAllCompanies();
        if(companies.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("companies", companies));
    }

    public ResponseEntity<?> getCompanyByCompanyId(String companyProfileId){
        return companyRepository.getCompanyByCompanyProfileId(companyProfileId)
                .map(company -> ResponseEntity.ok(Map.of("company", company)))
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> createNewCompany(Company_Entity company_entity){
        companyRepository.addNewCompany(company_entity);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?> removeCompany(String companyProfileId){
        companyRepository.deleteCompanyByCompanyProfileId(companyProfileId);
        return ResponseEntity.ok().build();
    }
}
