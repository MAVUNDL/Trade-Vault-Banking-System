package backend.resourceserver.api.controller;

import backend.resourceserver.api.entity.*;
import backend.resourceserver.api.service.*;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@AllArgsConstructor
public class ClientAPIController {
    private final AccountService accountService;
    private final AccountInfoService accountInfoService;
    private final BeneficiaryService beneficiaryService;
    private final TransactionService transactionService;
    private final InvestmentsService investmentsService;
    private final CompanyService companyService;
    private final CompanyFinancialsService companyFinancialsService;
    private final ShipmentService shipmentService;
    private final ShipmentFundingService shipmentFundingService;

    @GetMapping("/accounts")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> retrieveAccounts(@AuthenticationPrincipal UserEntity user) {
        return accountService.retrieveAllAccountsForProfile(user.getProfileId());
    }

    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> retrieveSpecificAccount(@PathVariable String accountId, @AuthenticationPrincipal UserEntity user) {
        return accountService.retrieveAccountForAccountId(accountId, user.getProfileId());
    }

    @PostMapping("/account/open-account")
    @Transactional // Rolls back if the ledger info fails to create
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> openNewAccount(
            @RequestBody CreateAccountRequest request,
            @AuthenticationPrincipal UserEntity user) {

        // 1. Generate Unique Identifiers
        // Example: Investec style prefixes + random digits
        String generatedAccountNumber = "1100" + (long) (Math.random() * 1000000000L);
        String generatedAccountId = java.util.UUID.randomUUID().toString().replace("-", "");

        // 2. Create the Base Account
        Account_Entity account = new Account_Entity();
        account.setAccount_id(generatedAccountId);
        account.setAccount_number(generatedAccountNumber);
        account.setAccount_name(request.getAccountName());
        account.setProduct_name(request.getProductName());
        account.setReference_name(request.getAccountName() + " Ref");
        account.setProfile_id(user.getProfileId());
        account.setKyc_compliant(true); // Assuming they are already KYC'd to be logged in
        account.setCreated_at(java.time.LocalDateTime.now());

        accountService.createAccount(account);

        // 3. Create the Linked Ledger (Account Info) starting at 0.00
        AccountInfo_Entity info = new AccountInfo_Entity();
        info.setAccount_id(generatedAccountId);
        info.setCurrent_balance(java.math.BigDecimal.ZERO);
        info.setAvailable_balance(java.math.BigDecimal.ZERO);
        info.setCurrency("ZAR");
        info.setLast_updated_at(java.time.LocalDateTime.now());

        accountInfoService.loadNewAccountInfo(info);

        return ResponseEntity.ok().body(Map.of("message", "Account opened successfully", "account_number", generatedAccountNumber));
    }

    @PostMapping("/account/transfer")
    @Transactional // CRITICAL: Rolls back if either side of the ledger fails!
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> transferBetweenAccounts(
            @RequestBody InterAccountTransferRequest request,
            @AuthenticationPrincipal UserEntity user) {

        // Safety check: Prevent transferring to the same account
        if (request.getSourceAccountId().equals(request.getDestinationAccountId())) {
            throw new RuntimeException("Source and destination accounts cannot be the same.");
        }

        // 1. Deduct from Source Account (Throws RuntimeException if insufficient funds)
        accountInfoService.updateAccountInfo(request.getSourceAccountId(), user.getProfileId(), request.getAmount().negate());

        // 2. Add to Destination Account (Belongs to the same profile)
        accountInfoService.updateAccountInfo(request.getDestinationAccountId(), user.getProfileId(), request.getAmount());

        // 3. Log Source Transaction (DEBIT)
        Transaction_Entity debitTxn = new Transaction_Entity();
        debitTxn.setAccount_id(request.getSourceAccountId());
        debitTxn.setType("DEBIT");
        debitTxn.setTransaction_type("INTER-ACCOUNT TRANSFER");
        debitTxn.setStatus("COMPLETED");
        debitTxn.setDescription("Transfer to " + request.getDestinationAccountId().substring(request.getDestinationAccountId().length() - 4) + ": " + request.getDescription());
        debitTxn.setAmount(request.getAmount().negate());
        debitTxn.setPosting_date(LocalDate.now());
        debitTxn.setAction_date(LocalDate.now());
        debitTxn.setTransaction_date(LocalDate.now());
        transactionService.insertNewTransaction(debitTxn);

        // 4. Log Destination Transaction (CREDIT)
        Transaction_Entity creditTxn = new Transaction_Entity();
        creditTxn.setAccount_id(request.getDestinationAccountId());
        creditTxn.setType("CREDIT");
        creditTxn.setTransaction_type("INTER-ACCOUNT TRANSFER");
        creditTxn.setStatus("COMPLETED");
        creditTxn.setDescription("Transfer from " + request.getSourceAccountId().substring(request.getSourceAccountId().length() - 4) + ": " + request.getDescription());
        creditTxn.setAmount(request.getAmount());
        creditTxn.setPosting_date(LocalDate.now());
        creditTxn.setAction_date(LocalDate.now());
        creditTxn.setTransaction_date(LocalDate.now());
        transactionService.insertNewTransaction(creditTxn);

        return ResponseEntity.ok().body(Map.of("message", "Transfer completed successfully"));
    }

