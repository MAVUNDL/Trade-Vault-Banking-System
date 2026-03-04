"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginResponse {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
}

export default function Login() {
    const router = useRouter();
    const [profileId, setProfileId] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [focused, setFocused] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!profileId.trim() || !password) return;
        setError("");
        setLoading(true);

        try {
            const res = await fetch("https://skhumbuzo-software-engineering-projects.site/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId: `VRD-${profileId}`,
                    password: password,
                }),
            });
            const data: LoginResponse = await res.json();

            if (!res.ok) {
                // handle error from backend
                setError(data.error ?? "Invalid profile ID or password. Please try again.");
                return;
            }

            // log the full object properly
            console.log("data:", data);

            if (data.accessToken) {
                localStorage.setItem("vrd_accessToken", data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem("vrd_refreshToken", data.refreshToken);
                }
            }

            router.push("/dashboard");
        } catch (_err: unknown) {
            setError("Unable to reach the server. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileIdChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const val = e.target.value.replace(/^VRD-/i, "");
        setProfileId(val.toUpperCase().slice(0, 14));
    };

    const isValid: boolean = profileId.trim().length > 0 && password.length > 0;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy:        #0A1628;
          --navy-mid:    #0F1E38;
          --navy-card:   #112240;
          --navy-light:  #1A3358;
          --gold:        #B8902A;
          --gold-light:  #D4A843;
          --gold-pale:   rgba(184,144,42,0.10);
          --cream:       #F5F0E8;
          --cream-60:    rgba(245,240,232,0.60);
          --cream-30:    rgba(245,240,232,0.30);
          --cream-10:    rgba(245,240,232,0.10);
          --cream-05:    rgba(245,240,232,0.05);
          --border-gold: rgba(184,144,42,0.22);
          --border-sub:  rgba(245,240,232,0.07);
          --error:       #C0392B;
          --error-bg:    rgba(192,57,43,0.08);
        }

        .page {
          font-family: 'IBM Plex Sans', sans-serif;
          min-height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 500px;
          background: var(--navy);
          color: var(--cream);
        }

        /* ── LEFT PANEL ── */
        .left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px 68px;
          border-right: 1px solid var(--border-sub);
          overflow: hidden;
          opacity: 0;
          transform: translateY(12px);
          animation: fadeUp 0.7s ease forwards;
        }

        .left::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 5% 95%, rgba(184,144,42,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 95% 5%, rgba(10,22,40,0.9) 0%, transparent 60%);
          pointer-events: none;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border-sub) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-sub) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
        }

        .left-inner { position: relative; z-index: 1; }

        .wordmark {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 88px;
        }

        .wm-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cream);
        }

        .wm-sep {
          width: 1px;
          height: 22px;
          background: var(--border-gold);
        }

        .wm-est {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--gold);
        }

        .headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 3.2vw, 50px);
          font-weight: 400;
          line-height: 1.18;
          letter-spacing: -0.4px;
          color: var(--cream);
          margin-bottom: 24px;
        }

        .headline em {
          font-style: italic;
          color: var(--gold-light);
        }

        .subtext {
          font-size: 14px;
          font-weight: 300;
          color: var(--cream-60);
          line-height: 1.85;
          max-width: 380px;
        }

        /* Notice block */
        .notice {
          position: relative;
          z-index: 1;
          border: 1px solid var(--border-gold);
          border-left: 2px solid var(--gold);
          padding: 20px 24px;
          background: var(--gold-pale);
          margin-bottom: 40px;
        }

        .notice-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 8px;
        }

        .notice-text {
          font-size: 12px;
          font-weight: 300;
          color: var(--cream-60);
          line-height: 1.7;
        }

        .stats-block { position: relative; z-index: 1; }

        .stats-rule {
          width: 36px;
          height: 1px;
          background: var(--gold);
          opacity: 0.5;
          margin-bottom: 28px;
        }

        .stats-row {
          display: flex;
          gap: 44px;
          margin-bottom: 24px;
        }

        .stat-val {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 22px;
          font-weight: 500;
          color: var(--cream);
          letter-spacing: -0.5px;
          display: block;
          margin-bottom: 4px;
        }

        .stat-lbl {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--cream-30);
        }

        .certs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cert {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.07em;
          color: var(--gold);
          border: 1px solid var(--border-gold);
          padding: 5px 12px 4px;
          border-radius: 1px;
        }

        /* ── RIGHT PANEL ── */
        .right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 56px;
          background: var(--navy-card);
          position: relative;
          opacity: 0;
          transform: translateY(16px);
          animation: fadeUp 0.7s ease 0.18s forwards;
        }

        .right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--gold), var(--gold-light), var(--gold), transparent);
        }

        .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .eyebrow::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-gold);
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 500;
          color: var(--cream);
          letter-spacing: -0.3px;
          margin-bottom: 10px;
          line-height: 1.15;
        }

        .form-sub {
          font-size: 13px;
          font-weight: 300;
          color: var(--cream-30);
          line-height: 1.75;
          margin-bottom: 44px;
        }

        /* Fields */
        .field { margin-bottom: 28px; }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 10px;
        }

        .field-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cream-30);
        }

        .field-hint {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--gold);
          letter-spacing: 0.04em;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.15s;
        }

        .field-hint:hover { color: var(--gold-light); }

        .input-wrap { position: relative; }

        .field-input {
          width: 100%;
          height: 50px;
          background: var(--cream-05);
          border: 1px solid var(--border-sub);
          border-bottom: 1px solid var(--border-gold);
          border-radius: 0;
          color: var(--cream);
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          padding: 0 16px;
          outline: none;
          transition: background 0.2s, border-bottom-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          letter-spacing: 0.01em;
        }

        .field-input::placeholder {
          color: rgba(245,240,232,0.14);
          font-weight: 300;
        }

        .field-input:focus {
          background: var(--gold-pale);
          border-bottom-color: var(--gold-light);
          box-shadow: 0 1px 0 0 var(--gold-light);
        }

        .field-input.pr { padding-right: 50px; }

        /* Profile ID prefix */
        .id-prefix-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .id-prefix {
          position: absolute;
          left: 16px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          color: var(--gold);
          letter-spacing: 0.04em;
          pointer-events: none;
          z-index: 1;
          line-height: 50px;
        }

        .field-input.has-prefix {
          padding-left: 52px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          letter-spacing: 0.06em;
        }

        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--cream-30);
          display: flex;
          padding: 4px;
          transition: color 0.15s;
        }

        .eye-btn:hover { color: var(--gold-light); }

        /* Error */
        .error-msg {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--error-bg);
          border: 1px solid rgba(192,57,43,0.25);
          border-left: 2px solid var(--error);
          margin-bottom: 20px;
          font-size: 12px;
          color: rgba(245,240,232,0.7);
          line-height: 1.5;
          animation: fadeUp 0.25s ease;
        }

        .error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--error);
          flex-shrink: 0;
        }

        /* CTA */
        .cta {
          width: 100%;
          height: 52px;
          margin-top: 4px;
          border: 1px solid var(--gold);
          background: transparent;
          color: var(--gold-light);
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          transform: translateX(-101%);
          transition: transform 0.38s cubic-bezier(0.4,0,0.2,1);
        }

        .cta:not(:disabled):hover::before { transform: translateX(0); }
        .cta:not(:disabled):hover { color: var(--navy); }

        .cta:disabled {
          border-color: var(--border-sub);
          color: var(--cream-10);
          cursor: not-allowed;
        }

        .cta-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spin {
          width: 14px; height: 14px;
          border: 1.5px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        /* Footer */
        .form-foot {
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid var(--border-sub);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .foot-register {
          font-size: 12px;
          color: var(--cream-30);
        }

        .foot-register a {
          color: var(--gold-light);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .foot-register a:hover { color: var(--cream); }

        .foot-ssl {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: rgba(245,240,232,0.18);
          letter-spacing: 0.04em;
        }

        /* ── SUCCESS ── */
        .success {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .s-icon {
          width: 52px; height: 52px;
          border: 1px solid var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        .s-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 14px;
        }

        .s-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 500;
          color: var(--cream);
          margin-bottom: 14px;
          line-height: 1.2;
        }

        .s-body {
          font-size: 13px;
          font-weight: 300;
          color: var(--cream-30);
          line-height: 1.8;
          max-width: 330px;
          margin-bottom: 40px;
        }

        .s-meta {
          border: 1px solid var(--border-sub);
          padding: 14px 18px;
          background: var(--cream-05);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .s-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .s-meta-key {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cream-30);
        }

        .s-meta-val {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--gold);
          letter-spacing: 0.06em;
        }

        /* Animations */
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .right { padding: 52px 36px; }
        }
      `}</style>

            <div className="page">

                {/* ── LEFT ── */}
                <div className="left">
                    <div className="grid-bg" />

                    <div className="left-inner">
                        <div className="wordmark">
                            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                                <rect x="0.5" y="0.5" width="37" height="37" stroke="#B8902A" strokeOpacity="0.35" />
                                <path d="M19 5L33 13V25L19 33L5 25V13L19 5Z" stroke="#B8902A" strokeWidth="1" fill="none" />
                                <path d="M19 11L27 16V22L19 27L11 22V16L19 11Z" fill="rgba(184,144,42,0.10)" stroke="#B8902A" strokeWidth="0.75" />
                                <circle cx="19" cy="19" r="2.5" fill="#B8902A" />
                            </svg>
                            <span className="wm-name">Veridian</span>
                            <div className="wm-sep" />
                            <span className="wm-est">Est. 1891</span>
                        </div>

                        <h1 className="headline">
                            Secure access<br />
                            to your <em>private</em><br />
                            banking portal.
                        </h1>
                        <p className="subtext">
                            Your session is protected by multi-layer encryption and continuous fraud monitoring. For support, contact your dedicated relationship manager directly.
                        </p>
                    </div>

                    <div className="stats-block">
                        <div className="notice">
                            <p className="notice-label">Security Notice</p>
                            <p className="notice-text">
                                Veridian will never ask for your password via email or telephone. Always verify you are on the official portal before entering credentials.
                            </p>
                        </div>

                        <div className="stats-rule" />
                        <div className="stats-row">
                            <div>
                                <span className="stat-val">$42B</span>
                                <span className="stat-lbl">Assets Managed</span>
                            </div>
                            <div>
                                <span className="stat-val">130+</span>
                                <span className="stat-lbl">Years of Service</span>
                            </div>
                            <div>
                                <span className="stat-val">99.99%</span>
                                <span className="stat-lbl">System Uptime</span>
                            </div>
                        </div>
                        <div className="certs">
                            <span className="cert">ISO 27001</span>
                            <span className="cert">SOC 2 Type II</span>
                            <span className="cert">FDIC Insured</span>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT ── */}
                <div className="right">
                    {submitted ? (
                        <div className="success">
                            <div className="s-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8902A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <p className="s-eyebrow">Authentication Successful</p>
                            <h2 className="s-title">Welcome<br />back.</h2>
                            <p className="s-body">
                                Your identity has been verified. You are being redirected to your private banking dashboard.
                            </p>
                            <div className="s-meta">
                                <div className="s-meta-row">
                                    <span className="s-meta-key">Profile ID</span>
                                    <span className="s-meta-val">VRD-{profileId.toUpperCase()}</span>
                                </div>
                                <div className="s-meta-row">
                                    <span className="s-meta-key">Session</span>
                                    <span className="s-meta-val">
                    {new Date().toLocaleString("en-ZA", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                  </span>
                                </div>
                                <div className="s-meta-row">
                                    <span className="s-meta-key">Encryption</span>
                                    <span className="s-meta-val">AES-256-GCM</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="eyebrow">Client Portal</p>
                            <h2 className="form-title">Sign in to<br />your account</h2>
                            <p className="form-sub">
                                Enter your Veridian profile ID and password to access your private banking dashboard.
                            </p>

                            {error && (
                                <div className="error-msg">
                                    <span className="error-dot" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} autoComplete="off" noValidate>
                                {/* Profile ID */}
                                <div className="field">
                                    <div className="field-header">
                                        <label className="field-label" htmlFor="profileId">Profile ID</label>
                                        <a href="/find-id" className="field-hint">Find my ID</a>
                                    </div>
                                    <div className="input-wrap id-prefix-wrap">
                                        <span className="id-prefix">VRD-</span>
                                        <input
                                            className="field-input has-prefix"
                                            id="profileId"
                                            type="text"
                                            placeholder="XXXXXXXX"
                                            value={profileId}
                                            onChange={handleProfileIdChange}
                                            onFocus={() => setFocused("id")}
                                            onBlur={() => setFocused(null)}
                                            autoComplete="username"
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="field">
                                    <div className="field-header">
                                        <label className="field-label" htmlFor="password">Password</label>
                                        <a href="/forgot-password" className="field-hint">Forgot password?</a>
                                    </div>
                                    <div className="input-wrap">
                                        <input
                                            className="field-input pr"
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                            onFocus={() => setFocused("pw")}
                                            onBlur={() => setFocused(null)}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="eye-btn"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="cta"
                                    disabled={!isValid || loading}
                                >
                  <span className="cta-inner">
                    {loading ? (
                        <>
                            <span className="spin" />
                            Authenticating
                        </>
                    ) : (
                        <>
                            Sign In
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </>
                    )}
                  </span>
                                </button>
                            </form>

                            <div className="form-foot">
                <span className="foot-register">
                  New client? <a href="/register">Open an account</a>
                </span>
                                <span className="foot-ssl">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  256-bit SSL
                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}