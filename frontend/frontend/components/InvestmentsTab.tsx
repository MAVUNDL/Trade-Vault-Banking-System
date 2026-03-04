"use client";

import { useState, useEffect, useCallback } from "react";
import {
    api,
    fmt,
    fmtDate,
    type Investment,
    type Account
} from "../Api";
import { IconTradeVault } from "./Icons";

interface InvestmentsTabProps {
    profileId: string;
}

export default function InvestmentsTab({ profileId }: InvestmentsTabProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // 1. Load Accounts First
    useEffect(() => {
        api.getAccounts()
            .then((res) => {
                const accs = Array.isArray(res) ? res : [];
                setAccounts(accs);
                if (accs.length > 0) {
                    setSelectedAccountId(accs[0].account_id); // Auto-select first account
                } else {
                    setLoading(false);
                }
            })
            .catch(() => {
                setError("Failed to load accounts.");
                setLoading(false);
            });
    }, []);

    // 2. Load Investments when selected account changes
    const loadInvestments = useCallback(() => {
        if (!selectedAccountId) return;
        setLoading(true);
        setError("");

        api.getInvestments(selectedAccountId)
            .then((res) => setInvestments(Array.isArray(res) ? res : []))
            .catch((err) => {
                console.error("Investments fetch error:", err);
                setError("Failed to load investments.");
            })
            .finally(() => setLoading(false));
    }, [selectedAccountId]);

    useEffect(() => {
        loadInvestments();
    }, [loadInvestments]);

    // ── PORTFOLIO CALCULATIONS ──
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const activeDeals = investments.filter(inv => inv.status?.toUpperCase() !== 'REPAID' && inv.status?.toUpperCase() !== 'DEFAULTED').length;
    const largestExposure = investments.length > 0 ? Math.max(...investments.map(inv => inv.amount || 0)) : 0;

    return (
        <>
            <style>{`
                .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .account-selector { background: var(--navy-card); border: 1px solid var(--border-gold); color: var(--gold-light); padding: 8px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; border-radius: 4px; outline: none; cursor: pointer; transition: 0.2s; }
                .account-selector:hover { background: rgba(184, 144, 42, 0.05); }
                
                /* Portfolio Stats Cards */
                .portfolio-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px; }
                .stat-card { background: linear-gradient(145deg, var(--navy-card), var(--navy-mid)); border: 1px solid var(--border-sub); padding: 24px; border-radius: 4px; transition: 0.2s; border-top: 2px solid transparent; }
                .stat-card:hover { border-top-color: var(--border-gold); transform: translateY(-2px); }
                .stat-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--cream-60); margin-bottom: 12px; }
                .stat-value { font-family: 'Playfair Display', serif; font-size: 28px; color: var(--cream); }
                .stat-value.highlight { color: var(--gold-light); }
                
                /* Table Styles */
                .ledger-card { background: var(--navy-card); border: 1px solid var(--border-sub); border-radius: 4px; padding: 24px; }
                .inv-status { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 8px; border-radius: 2px; white-space: nowrap; font-weight: 500; }
                .inv-status.active, .inv-status.confirmed { color: var(--green); background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.2); }
                .inv-status.pending { color: #E67E22; background: rgba(230,126,34,0.1); border: 1px solid rgba(230,126,34,0.2); }
                .inv-status.repaid { color: var(--gold-light); background: rgba(184,144,42,0.1); border: 1px solid var(--border-gold); }
                .inv-status.default { color: var(--cream-60); background: var(--cream-05); }
            `}</style>

            <div className="tab-header">
                <div className="section-eyebrow" style={{ marginBottom: 0 }}>Portfolio Overview</div>
                {accounts.length > 0 && (
                    <select
                        className="account-selector"
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                    >
                        {accounts.map(acc => (
                            <option key={acc.account_id} value={acc.account_id}>
                                {acc.account_name} (...{acc.account_number.slice(-4)})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {error && (
                <div className="err-banner">{error}</div>
            )}

            {/* ── HIGH-LEVEL PORTFOLIO STATS ── */}
            {!loading && accounts.length > 0 && (
                <div className="portfolio-overview">
                    <div className="stat-card">
                        <div className="stat-label">Total Capital Deployed</div>
                        <div className="stat-value highlight">
                            {fmt(totalInvested)}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Active Trade Deals</div>
                        <div className="stat-value">{activeDeals}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Largest Single Exposure</div>
                        <div className="stat-value">
                            {fmt(largestExposure)}
                        </div>
                    </div>
                </div>
            )}

            {/* ── DETAILED LEDGER ── */}
            <div className="ledger-card">
                <div className="txn-header">
                    Investment Ledger
                    <span className="txn-count">{investments.length} records</span>
                </div>

                {loading ? (
                    <div className="detail-loading"><div className="detail-spinner" />Syncing portfolio data...</div>
                ) : investments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><IconTradeVault /></div>
                        No active investments for this account. <br/>
                        <span style={{ fontSize: "12px", color: "var(--cream-30)", marginTop: "8px", display: "block" }}>
                            Head to the Companies tab to explore and fund shipments.
                        </span>
                    </div>
                ) : (
                    <table className="txn-table">
                        <thead>
                        <tr>
                            <th>Deployment Date</th>
                            <th>Shipment Reference</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Capital Deployed</th>
                        </tr>
                        </thead>
                        <tbody>
                        {investments.map((inv, idx) => {
                            const statusKey = inv.status?.toLowerCase() || "default";
                            let statusClass = "default";

                            if (["active", "confirmed"].includes(statusKey)) statusClass = "active";
                            if (statusKey === "pending") statusClass = "pending";
                            if (statusKey === "repaid") statusClass = "repaid";

                            return (
                                <tr key={inv.id || idx}>
                                    <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "var(--cream-60)" }}>
                                        {fmtDate(inv.created_at)}
                                    </td>
                                    <td className="txn-desc mono" style={{ color: "var(--cream)", fontWeight: 500 }}>
                                        {inv.shipment_number}
                                    </td>
                                    <td>
                                        <span className={`inv-status ${statusClass}`}>{inv.status || "UNKNOWN"}</span>
                                    </td>
                                    <td className="mono" style={{ color: "var(--gold-light)", textAlign: "right", fontWeight: 500 }}>
                                        {fmt(inv.amount)}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}