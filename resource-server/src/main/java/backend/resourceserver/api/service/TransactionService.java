package backend.resourceserver.api.service;

import backend.resourceserver.api.entity.Transaction_Entity;
import backend.resourceserver.api.repository.TransactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;

    public ResponseEntity<?> retrieveAllTransactionsForAccountId(String accountId, String profileId) {
        List<Transaction_Entity> transactions = transactionRepository.getAllTransactionsByAccountId(accountId, profileId);
        if(transactions.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("transactions", transactions));
    }

    public ResponseEntity<?> insertNewTransaction(Transaction_Entity transaction_entity){
        transactionRepository.insertNewTransaction(transaction_entity);
        return ResponseEntity.ok().build();
    }
}
