# Trade Vault — Backend (Resource Server)

> Spring Boot 4 resource server powering the Trade Vault P2P supply chain finance platform. Handles authentication, shadow ledger management, investment lifecycle, and shipment funding logic.

---

## Overview

The resource server is a stateless RESTful API built on **Java 25** and **Spring Boot 4**. It implements a **shadow ledger architecture** — ingesting live financial and shipment data from Investec's Private Banking (PB) and Corporate & Investment Banking (CIB) APIs, then extending that data with Trade Vault's investment and funding logic without touching the source-of-record systems.

Two roles operate the platform:

- **`ROLE_USER`** (Private Banking investors) — View accounts, manage beneficiaries, browse companies and shipments, deploy capital
- **`ROLE_ADMIN`** (Back-office) — Full CRUD over companies, shipments, funding pools, and account administration

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| Java | 25 | Language |
| Spring Boot | 4.0.2 | Application framework |
| Spring MVC (WebMVC) | — | REST layer |
| Spring Security | — | Authentication, RBAC |
| Spring Data JDBC | — | Database access (no ORM overhead) |
| Spring Batch | — | Batch ingestion pipeline |
| PostgreSQL | 16 | Primary database |
| Flyway | — | Database migrations |
| jjwt | 0.12.6 | JWT generation & validation |
| Lombok | — | Boilerplate reduction |
| Docker Compose | — | Local development database |
| Maven | 3.9+ | Build tool |

---

## Project Structure

```
resource-server/
└── src/main/java/backend/resourceserver/
    ├── ResourceServerApplication.java      # Entry point
    │
    ├── api/
    │   ├── controller/
    │   │   ├── AuthenticationController.java   # Public: /api/auth/register, /api/auth/login
    │   │   └── ClientAPIController.java        # Secured: /api/v1/** (all business endpoints)
    │   │
    │   ├── Dto/
    │   │   ├── LoginRequest.java
    │   │   ├── LoginResponse.java               # Returns accessToken + refreshToken
    │   │   └── RegisterRequest.java
    │   │
    │   ├── entity/                              # Domain entities (shadow ledger tables)
    │   │   ├── Account_Entity.java
    │   │   ├── AccountInfo_Entity.java          # Live balance ledger
    │   │   ├── Transaction_Entity.java
    │   │   ├── Beneficiary_Entity.java
    │   │   ├── Company_Entity.java
    │   │   ├── CompanyFinancials_Entity.java
    │   │   ├── Shipment_Entity.java
    │   │   ├── ShipmentFunding_Entity.java
    │   │   ├── Investments_Entity.java
    │   │   ├── UserEntity.java
    │   │   ├── Identity.java
    │   │   └── [Request DTOs]                   # DeployCapitalRequest, PaymentRequest, etc.
    │   │
    │   ├── repository/                          # Spring Data JDBC repositories
    │   │   └── [One per entity]
    │   │
    │   ├── service/                             # Business logic layer
    │   │   ├── AccountService.java
    │   │   ├── AccountInfoService.java          # Balance mutation (used by all financial ops)
    │   │   ├── TransactionService.java
    │   │   ├── BeneficiaryService.java
    │   │   ├── CompanyService.java
    │   │   ├── CompanyFinancialsService.java
    │   │   ├── ShipmentService.java
    │   │   ├── ShipmentFundingService.java
    │   │   ├── InvestmentsService.java
    │   │   └── UserService.java
    │   │
    │   └── exception/
    │       └── GlobalExceptionHandler.java
    │
    ├── pipeline/                                # Ingest & Extend — upstream API layer
    │   ├── models/                              # Immutable Java records (upstream API shape)
    │   │   ├── Account.java
    │   │   ├── AccountInfo.java
    │   │   ├── Beneficiary.java
    │   │   ├── Shipment.java
    │   │   └── Transaction.java
    │   └── entities/                            # Shadow ledger entities for pipeline writes
    │       └── [Mirrors api/entity/ for pipeline use]
    │
    └── security/
        ├── config/
        │   ├── SecurityConfig.java              # SecurityFilterChain, CORS, RBAC rules
        │   └── WebSecurityConfig.java
        ├── jwt/
        │   ├── JwtService.java                  # Token generation + validation
        │   └── JwtFilter.java                   # Per-request JWT extraction + auth
        └── provider/
            └── AuthProvider.java                # Custom AuthenticationProvider
```

---

## Database Schema

Migrations are versioned with Flyway (`V1__setup.sql` through `V8__setup.sql`) and run automatically on startup.

### Shadow Ledger (Core Banking)