    @DeleteMapping("/accounts/delete-account/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAccount(@PathVariable String accountId, @AuthenticationPrincipal UserEntity user) {
        return accountService.removeAccount(accountId, user.getProfileId());
    }


    @GetMapping("/account/{accountId}/information")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> retrieveAccountInfoForAccountId(@PathVariable String accountId, @AuthenticationPrincipal UserEntity user) {
        return accountInfoService.retrieveAccountInfoForAccountId(accountId, user.getProfileId());
    }

    @PostMapping("/account/new-information")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> addNewAccountInfo(@RequestBody AccountInfo_Entity accountInfo){
        return accountInfoService.loadNewAccountInfo(accountInfo);
    }

    @PostMapping("/account/{accountId}/update-balance")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> updateAccountBalance(@PathVariable String accountId, @RequestBody BigDecimal balance, @AuthenticationPrincipal UserEntity user) {
        return accountInfoService.updateAccountInfo(accountId, user.getProfileId(),  balance);
    }

    @GetMapping("/account/{accountId}/transactions")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getAccountTransactions(@PathVariable String accountId, @AuthenticationPrincipal UserEntity user) {
        return transactionService.retrieveAllTransactionsForAccountId(accountId, user.getProfileId());
    }

    @PostMapping("/account/new-transaction")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> addNewTransaction(@RequestBody Transaction_Entity transaction, @AuthenticationPrincipal UserEntity user) {
        return transactionService.insertNewTransaction(transaction);
    }

    @GetMapping("/account/profile/{profileId}/beneficiaries")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getAllAccountBeneficiaries(@PathVariable String profileId, @AuthenticationPrincipal UserEntity user) {
        if(user.getProfileId().matches(profileId.strip()))
            return beneficiaryService.retrieveAllBeneficiariesForProfileId(profileId);
        return ResponseEntity.status(403).body("You are trying to retrieve beneficiaries of another profile Id. Use your own profile Id");
    }

    @PostMapping("/account/profile/beneficiary")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> addNewBeneficiary(@RequestBody Beneficiary_Entity beneficiary) {
        return beneficiaryService.addBeneficiary(beneficiary);
    }

    @DeleteMapping("account/profile/{beneficiaryId}/delete-beneficiary")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> deleteBeneficiary(@PathVariable String beneficiaryId, @AuthenticationPrincipal UserEntity user) {
        return beneficiaryService.removeBeneficiary(beneficiaryId, user.getProfileId());
    }

    @GetMapping("/account/{accountId}/investments")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getAccountInvestments(@PathVariable String accountId,@AuthenticationPrincipal UserEntity user) {
        return investmentsService.retrieveAllInvestmentsForInvestorId(accountId, user.getProfileId());
    }

