const BASE_URL = "http://localhost:8080/api/v1";

// ── Utility Functions ────────────────────────────────────────────────────────

export function fmt(n: number, currency: string = "ZAR"): string {
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(n);
}

export function fmtDate(d: string | null | undefined): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ── Auth & API Core ─────────────────────────────────────────────────────────

function getToken(): string {
    return typeof window !== "undefined" ? (localStorage.getItem("vrd_accessToken") ?? "") : "";
}

function authHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
    if (isRefreshing && refreshPromise) return refreshPromise;

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const refreshToken = localStorage.getItem("vrd_refreshToken");
            if (!refreshToken) return false;

            const res = await fetch(`${BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken })
            });

            if (!res.ok) return false;

            const data = await res.json();
            const newAccess = data.accessToken || data.access_token || data.token;
            const newRefresh = data.refreshToken || data.refresh_token || refreshToken;

            if (newAccess) {
                localStorage.setItem("vrd_accessToken", newAccess);
                localStorage.setItem("vrd_refreshToken", newRefresh);
                return true;
            }
            return false;
        } catch (err) {
            return false;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const doFetch = () => fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            ...authHeaders(),
            ...(options.headers ?? {}),
        },
    });

    let res = await doFetch();

    // ONLY refresh the token if it's an actual 401 Unauthorized (Expired Token)
    if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            res = await doFetch();
        } else {
            if (typeof window !== "undefined") {
                localStorage.removeItem("vrd_accessToken");
                localStorage.removeItem("vrd_refreshToken");
                window.location.href = "/login";
            }
            throw new Error("Session expired. Please log in again.");
        }
    }

    // Treat 403 Forbidden as an Access Denied error, NOT a session expiration!
    if (res.status === 403) {
        throw new Error("Access Denied: You do not have permission to view this data.");
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    // Magic unwrapper for Spring Boot Map.of() responses
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        const keys = Object.keys(data).filter(k => !['message', 'status', 'error', 'timestamp'].includes(k));
        if (keys.length === 1) {
            return data[keys[0]] as T;
        }
    }

    return data as T;
}

// ── API Endpoints ───────────────────────────────────────────────────────────

export const api = {
    // Accounts
    getAccounts: () => apiFetch<Account[]>("/accounts"),
    getAccount: (accountId: string) => apiFetch<Account>(`/account/${accountId}`),
    getAccountInfo: (accountId: string) => apiFetch<AccountInfo>(`/account/${accountId}/information`),

    openAccount: (payload: { accountName: string, productName: string }) =>
        apiFetch<any>("/account/open-account", {
            method: "POST",
            body: JSON.stringify(payload)
        }),

    // Transactions & Balances
    getTransactions: (accountId: string) => apiFetch<Transaction[]>(`/account/${accountId}/transactions`),
    updateBalance: (accountId: string, amount: number) =>
        apiFetch<any>(`/account/${accountId}/update-balance`, {
            method: "POST",
            body: JSON.stringify(amount) // Sending raw BigDecimal representation
        }),
    addTransaction: (transaction: Partial<Transaction>) =>
        apiFetch<any>("/account/new-transaction", {
            method: "POST",
            body: JSON.stringify(transaction)
        }),
    processTransfer: (payload: any) =>
        apiFetch<any>("/account/transfer", {
            method: "POST",
            body: JSON.stringify(payload)
        }),

    // Beneficiaries
    getBeneficiaries: (profileId: string) => apiFetch<Beneficiary[]>(`/account/profile/${profileId}/beneficiaries`),
    addBeneficiary: (beneficiary: Partial<Beneficiary>) =>
        apiFetch<any>("/account/profile/beneficiary", {
            method: "POST",
            body: JSON.stringify(beneficiary)
        }),

    payBeneficiary: (payload: { sourceAccountId: string, destinationAccountNumber: string, amount: number, description: string, beneficiaryId: string }) =>
        apiFetch<any>("/account/pay-beneficiary", {
            method: "POST",
            body: JSON.stringify(payload)
        }),

    removeBeneficiary: (beneficiaryId: string) =>
        apiFetch<any>(`/account/profile/${beneficiaryId}/delete-beneficiary`, {
            method: "DELETE"
        }),

    // Investments
    getInvestments: (accountId: string) => apiFetch<Investment[]>(`/account/${accountId}/investments`),
    createInvestment: (investment: Partial<Investment>) =>
        apiFetch<any>("/account/create-investment", {
            method: "POST",
            body: JSON.stringify(investment)
        }),

    // Companies & Shipments
    getCompanies: () => apiFetch<Company[]>("/companies"),
    getCompanyShipments: (companyOwner: string) =>
        apiFetch<Shipment[]>(`/companies/company/${companyOwner}/shipments`),
    getShipmentFundings: (companyProfileId: string) =>
        apiFetch<ShipmentFunding[]>(`/companies/company/${companyProfileId}/shipments/funding`),
    addFundingToShipment: (companyProfileId: string, shipmentNumber: string, amount: number) =>
        apiFetch<any>(`/companies/company/${companyProfileId}/shipments/${shipmentNumber}/add-funding`, {
            method: "POST",
            body: JSON.stringify(amount)
        }),

    // investments
    deployCapital: (payload: { sourceAccountId: string, shipmentNumber: string, companyProfileId: string, amount: number }) =>
        apiFetch<any>("/investments/deploy", {
            method: "POST",
            body: JSON.stringify(payload)
        }),
};

// ── Types ──────────────────────────────────────────────────────────────────

export type NavTab = "accounts" | "beneficiaries" | "companies" | "trade-vault";

export interface Account {
    id: number;
    account_id: string;
    account_number: string;
    account_name: string;
    reference_name: string;
    product_name: string;
    kyc_compliant: boolean;
    profile_id: string;
    created_at: string;
}

export interface AccountInfo {
    id: number;
    account_id: string;
    current_balance: number;
    available_balance: number;
    currency: string;
    last_updated_at: string;
}

export interface Transaction {
    id: number;
    account_id: string;
    type: string;
    transaction_type: string;
    status: string;
    description: string;
    card_number: string;
    posting_date: string;
    value_date: string;
    action_date: string;
    transaction_date: string;
    amount: number;
    running_balance: number;
    uuid: string;
}

export interface Beneficiary {
    id?: number;
    beneficiary_id: string;
    account_number: string;
    code: string;
    bank: string;
    beneficiary_name: string;
    last_payment_amount: number;
    last_payment_date: string;
    cell_no: string;
    email_address: string;
    name: string;
    reference_account_number: string;
    reference_name: string;
    category_id: string;
    profile_id: string;
    faster_payment_allowed: boolean;
    created_at: string;
}

// FIX: Mapped to match backend DB 'shipment_investments'
export interface Investment {
    id?: number;
    shipment_number: string;
    investor_profile_id: string;
    investor_account_id: string;
    amount: number;
    status: string;
    created_at: string;
}

export interface Company {
    id?: number;
    company_profile_id: string;
    company_name: string;
    company_owner: string;
    registration_number: string;
    tax_number: string;
    email_address: string;
    phone_number: string;
    created_at: string;
}

// FIX: Mapped to match backend DB 'shipment_funding'
export interface ShipmentFunding {
    id?: number;
    shipment_number: string;
    company_profile_id: string;
    funding_required: number;
    funding_raised: number;
    funding_status: string;
    created_at: string;
    updated_at: string;
}

export interface Shipment {
    id?: number;
    shipment_number: string;
    indent_number: string;
    ifb_reference: string;
    customer_name: string;
    buyer_full_name: string;
    supplier_name: string;
    port_of_load: string;
    port_of_discharge: string;
    ship_on_board: string;
    eta: string;
    delivery_date: string;
    currency_code: string;
    order_value: number;
    shipped_value: number;
    paid_amount: number;
    incoterm: string;
    status: string;
    movement_type: string;
    shipment_mode: string;
    mv_start_date: string;
    mv_end_date: string;
    vessel_name: string;
    container_number: string;
    container_count: number;
    container_type: string;
    load_type: string;
    pallets: number;
    cartons: number;
    delivery_contact: string;
    delivery_month: string;
    delivery_year: string;
    delivery_address: string;
    unit_price: number;
    item_reference: string;
    quantity: number;
    description: string;
    estimated_landed_cost: number;
    created_at: string;
}