```sql
account (
    account_id        VARCHAR UNIQUE NOT NULL,
    account_number    VARCHAR,
    account_name      VARCHAR,
    reference_name    VARCHAR,
    product_name      VARCHAR,
    kyc_compliant     BOOLEAN,
    profile_id        VARCHAR NOT NULL,
    created_at        TIMESTAMP
)

account_information (
    account_id        VARCHAR REFERENCES account(account_id) ON DELETE CASCADE UNIQUE,
    current_balance   NUMERIC(19,4) DEFAULT 0.0000,
    available_balance NUMERIC(19,4) DEFAULT 0.0000,
    currency          VARCHAR(3),
    last_updated_at   TIMESTAMP
)

transactions (
    account_id        VARCHAR REFERENCES account(account_id) ON DELETE CASCADE,
    type              VARCHAR,           -- DEBIT | CREDIT
    transaction_type  VARCHAR,           -- EFT PAYMENT | INTER-ACCOUNT TRANSFER | INVESTMENT FUNDING
    status            VARCHAR,           -- COMPLETED | PENDING | FAILED
    amount            NUMERIC(19,4),
    posting_date      DATE,
    action_date       DATE,
    transaction_date  DATE
)

beneficiary (
    beneficiary_id    VARCHAR UNIQUE,
    account_number    VARCHAR,
    bank              VARCHAR,
    profile_id        VARCHAR NOT NULL,
    faster_payment_allowed BOOLEAN
)
```

### Authentication

```sql
identities (
    identity_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login_id      VARCHAR UNIQUE NOT NULL,   -- maps to profile_id
    password_hash TEXT NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login    TIMESTAMP
)

users (
    user_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id  UUID UNIQUE REFERENCES identities(identity_id),
    profile_id   VARCHAR UNIQUE NOT NULL,
    full_name    VARCHAR NOT NULL,
    authorities  VARCHAR[] NOT NULL DEFAULT ARRAY['USER']::VARCHAR[]
)
```

### Trade Vault (Investment Layer)

```sql
companies (
    company_profile_id   VARCHAR UNIQUE NOT NULL,
    company_name         VARCHAR NOT NULL,
    company_owner        VARCHAR NOT NULL,
    registration_number  VARCHAR,
    tax_number           VARCHAR
)

company_financials (
    company_id        INTEGER UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    current_balance   NUMERIC(19,4) DEFAULT 0.0000,
    available_balance NUMERIC(19,4) DEFAULT 0.0000
)

shipments (
    shipment_number    VARCHAR UNIQUE NOT NULL,
    customer_name      VARCHAR,
    supplier_name      VARCHAR,
    port_of_load       VARCHAR,
    port_of_discharge  VARCHAR,
    ship_on_board      TIMESTAMP,
    eta                TIMESTAMP,
    delivery_date      TIMESTAMP,
    order_value        NUMERIC(19,4),
    shipped_value      NUMERIC(19,4),
    paid_amount        NUMERIC(19,4),
    incoterm           VARCHAR,           -- FOB | CIF | EXW | DDP
    status             VARCHAR,           -- SCHEDULED | IN_TRANSIT | DELIVERED | PENDING
    shipment_mode      VARCHAR,           -- OCEAN | AIR
    vessel_name        VARCHAR,
    container_number   VARCHAR
)

shipment_funding (
    shipment_number    VARCHAR UNIQUE REFERENCES shipments(shipment_number) ON DELETE CASCADE,
    company_profile_id VARCHAR REFERENCES companies(company_profile_id),
    funding_required   NUMERIC(19,4) DEFAULT 0.0000,
    funding_raised     NUMERIC(19,4) DEFAULT 0.0000,
    funding_status     VARCHAR DEFAULT 'NOT_REQUIRED'
        CHECK (funding_status IN ('NOT_REQUIRED','OPEN','FUNDED','CLOSED'))
)

investments (
    shipment_number       VARCHAR REFERENCES shipments(shipment_number) ON DELETE CASCADE,
    investor_profile_id   VARCHAR NOT NULL,
    investor_account_id   VARCHAR REFERENCES account(account_id),
    amount                NUMERIC(19,4) NOT NULL,
    status                VARCHAR DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','CONFIRMED','REJECTED','PAID_OUT'))
)
```

> **Precision note:** All monetary values use `NUMERIC(19,4)` — this avoids floating-point rounding errors that occur with Java `double` or PostgreSQL `FLOAT`, which is critical for financial systems.

---

## API Reference

### Authentication (Public — no token required)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | `{ profileId, fullName, password }` | Create new user account |
| POST | `/api/auth/login` | `{ profileId, password }` | Returns `accessToken` (15 min) + `refreshToken` (7 days) |

