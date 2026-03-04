# Trade Vault — P2P Supply Chain Finance Platform

<p align="center">
  <img src="https://github.com/user-attachments/assets/cf571823-fb9c-4e8d-bba8-813a127aa5ec" width="95%" alt="Trade Vault Landing Page"/>
</p>

<p align="center">
  <strong>Turn live shipment data into investable collateral.</strong><br/>
  Connecting private capital with corporate importers through a real-time shadow ledger architecture.
</p>

---

## 🔐 Authentication Flow

<p align="center">
  <img src="https://github.com/user-attachments/assets/142bfb0d-720d-40c2-a9fb-a5b846207aff" width="48%" alt="Sign Up"/>
  <img src="https://github.com/user-attachments/assets/85a95425-5989-43d9-a73d-5a718118e1cc" width="48%" alt="Sign In"/>
</p>

<p align="center">
  Secure JWT-based registration and login with role-based access control.
</p>

---

> A peer-to-peer supply chain financing platform that turns live shipment data into investable collateral — connecting Investec Private Banking clients with corporate importers via a real-time shadow ledger architecture.

Built on **Java 25 + Spring Boot 4**, **Next.js**, and **PostgreSQL**, Trade Vault bridges the gap between idle private capital and working capital-hungry supply chains.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Security Model](#security-model)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Design Decisions](#key-design-decisions)

---

## Overview

Trade Vault is a fintech platform with two distinct user personas:

- **Investors (Private Banking clients)** — Browse corporate importers, view their active shipments, and deploy capital directly into specific shipment funding pools. Investments are tracked in real-time against their account balances.
- **Administrators** — Manage the full supply chain dataset: companies, shipments, shipment funding records, and company financials. Act as the back-office layer between the core banking system and the investor-facing portal.

The platform implements an **"Ingest & Extend"** shadow ledger pattern — it ingests live financial and shipment data from upstream systems (Investec PB and CIB APIs) and extends it with investment and funding logic without modifying the source of record.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│  Dashboard · Accounts · Beneficiaries · Trade Vault     │
└────────────────────────┬────────────────────────────────┘
                         │ REST (JWT Bearer)
┌────────────────────────▼────────────────────────────────┐
│              Spring Boot Resource Server                │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Auth Layer  │  │  Client API  │  │   Pipeline   │  │
│  │  (JWT/RBAC)  │  │  Controller  │  │  (Ingest &   │  │
│  └──────────────┘  └──────────────┘  │   Extend)    │  │
│                                      └──────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │               Service Layer                       │  │
│  │  Account · Transaction · Investment · Shipment    │  │
│  │  Beneficiary · Company · ShipmentFunding          │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ Spring Data JDBC + Flyway
┌────────────────────────▼────────────────────────────────┐
│                     PostgreSQL                          │
│   Shadow Ledger · Investments · Companies · Shipments   │
└─────────────────────────────────────────────────────────┘
```

### Shadow Ledger Design

The pipeline package contains two sets of classes for each domain object:

- **`pipeline/models/`** — Immutable Java records mirroring the upstream API response shape (e.g. Investec PB/CIB APIs). These are the DTOs used during ingestion.
- **`pipeline/entities/`** — JPA-style entities representing the local shadow ledger tables. Extended with Trade Vault-specific fields (e.g. funding status, investment linkage).

This decoupling means upstream API changes only affect the pipeline layer, not the core business logic.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 25, Spring Boot 4.0.2 |
| Web Framework | Spring MVC (WebMVC) |
| Security | Spring Security, JWT (jjwt 0.12.6), RBAC |
| Data Access | Spring Data JDBC, Spring Batch |
| Database | PostgreSQL 16 |
| Migrations | Flyway |
| Frontend | Next.js (TypeScript), Tailwind CSS |
| Containerization | Docker Compose |
| Build Tool | Maven |
| Dev Tools | Lombok, Spring DevTools |

---

## Project Structure

```
investec-trade-vault/
├── resource-server/                  # Spring Boot backend
│   ├── src/main/java/backend/resourceserver/
│   │   ├── api/
│   │   │   ├── controller/
│   │   │   │   ├── AuthenticationController.java   # /api/auth/** (public)
│   │   │   │   └── ClientAPIController.java        # /api/v1/** (secured)
│   │   │   ├── Dto/                                # Login/Register request/response
│   │   │   ├── entity/                             # Domain entities (shadow ledger)
│   │   │   ├── repository/                         # Spring Data JDBC repos
│   │   │   ├── service/                            # Business logic layer
│   │   │   └── exception/                          # Global exception handling
│   │   ├── pipeline/
│   │   │   ├── models/                             # Upstream API DTOs (records)
│   │   │   └── entities/                           # Local shadow ledger entities
│   │   └── security/
│   │       ├── config/                             # SecurityFilterChain, CORS
│   │       ├── jwt/                                # JwtService, JwtFilter
│   │       └── provider/                           # AuthProvider
│   └── src/main/resources/
│       ├── application.yaml
│       └── db/migration/                           # Flyway versioned migrations V1–V8
└── frontend/frontend/
    ├── src/app/
    │   ├── dashboard/page.tsx                      # Main authenticated view
    │   ├── login/page.tsx
    │   └── register/page.tsx
    ├── components/
    │   ├── AccountsTab.tsx
    │   ├── BeneficiariesTab.tsx
    │   ├── CompaniesTab.tsx
    │   └── InvestmentsTab.tsx
    └── Api.ts                                      # Typed API client + all TypeScript types
```

---

## Database Schema

Migrations are managed by Flyway (`V1__setup.sql` through `V8__setup.sql`).

### Core Banking (Shadow Ledger)

```sql
account              -- Shadow account records (synced from Investec PB)
account_information  -- Live balances: current_balance, available_balance (ZAR, NUMERIC 19,4)
transactions         -- Full transaction ledger: DEBIT/CREDIT, EFT, INTER-ACCOUNT TRANSFER, INVESTMENT FUNDING
beneficiary          -- Saved payment recipients per profile
```

### Authentication

```sql
identities  -- Login credentials (hashed passwords, UUID primary key)
users       -- Profile data, authorities array (e.g. ['USER'] or ['ADMIN'])
```

### Trade Vault (P2P Finance)

```sql
companies          -- Registered corporate importers (CIB clients)
company_financials -- Corporate balance sheet (current/available balance)
shipments          -- Full shipment lifecycle: ports, vessels, containers, ETAs, incoterms, values
investments        -- Investor → shipment linkage (amount, status: PENDING/CONFIRMED/REJECTED/PAID_OUT)
shipment_funding   -- Funding pool per shipment (funding_required, funding_raised, status: OPEN/FUNDED/CLOSED)
```

### Precision
All financial values use `NUMERIC(19,4)` to avoid floating-point rounding errors — critical for monetary amounts.

---

## API Reference

All endpoints under `/api/v1/**` require a valid JWT Bearer token.

### Authentication (`/api/auth` — Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user with profileId, fullName, password |
| POST | `/api/auth/login` | Authenticate and receive access + refresh tokens |

### Accounts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/accounts` | USER, ADMIN | List all accounts for authenticated profile |
| GET | `/api/v1/account/{accountId}` | USER, ADMIN | Get specific account details |
| POST | `/api/v1/account/open-account` | USER, ADMIN | Open new account (creates ledger entry at 0.00 ZAR) |
| DELETE | `/api/v1/accounts/delete-account/{accountId}` | **ADMIN only** | Delete account |
| GET | `/api/v1/account/{accountId}/information` | USER, ADMIN | Get live balance |
| POST | `/api/v1/account/{accountId}/update-balance` | USER, ADMIN | Adjust balance |

### Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/account/{accountId}/transactions` | USER, ADMIN | Full transaction history |
| POST | `/api/v1/account/transfer` | USER, ADMIN | Atomic inter-account transfer (double-entry, `@Transactional`) |
| POST | `/api/v1/account/pay-beneficiary` | USER, ADMIN | EFT payment to beneficiary |

### Beneficiaries

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/account/profile/{profileId}/beneficiaries` | USER, ADMIN | List beneficiaries (profile-guarded) |
| POST | `/api/v1/account/profile/beneficiary` | USER, ADMIN | Add beneficiary |
| DELETE | `/api/v1/account/profile/{beneficiaryId}/delete-beneficiary` | USER, ADMIN | Remove beneficiary |

### Companies & Shipments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/companies` | USER, ADMIN | List all registered companies |
| GET | `/api/v1/companies/{companyProfileId}` | USER, ADMIN | Get company by profile ID |
| POST | `/api/v1/companies/create-new-company` | **ADMIN only** | Register new company |
| GET | `/api/v1/companies/company/{companyOwner}/shipments` | USER, ADMIN | Get all shipments for a company |
| POST | `/api/v1/companies/company/shipments/shipment/new-shipment` | **ADMIN only** | Add new shipment |

### Investments (Trade Vault Core)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/account/{accountId}/investments` | USER, ADMIN | List investments for account |
| POST | `/api/v1/investments/deploy` | **USER only** | Deploy capital to shipment (atomic: deduct balance → record transaction → update funding pool → create investment record) |

### Shipment Funding (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/companies/company/{companyId}/shipments/funding` | ADMIN | All funding records for company |
| POST | `/api/v1/companies/company/shipments/record-new-funding` | ADMIN | Create shipment funding pool |
| POST | `/api/v1/companies/company/{companyId}/shipments/{shipmentId}/add-funding` | ADMIN | Increment funding raised |

---

## Security Model

### JWT Authentication
- **Access Token** — 15 minute expiry, signed with HMAC-SHA, carries `profileId` and `roles` claims
- **Refresh Token** — 7 day expiry, used by the frontend to silently re-authenticate
- Secret key loaded from environment variable `JWT_SECRET_KEY` at runtime — never hardcoded

### Role-Based Access Control (RBAC)
Method-level security via `@PreAuthorize`:
- `ROLE_USER` — Standard investor: can view accounts, deploy capital, manage beneficiaries
- `ROLE_ADMIN` — Back-office: full CRUD on companies, shipments, funding pools, and account deletion

### Financial Safety — `@Transactional` Guarantees
Critical financial operations use Spring's `@Transactional` to ensure atomicity:

- **Inter-account transfer** — Debit source + credit destination + log both transaction records. Any failure rolls back the entire operation, preventing partial ledger states.
- **Capital deployment** — Deduct investor balance → log DEBIT transaction → update shipment funding pool → record investment. If the funding pool rejects the amount (e.g. shipment already fully funded), a `RuntimeException` is thrown to trigger a full rollback and refund the balance.
- **Beneficiary payment** — Debit sender + credit receiver + log both sides.

### CORS
Configured for `http://localhost:3000` during development. Update `SecurityConfig.corsConfigurationSource()` for production deployment.

---

## Getting Started

### Prerequisites
- Java 25+
- Maven 3.9+
- Docker & Docker Compose
- Node.js 20+ / npm

### 1. Start the Database

```bash
cd resource-server
docker-compose up -d
```

This starts a PostgreSQL 16 instance on port `5433` with database `trade_vault`.

### 2. Configure Environment Variables

Create a `.env` file or set the following in your IDE run configuration (see [Environment Variables](#environment-variables)).

### 3. Run the Backend

```bash
cd resource-server
./mvnw spring-boot:run
```

Flyway will automatically run all migrations (`V1__setup.sql` through `V8__setup.sql`) on startup, including seed data for companies and shipments.

The server starts on **port 8080**.

### 4. Run the Frontend

```bash
cd frontend/frontend
npm install
npm run dev
```

The Next.js app starts on **http://localhost:3000**.

### 5. Register & Login

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"profileId": "U-001", "fullName": "John Doe", "password": "securepassword"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"profileId": "U-001", "password": "securepassword"}'
```

The login response returns `accessToken` and `refreshToken`. Pass the access token as `Authorization: Bearer <token>` on all subsequent requests.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5433/trade_vault` |
| `DATABASE_USERNAME` | DB username | `sgaxamabhande` |
| `DATABASE_PASSWORD` | DB password | `your_password` |
| `JWT_SECRET_KEY` | HMAC secret for JWT signing (min 32 chars) | `your-256-bit-secret-key-here` |

---

## Key Design Decisions

**Double-Entry Ledger Pattern** — Every money movement creates two transaction records (DEBIT + CREDIT). This mirrors how real banking ledgers work and makes balance reconciliation auditable.

**`@Transactional` on all financial mutations** — Financial operations are all-or-nothing. A failure at any step (e.g. insufficient funds, full funding pool) throws a `RuntimeException` to trigger a Spring rollback, preventing partial state.

**`NUMERIC(19,4)` for all money** — Avoids floating-point precision errors for monetary values. The same precision standard used in accounting systems.

**Shadow Ledger separation** — The `pipeline` package keeps upstream API models separate from the internal domain entities. The application can evolve its internal data model independently of the upstream Investec API contract.

**Profile-guarded endpoints** — Beneficiary and account endpoints verify that the authenticated user's `profileId` matches the requested resource, preventing horizontal privilege escalation between accounts.

**Stateless JWT sessions** — No server-side session storage (`SessionCreationPolicy.STATELESS`). The entire authentication state lives in the JWT. The frontend handles token refresh transparently via the `apiFetch` wrapper in `Api.ts`.

