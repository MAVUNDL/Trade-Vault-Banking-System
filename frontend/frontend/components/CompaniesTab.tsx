"use client";

import { useState, useEffect, useCallback } from "react";
import {
    api,
    fmt,
    fmtDate,
    type Company,
    type Shipment,
    type ShipmentFunding,
    type Account
} from "../Api";

interface CompaniesTabProps {
    profileId: string;
}

export default function CompaniesTab({ profileId }: CompaniesTabProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Drill-down states
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [fundings, setFundings] = useState<ShipmentFunding[]>([]);
    const [loadingShipments, setLoadingShipments] = useState<boolean>(false);

    // Modal States
    const [showFundModal, setShowFundModal] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [myAccounts, setMyAccounts] = useState<Account[]>([]);
    const [fundForm, setFundForm] = useState({ sourceAccountId: "", amount: "" });
    const [isProcessing, setIsProcessing] = useState(false);

    // Toast Notification State
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
        show: false,
        message: "",
        type: "success"
    });

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ show: true, message, type });
        // Auto-hide after 4 seconds
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 4000);
    };

    // FIX: Load Companies AND Accounts on mount
    useEffect(() => {
        setLoadingCompanies(true);
        Promise.all([
            api.getCompanies(),
            api.getAccounts() // Ensure your api.ts maps this to GET /api/v1/accounts
        ])
            .then(([compRes, accRes]) => {
                setCompanies(Array.isArray(compRes) ? compRes : []);
                setMyAccounts(Array.isArray(accRes) ? accRes : []);
            })
            .catch(() => setError("Failed to load initial data."))
            .finally(() => setLoadingCompanies(false));
    }, []);

    // Load Shipments & Funding when a company is selected
    const handleSelectCompany = useCallback((company: Company) => {
        setSelectedCompany(company);
        setLoadingShipments(true);
        setError("");

        Promise.all([
            api.getCompanyShipments(company.company_owner),
            api.getShipmentFundings(company.company_profile_id)
        ])
            .then(([shipRes, fundRes]) => {
                setShipments(Array.isArray(shipRes) ? shipRes : []);
                setFundings(Array.isArray(fundRes) ? fundRes : []);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load shipments for this company.");
            })
            .finally(() => setLoadingShipments(false));
    }, []);

    // ── FRONTEND ORCHESTRATION OF FUNDING ──
    const handleFundSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShipment || !selectedCompany || !fundForm.sourceAccountId || !fundForm.amount) return;

        setIsProcessing(true);
        const amountNum = parseFloat(fundForm.amount);

        // 1. Calculate exactly how much room is left in the funding pool
        const fundingData = fundings.find(f => f.shipment_number === selectedShipment.shipment_number);
        const required = fundingData?.funding_required || 0;
        const raised = fundingData?.funding_raised || 0;
        const remainingToFund = Math.max(0, required - raised);

        // 2. FRONTEND GUARDRAIL: Block it and show the Toast immediately
        if (amountNum > remainingToFund) {
            showToast(`Amount exceeds remaining capacity. Maximum allowed is ${fmt(remainingToFund, selectedShipment.currency_code)}.`, "error");
            setIsProcessing(false);
            return; // Stops the function here so the API is never called!
        }

        try {
            // 3. If it passes the check, proceed with the secure API call
            await api.deployCapital({
                sourceAccountId: fundForm.sourceAccountId,
                shipmentNumber: selectedShipment.shipment_number,
                companyProfileId: selectedCompany.company_profile_id,
                amount: Math.abs(amountNum)
            });

            showToast("Capital successfully deployed!", "success");
            setShowFundModal(false);
            setFundForm({ sourceAccountId: "", amount: "" });

            // Refresh the screen to update the progress bars
            handleSelectCompany(selectedCompany);

        } catch (err: any) {
            // This will still catch legitimate backend errors (like Insufficient Funds)
            showToast(err.message || "Failed to process the investment. Please check your balance.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <style>{`
                .back-btn { background: transparent; border: 1px solid var(--border-sub); color: var(--cream-60); padding: 6px 12px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; cursor: pointer; border-radius: 2px; text-transform: uppercase; margin-bottom: 24px; transition: 0.2s; }
                .back-btn:hover { background: var(--cream-05); color: var(--cream); }
                
                .company-card { background: var(--navy-card); border: 1px solid var(--border-sub); border-radius: 4px; padding: 24px; cursor: pointer; transition: all 0.2s; }
                .company-card:hover { border-color: var(--border-gold); background: var(--navy-raised); transform: translateY(-2px); }
                .company-grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                
                .shipment-layer-card { background: var(--navy-card); border: 1px solid var(--border-sub); border-radius: 4px; margin-bottom: 24px; overflow: hidden; }
                .shipment-top-layer { padding: 24px; border-bottom: 1px solid var(--border-sub); background: rgba(184,144,42,0.02); display: flex; justify-content: space-between; align-items: center; }
                .shipment-bottom-layer { padding: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
                
                .progress-bar-bg { width: 100%; height: 6px; background: var(--cream-08); border-radius: 3px; margin-top: 8px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: var(--gold-light); transition: width 0.3s ease; }
                
                .btn-fund { background: var(--gold-light); color: var(--navy); border: none; padding: 8px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; border-radius: 2px; cursor: pointer; transition: 0.2s; }
                .btn-fund:hover { background: var(--gold); }
                
                /* Modal Styles */
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

            {error && <div className="err-banner">{error}</div>}

            {/* LEVEL 1: COMPANIES GRID */}
            {!selectedCompany ? (
                <>
                    <div className="section-eyebrow">Available Opportunities</div>
                    {loadingCompanies ? (
                        <div className="detail-loading"><div className="detail-spinner"/>Loading companies...</div>
                    ) : (
                        <div className="company-grid-container">
                            {companies.map((company) => (
                                <div key={company.id} className="company-card" onClick={() => handleSelectCompany(company)}>
                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "var(--cream)", marginBottom: "8px" }}>
                                        {company.company_name}
                                    </div>
                                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "var(--gold)", marginBottom: "16px" }}>
                                        Reg: {company.registration_number}
                                    </div>
                                    <div className="meta-row" style={{ textAlign: "left" }}>
                                        <div className="meta-key">Owner</div>
                                        <div className="meta-val">{company.company_owner}</div>
                                    </div>
                                    <div className="meta-row" style={{ textAlign: "left", marginTop: "8px" }}>
                                        <div className="meta-key">Contact</div>
                                        <div className="meta-val">{company.email_address}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* LEVEL 2: COMPANY SHIPMENTS */
                <>
                    <button className="back-btn" onClick={() => setSelectedCompany(null)}>← Back to Companies</button>
                    <div className="section-eyebrow">{selectedCompany.company_name} - Active Shipments</div>

                    {loadingShipments ? (
                        <div className="detail-loading"><div className="detail-spinner"/>Loading shipments...</div>
                    ) : shipments.length === 0 ? (
                        <div className="empty-state">No shipments currently available for this company.</div>
                    ) : (
                        shipments.map((ship) => {
                            // Link Shipment to its Funding Data
                            const funding = fundings.find(f => f.shipment_number === ship.shipment_number);
                            const required = funding?.funding_required || 0;
                            const raised = funding?.funding_raised || 0;
                            const progress = required > 0 ? Math.min((raised / required) * 100, 100) : 0;

                            // ── FIXED STATUS LOGIC ──
                            const isDelivered = ship.status === 'DELIVERED';
                            const isFullyFunded = raised >= required && required > 0;
                            const isDisabled = isDelivered || isFullyFunded || required === 0;

                            let buttonLabel = "Deploy Capital";
                            if (isDelivered) {
                                buttonLabel = "Closed";
                            } else if (isFullyFunded || required === 0) {
                                buttonLabel = "Fully Funded";
                            }

                            return (
                                <div key={ship.id} className="shipment-layer-card">
                                    {/* TOP LAYER: Funding Status */}
                                    <div className="shipment-top-layer">
                                        <div style={{ flex: 1, paddingRight: "40px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <div>
                                                    <span className="acc-field-label">Funding Required</span>
                                                    <div className="acc-field-value mono">{fmt(required, ship.currency_code)}</div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <span className="acc-field-label">Capital Raised</span>
                                                    <div className="acc-field-value mono" style={{ color: "var(--gold-light)" }}>{fmt(raised, ship.currency_code)}</div>
                                                </div>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div className="progress-bar-fill" style={{ width: `${progress}%`, background: (isFullyFunded || isDelivered) ? "var(--green)" : "var(--gold-light)" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                className="btn-fund"
                                                disabled={isDisabled}
                                                style={{ opacity: isDisabled ? 0.3 : 1 }}
                                                onClick={() => { setSelectedShipment(ship); setShowFundModal(true); }}
                                            >
                                                {buttonLabel}
                                            </button>
                                        </div>
                                    </div>

                                    {/* BOTTOM LAYER: Shipment Specs */}
                                    <div className="shipment-bottom-layer">
                                        <div>
                                            <div className="meta-key">Shipment Ref</div>
                                            <div className="meta-val" style={{ color: "var(--cream)" }}>{ship.shipment_number}</div>
                                            <div className="meta-key" style={{ marginTop: "12px" }}>Route</div>
                                            <div className="meta-val">{ship.port_of_load} → {ship.port_of_discharge}</div>
                                        </div>
                                        <div>
                                            <div className="meta-key">Vessel / Mode</div>
                                            <div className="meta-val">{ship.vessel_name || "TBA"} ({ship.shipment_mode})</div>
                                            <div className="meta-key" style={{ marginTop: "12px" }}>ETA</div>
                                            <div className="meta-val">{fmtDate(ship.eta)}</div>
                                        </div>
                                        <div>
                                            <div className="meta-key">Goods</div>
                                            <div className="meta-val">{ship.description}</div>
                                            <div className="meta-key" style={{ marginTop: "12px" }}>Value</div>
                                            <div className="meta-val mono">{fmt(ship.order_value, ship.currency_code)}</div>
                                        </div>
                                        <div>
                                            <div className="meta-key">Supplier</div>
                                            <div className="meta-val">{ship.supplier_name}</div>
                                            <div className="meta-key" style={{ marginTop: "12px" }}>Status</div>
                                            <div className="meta-val">
                                                <span className={`txn-status ${ship.status?.toLowerCase() === 'in transit' ? 'pending' : 'posted'}`}>
                                                    {ship.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </>
            )}

            {/* ── FUND SHIPMENT MODAL ── */}
            {showFundModal && selectedShipment && selectedCompany && (() => {
                // Calculate remaining funding to display in the modal
                const fundingData = fundings.find(f => f.shipment_number === selectedShipment.shipment_number);
                const remainingToFund = Math.max(0, (fundingData?.funding_required || 0) - (fundingData?.funding_raised || 0));

                return (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 className="modal-title">Fund Shipment {selectedShipment.shipment_number}</h2>

                            <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(184,144,42,0.1)", border: "1px solid var(--border-gold)", borderRadius: "4px" }}>
                                <div className="meta-key">Company</div>
                                <div className="meta-val" style={{ color: "var(--cream)" }}>{selectedCompany.company_name}</div>
                            </div>

                            <form onSubmit={handleFundSubmit}>
                                <div className="input-group">
                                    <label className="input-label">Deploy Capital From</label>
                                    <select required className="input-field" value={fundForm.sourceAccountId} onChange={e => setFundForm({...fundForm, sourceAccountId: e.target.value})}>
                                        <option value="" disabled>Select an account...</option>
                                        {myAccounts.map(acc => (
                                            <option key={acc.account_id} value={acc.account_id}>
                                                {acc.account_name} (...{acc.account_number.slice(-4)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Investment Amount ({selectedShipment.currency_code || 'ZAR'})</label>
                                    <div style={{ fontSize: "11px", color: "var(--cream-60)", marginBottom: "8px" }}>
                                        Max available: <span style={{ color: "var(--gold-light)" }}>{fmt(remainingToFund, selectedShipment.currency_code)}</span>
                                    </div>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        max={remainingToFund}
                                        className="input-field"
                                        value={fundForm.amount}
                                        onChange={e => setFundForm({...fundForm, amount: e.target.value})}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowFundModal(false)} disabled={isProcessing}>Cancel</button>
                                    <button type="submit" className="btn-submit" disabled={isProcessing || !fundForm.sourceAccountId}>
                                        {isProcessing ? "Processing..." : "Deploy Capital"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}

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