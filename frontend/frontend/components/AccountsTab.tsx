"use client";

import { useState, useEffect, useCallback } from "react";
import {
    api,
    fmt,
    fmtDate,
    type Account,
    type AccountInfo,
    type Transaction
} from "../Api";
import { IconAccounts, IconShield, IconChevron } from "./Icons";

export default function AccountsTab() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);
    const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Forms
    const [createForm, setCreateForm] = useState({ accountName: "", productName: "" });
    const [transferForm, setTransferForm] = useState({ sourceAccountId: "", destinationAccountId: "", amount: "", description: "" });

    // Toast Notification State
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
        show: false,
        message: "",
        type: "success"
    });

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    // Pagination state
    const [txnPage, setTxnPage] = useState<number>(1);
    const ITEMS_PER_PAGE = 10;

    const loadAccounts = useCallback(() => {
        setLoadingAccounts(true);
        api.getAccounts()
            .then((res) => setAccounts(Array.isArray(res) ? res : []))
            .catch((err) => {
                console.error("Accounts fetch error:", err);
                setError("Failed to load accounts.");
            })
            .finally(() => setLoadingAccounts(false));
    }, []);

    // Load initial Accounts
    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const handleSelectAccount = useCallback(async (account: Account) => {
        const isSame = expandedAccount === account.account_id;
        if (isSame) {
            setExpandedAccount(null);
            setSelectedAccount(null);
            setAccountInfo(null);
            setTransactions([]);
            return;
        }

        setExpandedAccount(account.account_id);
        setSelectedAccount(account);
        setLoadingDetail(true);
        setAccountInfo(null);
        setTransactions([]);
        setTxnPage(1);

        try {
            const [infoRes, txnsRes] = await Promise.all([
                api.getAccountInfo(account.account_id),
                api.getTransactions(account.account_id),
            ]);

            setAccountInfo(infoRes || null);
            setTransactions(Array.isArray(txnsRes) ? txnsRes : []);
        } catch (err) {
            console.error("Details fetch error:", err);
            setError("Failed to load account details.");
        } finally {
            setLoadingDetail(false);
        }
    }, [expandedAccount]);

    // ── CREATE NEW ACCOUNT HANDLER ──
    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.accountName || !createForm.productName) return;

        setIsProcessing(true);
        try {
            await api.openAccount({
                accountName: createForm.accountName,
                productName: createForm.productName
            });

            showToast("New account successfully opened!", "success");
            setShowCreateModal(false);
            setCreateForm({ accountName: "", productName: "" });
            loadAccounts();
        } catch (err: any) {
            showToast(err.message || "Failed to open account.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── INTER-ACCOUNT TRANSFER HANDLER ──
    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferForm.sourceAccountId || !transferForm.destinationAccountId || !transferForm.amount) return;

        setIsProcessing(true);
        const amountNum = parseFloat(transferForm.amount);

        try {
            await api.processTransfer({
                sourceAccountId: transferForm.sourceAccountId,
                destinationAccountId: transferForm.destinationAccountId,
                amount: Math.abs(amountNum),
                description: transferForm.description || "Internal Transfer"
            });

            showToast("Transfer completed successfully!", "success");
            setShowTransferModal(false);
            setTransferForm({ sourceAccountId: "", destinationAccountId: "", amount: "", description: "" });

            // Refresh accounts list to show updated balances in the UI (if you have balances at the top level)
            loadAccounts();

            // If the user has the affected account expanded, refresh its details
            if (expandedAccount === transferForm.sourceAccountId || expandedAccount === transferForm.destinationAccountId) {
                const accToRefresh = accounts.find(a => a.account_id === expandedAccount);
                if (accToRefresh) handleSelectAccount(accToRefresh); // re-trigger fetch
            }

        } catch (err: any) {
            console.error("Transfer Error:", err);
            showToast(err.message || "Insufficient funds or transfer failed.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // Pagination calculations
    const totalTxnPages = Math.ceil((transactions?.length || 0) / ITEMS_PER_PAGE);
    const currentTxns = Array.isArray(transactions)
        ? transactions.slice((txnPage - 1) * ITEMS_PER_PAGE, txnPage * ITEMS_PER_PAGE)
        : [];

    return (
        <>
            <style>{`
                .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .btn-group { display: flex; gap: 12px; }
                .btn-primary { background: var(--gold-light); color: var(--navy); border: none; padding: 8px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; border-radius: 2px; cursor: pointer; transition: 0.2s; }
                .btn-primary:hover { background: var(--gold); }
                .btn-secondary { background: transparent; color: var(--gold-light); border: 1px solid var(--border-gold); padding: 8px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; border-radius: 2px; cursor: pointer; transition: 0.2s; }
                .btn-secondary:hover { background: rgba(184, 144, 42, 0.1); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(10, 22, 40, 0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
                .modal-content { background: var(--navy-mid); border: 1px solid var(--border-gold); padding: 32px; width: 100%; max-width: 480px; border-radius: 4px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--cream); margin-bottom: 24px; }
                .input-group { margin-bottom: 16px; }
                .input-label { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--cream-60); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
                .input-field { width: 100%; background: var(--navy-card); border: 1px solid var(--border-sub); color: var(--cream); padding: 12px; font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; border-radius: 2px; }
                .input-field:focus { outline: none; border-color: var(--gold-light); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
                .btn-cancel { background: transparent; border: 1px solid var(--border-sub); color: var(--cream-60); padding: 10px 20px; cursor: pointer; border-radius: 2px; font-size: 13px; }
                .btn-submit { background: var(--gold-light); border: none; color: var(--navy); padding: 10px 20px; font-weight: 500; cursor: pointer; border-radius: 2px; font-size: 13px; }
                .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Toast Notification Styles */
                .toast-container { position: fixed; top: 24px; right: 24px; z-index: 1000; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
                .toast { background: var(--navy-raised, #162436); color: var(--cream); padding: 16px 24px; border-radius: 4px; font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 12px; transform: translateX(120%); opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border-left: 4px solid transparent; }
                .toast.show { transform: translateX(0); opacity: 1; }
                .toast.success { border-left-color: var(--green, #4CAF50); }
                .toast.error { border-left-color: #E57373; }
                .toast-icon { font-size: 18px; }
            `}</style>

            <div className="tab-header">
                <div className="section-eyebrow" style={{ marginBottom: 0 }}>Client Accounts</div>
                <div className="btn-group">
                    <button className="btn-secondary" onClick={() => setShowTransferModal(true)} disabled={accounts.length < 2}>
                        Transfer Funds
                    </button>
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        + Open New Account
                    </button>
                </div>
            </div>

            {error && (
                <div className="err-banner">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            {loadingAccounts ? (
                <div className="accounts-grid">
                    {[1, 2, 3].map((i) => (
                        <div className="skeleton-row" key={i}>
                            <div><div className="skel skel-sm" /><div className="skel skel-xs" /></div>
                            <div><div className="skel skel-sm" /><div className="skel skel-xs" /></div>
                            <div><div className="skel skel-sm" /><div className="skel skel-xs" /></div>
                            <div style={{ width: 70 }}><div className="skel" /></div>
                            <div style={{ width: 24 }}><div className="skel" /></div>
                        </div>
                    ))}
                </div>
            ) : !Array.isArray(accounts) || accounts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><IconAccounts /></div>
                    No accounts found for this profile.
                </div>
            ) : (
                <div className="accounts-grid">
                    {accounts.map((acc) => {
                        const isExpanded = expandedAccount === acc.account_id;
                        return (
                            <div key={acc.account_id} className={`account-card${isExpanded ? " expanded" : ""}`}>
                                <div className="account-card-header" onClick={() => handleSelectAccount(acc)}>
                                    <div>
                                        <div className="acc-field-label">Account Number</div>
                                        <div className="acc-field-value mono">{acc.account_number}</div>
                                    </div>
                                    <div>
                                        <div className="acc-field-label">Account Name</div>
                                        <div className="acc-field-value">{acc.account_name}</div>
                                    </div>
                                    <div>
                                        <div className="acc-field-label">Product</div>
                                        <div className="acc-field-value">{acc.product_name}</div>
                                    </div>
                                    <div>
                                      <span className={`kyc-badge ${acc.kyc_compliant ? "compliant" : "non-compliant"}`}>
                                        <IconShield compliant={acc.kyc_compliant} />
                                          {acc.kyc_compliant ? "KYC Verified" : "KYC Pending"}
                                      </span>
                                    </div>
                                    <div className="chevron-col">
                                        <IconChevron open={isExpanded} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="detail-panel">
                                        {loadingDetail ? (
                                            <div className="detail-loading">
                                                <div className="detail-spinner" />
                                                Loading account details
                                            </div>
                                        ) : (
                                            <>
                                                <div className="detail-top">
                                                    <div className="balance-grid">
                                                        <div>
                                                            <div className="balance-label">Current Balance</div>
                                                            <div className="balance-value">{accountInfo ? fmt(accountInfo.current_balance, accountInfo.currency) : "—"}</div>
                                                            <div className="balance-currency">{accountInfo?.currency ?? ""}</div>
                                                        </div>
                                                        <div>
                                                            <div className="balance-label">Available Balance</div>
                                                            <div className="balance-value" style={{ color: "var(--gold-light)" }}>{accountInfo ? fmt(accountInfo.available_balance, accountInfo.currency) : "—"}</div>
                                                            <div className="balance-currency">{accountInfo?.currency ?? ""}</div>
                                                        </div>
                                                        <div className="detail-meta">
                                                            <div className="meta-row"><div className="meta-key">Account ID</div><div className="meta-val">{acc.account_id}</div></div>
                                                            <div className="meta-row"><div className="meta-key">Reference</div><div className="meta-val">{acc.reference_name}</div></div>
                                                            <div className="meta-row"><div className="meta-key">Last Updated</div><div className="meta-val">{fmtDate(accountInfo?.last_updated_at)}</div></div>
                                                            <div className="meta-row"><div className="meta-key">Opened</div><div className="meta-val">{fmtDate(acc.created_at)}</div></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="txn-section">
                                                    <div className="txn-header">
                                                        Transactions
                                                        <span className="txn-count">{Array.isArray(transactions) ? transactions.length : 0} records</span>
                                                    </div>

                                                    {!Array.isArray(transactions) || transactions.length === 0 ? (
                                                        <div className="empty-state" style={{ padding: "32px" }}>No transactions on record.</div>
                                                    ) : (
                                                        <>
                                                            <table className="txn-table">
                                                                <thead>
                                                                <tr>
                                                                    <th>Date</th>
                                                                    <th>Description</th>
                                                                    <th>Type</th>
                                                                    <th>Status</th>
                                                                    <th>Amount</th>
                                                                    <th>Running Balance</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {currentTxns.map((txn) => {
                                                                    const isCredit = txn.type?.toLowerCase() === "credit";
                                                                    const statusKey = txn.status?.toLowerCase() ?? "default";
                                                                    const statusClass = ["posted", "completed"].includes(statusKey) ? "posted" : ["pending"].includes(statusKey) ? "pending" : ["failed", "reversed"].includes(statusKey) ? "failed" : "default";

                                                                    return (
                                                                        <tr key={txn.id}>
                                                                            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px" }}>{fmtDate(txn.transaction_date ?? txn.posting_date)}</td>
                                                                            <td className="txn-desc">{txn.description || "—"}</td>
                                                                            <td><span className="txn-type-badge">{txn.transaction_type ?? txn.type ?? "—"}</span></td>
                                                                            <td><span className={`txn-status ${statusClass}`}>{txn.status}</span></td>
                                                                            <td><span className={`txn-amount ${isCredit ? "credit" : "debit"}`}>{isCredit ? "+" : "-"}{fmt(Math.abs(txn.amount), accountInfo?.currency)}</span></td>
                                                                            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "var(--cream-60)" }}>{fmt(txn.running_balance, accountInfo?.currency)}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                </tbody>
                                                            </table>

                                                            {totalTxnPages > 1 && (
                                                                <div className="pagination">
                                                                    <span className="pagination-info">Page {txnPage} of {totalTxnPages}</span>
                                                                    <div className="pagination-controls">
                                                                        <button className="page-btn" disabled={txnPage === 1} onClick={(e) => { e.stopPropagation(); setTxnPage(p => Math.max(1, p - 1)); }}>Previous</button>
                                                                        <button className="page-btn" disabled={txnPage === totalTxnPages} onClick={(e) => { e.stopPropagation(); setTxnPage(p => Math.min(totalTxnPages, p + 1)); }}>Next</button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── OPEN ACCOUNT MODAL ── */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Open New Account</h2>
                        <form onSubmit={handleCreateAccount}>
                            <div className="input-group">
                                <label className="input-label">Account Name</label>
                                <input
                                    required
                                    className="input-field"
                                    value={createForm.accountName}
                                    onChange={e => setCreateForm({...createForm, accountName: e.target.value})}
                                    placeholder="e.g. Holiday Savings, Tax Fund..."
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Product Type</label>
                                <select
                                    required
                                    className="input-field"
                                    value={createForm.productName}
                                    onChange={e => setCreateForm({...createForm, productName: e.target.value})}
                                >
                                    <option value="" disabled>Select a product...</option>
                                    <option value="PrimeSaver">PrimeSaver</option>
                                    <option value="MoneyFund">MoneyFund</option>
                                    <option value="Cash Management">Cash Management</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)} disabled={isProcessing}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={isProcessing || !createForm.productName || !createForm.accountName}>
                                    {isProcessing ? "Processing..." : "Open Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── TRANSFER FUNDS MODAL ── */}
            {showTransferModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Inter-Account Transfer</h2>
                        <form onSubmit={handleTransferSubmit}>
                            <div className="input-group">
                                <label className="input-label">Transfer From</label>
                                <select
                                    required
                                    className="input-field"
                                    value={transferForm.sourceAccountId}
                                    onChange={e => setTransferForm({...transferForm, sourceAccountId: e.target.value, destinationAccountId: ""})}
                                >
                                    <option value="" disabled>Select source account...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>
                                            {acc.account_name} (...{acc.account_number.slice(-4)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Transfer To</label>
                                <select
                                    required
                                    className="input-field"
                                    value={transferForm.destinationAccountId}
                                    onChange={e => setTransferForm({...transferForm, destinationAccountId: e.target.value})}
                                    disabled={!transferForm.sourceAccountId}
                                >
                                    <option value="" disabled>Select destination account...</option>
                                    {/* Smart filter: Don't let them select the same account they are transferring from */}
                                    {accounts.filter(acc => acc.account_id !== transferForm.sourceAccountId).map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>
                                            {acc.account_name} (...{acc.account_number.slice(-4)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Amount (ZAR)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    className="input-field"
                                    value={transferForm.amount}
                                    onChange={e => setTransferForm({...transferForm, amount: e.target.value})}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Reference</label>
                                <input
                                    className="input-field"
                                    value={transferForm.description}
                                    onChange={e => setTransferForm({...transferForm, description: e.target.value})}
                                    placeholder="e.g. Monthly Savings"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowTransferModal(false)} disabled={isProcessing}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={isProcessing || !transferForm.sourceAccountId || !transferForm.destinationAccountId || !transferForm.amount}>
                                    {isProcessing ? "Processing..." : "Complete Transfer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── TOAST NOTIFICATION ── */}
            <div className="toast-container">
                <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
                    <span className="toast-icon">
                        {toast.type === 'success' ? '✓' : '⚠️'}
                    </span>
                    {toast.message}
                </div>
            </div>
        </>
    );
}