### Accounts

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/accounts` | USER, ADMIN | All accounts for authenticated profile |
| GET | `/api/v1/account/{accountId}` | USER, ADMIN | Single account |
| POST | `/api/v1/account/open-account` | USER, ADMIN | Open new account; creates ledger at `0.00 ZAR` |
| DELETE | `/api/v1/accounts/delete-account/{accountId}` | ADMIN | Delete account |
| GET | `/api/v1/account/{accountId}/information` | USER, ADMIN | Current and available balance |
| POST | `/api/v1/account/{accountId}/update-balance` | USER, ADMIN | Adjust balance by amount |

### Transactions

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/account/{accountId}/transactions` | USER, ADMIN | Full transaction history |
| POST | `/api/v1/account/transfer` | USER, ADMIN | Atomic inter-account transfer (double-entry) |
| POST | `/api/v1/account/pay-beneficiary` | USER, ADMIN | EFT payment to saved beneficiary |

### Beneficiaries

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/account/profile/{profileId}/beneficiaries` | USER, ADMIN | List (profile-guarded) |
| POST | `/api/v1/account/profile/beneficiary` | USER, ADMIN | Add new beneficiary |
| DELETE | `/api/v1/account/profile/{beneficiaryId}/delete-beneficiary` | USER, ADMIN | Remove beneficiary |

### Companies & Shipments

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/companies` | USER, ADMIN | All registered companies |
| GET | `/api/v1/companies/{companyProfileId}` | USER, ADMIN | Single company |
| POST | `/api/v1/companies/create-new-company` | ADMIN | Register company |
| DELETE | `/api/v1/companies/delete-company/{companyId}` | ADMIN | Remove company |
| GET | `/api/v1/companies/company/{companyOwner}/shipments` | USER, ADMIN | All shipments for company |
| POST | `/api/v1/companies/company/shipments/shipment/new-shipment` | ADMIN | Add shipment |
| DELETE | `/api/v1/companies/company/{companyOwner}/shipments/shipment/{shipmentNo}/delete-shipment` | ADMIN | Delete single shipment |

### Shipment Funding

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/companies/company/{companyId}/shipments/funding` | ADMIN | All funding records for company |
| GET | `/api/v1/companies/company/{companyId}/shipments/{shipmentId}/funding/` | ADMIN | Funding for specific shipment |
| POST | `/api/v1/companies/company/shipments/record-new-funding` | ADMIN | Create funding pool |
| POST | `/api/v1/companies/company/{companyId}/shipments/{shipmentId}/add-funding` | ADMIN | Increment funding raised |

### Investments — Trade Vault Core

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/account/{accountId}/investments` | USER, ADMIN | All investments for account |
| POST | `/api/v1/account/create-investment` | USER, ADMIN | Create investment record |
| POST | `/api/v1/investments/deploy` | USER | **Atomic capital deployment** (see below) |

#### Capital Deployment — `POST /api/v1/investments/deploy`

This is the most complex operation in the system. It executes 4 steps atomically under `@Transactional`:

```
1. Deduct balance from investor's source account
   (AccountInfoService.updateAccountInfo — throws if insufficient funds)
   ↓
2. Create DEBIT transaction record
   ↓
3. Add funding to shipment pool
   (ShipmentFundingService.addFundingToShipment — returns 422 if pool is closed/full)
   ↓ (422 response)               ↓ (200 response)
throw RuntimeException         4. Record confirmed investment
(triggers full rollback)
```

If step 3 fails (shipment fully funded or closed), a `RuntimeException` is thrown, which Spring's `@Transactional` catches to roll back steps 1 and 2, refunding the investor's balance.

Request body:
```json
{
  "sourceAccountId": "abc123",
  "shipmentNumber": "SHP-TG-001",
  "companyProfileId": "CMP-20261111111111111111",
  "amount": 5000.00
}
```

---

## Security

### JWT Configuration

Tokens are signed using HMAC-SHA via the `JWT_SECRET_KEY` environment variable (minimum 32 characters). The key is loaded once at startup — never hardcoded.

| Token | Expiry | Claims |
|---|---|---|
| Access Token | 15 minutes | `sub` (profileId), `roles`, `iat`, `exp` |
| Refresh Token | 7 days | `sub` (profileId), `iat`, `exp` |

The `JwtFilter` intercepts every request, extracts the `Authorization: Bearer <token>` header, validates the token, and loads the `UserEntity` into the `SecurityContext`.

### RBAC — Method-Level Security

`@EnableMethodSecurity` enables `@PreAuthorize` annotations on controller methods:

