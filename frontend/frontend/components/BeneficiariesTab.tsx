"use client";

import { useState, useEffect, useCallback } from "react";
import {
    api,
    fmt,
    fmtDate,
    type Beneficiary,
    type Account
} from "../Api";
import { IconBeneficiaries, IconFastPay } from "./Icons";

interface BeneficiariesTabProps {
    profileId: string;
}

export default function BeneficiariesTab({ profileId }: BeneficiariesTabProps) {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [myAccounts, setMyAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedBen, setSelectedBen] = useState<Beneficiary | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form States
    const [addForm, setAddForm] = useState({ name: "", account_number: "", bank: "", reference_name: "" });
    const [payForm, setPayForm] = useState({ sourceAccountId: "", amount: "", description: "" });

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

    const loadData = useCallback(() => {
        if (!profileId) return;
        setLoading(true);
        setError(""); // Clear old errors on reload

        Promise.all([
            // 🚨 THE FIX: Catch the error on this specific call and default to an empty array
            api.getBeneficiaries(profileId).catch(() => []),

            api.getAccounts().catch((err) => {
                console.error("Accounts fetch failed", err);
                return []; // Also prevent account failure from crashing the page
            })
        ])
            .then(([bens, accs]) => {
                setBeneficiaries(Array.isArray(bens) ? bens : []);
                setMyAccounts(Array.isArray(accs) ? accs : []);
            })
            .catch(() => setError("Failed to load data."))
            .finally(() => setLoading(false));
    }, [profileId]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── HANDLERS ──

    const handleAddBeneficiary = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const newBen: Partial<Beneficiary> = {
                profile_id: profileId,
                beneficiary_id: `BEN-${Math.floor(Math.random() * 10000)}`,
                beneficiary_name: addForm.name,
                name: addForm.name,
                account_number: addForm.account_number,
                bank: addForm.bank,
                reference_name: addForm.reference_name,
                faster_payment_allowed: true
            };

            await api.addBeneficiary(newBen);
            setShowAddModal(false);
            setAddForm({ name: "", account_number: "", bank: "", reference_name: "" });
            loadData();
            showToast("Beneficiary saved successfully.", "success");
        } catch (err: any) {
            showToast(err.message || "Failed to add beneficiary", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveBeneficiary = async (beneficiaryId: string) => {
        // Native browser confirm dialogue to prevent accidental clicks
        if (!window.confirm("Are you sure you want to remove this beneficiary?")) return;

        try {
            await api.removeBeneficiary(beneficiaryId);
            showToast("Beneficiary removed successfully.", "success");
            loadData(); // Refresh the list
        } catch (err: any) {
            console.error("Delete Error:", err);
            showToast(err.message || "Failed to remove beneficiary.", "error");
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBen || !payForm.sourceAccountId || !payForm.amount) return;

        setIsProcessing(true);
        const amountNum = parseFloat(payForm.amount);

        try {
            await api.payBeneficiary({
                sourceAccountId: payForm.sourceAccountId,
                destinationAccountNumber: selectedBen.account_number,
                amount: amountNum,
                description: payForm.description,
                beneficiaryId: selectedBen.beneficiary_id
            });

            setShowPayModal(false);
            setPayForm({ sourceAccountId: "", amount: "", description: "" });
            loadData();
            showToast("Payment completed successfully!", "success");

        } catch (err: any) {
            console.error("Payment Error:", err);
            showToast(err.message || "Insufficient funds or payment failed.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <style>{`
                .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .btn-primary { background: var(--gold-light); color: var(--navy); border: none; padding: 8px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; border-radius: 2px; cursor: pointer; transition: 0.2s; }
                .btn-primary:hover { background: var(--gold); }
                
                .btn-pay { background: var(--gold-faint); border: 1px solid var(--border-gold); color: var(--gold-light); padding: 6px 12px; font-size: 10px; cursor: pointer; border-radius: 2px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; }
                .btn-pay:hover { background: var(--gold); color: var(--navy); }
                
                /* New Delete Button Style */
                .btn-delete { background: transparent; border: 1px solid var(--border-sub); color: #E57373; padding: 6px 12px; font-size: 10px; cursor: pointer; border-radius: 2px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; }
                .btn-delete:hover { border-color: #E57373; background: rgba(229, 115, 115, 0.1); }
                
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
                <div className="section-eyebrow" style={{ marginBottom: 0, flex: 1 }}>Saved Beneficiaries</div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Beneficiary</button>
            </div>

            {error && <div className="err-banner">{error}</div>}

            {loading ? (
                <div className="accounts-grid">
                    {[1, 2, 3].map((i) => (
                        <div className="skeleton-row beneficiary-card-header" key={i}>
                            <div><div className="skel skel-sm" /><div className="skel skel-xs" /></div>
                            <div><div className="skel skel-sm" /><div className="skel skel-xs" /></div>
                            <div><div className="skel skel-sm" /><div className="skel skel-xs" /></div>
                            <div><div className="skel skel-sm" /><div className="skel skel-xs" /></div>
                        </div>
                    ))}
                </div>
            ) : !Array.isArray(beneficiaries) || beneficiaries.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><IconBeneficiaries /></div>
                    No beneficiaries saved. Add a beneficiary to see them here.
                </div>
            ) : (
                <div className="accounts-grid">
                    {beneficiaries.map((ben) => (
                        <div key={ben.beneficiary_id} className="account-card">
                            <div className="account-card-header beneficiary-card-header">
                                <div>
                                    <div className="acc-field-label">Name / Alias</div>
                                    <div className="acc-field-value">
                                        {ben.name || ben.beneficiary_name}
                                        {ben.faster_payment_allowed && (
                                            <span className="fast-pay-badge" title="Fast Payment Allowed">
                                                <IconFastPay /> Fast
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="acc-field-label">Bank Details</div>
                                    <div className="acc-field-value mono">
                                        {ben.bank || "Unknown Bank"} • {ben.account_number}
                                    </div>
                                </div>
                                <div>
                                    <div className="acc-field-label">Last Payment</div>
                                    <div className="acc-field-value">
                                        {ben.last_payment_date ? (
                                            <span className="mono" style={{ fontSize: "11px", color: "var(--cream-60)" }}>
                                                {fmtDate(ben.last_payment_date)} <span style={{ color: "var(--cream)" }}>({fmt(ben.last_payment_amount)})</span>
                                            </span>
                                        ) : (
                                            <span style={{ color: "var(--cream-30)", fontSize: "12px" }}>No recent payments</span>
                                        )}
                                    </div>
                                </div>

                                {/* Updated Action Buttons Container */}
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleRemoveBeneficiary(ben.beneficiary_id)}
                                        title="Remove Beneficiary"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        className="btn-pay"
                                        onClick={() => { setSelectedBen(ben); setShowPayModal(true); }}
                                    >
                                        Pay Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── ADD BENEFICIARY MODAL ── */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Add New Beneficiary</h2>
                        <form onSubmit={handleAddBeneficiary}>
                            <div className="input-group">
                                <label className="input-label">Full Name / Alias</label>
                                <input required className="input-field" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} placeholder="e.g. John Doe" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Bank Name</label>
                                <input required className="input-field" value={addForm.bank} onChange={e => setAddForm({...addForm, bank: e.target.value})} placeholder="e.g. Standard Bank" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Account Number</label>
                                <input required className="input-field" value={addForm.account_number} onChange={e => setAddForm({...addForm, account_number: e.target.value})} placeholder="10 digit account number" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">My Reference</label>
                                <input className="input-field" value={addForm.reference_name} onChange={e => setAddForm({...addForm, reference_name: e.target.value})} placeholder="e.g. Rent Payment" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)} disabled={isProcessing}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={isProcessing}>
                                    {isProcessing ? "Saving..." : "Save Beneficiary"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── PAY BENEFICIARY MODAL ── */}
            {showPayModal && selectedBen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Pay {selectedBen.name || selectedBen.beneficiary_name}</h2>
                        <form onSubmit={handlePayment}>
                            <div className="input-group">
                                <label className="input-label">Pay From Account</label>
                                <select required className="input-field" value={payForm.sourceAccountId} onChange={e => setPayForm({...payForm, sourceAccountId: e.target.value})}>
                                    <option value="" disabled>Select an account...</option>
                                    {myAccounts.map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>
                                            {acc.account_name} (...{acc.account_number.slice(-4)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Amount (ZAR)</label>
                                <input required type="number" step="0.01" min="1" className="input-field" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Payment Description</label>
                                <input required className="input-field" value={payForm.description} onChange={e => setPayForm({...payForm, description: e.target.value})} placeholder="e.g. Dinner on Friday" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => { setShowPayModal(false); setSelectedBen(null); }} disabled={isProcessing}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={isProcessing || !payForm.sourceAccountId}>
                                    {isProcessing ? "Processing..." : "Confirm Payment"}
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