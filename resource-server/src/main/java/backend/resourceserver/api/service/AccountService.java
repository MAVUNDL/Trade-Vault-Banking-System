package backend.resourceserver.api.service;


import backend.resourceserver.api.entity.Account_Entity;
import backend.resourceserver.api.repository.AccountRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;

    public ResponseEntity<?> retrieveAllAccountsForProfile(String profileId) {
        List<Account_Entity> accounts = accountRepository.getAllAccountsByProfileId(profileId);
        // Check if the list is empty and return 404 if true
        if (accounts.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("accounts", accounts));
    }

    public ResponseEntity<?> retrieveAccountForAccountId(String accountId, String profileId) {
        return accountRepository.getAccountByAccountId(accountId, profileId)
                // If the account exists, wrap it in a Map and return 200 OK
                .map(account -> ResponseEntity.ok(Map.of("account", account)))
                // If the Optional is empty, return a 404 Not Found status
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public Account_Entity getAccountEntityByAccountNo(String accountNo) {
        return accountRepository.getAccountByAccountNo(accountNo.trim())
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    public ResponseEntity<?> createAccount(Account_Entity account_entity){
        accountRepository.insertAccount(account_entity);
        return ResponseEntity.accepted().build();
    }

    public ResponseEntity<?> removeAccount(String accountId, String profileId) {
        accountRepository.deleteAccountByAccountId(accountId, profileId);
        return ResponseEntity.accepted().build();
    }
}
