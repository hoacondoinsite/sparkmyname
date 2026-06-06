/**
 * HOA_CODE_10 — Landing.jsx
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Updated landing page with $39 price visible above fold,
 * Fannie Mae LL-2026-03 mentioned by name, 48-hour turnaround stated,
 * All 50 States stated, contact information visible.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../HOA_App';

export default function Landing() {
  const navigate = useNavigate();
  const { featureFlags } = usePlatform() || {};

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#fff', minHeight: '100vh' }}>

      {/* ─── NAV ─── */}
      <nav style={{
        background: '#1a2744',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ color: '#c9a84c', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>
          HOACONDInsight™
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>How It Works</a>
          <a href="#pricing" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
          <a href="mailto:peter@hoacondoinsight.com" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Contact</a>
          <button
            onClick={() => navigate('/order')}
            style={{
              background: '#c9a84c',
              color: '#1a2744',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Georgia, serif',
            }}
          >
            Order Report — $39
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a2744 0%, #0f172a 60%, #1a2744 100%)',
        padding: '80px 40px',
        textAlign: 'center',
        color: '#fff',
      }}>
        {/* Compliance badge */}
        <div style={{
          display: 'inline-block',
          background: '#c9a84c20',
          border: '1px solid #c9a84c',
          color: '#c9a84c',
          padding: '8px 20px',
          fontSize: '13px',
          letterSpacing: '1px',
          marginBottom: '24px',
        }}>
          FANNIE MAE LENDER LETTER LL-2026-03 COMPLIANCE ENGINE
        </div>

        <h1 style={{ fontSize: '44px', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '16px', maxWidth: '800px', margin: '0 auto 16px' }}>
          Know If Your HOA Is<br />
          <span style={{ color: '#c9a84c' }}>Mortgage-Eligible</span> Before You Close
        </h1>

        <p style={{ fontSize: '20px', color: '#a0aec0', maxWidth: '600px', margin: '24px auto', lineHeight: '1.6' }}>
          AI-powered HOA compliance analysis for mortgage lenders, title companies, and real estate professionals. All 50 states. 48-hour delivery.
        </p>

        {/* Price — above fold, prominent */}
        <div style={{
          background: '#fff',
          display: 'inline-block',
          padding: '32px 48px',
          margin: '32px 0',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{ color: '#6b7280', fontSize: '13px', letterSpacing: '1px', marginBottom: '4px' }}>HOA COMPLIANCE REPORT</div>
          <div style={{ color: '#1a2744', fontSize: '56px', fontWeight: 'bold', lineHeight: '1' }}>$39</div>
          <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>per report · all 50 states · 48-hour delivery</div>
          <button
            onClick={() => navigate('/order')}
            style={{
              background: '#1a2744',
              color: '#fff',
              border: 'none',
              padding: '16px 40px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              marginTop: '20px',
              fontFamily: 'Georgia, serif',
            }}
          >
            Order Now →
          </button>
        </div>

        {/* Key facts */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '16px' }}>
          {[
            { label: 'Compliance Standard', value: 'LL-2026-03' },
            { label: 'Delivery Time', value: '48 Hours' },
            { label: 'Coverage', value: 'All 50 States' },
            { label: 'Report Price', value: '$39' },
          ].map(f => (
            <div key={f.label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#c9a84c', fontSize: '22px', fontWeight: 'bold' }}>{f.value}</div>
              <div style={{ color: '#6b7280', fontSize: '12px', letterSpacing: '0.5px' }}>{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DEADLINE ALERT ─── */}
      <section style={{
        background: '#7f1d1d',
        padding: '24px 40px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#fca5a5', margin: 0, fontSize: '15px', fontWeight: 'bold' }}>
          ⚠️ COMPLIANCE DEADLINE: July 1, 2026 — Fannie Mae LL-2026-03 master policy deductible requirements take effect.
          HOAs not in compliance may lose mortgage warrantability. <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/order')}>Order your report today →</span>
        </p>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ padding: '80px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ color: '#1a2744', fontSize: '32px', textAlign: 'center', marginBottom: '48px' }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
          {[
            { step: '01', title: 'Submit Order', desc: 'Provide your HOA name, address, and state. Upload available HOA documents or we retrieve them.' },
            { step: '02', title: 'AI Analysis', desc: 'Our engine analyzes your HOA against all Fannie Mae LL-2026-03 requirements — reserve funding, insurance, delinquency, litigation, and more.' },
            { step: '03', title: 'Health Score', desc: 'Receive your HOA Health Score (0–100), warrantability status, and all compliance flags with specific citations.' },
            { step: '04', title: 'PDF Report', desc: 'Complete lender-ready PDF report delivered to your email within 48 hours. Valid for 90 days of mortgage underwriting.' },
          ].map(s => (
            <div key={s.step} style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{
                background: '#1a2744',
                color: '#c9a84c',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 auto 16px',
              }}>{s.step}</div>
              <h3 style={{ color: '#1a2744', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT WE CHECK ─── */}
      <section style={{ background: '#f8f7f4', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: '#1a2744', fontSize: '32px', textAlign: 'center', marginBottom: '8px' }}>
            Every Report Covers All LL-2026-03 Requirements
          </h2>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
            Fannie Mae Lender Letter LL-2026-03 — the mortgage compliance standard effective 2026
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              'Master insurance policy coverage and deductible',
              'Reserve fund percentage (current vs. required)',
              'Reserve study recency (required within 3 years)',
              'Pending litigation disclosure',
              'Owner delinquency rate (must be under 15%)',
              'Commercial space percentage (must be under 35%)',
              'Single-entity ownership concentration',
              'Owner-occupancy rate (minimum 50%)',
              'Special assessments analysis',
              'Structural deficiencies and deferred maintenance',
              'Form 1076 completeness score',
              'July 1, 2026 deadline compliance check',
            ].map(item => (
              <div key={item} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                background: '#fff',
                border: '1px solid #e0ddd5',
              }}>
                <span style={{ color: '#c9a84c', fontSize: '16px', flexShrink: 0 }}>✓</span>
                <span style={{ color: '#374151', fontSize: '14px' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: '80px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ color: '#1a2744', fontSize: '32px', textAlign: 'center', marginBottom: '48px' }}>Pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {/* Basic */}
          <div style={{ border: '2px solid #1a2744', padding: '32px' }}>
            <div style={{ color: '#6b7280', fontSize: '13px', letterSpacing: '1px', marginBottom: '8px' }}>BASIC</div>
            <div style={{ color: '#1a2744', fontSize: '48px', fontWeight: 'bold' }}>$39</div>
            <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>per report</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
              {['LL-2026-03 compliance check', 'HOA Health Score (0–100)', 'Reserve funding analysis', 'PDF report by email', '48-hour turnaround', 'All 50 states'].map(f => (
                <li key={f} style={{ color: '#374151', fontSize: '14px', padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#c9a84c' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/order')} style={{
              background: '#1a2744', color: '#fff', border: 'none', padding: '14px', width: '100%',
              fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif',
            }}>Order Now →</button>
          </div>

          {/* Professional */}
          <div style={{ border: '2px solid #c9a84c', padding: '32px', background: '#1a274408' }}>
            <div style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '1px', marginBottom: '8px' }}>PROFESSIONAL</div>
            <div style={{ color: '#1a2744', fontSize: '48px', fontWeight: 'bold' }}>$79</div>
            <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>per report</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
              {['Everything in Basic', 'Form 1076 auto-fill', 'Lender-ready documents', 'Risk flags with legal citations', '24-hour turnaround', 'Phone consult available'].map(f => (
                <li key={f} style={{ color: '#374151', fontSize: '14px', padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#c9a84c' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/order?product=professional')} style={{
              background: '#c9a84c', color: '#1a2744', border: 'none', padding: '14px', width: '100%',
              fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif',
            }}>Order Professional →</button>
          </div>

          {/* Enterprise */}
          <div style={{ border: '2px solid #2d3f6b', padding: '32px', background: '#1a274408' }}>
            <div style={{ color: '#6b7280', fontSize: '13px', letterSpacing: '1px', marginBottom: '8px' }}>ENTERPRISE</div>
            <div style={{ color: '#1a2744', fontSize: '48px', fontWeight: 'bold' }}>$299</div>
            <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>per month · unlimited reports</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
              {['Unlimited reports', 'API access', 'Bulk upload', 'White-label PDFs', 'Dedicated account manager', '4-hour SLA'].map(f => (
                <li key={f} style={{ color: '#374151', fontSize: '14px', padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#c9a84c' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <a href="mailto:peter@hoacondoinsight.com?subject=Enterprise Inquiry" style={{
              display: 'block', background: '#2d3f6b', color: '#fff', border: 'none', padding: '14px',
              width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif',
              textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box',
            }}>Contact for Enterprise →</a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#1a2744', padding: '48px 40px', color: '#9ca3af' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          <div>
            <div style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>HOACONDInsight™</div>
            <p style={{ fontSize: '13px', lineHeight: '1.6' }}>AI-powered HOA compliance analysis built for Fannie Mae LL-2026-03. Protecting lenders, title companies, and buyers.</p>
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Contact</div>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><a href="mailto:peter@hoacondoinsight.com" style={{ color: '#9ca3af', textDecoration: 'none' }}>peter@hoacondoinsight.com</a></div>
              <div>HOACONDInsight LLC</div>
              <div>61 N Lakeshore Dr</div>
              <div>Hypoluxo, FL 33462</div>
            </div>
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Legal</div>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a></div>
              <div><a href="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a></div>
              <div><a href="/disclaimer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Disclaimer</a></div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1000px', margin: '32px auto 0', paddingTop: '24px', borderTop: '1px solid #2d3f6b', fontSize: '12px', color: '#4b5563' }}>
          © 2026 HOACONDInsight LLC. All rights reserved. HOAInsight™ is a trademark of HOACONDInsight LLC.
          Reports are for informational purposes only and do not constitute legal or financial advice.
          Fannie Mae LL-2026-03 is a registered guideline of Fannie Mae. HOACONDInsight LLC is not affiliated with Fannie Mae.
          Patents pending: U.S. App. No. 64/081,022 and 64/082,247.
        </div>
      </footer>
    </div>
  );
}