    @PostMapping("/account/create-investment")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> addNewInvestment(@RequestBody Investments_Entity investment) {
        return investmentsService.addNewInvestment(investment);
    }

    @GetMapping("/companies")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getAllCompanies() {
        return companyService.retrieveAllCompanies();
    }

    @GetMapping("/companies/{companyProfileId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getCompanyByProfileId(@PathVariable String companyProfileId) {
        return companyService.getCompanyByCompanyId(companyProfileId);
    }

    @PostMapping("/companies/create-new-company")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createNewCompany(@RequestBody Company_Entity company) {
        return companyService.createNewCompany(company);
    }

    @DeleteMapping("/companies/delete-company/{companyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCompany(@PathVariable String companyId) {
        return companyService.removeCompany(companyId);
    }

    @GetMapping("/companies/company/{companyId}/financials")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCompanyFinancials(@PathVariable String companyId) {
        return companyFinancialsService.retrieveAllCompanyFinancialsForCompanyId(companyId);
    }

    @PostMapping("/companies/company/add-new-financials")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addNewCompanyFinancials(@RequestBody CompanyFinancials_Entity companyFinancials) {
        return companyFinancialsService.insertNewCompanyFinancial(companyFinancials);
    }

    @PostMapping("/companies/company/{companyId}/update-financials")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCompanyFinancials(@PathVariable String companyId, @RequestBody BigDecimal amount) {
        return companyFinancialsService.updateCompanyBalance(companyId, amount);
    }

    @GetMapping("/companies/company/{companyOwner}/shipments")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getCompanyShipments(@PathVariable String companyOwner){

        return shipmentService.retrieveAllShipmentsForCompany(companyOwner);
    }

    @PostMapping("/companies/company/shipments/shipment/new-shipment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addNewShipment(@RequestBody Shipment_Entity shipment) {
        return shipmentService.insertNewShipment(shipment);
    }

    @DeleteMapping("/companies/company/{companyOwner}/shipments/shipment/{shipmentNo}/delete-shipment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteShipment(@PathVariable String companyOwner,@PathVariable String shipmentNo){
        return shipmentService.removeShipmentByShipmentNumber(companyOwner, shipmentNo);
    }

    @DeleteMapping("/companies/company/{companyOwner}/shipments/delete-shipments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllShipments(@PathVariable String companyOwner){
        return shipmentService.removeAllShipmentsForCompany(companyOwner);
    }

    @GetMapping("/companies/company/{companyId}/shipments/funding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCompanyShipmentFundings(@PathVariable String companyId){
        return shipmentFundingService.retrieveAllShipmentFundingForCompanyId(companyId);
    }

    @GetMapping("/companies/company/{companyId}/shipments/{shipmentId}/funding/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getShipmentFundingLinkedToCompany(@PathVariable String companyId, @PathVariable String shipmentId){
        return shipmentFundingService.retrieveShipmentFundingByShipmentId(companyId, shipmentId);
    }

    @PostMapping("/companies/company/shipments/record-new-funding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addNewShipmentFunding(@RequestBody ShipmentFunding_Entity shipmentFunding) {
        return shipmentFundingService.createNewShipmentFunding(shipmentFunding);
    }

    @PostMapping("/companies/company/{companyId}/shipments/{shipmentId}/add-funding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addFundingToShipment(@PathVariable String companyId,@PathVariable String shipmentId, @RequestBody BigDecimal fundingAmount){
        return shipmentFundingService.addFundingToShipment(companyId, shipmentId, fundingAmount);
    }