```java
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")   // Standard access
@PreAuthorize("hasRole('ADMIN')")               // Admin-only operations
@PreAuthorize("hasAuthority('USER')")           // Capital deployment (investors only)
```

User roles are stored as a `VARCHAR[]` array in the `users` table and loaded into Spring's `GrantedAuthority` collection on each authenticated request.

### Transaction Safety — `@Transactional`

Every financial mutation that touches more than one table is wrapped in a Spring transaction:

| Operation | What rolls back on failure |
|---|---|
| Inter-account transfer | Debit + credit + both transaction records |
| Beneficiary payment | Debit sender + credit receiver + both transaction records |
| Capital deployment | Balance deduction + debit transaction record + shipment funding update + investment record |
| Account opening | Account creation + linked ledger entry |

### Profile Guard

Beneficiary endpoints verify that the `profileId` in the request path matches the authenticated user's `profileId`, preventing horizontal access to another user's data:

```java
if(user.getProfileId().matches(profileId.strip()))
    return beneficiaryService.retrieveAllBeneficiariesForProfileId(profileId);
return ResponseEntity.status(403).body("...");
```

### CORS

Configured in `SecurityConfig` for `http://localhost:3000`. Update for production:

```java
configuration.setAllowedOrigins(List.of("https://your-production-domain.com"));
```

---

## Getting Started

### Prerequisites
- Java 25+
- Maven 3.9+
- Docker & Docker Compose

### 1. Start the Database

```bash
docker-compose up -d
```

Starts PostgreSQL 16 on port `5433` with database `trade_vault`.

### 2. Set Environment Variables

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5433/trade_vault
export DATABASE_USERNAME=sgaxamabhande
export DATABASE_PASSWORD=your_password
export JWT_SECRET_KEY=your-minimum-32-character-secret-key
export PB_CLIENT_ID=your_pb_client_id
export PB_SECRET=your_pb_secret
export PB_API_KEY=your_pb_api_key
export CIB_CLIENT_ID=your_cib_client_id
export CIB_SECRET=your_cib_secret
export CIB_API_KEY=your_cib_api_key
```

Or configure them in your IDE run configuration.

### 3. Run the Server

```bash
./mvnw spring-boot:run
```

On first startup, Flyway runs all migrations automatically, including seed data for 10 companies and 100 shipments across multiple industries. The server starts on **port 8080**.

### 4. Test Authentication

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"profileId": "USR-001", "fullName": "Jane Doe", "password": "securepassword"}'

# Login — save the accessToken from the response
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"profileId": "USR-001", "password": "securepassword"}'
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | JDBC connection string e.g. `jdbc:postgresql://localhost:5433/trade_vault` |
| `DATABASE_USERNAME` | ✅ | PostgreSQL username |
| `DATABASE_PASSWORD` | ✅ | PostgreSQL password |
| `JWT_SECRET_KEY` | ✅ | HMAC signing secret — minimum 32 characters |

---

## Shadow Ledger Architecture

The `pipeline` package separates upstream API contracts from the internal domain model:

```
Upstream Investec API
        ↓
pipeline/models/         ← Immutable Java records (Jackson deserialization targets)
        ↓  (ingestion)
pipeline/entities/       ← Shadow ledger entities written to PostgreSQL
        ↓
api/entity/              ← Domain entities used by business logic and API layer
```

**Why this matters:** If Investec renames a field in their API response, only the `pipeline/models` record needs updating. The service layer, controller, and database schema are completely insulated from upstream changes.

---

## Key Design Decisions

**Spring Data JDBC over JPA** — No Hibernate, no lazy loading surprises, no N+1 query issues. SQL queries are explicit and predictable, which matters for financial systems where query behaviour must be auditable.

**`NUMERIC(19,4)` for all money** — Java `double` and PostgreSQL `FLOAT` have well-known rounding issues with decimal arithmetic. `NUMERIC(19,4)` stores exact decimal values — the same standard used in accounting software.

**Double-entry transaction logging** — Every money movement creates two `transactions` records (DEBIT on source, CREDIT on destination). This mirrors real banking ledger practice and makes reconciliation straightforward.

**`@Transactional` on all multi-table financial writes** — A `RuntimeException` at any step triggers a full Spring rollback. This is the only safe pattern for operations that span multiple tables (e.g. deduct balance + log transaction + update funding pool).

**Stateless JWT sessions** — No `HttpSession`, no Redis. `SessionCreationPolicy.STATELESS` means every request is independently authenticated via the JWT. This makes horizontal scaling trivial.

**Roles as `VARCHAR[]` in PostgreSQL** — Storing roles as a native array column allows Spring Security to load all authorities in a single query without a separate roles table or join.
