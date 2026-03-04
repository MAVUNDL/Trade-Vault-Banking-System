package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.AccountInfo_Entity;
import backend.resourceserver.api.repository.AccountInfoRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@AllArgsConstructor
public class AccountInfoService {
    private final AccountInfoRepository accountInfoRepository;

    public ResponseEntity<?> retrieveAccountInfoForAccountId(String accountId, String profileId){
        return accountInfoRepository.getAccountInfoByAccountId(accountId, profileId)
                .map(accountInfo -> ResponseEntity.ok(Map.of("account-information", accountInfo)))
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> loadNewAccountInfo(AccountInfo_Entity accountInfo){
        accountInfoRepository.addNewAccountInfo(accountInfo);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?> updateAccountInfo(String accountId, String profileId, BigDecimal amount){
        accountInfoRepository.updateAccountBalance(accountId, profileId, amount);
        return ResponseEntity.ok().build();
    }
}