    @PostMapping("/investments/deploy")
    @PreAuthorize("hasAuthority('USER')")
    @Transactional // Rolls back ONLY if a RuntimeException is thrown
    public ResponseEntity<?> deployCapitalToShipment(
            @RequestBody DeployCapitalRequest request,
            @AuthenticationPrincipal UserEntity user) {

        // 1. Deduct Balance
        accountInfoService.updateAccountInfo(request.getSourceAccountId(), user.getProfileId(), request.getAmount().negate());

        // 2. Create Transaction Record
        Transaction_Entity txn = new Transaction_Entity();
        txn.setAccount_id(request.getSourceAccountId());
        txn.setType("DEBIT");
        txn.setTransaction_type("INVESTMENT FUNDING");
        txn.setStatus("COMPLETED");
        txn.setDescription("Funded Shipment " + request.getShipmentNumber());
        txn.setAmount(request.getAmount().negate());
        txn.setPosting_date(LocalDate.now());
        txn.setAction_date(LocalDate.now());
        txn.setTransaction_date(LocalDate.now());
        transactionService.insertNewTransaction(txn);

        // 3. Update the Shipment Funding Pool
        ResponseEntity<?> response = shipmentFundingService.addFundingToShipment(request.getCompanyProfileId(), request.getShipmentNumber(), request.getAmount());

        // 🚨 CRITICAL FIX: We MUST throw an exception if this fails so the money is refunded!
        if(!response.getStatusCode().is2xxSuccessful()){
            throw new RuntimeException("Funding failed: Shipment may be fully funded or unavailable.");
        }

        // 4. Record the Investment
        Investments_Entity investment = new Investments_Entity();
        investment.setShipment_number(request.getShipmentNumber());
        investment.setInvestor_profile_id(user.getProfileId());
        investment.setInvestor_account_id(request.getSourceAccountId());
        investment.setAmount(request.getAmount());
        investment.setStatus("CONFIRMED");
        investment.setCreated_at(LocalDateTime.now());
        investmentsService.addNewInvestment(investment);

        return ResponseEntity.ok().body("{\"message\": \"Capital deployed successfully\"}");
    }

    @PostMapping("/account/pay-beneficiary")
    @Transactional // CRITICAL for financial safety
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> payBeneficiary(@RequestBody PaymentRequest request, @AuthenticationPrincipal UserEntity user) {

        // 1. Deduct from Sender (Throws RuntimeException if insufficient funds)
        accountInfoService.updateAccountInfo(request.getSourceAccountId(), user.getProfileId(), request.getAmount().negate());

        // 2. Add to Receiver (The Beneficiary's Account Number)
        Account_Entity beneficiaryAccount = accountService.getAccountEntityByAccountNo(request.getDestinationAccountNumber());
        accountInfoService.updateAccountInfo(beneficiaryAccount.getAccount_id(), beneficiaryAccount.getProfile_id(), request.getAmount());

        // 3. Log Sender Transaction (DEBIT)
        Transaction_Entity senderTxn = new Transaction_Entity();
        senderTxn.setAccount_id(request.getSourceAccountId());
        senderTxn.setType("DEBIT");
        senderTxn.setTransaction_type("EFT PAYMENT");
        senderTxn.setStatus("COMPLETED");
        senderTxn.setDescription("Paid: " + request.getDescription());
        senderTxn.setAmount(request.getAmount().negate());
        senderTxn.setPosting_date(LocalDate.now());
        senderTxn.setAction_date(LocalDate.now());
        senderTxn.setTransaction_date(LocalDate.now());
        transactionService.insertNewTransaction(senderTxn);

        // 4. Log Receiver Transaction (CREDIT)
        Transaction_Entity receiverTxn = new Transaction_Entity();
        receiverTxn.setAccount_id(beneficiaryAccount.getAccount_id());
        receiverTxn.setType("CREDIT");
        receiverTxn.setTransaction_type("INCOMING EFT");
        receiverTxn.setStatus("COMPLETED");
        receiverTxn.setDescription("Received: " + request.getDescription());
        receiverTxn.setAmount(request.getAmount());
        receiverTxn.setPosting_date(LocalDate.now());
        receiverTxn.setAction_date(LocalDate.now());
        receiverTxn.setTransaction_date(LocalDate.now());
        transactionService.insertNewTransaction(receiverTxn);

        // 5. Update Beneficiary "Last Payment Date"
        beneficiaryService.updateLastPayment(request.getBeneficiaryId(), request.getAmount());

        return ResponseEntity.ok(Map.of("message", "Payment successful"));
    }

}
