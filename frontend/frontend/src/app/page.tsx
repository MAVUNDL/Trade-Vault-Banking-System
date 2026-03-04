"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
      <>
        <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --navy:        #0A1628;
                    --navy-mid:    #0F1E38;
                    --navy-card:   #112240;
                    --gold:        #B8902A;
                    --gold-light:  #D4A843;
                    --cream:       #F5F0E8;
                    --cream-60:    rgba(245,240,232,0.60);
                    --cream-30:    rgba(245,240,232,0.30);
                    --border-gold: rgba(184,144,42,0.22);
                    --border-sub:  rgba(245,240,232,0.07);
                }

                body {
                    background-color: var(--navy);
                    color: var(--cream);
                    font-family: 'IBM Plex Sans', sans-serif;
                    overflow-x: hidden;
                }

                /* ── BACKGROUNDS & EFFECTS ── */
                .ambient-glow {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 15% 30%, rgba(184,144,42,0.08) 0%, transparent 40%),
                        radial-gradient(circle at 85% 70%, rgba(10,22,40,0.9) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: 0;
                }

                .grid-overlay {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(var(--border-sub) 1px, transparent 1px),
                        linear-gradient(90deg, var(--border-sub) 1px, transparent 1px);
                    background-size: 64px 64px;
                    pointer-events: none;
                    z-index: 0;
                    opacity: 0.5;
                }

                /* ── NAVIGATION ── */
                .nav {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px 64px;
                    border-bottom: 1px solid var(--border-sub);
                }

                .wordmark { display: flex; align-items: center; gap: 16px; cursor: pointer; }
                .wm-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cream); }
                .wm-sep { width: 1px; height: 22px; background: var(--border-gold); }
                .wm-est { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.1em; color: var(--gold); }

                .nav-actions { display: flex; align-items: center; gap: 24px; }
                .nav-link { background: none; border: none; color: var(--cream-60); font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: color 0.2s; }
                .nav-link:hover { color: var(--gold-light); }

                /* ── BUTTONS ── */
                .btn-primary { background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%); color: var(--navy); border: none; padding: 12px 28px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.1em; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border-radius: 2px; }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(184,144,42,0.2); }
                
                .btn-outline { background: transparent; border: 1px solid var(--border-gold); color: var(--gold-light); padding: 12px 28px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; border-radius: 2px; }
                .btn-outline:hover { background: rgba(184,144,42,0.1); color: var(--cream); }

                /* ── HERO SECTION ── */
                .hero {
                    position: relative;
                    z-index: 1;
                    min-height: calc(100vh - 100px);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 0 24px;
                    opacity: 0;
                    transform: translateY(20px);
                    animation: fadeUp 1s ease 0.2s forwards;
                }

                .eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 24px; }
                
                .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(48px, 6vw, 84px); font-weight: 400; line-height: 1.1; color: var(--cream); margin-bottom: 32px; letter-spacing: -0.02em; max-width: 900px; }
                .hero-title em { font-style: italic; color: var(--gold-light); }

                .hero-desc { font-size: 18px; font-weight: 300; color: var(--cream-60); line-height: 1.6; max-width: 600px; margin-bottom: 48px; }

                .hero-actions { display: flex; gap: 16px; justify-content: center; }

                /* ── FEATURES SECTION ── */
                .features {
                    position: relative;
                    z-index: 1;
                    padding: 120px 64px;
                    background: var(--navy-mid);
                    border-top: 1px solid var(--border-sub);
                }

                .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto; }
                
                .feature-card { background: var(--navy-card); border: 1px solid var(--border-sub); padding: 40px; border-radius: 4px; transition: 0.3s; }
                .feature-card:hover { border-color: var(--border-gold); transform: translateY(-5px); }
                
                .fc-icon { width: 48px; height: 48px; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--gold-light); }
                .fc-title { font-family: 'Playfair Display', serif; font-size: 24px; color: var(--cream); margin-bottom: 16px; }
                .fc-desc { font-size: 14px; font-weight: 300; color: var(--cream-60); line-height: 1.7; }

                /* ── FOOTER ── */
                .footer { padding: 40px 64px; border-top: 1px solid var(--border-sub); display: flex; justify-content: space-between; align-items: center; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--cream-30); letter-spacing: 0.05em; text-transform: uppercase; position: relative; z-index: 1; }

                @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .nav { padding: 24px; }
                    .features { padding: 64px 24px; }
                    .footer { flex-direction: column; gap: 16px; text-align: center; }
                    .hero-actions { flex-direction: column; width: 100%; max-width: 300px; }
                    .btn-primary, .btn-outline { width: 100%; text-align: center; }
                }
            `}</style>

        <div className="grid-overlay" />
        <div className="ambient-glow" />

        {/* ── NAVIGATION ── */}
        <nav className="nav">
          <div className="wordmark">
            <div className="crest">
              <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
                <rect x="0.5" y="0.5" width="37" height="37" stroke="#B8902A" strokeOpacity="0.35" />
                <path d="M19 5L33 13V25L19 33L5 25V13L19 5Z" stroke="#B8902A" strokeWidth="1" fill="none" />
                <path d="M19 11L27 16V22L19 27L11 22V16L19 11Z" fill="rgba(184,144,42,0.10)" stroke="#B8902A" strokeWidth="0.75" />
                <circle cx="19" cy="19" r="2.5" fill="#B8902A" />
              </svg>
            </div>
            <span className="wm-name">Veridian</span>
            <div className="wm-sep" />
            <span className="wm-est">Est. 1891</span>
          </div>

          <div className="nav-actions">
            <button className="nav-link" onClick={() => router.push("/login")}>Client Portal</button>
            <button className="btn-primary" onClick={() => router.push("/register")} style={{ padding: "8px 20px" }}>Become a Client</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <header className="hero">
          <div className="eyebrow">Private Wealth Management</div>
          <h1 className="hero-title">
            Capital allocation,<br/>
            <em>elevated</em> for the<br/>
            modern world.
          </h1>
          <p className="hero-desc">
            Experience institutional-grade cash management, global inter-account transfers, and exclusive direct-to-market trade funding through the Veridian secure portal.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => router.push("/register")}>
              Open an Account
            </button>
            <button className="btn-outline" onClick={() => router.push("/login")}>
              Access Portal
            </button>
          </div>
        </header>

        {/* ── FEATURES ── */}
        <section className="features">
          <div className="features-grid">
            <div className="feature-card">
              <div className="fc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className="fc-title">Cash Management</h3>
              <p className="fc-desc">
                Instantly deploy capital across PrimeSaver and MoneyFund accounts. Execute real-time, zero-fee global transfers to saved beneficiaries securely.
              </p>
            </div>

            <div className="feature-card">
              <div className="fc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="fc-title">The Trade Vault</h3>
              <p className="fc-desc">
                Bypass traditional markets. Directly fund and track lucrative global shipping manifests with our proprietary real-time ledger technology.
              </p>
            </div>

            <div className="feature-card">
              <div className="fc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="fc-title">Fortified Security</h3>
              <p className="fc-desc">
                Protected by military-grade 256-bit encryption and strict stateless JWT token architecture. Your capital and data never leave the secure boundary.
              </p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div>© {new Date().getFullYear()} Veridian Private Wealth. All rights reserved.</div>
          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ color: "var(--gold)" }}>FDIC Insured</span>
            <span>SOC 2 Type II</span>
            <span>ISO 27001</span>
          </div>
        </footer>
      </>
  );
}