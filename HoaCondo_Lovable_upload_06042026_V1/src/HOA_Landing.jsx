/**
 * HOA_CODE_REBUILT - HOA_Landing.jsx
 * HOACONDInsight LLC - Peter Klein - Sole Owner
 * Version: 2.0 | Date: 2026-06-06
 * PURPOSE: Complete Fortune 100 redesign - all approved changes applied
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HOA_Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState({});
  const [activeTab, setActiveTab] = useState('lenders');
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const stats = [
    { value: '4,400', label: 'Lenders Mandated' },
    { value: '$0', label: 'Manual Review Cost' },
    { value: '<60s', label: 'Processing Time' },
    { value: '50', label: 'States Covered' },
  ];

  const regulators = [
    { name: 'Fannie Mae', abbr: 'FNMA' },
    { name: 'Freddie Mac', abbr: 'FHLMC' },
    { name: 'HUD', abbr: 'HUD' },
    { name: 'CFPB', abbr: 'CFPB' },
  ];

  const badges = [
    { icon: '⚖', text: '2 Patents Pending' },
    { icon: '🏛', text: 'USPTO Filed 2026' },
    { icon: '✓', text: 'Attorney Network' },
    { icon: '🗺', text: 'All 50 States' },
  ];

  const steps = [
    {
      num: '01',
      title: 'You Order a Report',
      time: '5 Minutes',
      desc: 'Enter the condo address. Select your role. Complete checkout. Our system immediately begins working on your behalf.',
      color: '#c8860b',
    },
    {
      num: '02',
      title: 'We Contact the HOA',
      time: 'Automated',
      desc: 'Our patent-pending Document Collection Engine automatically contacts the HOA management company requesting all 24 required documents. You do nothing.',
      color: '#1a6b2a',
    },
    {
      num: '03',
      title: 'AI Analysis Runs',
      time: 'Under 60 Seconds',
      desc: 'Our proprietary 6-factor AI model analyzes every document against Fannie Mae LL-2026-03. Form 1076 auto-populated. Health score 0–100 calculated.',
      color: '#1a2744',
    },
    {
      num: '04',
      title: 'Report Delivered',
      time: 'Instantly',
      desc: 'Your certified compliance report arrives by email the moment documents are received and processed. No waiting. No manual review.',
      color: '#7b2d8b',
    },
  ];

  const features = [
    {
      cat: 'COMPLIANCE',
      title: 'Fannie Mae Full Review Automation',
      desc: 'Complete automation of LL-2026-03 Full Review requirements. Every document checked, every field verified, every checklist item confirmed.',
    },
    {
      cat: 'INTELLIGENCE',
      title: 'Patent-Pending 6-Factor Scoring',
      desc: 'Proprietary HOA health score 0–100. Factors: reserve fund adequacy, delinquency rate, litigation exposure, insurance coverage, financial stability, owner-occupancy.',
    },
    {
      cat: 'DOCUMENTS',
      title: 'Automated Document Collection',
      desc: 'Our system contacts HOA management companies directly. Documents arrive automatically. No phone calls. No follow-up. No waiting.',
    },
    {
      cat: 'FORMS',
      title: 'Form 1076 Auto-Population',
      desc: 'Fannie Mae Form 1076 automatically completed from analysis results. Ready for lender submission. No manual data entry.',
    },
    {
      cat: 'PRIVACY',
      title: 'Buyer Protection Report',
      desc: 'Private analysis delivered only to the buyer. Never visible to the listing agent or seller. Protects buyer negotiating position.',
    },
    {
      cat: 'ENTERPRISE',
      title: 'White Label Deployment',
      desc: 'Full platform under your brand. Enterprise lenders and title companies deploy HOACONDInsight as their own compliance solution.',
    },
  ];

  const audiences = [
    {
      id: 'lenders',
      label: 'Mortgage Lenders',
      headline: 'Every Condo Loan. Fully Compliant. Automatically.',
      desc: 'Fannie Mae LL-2026-03 requires Full Review on every conventional condo loan. HOACONDInsight automates the entire process — eliminating manual review, attorney delays, and compliance risk.',
      cta: 'View Lender Programs',
      link: '/lenders',
      urgency: 'Compliance deadline: July 1, 2026',
    },
    {
      id: 'buyers',
      label: 'Home Buyers & Agents',
      headline: 'Know Everything About Your Condo Before You Close.',
      desc: 'Order a complete HOA health analysis for $79. Receive a full compliance report in minutes — not days. Attorney certification available as an optional add-on.',
      cta: 'Order a Report — $79',
      link: '/order',
      urgency: 'Most affordable option available — period',
    },
    {
      id: 'associations',
      label: 'HOA Associations',
      headline: 'Your Association. Always Compliant. Always Ready.',
      desc: 'Upload your documents once. Drop updates monthly. HOACONDInsight monitors your compliance status automatically — so your board is never caught unprepared.',
      cta: 'Set Up Association Portal',
      link: '/association-portal',
      urgency: 'Protect your board members personally',
    },
  ];

  const pricingTiers = [
    {
      name: 'Individual Report',
      price: '$79',
      period: 'one-time',
      desc: 'Perfect for buyers, agents, and single transactions',
      features: ['Full HOA analysis', 'Health score 0–100', 'Fannie Mae checklist', 'Form 1076 auto-filled', 'Email + download', 'Results in minutes'],
      cta: 'Order Now',
      highlight: false,
    },
    {
      name: 'Lender Branch',
      price: '$499',
      period: 'per month',
      desc: 'Up to 50 analyses/month with LOS integration',
      features: ['50 analyses/month', 'Basic LOS integration', 'Form 1076 auto-populated', 'Full report archive', 'Priority processing', 'Branch dashboard'],
      cta: 'Get Started',
      highlight: true,
    },
    {
      name: 'Lender Enterprise',
      price: '$3,999',
      period: 'per month',
      desc: 'Unlimited analyses with native Encompass integration',
      features: ['Unlimited analyses', 'Native Encompass + all LOS', 'Form 1076 auto-populated', 'Full report archive', 'Dedicated account manager', 'API access'],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#f8f7f4', minHeight: '100vh' }}>

      {/* COMPLIANCE DEADLINE BANNER */}
      <div style={{
        background: '#7b2d8b',
        color: '#fff',
        textAlign: 'center',
        padding: '10px 20px',
        fontSize: '13px',
        fontFamily: 'Georgia, serif',
        letterSpacing: '0.5px',
      }}>
        ⚠ FANNIE MAE LL-2026-03 MANDATE — EFFECTIVE NOW · July 1, 2026: Master Policy Deductible · January 4, 2027: Reserve Funding Minimum Increases
      </div>

      {/* NAVIGATION */}
      <nav style={{
        background: '#0d1829',
        padding: '0 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '72px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
            HOACOND<span style={{ color: '#c8860b' }}>Insight</span>™
          </span>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {['How It Works', 'Features', 'Pricing', 'Lenders', 'Associations'].map(item => (
            <a key={item} href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none', fontFamily: 'Georgia, serif' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#9ca3af'}
            >{item}</a>
          ))}
          <button
            onClick={() => navigate('/order')}
            style={{
              background: '#c8860b',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              fontSize: '14px',
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
          >
            Order a Report
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1829 0%, #1a2744 50%, #0d1829 100%)',
        padding: '100px 40px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background texture */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200,134,11,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(123,45,139,0.08) 0%, transparent 50%)',
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Category badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(200,134,11,0.15)',
            border: '1px solid rgba(200,134,11,0.4)',
            color: '#c8860b',
            padding: '6px 16px',
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '32px',
            fontFamily: 'Georgia, serif',
          }}>
            Patent Pending · USPTO 2026 · The First of Its Kind
          </div>

          <h1 style={{
            color: '#fff',
            fontSize: '58px',
            lineHeight: '1.1',
            marginBottom: '24px',
            fontWeight: 'bold',
            fontFamily: 'Georgia, serif',
          }}>
            The First Fully Automated<br />
            <span style={{ color: '#c8860b' }}>HOA Compliance</span><br />
            Fulfillment System
          </h1>

          <p style={{
            color: '#9ca3af',
            fontSize: '20px',
            lineHeight: '1.7',
            marginBottom: '40px',
            maxWidth: '650px',
            fontFamily: 'Georgia, serif',
          }}>
            Fannie Mae now requires Full Review on every conventional condo loan.
            HOACONDInsight automates the entire process — from document collection
            to certified report — in minutes, not days. All 50 states. The most
            affordable option available. Period.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '60px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/order')}
              style={{
                background: '#c8860b',
                color: '#fff',
                border: 'none',
                padding: '18px 40px',
                fontSize: '17px',
                fontFamily: 'Georgia, serif',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '2px',
                boxShadow: '0 4px 20px rgba(200,134,11,0.4)',
              }}
            >
              Order a Report — $79 →
            </button>
            <button
              onClick={() => navigate('/lenders')}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '18px 40px',
                fontSize: '17px',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              Enterprise Access →
            </button>
          </div>

          {/* STATISTICS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '48px',
          }}>
            {stats.map((stat, i) => (
              <div key={i}>
                <div style={{
                  color: '#c8860b',
                  fontSize: '52px',
                  fontWeight: 'bold',
                  fontFamily: 'Georgia, serif',
                  lineHeight: '1',
                  marginBottom: '8px',
                }}>
                  {stat.value}
                </div>
                <div style={{ color: '#6b7280', fontSize: '13px', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REGULATORY AUTHORITY BAR */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '24px 40px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <span style={{ color: '#6b7280', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}>
            Built for compliance with:
          </span>
          {regulators.map((r, i) => (
            <div key={i} style={{
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              padding: '8px 20px',
              borderRadius: '2px',
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              fontSize: '13px',
              color: '#1a2744',
              letterSpacing: '0.5px',
            }}>
              {r.abbr}
              <span style={{ display: 'block', fontSize: '9px', color: '#6b7280', fontWeight: 'normal', letterSpacing: '0' }}>{r.name}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {badges.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', fontFamily: 'Georgia, serif' }}>
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DOCUMENT COLLECTION ENGINE */}
      <div style={{ background: '#0d1829', padding: '80px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Patent-Pending Innovation
            </div>
            <h2 style={{ color: '#fff', fontSize: '42px', fontFamily: 'Georgia, serif', marginBottom: '16px' }}>
              The HOAInsight Document<br />Collection Engine
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '18px', fontFamily: 'Georgia, serif', maxWidth: '600px', margin: '0 auto' }}>
              We collect the documents. You just order.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                padding: '36px 28px',
                borderTop: `3px solid ${step.color}`,
                position: 'relative',
              }}>
                <div style={{ color: step.color, fontSize: '42px', fontWeight: 'bold', fontFamily: 'Georgia, serif', marginBottom: '16px', opacity: 0.4 }}>
                  {step.num}
                </div>
                <div style={{
                  background: step.color,
                  color: '#fff',
                  fontSize: '10px',
                  padding: '3px 10px',
                  display: 'inline-block',
                  marginBottom: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: 'Georgia, serif',
                }}>
                  {step.time}
                </div>
                <h3 style={{ color: '#fff', fontSize: '16px', fontFamily: 'Georgia, serif', marginBottom: '12px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '13px', fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '40px',
            background: 'rgba(200,134,11,0.1)',
            border: '1px solid rgba(200,134,11,0.3)',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ color: '#c8860b', fontSize: '24px' }}>⚡</span>
            <p style={{ color: '#c8860b', fontFamily: 'Georgia, serif', fontSize: '15px', margin: 0 }}>
              <strong>Industry first:</strong> Our system automatically contacts the HOA management company, 
              collects all 24 required documents, and processes your report — without any human involvement. 
              Once documents are received, your report is ready in under 60 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* AUDIENCE TABS */}
      <div style={{ background: '#f8f7f4', padding: '80px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Built for Everyone
            </div>
            <h2 style={{ color: '#1a2744', fontSize: '42px', fontFamily: 'Georgia, serif' }}>
              Enterprise Grade. Individual Accessible.
            </h2>
          </div>

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '40px', background: '#e5e7eb', padding: '2px' }}>
            {audiences.map(a => (
              <button
                key={a.id}
                onClick={() => setActiveTab(a.id)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: activeTab === a.id ? '#1a2744' : 'transparent',
                  color: activeTab === a.id ? '#fff' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  fontSize: '14px',
                  fontWeight: activeTab === a.id ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                }}
              >
                {a.label}
              </button>
            ))}
          </div>

          {audiences.filter(a => a.id === activeTab).map(a => (
            <div key={a.id} style={{
              background: '#fff',
              padding: '48px',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{
                display: 'inline-block',
                background: '#f0fdf4',
                color: '#1a6b2a',
                padding: '4px 12px',
                fontSize: '12px',
                marginBottom: '20px',
                fontFamily: 'Georgia, serif',
              }}>
                {a.urgency}
              </div>
              <h3 style={{ color: '#1a2744', fontSize: '32px', fontFamily: 'Georgia, serif', marginBottom: '16px' }}>
                {a.headline}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '17px', fontFamily: 'Georgia, serif', lineHeight: '1.7', marginBottom: '32px' }}>
                {a.desc}
              </p>
              <button
                onClick={() => navigate(a.link)}
                style={{
                  background: '#1a2744',
                  color: '#fff',
                  border: 'none',
                  padding: '16px 36px',
                  fontSize: '15px',
                  fontFamily: 'Georgia, serif',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {a.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES GRID */}
      <div style={{ background: '#fff', padding: '80px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              The Platform
            </div>
            <h2 style={{ color: '#1a2744', fontSize: '42px', fontFamily: 'Georgia, serif' }}>
              Every Tool for HOA Compliance<br />in a Single Platform
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#e5e7eb' }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: '#fff', padding: '36px', borderLeft: '3px solid #c8860b' }}>
                <div style={{ color: '#c8860b', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
                  {f.cat}
                </div>
                <h3 style={{ color: '#1a2744', fontSize: '18px', fontFamily: 'Georgia, serif', marginBottom: '12px' }}>
                  {f.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', fontFamily: 'Georgia, serif', lineHeight: '1.7' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ background: '#f8f7f4', padding: '80px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Pricing
            </div>
            <h2 style={{ color: '#1a2744', fontSize: '42px', fontFamily: 'Georgia, serif', marginBottom: '16px' }}>
              The Most Affordable Automated<br />HOA Compliance Available. Period.
            </h2>
            <p style={{ color: '#6b7280', fontSize: '17px', fontFamily: 'Georgia, serif' }}>
              No subscriptions required to start. Order a single report for $79 today.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', background: '#e5e7eb' }}>
            {pricingTiers.map((tier, i) => (
              <div key={i} style={{
                background: tier.highlight ? '#1a2744' : '#fff',
                padding: '40px 32px',
                position: 'relative',
              }}>
                {tier.highlight && (
                  <div style={{
                    position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                    background: '#c8860b', color: '#fff', padding: '4px 20px', fontSize: '11px',
                    letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Georgia, serif',
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ color: tier.highlight ? '#fff' : '#1a2744', fontSize: '18px', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
                  {tier.name}
                </h3>
                <p style={{ color: tier.highlight ? '#9ca3af' : '#6b7280', fontSize: '13px', fontFamily: 'Georgia, serif', marginBottom: '24px' }}>
                  {tier.desc}
                </p>
                <div style={{ marginBottom: '32px' }}>
                  <span style={{ color: tier.highlight ? '#c8860b' : '#1a2744', fontSize: '48px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                    {tier.price}
                  </span>
                  <span style={{ color: tier.highlight ? '#9ca3af' : '#6b7280', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
                    {' '}{tier.period}
                  </span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tier.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: tier.highlight ? '#d1d5db' : '#374151', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
                      <span style={{ color: '#c8860b', fontWeight: 'bold' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(tier.name === 'Individual Report' ? '/order' : '/lenders')}
                  style={{
                    width: '100%',
                    background: tier.highlight ? '#c8860b' : '#1a2744',
                    color: '#fff',
                    border: 'none',
                    padding: '16px',
                    fontSize: '15px',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
              Attorney Certification available as an optional add-on — $149. 
              <span style={{ color: '#9ca3af' }}> Fannie Mae LL-2026-03 does not require attorney review.</span>
            </p>
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div style={{ background: '#1a2744', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: '42px', fontFamily: 'Georgia, serif', marginBottom: '20px' }}>
            Start Your First Report Today
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '18px', fontFamily: 'Georgia, serif', marginBottom: '40px', lineHeight: '1.7' }}>
            Individual report $79 · Enterprise and association programs available · 
            All 50 states · No subscription required
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/order')}
              style={{
                background: '#c8860b',
                color: '#fff',
                border: 'none',
                padding: '18px 48px',
                fontSize: '17px',
                fontFamily: 'Georgia, serif',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(200,134,11,0.4)',
              }}
            >
              Order Your Report — $79
            </button>
            <button
              onClick={() => navigate('/sample')}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '18px 48px',
                fontSize: '17px',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
              }}
            >
              View Sample Report
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#0d1829', padding: '60px 40px 40px', color: '#6b7280' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '20px', fontFamily: 'Georgia, serif', fontWeight: 'bold', marginBottom: '12px' }}>
                HOACOND<span style={{ color: '#c8860b' }}>Insight</span>™
              </div>
              <p style={{ color: '#6b7280', fontSize: '13px', fontFamily: 'Georgia, serif', lineHeight: '1.7', marginBottom: '16px' }}>
                Powered by Hoa Condo Insight LLC<br />
                61 N Lakeshore Drive<br />
                Hypoluxo, Florida 33462<br />
                peter@hoacondoinsight.com<br />
                hoacondoinsight.com
              </p>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Platform</div>
              {['Home', 'Order Report', 'Features', 'How It Works', 'Pricing'].map(item => (
                <div key={item} style={{ marginBottom: '8px' }}>
                  <a href='#' style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia, serif' }}
                    onMouseEnter={e => e.target.style.color = '#c8860b'}
                    onMouseLeave={e => e.target.style.color = '#6b7280'}
                  >{item}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Enterprise</div>
              {['For Lenders', 'Partner Program', 'White Label', 'Association Portal', 'Join Attorney Network'].map(item => (
                <div key={item} style={{ marginBottom: '8px' }}>
                  <a href='#' style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia, serif' }}
                    onMouseEnter={e => e.target.style.color = '#c8860b'}
                    onMouseLeave={e => e.target.style.color = '#6b7280'}
                  >{item}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Legal</div>
              {['Terms of Service', 'Privacy Policy', 'Disclaimer', 'Cancellation Policy', 'Platform Status'].map(item => (
                <div key={item} style={{ marginBottom: '8px' }}>
                  <a href='#' style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia, serif' }}
                    onMouseEnter={e => e.target.style.color = '#c8860b'}
                    onMouseLeave={e => e.target.style.color = '#6b7280'}
                  >{item}</a>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '32px' }}>
            <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderLeft: '2px solid #c8860b' }}>
              <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
                Intellectual Property — Patent Applications Pending
              </div>
              <p style={{ color: '#4b5563', fontSize: '11px', fontFamily: 'Georgia, serif', lineHeight: '1.6', margin: 0 }}>
                Primary: U.S. Utility Patent Application No. 64/081,022 · Filed June 2, 2026 · Provisional<br />
                Secondary: U.S. Application No. 64/082,247 · Filed June 4, 2026 · Provisional
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ color: '#4b5563', fontSize: '12px', fontFamily: 'Georgia, serif', margin: 0 }}>
                HOACONDInsight™ · HOACondoInsight™ · Know the Risks Before You Sign™ — Trademarks Filed
              </p>
              <p style={{ color: '#4b5563', fontSize: '12px', fontFamily: 'Georgia, serif', margin: 0 }}>
                © 2026 Hoa Condo Insight LLC. All rights reserved. U.S. Patent App. Nos. 64/081,022 and 64/082,247
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HOA_Landing;
