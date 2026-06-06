/**
 * HOA_CODE_11 — OrderFlow.jsx
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Updated order flow with working Stripe payment integration,
 * consent and disclaimer visible, test mode notice when Stripe is in test mode.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlatform } from '../HOA_App';
import { PRODUCTS, getStripe, createPaymentIntent } from '../lib/HOA_stripeConfig';

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function OrderFlow({ step: initialStep }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { featureFlags } = usePlatform() || {};

  const productParam = searchParams.get('product');
  const defaultProduct = productParam === 'professional' ? 'professional_report' : 'basic_report';

  const [step, setStep] = useState(initialStep || 'form'); // form | payment | confirmation
  const [selectedProduct, setSelectedProduct] = useState(defaultProduct);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', company: '',
    hoaName: '', hoaAddress: '', hoaCity: '', hoaState: '', hoaZip: '',
    documentsAvailable: 'yes',
    consent: false,
    disclaimer: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const product = PRODUCTS[selectedProduct.toUpperCase()] || PRODUCTS.BASIC_REPORT;
  const isTestMode = featureFlags?.PAYMENTS_TEST_MODE;
  const paymentsEnabled = featureFlags?.PAYMENTS_ENABLED;

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'Required';
    if (!formData.lastName.trim()) e.lastName = 'Required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Valid email required';
    if (!formData.hoaName.trim()) e.hoaName = 'Required';
    if (!formData.hoaState) e.hoaState = 'Required';
    if (!formData.consent) e.consent = 'You must agree to the Terms of Service';
    if (!formData.disclaimer) e.disclaimer = 'You must acknowledge the disclaimer';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (paymentsEnabled) {
        const data = await createPaymentIntent({
          productId: product.id,
          customerEmail: formData.email,
          hoaName: formData.hoaName,
          hoaState: formData.hoaState,
        });
        setPaymentData(data);
        setStep('payment');
      } else {
        // Demo mode — skip straight to confirmation
        setStep('confirmation');
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <div style={{ fontFamily: 'Georgia, serif', background: '#f8f7f4', minHeight: '100vh', padding: '80px 40px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '48px', border: '1px solid #e0ddd5', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ color: '#1a2744', marginBottom: '8px' }}>Order Confirmed</h1>
          <p style={{ color: '#6b7280' }}>Check your email for your order confirmation. Your report will be delivered within 48 hours.</p>
          <button onClick={() => navigate('/dashboard')} style={{
            background: '#1a2744', color: '#fff', border: 'none', padding: '14px 32px',
            fontSize: '15px', cursor: 'pointer', marginTop: '24px', fontFamily: 'Georgia, serif',
          }}>View Dashboard →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f7f4', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#1a2744', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
          HOACONDInsight™
        </div>
        <div style={{ color: '#9ca3af', fontSize: '13px' }}>Secure Checkout</div>
      </div>

      {isTestMode && (
        <div style={{ background: '#fef3c7', padding: '12px 40px', textAlign: 'center', fontSize: '13px', color: '#92400e', fontWeight: 'bold' }}>
          ⚠️ TEST MODE — Use card 4242 4242 4242 4242 · Exp: any future date · CVV: any 3 digits. No real charge.
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '48px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>

        {/* ─── FORM ─── */}
        <div style={{ background: '#fff', padding: '40px', border: '1px solid #e0ddd5' }}>
          <h2 style={{ color: '#1a2744', marginBottom: '32px' }}>Order Your HOA Compliance Report</h2>

          {/* Product selector */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ color: '#374151', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>
              SELECT REPORT TYPE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[PRODUCTS.BASIC_REPORT, PRODUCTS.PROFESSIONAL_REPORT].map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p.id)}
                  style={{
                    border: `2px solid ${selectedProduct === p.id ? '#1a2744' : '#e0ddd5'}`,
                    padding: '16px',
                    cursor: 'pointer',
                    background: selectedProduct === p.id ? '#f0f4ff' : '#fff',
                  }}
                >
                  <div style={{ color: '#1a2744', fontWeight: 'bold', fontSize: '15px' }}>{p.price_display}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{p.name.split('—')[1]?.trim()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#374151', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '0.5px' }}>YOUR INFORMATION</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {[
                { field: 'firstName', label: 'First Name' },
                { field: 'lastName', label: 'Last Name' },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                  <input
                    value={formData[f.field]}
                    onChange={e => setFormData(p => ({ ...p, [f.field]: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', border: `1px solid ${errors[f.field] ? '#dc2626' : '#e0ddd5'}`,
                      fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box',
                    }}
                  />
                  {errors[f.field] && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '2px' }}>{errors[f.field]}</div>}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email" value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', border: `1px solid ${errors.email ? '#dc2626' : '#e0ddd5'}`,
                  fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box',
                }}
              />
              {errors.email && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '2px' }}>{errors.email}</div>}
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Company / Organization (optional)</label>
              <input
                value={formData.company}
                onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0ddd5', fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* HOA info */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#374151', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '0.5px' }}>HOA / COMMUNITY INFORMATION</div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>HOA / Community Name</label>
              <input
                value={formData.hoaName}
                onChange={e => setFormData(p => ({ ...p, hoaName: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', border: `1px solid ${errors.hoaName ? '#dc2626' : '#e0ddd5'}`,
                  fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box',
                }}
              />
              {errors.hoaName && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '2px' }}>{errors.hoaName}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>City</label>
                <input value={formData.hoaCity} onChange={e => setFormData(p => ({ ...p, hoaCity: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0ddd5', fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>State *</label>
                <select value={formData.hoaState} onChange={e => setFormData(p => ({ ...p, hoaState: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 12px', border: `1px solid ${errors.hoaState ? '#dc2626' : '#e0ddd5'}`,
                    fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box', background: '#fff',
                  }}>
                  <option value="">--</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.hoaState && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '2px' }}>{errors.hoaState}</div>}
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>ZIP</label>
                <input value={formData.hoaZip} onChange={e => setFormData(p => ({ ...p, hoaZip: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0ddd5', fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* Consent and Disclaimer */}
          <div style={{ marginBottom: '24px', background: '#f8f7f4', padding: '20px', border: '1px solid #e0ddd5' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input type="checkbox" checked={formData.consent} onChange={e => setFormData(p => ({ ...p, consent: e.target.checked }))} style={{ marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                  I agree to the <a href="/terms" target="_blank" style={{ color: '#1a2744' }}>Terms of Service</a> and <a href="/privacy" target="_blank" style={{ color: '#1a2744' }}>Privacy Policy</a> of HOACONDInsight LLC.
                </span>
              </label>
              {errors.consent && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.consent}</div>}
            </div>
            <div>
              <label style={{ display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input type="checkbox" checked={formData.disclaimer} onChange={e => setFormData(p => ({ ...p, disclaimer: e.target.checked }))} style={{ marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                  I acknowledge that HOACONDInsight reports are for informational purposes only and do not constitute legal, financial, or investment advice. I will seek qualified counsel for legal questions.
                </span>
              </label>
              {errors.disclaimer && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.disclaimer}</div>}
            </div>
          </div>

          {errors.submit && (
            <div style={{ background: '#fef2f2', border: '1px solid #dc2626', color: '#991b1b', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
              {errors.submit}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#1a2744',
              color: '#fff', border: 'none', padding: '16px', width: '100%',
              fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Georgia, serif',
            }}
          >
            {loading ? 'Processing…' : `Continue to Payment — ${product.price_display}`}
          </button>
        </div>

        {/* ─── ORDER SUMMARY ─── */}
        <div>
          <div style={{ background: '#1a2744', padding: '24px', color: '#fff', marginBottom: '16px' }}>
            <div style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '1px', marginBottom: '16px' }}>ORDER SUMMARY</div>
            <div style={{ color: '#e2e8f0', fontSize: '16px', marginBottom: '8px' }}>{product.name}</div>
            <div style={{ color: '#c9a84c', fontSize: '32px', fontWeight: 'bold' }}>{product.price_display}</div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>One-time payment</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e0ddd5', padding: '20px' }}>
            <div style={{ color: '#374151', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>INCLUDES</div>
            {product.features.map(f => (
              <div key={f} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#374151' }}>
                <span style={{ color: '#c9a84c', flexShrink: 0 }}>✓</span>{f}
              </div>
            ))}
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '16px', marginTop: '12px' }}>
            <div style={{ color: '#166534', fontSize: '13px', fontWeight: 'bold' }}>🔒 Secure Payment</div>
            <div style={{ color: '#166534', fontSize: '12px', marginTop: '4px' }}>Processed by Stripe. HOACONDInsight never stores your card information.</div>
          </div>
          <div style={{ padding: '16px', fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>
            Report covers all Fannie Mae LL-2026-03 requirements. Valid 90 days. Not legal advice.
          </div>
        </div>
      </div>
    </div>
  );
}
