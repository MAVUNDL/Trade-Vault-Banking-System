# Trade Vault — Frontend

> Investor-facing dashboard for the Trade Vault P2P supply chain finance platform. Built with **Next.js 16**, **React 19**, and **TypeScript**.

---

## Overview

The frontend is a single-page dashboard application serving Investec Private Banking clients. It provides four core views accessible via a persistent sidebar:

- **Accounts** — View all linked accounts, live balances, and full transaction history
- **Beneficiaries** — Manage saved payment recipients and execute EFT payments
- **Opportunities** — Browse corporate importers and their active shipments available for funding
- **My Portfolio** — Track active and historical shipment investments

Authentication is handled via JWT tokens with automatic silent refresh — the session persists until the refresh token expires (7 days).

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.1.6 | App framework, routing |
| React | 19.2.3 | UI rendering |
| TypeScript | 5.x | Type safety across API layer and components |
| Tailwind CSS | 4.x | Utility styling |
| IBM Plex Sans / Playfair Display | — | Typography (loaded via Google Fonts) |

---

## Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx              # Root layout
│       ├── page.tsx                # Root redirect → /login
│       ├── login/
│       │   └── page.tsx            # Login form
│       ├── register/
│       │   └── page.tsx            # Registration form
│       └── dashboard/
│           └── page.tsx            # Main authenticated shell (sidebar + tab routing)
├── components/
│   ├── AccountsTab.tsx             # Account list, balance details, transaction history
│   ├── BeneficiariesTab.tsx        # Beneficiary management + EFT payments
│   ├── CompaniesTab.tsx            # Company browser + shipment explorer + capital deployment
│   ├── InvestmentsTab.tsx          # Portfolio tracker (active investments per account)
│   └── Icons.tsx                   # SVG icon components
├── Api.ts                          # Typed API client + all TypeScript type definitions
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## API Client (`Api.ts`)

All backend communication flows through a single typed module. It handles:

- **Base URL** — Configured to `http://localhost:8080/api/v1` (update for production)
- **JWT injection** — `Authorization: Bearer <token>` added automatically to every request
- **Silent token refresh** — On a `401` response, the client attempts a token refresh using the stored refresh token. If successful, the original request is retried transparently. If refresh fails, the user is redirected to `/login`
- **403 handling** — Treated as a permission error, not a session expiry — throws an explicit "Access Denied" error rather than redirecting
- **Response unwrapping** — Spring Boot wraps single-key responses in `Map.of()`. The client automatically unwraps these so components receive clean data

### Token Storage
Tokens are stored in `localStorage` under:
- `vrd_accessToken` — Short-lived JWT (15 min)
- `vrd_refreshToken` — Long-lived refresh token (7 days)

On dashboard load, the access token is decoded client-side to extract the `profileId` (JWT `sub` claim), which is passed to components that require it.

### Available API Methods

```typescript
// Accounts
api.getAccounts()
api.getAccount(accountId)
api.getAccountInfo(accountId)
api.openAccount({ accountName, productName })

// Transactions
api.getTransactions(accountId)
api.updateBalance(accountId, amount)
api.addTransaction(transaction)
api.processTransfer({ sourceAccountId, destinationAccountId, amount, description })

// Beneficiaries
api.getBeneficiaries(profileId)
api.addBeneficiary(beneficiary)
api.payBeneficiary({ sourceAccountId, destinationAccountNumber, amount, description, beneficiaryId })
api.removeBeneficiary(beneficiaryId)

// Investments
api.getInvestments(accountId)
api.createInvestment(investment)

// Companies & Shipments
api.getCompanies()
api.getCompanyShipments(companyOwner)
api.getShipmentFundings(companyProfileId)
api.addFundingToShipment(companyProfileId, shipmentNumber, amount)

// Capital Deployment (Trade Vault Core)
api.deployCapital({ sourceAccountId, shipmentNumber, companyProfileId, amount })
```

### TypeScript Types

All domain types are defined in `Api.ts` and exported for use across components:

`Account` · `AccountInfo` · `Transaction` · `Beneficiary` · `Investment` · `Company` · `Shipment` · `ShipmentFunding` · `NavTab`

---

## Dashboard Layout

The dashboard uses a CSS Grid layout (`220px sidebar + 1fr main`). All styling is written as inline CSS-in-JS using a `<style>` tag in the dashboard shell — this avoids the need for separate CSS modules while maintaining a consistent design system via CSS custom properties.

### Design Tokens (CSS Variables)

```css
--navy: #0A1628          /* Page background */
--navy-mid: #0F1E38      /* Sidebar background */
--navy-card: #112240     /* Card/row backgrounds */
--gold: #B8902A          /* Primary accent */
--gold-light: #D4A843    /* Active states, headings */
--cream: #F5F0E8         /* Primary text */
--green: #1B6B3A         /* Credit amounts, KYC badges */
--red: #C0392B           /* Debit amounts, errors */
```

### Tab Routing

Tabs are managed with a single `activeTab` state variable (`useState<NavTab>`). No client-side router is used for tab switching — all four views are rendered conditionally within the same page.

```typescript
type NavTab = "accounts" | "beneficiaries" | "companies" | "trade-vault";
```

### Responsive Behaviour
- Below `900px`: sidebar is hidden, content padding reduces
- Account card headers reflow from 5-column to 2-column grid
- Balance detail metadata panel is hidden on mobile

---

## Authentication Flow

```
User visits /dashboard
    ↓
Check localStorage for vrd_accessToken
    ↓ (missing)            ↓ (present)
Redirect to /login    Decode JWT payload
                           ↓
                      Extract profileId (sub claim)
                           ↓
                      Render dashboard with profileId prop
```

On any API call returning `401`:
```
Request fails with 401
    ↓
Read vrd_refreshToken from localStorage
    ↓ (missing)              ↓ (present)
Clear tokens             POST /api/v1/auth/refresh
Redirect to /login           ↓
                         Store new access + refresh tokens
                             ↓
                         Retry original request
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Trade Vault backend running on `http://localhost:8080`

### Install & Run

```bash
cd frontend/frontend
npm install
npm run dev
```

The app starts on **http://localhost:3000**.

### Build for Production

```bash
npm run build
npm start
```

---

## Environment Configuration

The API base URL is currently hardcoded in `Api.ts`:

```typescript
const BASE_URL = "http://localhost:8080/api/v1";
```

For production, move this to a Next.js environment variable:

```typescript
// Api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
```

Then create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

---

## Key Design Decisions

**Single typed API module** — All backend calls are centralised in `Api.ts` with full TypeScript types. Components never call `fetch` directly. This means any API contract change only requires updating one file.

**Automatic token refresh** — The `apiFetch` wrapper handles `401` responses transparently. Components don't need to handle auth errors — they only handle data errors.

**`Map.of()` response unwrapper** — Spring Boot's `ResponseEntity.ok(Map.of("accounts", list))` pattern wraps data in a single-key object. The `apiFetch` wrapper detects this pattern and automatically returns the inner value, so components receive clean arrays/objects rather than `{ accounts: [...] }`.

**CSS custom properties for theming** — The entire colour system lives in `:root` CSS variables defined once in the dashboard shell. This makes global theme changes a single-line edit.

**profileId from JWT** — The dashboard decodes the access token client-side to extract `profileId` without an extra API call. This is safe because JWTs are signed — the payload can be read but not forged.
