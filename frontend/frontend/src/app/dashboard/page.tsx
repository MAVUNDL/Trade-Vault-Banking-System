"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Adjust these imports based on where you placed the files
import { type NavTab } from "../../../Api";
import {
    IconAccounts,
    IconBeneficiaries,
    IconTradeVault,
    IconLogout
} from "../../../components/Icons";

import AccountsTab from "../../../components/AccountsTab";
import BeneficiariesTab from "../../../components/BeneficiariesTab";
import InvestmentsTab from "../../../components/InvestmentsTab";
import CompaniesTab from "../../../components/CompaniesTab"; // <-- Added this import

// Inline Icon for Companies/Opportunities
const IconCompanies = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <path d="M9 22v-4h6v4"></path>
        <path d="M8 6h.01"></path>
        <path d="M16 6h.01"></path>
        <path d="M12 6h.01"></path>
        <path d="M12 10h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M16 10h.01"></path>
        <path d="M16 14h.01"></path>
        <path d="M8 10h.01"></path>
        <path d="M8 14h.01"></path>
    </svg>
);

export default function Dashboard() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<NavTab>("accounts");
    const [profileId, setProfileId] = useState<string>("");

    useEffect(() => {
        const currentToken = typeof window !== "undefined" ? localStorage.getItem("vrd_accessToken") : null;

        if (!currentToken) {
            router.push("/login");
            return;
        }

        try {
            const payload = JSON.parse(atob(currentToken.split(".")[1]));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProfileId(payload.sub ?? payload.profileId ?? "");
        } catch {
            /* ignore invalid token payload */
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("vrd_accessToken");
        localStorage.removeItem("vrd_refreshToken");
        router.push("/login");
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
                
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                
                :root {
                  --navy: #0A1628; --navy-mid: #0F1E38; --navy-card: #112240; --navy-raised: #162B4A;
                  --gold: #B8902A; --gold-light: #D4A843; --gold-pale: rgba(184,144,42,0.10); --gold-faint: rgba(184,144,42,0.05);
                  --cream: #F5F0E8; --cream-60: rgba(245,240,232,0.60); --cream-30: rgba(245,240,232,0.30);
                  --cream-15: rgba(245,240,232,0.15); --cream-08: rgba(245,240,232,0.08); --cream-05: rgba(245,240,232,0.05);
                  --border-gold: rgba(184,144,42,0.20); --border-sub: rgba(245,240,232,0.07);
                  --green: #1B6B3A; --green-bg: rgba(27,107,58,0.12);
                  --red: #C0392B; --red-bg: rgba(192,57,43,0.10);
                }
                
                body { background: var(--navy); font-family: 'IBM Plex Sans', sans-serif; color: var(--cream); min-height: 100vh; }
                .shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
                
                /* ── SIDEBAR ── */
                .sidebar { background: var(--navy-mid); border-right: 1px solid var(--border-sub); display: flex; flex-direction: column; padding: 0; position: sticky; top: 0; height: 100vh; overflow: hidden; }
                .sidebar-brand { padding: 28px 24px 24px; border-bottom: 1px solid var(--border-sub); display: flex; align-items: center; gap: 12px; }
                .brand-name { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cream); }
                .brand-est { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--gold); letter-spacing: 0.1em; margin-top: 1px; }
                .sidebar-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; }
                .nav-section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(245,240,232,0.2); padding: 0 12px; margin-bottom: 8px; margin-top: 8px; }
                .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 400; color: var(--cream-30); border: 1px solid transparent; transition: all 0.15s ease; background: none; width: 100%; text-align: left; letter-spacing: 0.01em; }
                .nav-item:hover { color: var(--cream-60); background: var(--cream-05); }
                .nav-item.active { color: var(--gold-light); background: var(--gold-faint); border-color: var(--border-gold); }
                .nav-item.active svg { stroke: var(--gold-light); }
                .nav-item-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); margin-left: auto; opacity: 0; }
                .nav-item.active .nav-item-dot { opacity: 1; }
                
                .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border-sub); }
                .profile-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 4px; }
                .profile-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--gold-pale); border: 1px solid var(--border-gold); display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--gold); letter-spacing: 0.04em; flex-shrink: 0; }
                .profile-id { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--cream-30); letter-spacing: 0.04em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; width: 100%; background: none; border: none; cursor: pointer; color: var(--cream-30); font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; border-radius: 4px; transition: all 0.15s; text-align: left; }
                .logout-btn:hover { color: var(--red); background: var(--red-bg); }
                
                /* ── MAIN ── */
                .main { display: flex; flex-direction: column; min-height: 100vh; background: var(--navy); }
                .topbar { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid var(--border-sub); position: sticky; top: 0; background: var(--navy); z-index: 10; }
                .topbar-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 400; color: var(--cream); letter-spacing: -0.2px; }
                .topbar-title em { font-style: italic; color: var(--gold-light); }
                .topbar-right { display: flex; align-items: center; gap: 20px; }
                .topbar-date { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--cream-30); letter-spacing: 0.04em; }
                .content { padding: 36px 40px; flex: 1; }
                
                /* Shared Layout Styles */
                .section-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; display: flex; align-items: center; gap: 14px; }
                .section-eyebrow::after { content: ''; flex: 1; height: 1px; background: var(--border-gold); }
                .err-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--red-bg); border: 1px solid rgba(192,57,43,0.25); border-left: 2px solid var(--red); margin-bottom: 24px; font-size: 12px; color: var(--cream-60); }
                .accounts-grid { display: flex; flex-direction: column; gap: 0; }
                .account-card { border: 1px solid var(--border-sub); border-bottom: none; background: var(--navy-card); cursor: pointer; transition: background 0.2s ease; overflow: hidden; }
                .account-card:first-child { border-radius: 4px 4px 0 0; }
                .account-card:last-child { border-bottom: 1px solid var(--border-sub); border-radius: 0 0 4px 4px; }
                .account-card:only-child { border-radius: 4px; border-bottom: 1px solid var(--border-sub); }
                .account-card.expanded { border-color: var(--border-gold); border-bottom: 1px solid var(--border-gold) !important; margin-bottom: 1px; }
                .account-card:hover .account-card-header { background: var(--navy-raised); }
                .account-card.expanded .account-card-header { background: var(--navy-raised); }
                .account-card-header { display: grid; grid-template-columns: 1fr 1fr 1fr auto auto; align-items: center; padding: 20px 24px; gap: 16px; transition: background 0.15s; }
                .beneficiary-card-header { grid-template-columns: 1fr 1.5fr 1fr 1fr; cursor: default !important; }
                .beneficiary-card-header:hover { background: var(--navy-card) !important; }
                .acc-field-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--cream-30); margin-bottom: 5px; }
                .acc-field-value { font-size: 13px; font-weight: 500; color: var(--cream); letter-spacing: 0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px; }
                .acc-field-value.mono { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.06em; }
                .kyc-badge { display: inline-flex; align-items: center; gap: 5px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 2px; white-space: nowrap; }
                .kyc-badge.compliant { color: var(--green); background: var(--green-bg); border: 1px solid rgba(27,107,58,0.3); }
                .kyc-badge.non-compliant { color: var(--red); background: var(--red-bg); border: 1px solid rgba(192,57,43,0.3); }
                .fast-pay-badge { display: inline-flex; align-items: center; gap: 4px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.06em; padding: 2px 6px; border-radius: 2px; color: var(--gold-light); background: var(--gold-faint); border: 1px solid var(--border-gold); text-transform: uppercase; }
                .chevron-col { display: flex; align-items: center; justify-content: center; color: var(--cream-30); width: 32px; }
                
                .detail-panel { background: var(--navy-mid); border: 1px solid var(--border-gold); border-top: none; padding: 0; overflow: hidden; animation: slideDown 0.25s ease; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                .detail-top { position: relative; padding: 28px 32px; border-bottom: 1px solid var(--border-sub); overflow: hidden; }
                .detail-top::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), var(--gold-light), var(--gold), transparent); }
                .balance-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 32px; align-items: start; }
                .balance-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--cream-30); margin-bottom: 8px; }
                .balance-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 400; color: var(--cream); letter-spacing: -0.5px; line-height: 1; }
                .balance-currency { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--gold); letter-spacing: 0.1em; margin-top: 6px; }
                .detail-meta { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
                .meta-row { text-align: right; }
                .meta-key { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--cream-30); margin-bottom: 3px; }
                .meta-val { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--cream-60); letter-spacing: 0.04em; }
                
                .txn-section { padding: 0 32px 28px; }
                .txn-header { padding: 20px 0 14px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); display: flex; align-items: center; gap: 12px; }
                .txn-header::after { content: ''; flex: 1; height: 1px; background: var(--border-sub); }
                .txn-count { font-size: 10px; color: var(--cream-30); font-weight: 400; letter-spacing: 0.04em; }
                .txn-table { width: 100%; border-collapse: collapse; }
                .txn-table th { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--cream-30); text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border-sub); font-weight: 400; }
                .txn-table th:last-child, .txn-table td:last-child { text-align: right; }
                .txn-table td { font-size: 12px; color: var(--cream-60); padding: 13px 12px; border-bottom: 1px solid var(--border-sub); vertical-align: middle; }
                .txn-table tr:last-child td { border-bottom: none; }
                .txn-table tr:hover td { background: var(--cream-05); }
                .txn-desc { color: var(--cream); font-weight: 400; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .txn-status { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px; white-space: nowrap; }
                .txn-status.posted, .txn-status.completed { color: var(--green); background: var(--green-bg); }
                .txn-status.pending { color: #E67E22; background: rgba(230,126,34,0.1); }
                .txn-status.failed, .txn-status.reversed { color: var(--red); background: var(--red-bg); }
                .txn-status.default { color: var(--cream-30); background: var(--cream-05); }
                .txn-amount { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 500; white-space: nowrap; }
                .txn-amount.credit { color: var(--green); }
                .txn-amount.debit { color: var(--red); }
                .txn-type-badge { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.06em; color: var(--cream-30); text-transform: uppercase; }
                
                .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 12px 0; border-top: 1px solid var(--border-sub); margin-top: 12px; }
                .pagination-info { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--cream-30); letter-spacing: 0.04em; }
                .pagination-controls { display: flex; gap: 8px; }
                .page-btn { background: var(--navy-raised); border: 1px solid var(--border-sub); color: var(--cream-60); padding: 6px 12px; border-radius: 2px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; cursor: pointer; transition: all 0.15s; }
                .page-btn:hover:not(:disabled) { background: var(--cream-05); color: var(--cream); border-color: var(--border-gold); }
                .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: transparent; }
                
                .skeleton-row { display: grid; grid-template-columns: 1fr 1fr 1fr auto auto; gap: 16px; padding: 20px 24px; border: 1px solid var(--border-sub); border-bottom: none; background: var(--navy-card); }
                .skeleton-row:first-child { border-radius: 4px 4px 0 0; }
                .skeleton-row:last-child { border-bottom: 1px solid var(--border-sub); border-radius: 0 0 4px 4px; }
                .skel { height: 12px; border-radius: 2px; background: linear-gradient(90deg, var(--cream-05) 0%, var(--cream-08) 50%, var(--cream-05) 100%); background-size: 200% 100%; animation: shimmer 1.4s ease infinite; }
                .skel-sm { width: 60%; } .skel-xs { width: 40%; margin-top: 6px; }
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                
                .detail-loading { display: flex; align-items: center; justify-content: center; padding: 48px; gap: 12px; color: var(--cream-30); font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.1em; }
                .detail-spinner { width: 16px; height: 16px; border: 1.5px solid var(--border-gold); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.7s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                .empty-state { text-align: center; padding: 60px 40px; color: var(--cream-30); font-size: 13px; font-weight: 300; }
                .empty-icon { margin: 0 auto 16px; width: 40px; height: 40px; border: 1px solid var(--border-sub); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--cream-15); }
                
                .coming-soon-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 12px; padding: 120px 40px; text-align: center; }
                .cs-icon { width: 48px; height: 48px; border: 1px solid var(--border-gold); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
                .cs-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 400; color: var(--cream); margin-bottom: 8px; }
                .cs-sub { font-size: 13px; font-weight: 300; color: var(--cream-30); max-width: 320px; line-height: 1.7; }
                
                @media (max-width: 900px) { 
                  .shell { grid-template-columns: 1fr; } 
                  .sidebar { display: none; } 
                  .account-card-header { grid-template-columns: 1fr 1fr auto auto; } 
                  .beneficiary-card-header { grid-template-columns: 1fr 1fr; } 
                  .balance-grid { grid-template-columns: 1fr 1fr; } 
                  .detail-meta { display: none; } 
                  .content { padding: 24px 20px; } 
                  .topbar { padding: 16px 20px; } 
                }
            `}</style>

            <div className="shell">
                {/* ── SIDEBAR ── */}
                <aside className="sidebar">
                    <div className="sidebar-brand">
                        <svg width="28" height="28" viewBox="0 0 38 38" fill="none">
                            <rect x="0.5" y="0.5" width="37" height="37" stroke="#B8902A" strokeOpacity="0.35" />
                            <path d="M19 5L33 13V25L19 33L5 25V13L19 5Z" stroke="#B8902A" strokeWidth="1" fill="none" />
                            <path d="M19 11L27 16V22L19 27L11 22V16L19 27L11 22V16L19 11Z" fill="rgba(184,144,42,0.10)" stroke="#B8902A" strokeWidth="0.75" />
                            <circle cx="19" cy="19" r="2.5" fill="#B8902A" />
                        </svg>
                        <div>
                            <div className="brand-name">Veridian</div>
                            <div className="brand-est">Est. 1891</div>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <div className="nav-section-label">Banking</div>

                        <button
                            className={`nav-item${activeTab === "accounts" ? " active" : ""}`}
                            onClick={() => setActiveTab("accounts")}
                        >
                            <IconAccounts /> Accounts <span className="nav-item-dot" />
                        </button>

                        <button
                            className={`nav-item${activeTab === "beneficiaries" ? " active" : ""}`}
                            onClick={() => setActiveTab("beneficiaries")}
                        >
                            <IconBeneficiaries /> Beneficiaries <span className="nav-item-dot" />
                        </button>

                        <div className="nav-section-label">Investments</div>

                        {/* NEW COMPANIES TAB */}
                        <button
                            className={`nav-item${activeTab === "companies" ? " active" : ""}`}
                            onClick={() => setActiveTab("companies")}
                        >
                            <IconCompanies /> Opportunities <span className="nav-item-dot" />
                        </button>

                        <button
                            className={`nav-item${activeTab === "trade-vault" ? " active" : ""}`}
                            onClick={() => setActiveTab("trade-vault")}
                        >
                            <IconTradeVault /> My Portfolio <span className="nav-item-dot" />
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <div className="profile-row">
                            <div className="profile-avatar">
                                {profileId ? profileId.replace("VRD-", "").slice(0, 2) : "VR"}
                            </div>
                            <span className="profile-id">{profileId || "—"}</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            <IconLogout /> Sign out
                        </button>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <main className="main">
                    <div className="topbar">
                        <h1 className="topbar-title">
                            {activeTab === "accounts" && <>Your <em>accounts</em></>}
                            {activeTab === "beneficiaries" && <>Your <em>beneficiaries</em></>}
                            {activeTab === "companies" && <>Market <em>opportunities</em></>}
                            {activeTab === "trade-vault" && <><em>Trade</em> vault</>}
                        </h1>
                        <div className="topbar-right">
                            <span className="topbar-date">
                                {new Date().toLocaleDateString("en-ZA", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                        </div>
                    </div>

                    <div className="content">
                        {/* Tab Content Routing */}
                        {activeTab === "accounts" && <AccountsTab />}

                        {activeTab === "beneficiaries" && <BeneficiariesTab profileId={profileId} />}

                        {activeTab === "companies" && <CompaniesTab profileId={profileId} />}

                        {activeTab === "trade-vault" && <InvestmentsTab profileId={profileId} />}
                    </div>
                </main>
            </div>
        </>
    );
}