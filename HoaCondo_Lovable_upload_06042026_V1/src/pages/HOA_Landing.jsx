/**
 * HOA_Landing.jsx
 * HOACondoInsight LLC — Peter Klein, Sole Owner
 * Version: 3.0 | Date: 2026-06-06
 * Fortune 100 Redesign — Full Update Applied
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HOA_Landing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lenders');
  const [isVisible, setIsVisible] = useState({});
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
    { value: '4,400+', label: 'Lenders Now Mandated', sub: 'by Fannie Mae LL-2026-03' },
    { value: '$0', label: 'Manual Review Cost', sub: 'Fully automated processing' },
    { value: '<60s', label: 'Report Processing', sub: 'Once documents received' },
    { value: '50', label: 'States Covered', sub: 'Every U.S. jurisdiction' },
  ];

  const regulators = [
    { name: 'Fannie Mae', abbr: 'FNMA', sub: 'LL-2026-03 Mandate' },
    { name: 'Freddie Mac', abbr: 'FHLMC', sub: 'Bulletin 2024-6' },
    { name: 'HUD', abbr: 'HUD', sub: 'FHA Condo Rules' },
    { name: 'CFPB', abbr: 'CFPB', sub: 'Consumer Protection' },
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
      desc: 'Enter the condo address. Select your role. Complete checkout. Our Document Collection Engine immediately begins working on your behalf.',
      color: '#c8860b',
    },
    {
      num: '02',
      title: 'We Contact the HOA',
      time: 'Automated',
      desc: 'Our patent-pending system automatically contacts the HOA management company — by phone, email, and certified letter — requesting all 24 required documents. You do nothing.',
      color: '#1a6b2a',
    },
    {
      num: '03',
      title: 'AI Analysis Runs',
      time: 'Under 60 Seconds',
      desc: 'Our proprietary 6-factor AI model analyzes every document against Fannie Mae LL-2026-03. Form 1076 auto-populated. HOA health score 0–100 calculated instantly.',
      color: '#1a2744',
    },
    {
      num: '04',
      title: 'Report Delivered',
      time: 'Instant Delivery',
      desc: 'Your certified compliance report arrives by email the instant documents are received and processed. No waiting. No manual review. No delays.',
      color: '#7b2d8b',
    },
  ];

  const features = [
    {
      cat: 'COMPLIANCE',
      title: 'Fannie Mae Full Review Automation',
      desc: 'Complete automation of LL-2026-03 Full Review requirements. Every document checked, every field verified, every checklist item confirmed — instantly.',
    },
    {
      cat: 'INTELLIGENCE',
      title: 'Patent-Pending 6-Factor Scoring',
      desc: 'Proprietary HOA health score 0–100. Factors: reserve fund adequacy, delinquency rate, litigation exposure, insurance coverage, financial stability, owner-occupancy.',
    },
    {
      cat: 'DOCUMENTS',
      title: 'Automated Document Collection',
      desc: 'Our system contacts HOA management companies directly via phone, email, and certified mail. Documents arrive automatically. No phone calls. No follow-up. No waiting.',
    },
    {
      cat: 'FORMS',
      title: 'Form 1076 Auto-Population',
      desc: 'Fannie Mae Form 1076 automatically completed from analysis results. Ready for lender submission. No manual data entry required.',
    },
    {
      cat: 'PRIVACY',
      title: 'Buyer Protection Report',
      desc: 'Private analysis delivered only to the buyer. Never visible to the listing agent or seller. Protects buyer negotiating position completely.',
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
      desc: 'Fannie Mae LL-2026-03 requires Full Review on every conventional condo loan. HOACONDInsight automates the entire process — eliminating manual review, attorney delays, and compliance risk. Results are instant.',
      cta: 'View Lender Programs',
      link: '/lenders',
      urgency: 'Compliance deadline: July 1, 2026',
    },
    {
      id: 'buyers',
      label: 'Home Buyers & Agents',
      headline: 'Know Everything About Your Condo Before You Close.',
      desc: 'Order a complete HOA health analysis for $79. Receive a full compliance report instantly — not in days. Attorney certification is available as an optional add-on at $149 and is not required by Fannie Mae LL-2026-03.',
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
      features: [
        'Full HOA analysis',
        'Health score 0–100',
        'Fannie Mae checklist',
        'Form 1076 auto-filled',
        'Email + download',
        'Instant processing',
      ],
      cta: 'Order Now — $79',
      highlight: false,
    },
    {
      name: 'Lender Branch',
      price: '$499',
      period: 'per month',
      desc: 'Up to 50 analyses/month with LOS integration',
      features: [
        '50 analyses/month',
        'Basic LOS integration',
        'Form 1076 auto-populated',
        'Full report archive',
        'Priority processing',
        'Branch dashboard',
      ],
      cta: 'Get Started',
      highlight: true,
    },
    {
      name: 'Lender Enterprise',
      price: '$3,999',
      period: 'per month',
      desc: 'Unlimited analyses with native Encompass integration',
      features: [
        'Unlimited analyses',
        'Native Encompass + all LOS',
        'Form 1076 auto-populated',
        'Full report archive',
        'Dedicated account manager',
        'API access',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#f8f7f4', minHeight: '100vh' }}>

      {/* ─── DUAL DEADLINE BANNER ─── */}
      <div style={{
        background: '#0d1829',
        borderBottom: '1px solid rgba(200,134,11,0.3)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{
            background: '#7b1d1d',
            color: '#fff',
            padding: '12px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: '1 1 300px',
            justifyContent: 'center',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          }}>
            <span style={{ fontSize: '18px' }}>⚠</span>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, fontFamily: 'Georgia, serif' }}>
                FANNIE MAE DEADLINE #1
              </div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                July 1, 2026 — Master Policy Deductible Requirement
              </div>
            </div>
          </div>
          <div style={{
            background: '#7b2d00',
            color: '#fff',
            padding: '12px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: '1 1 300px',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '18px' }}>⚠</span>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, fontFamily: 'Georgia, serif' }}>
                FANNIE MAE DEADLINE #2
              </div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                January 4, 2027 — Reserve Funding Minimum Increases
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION ─── */}
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
            <a
              key={item}
              href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none', fontFamily: 'Georgia, serif' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#9ca3af'}
            >
              {item}
            </a>
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
            Order a Report — $79
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1829 0%, #1a2744 50%, #0d1829 100%)',
        padding: '100px 40px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200,134,11,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(123,45,139,0.08) 0%, transparent 50%)',
        }} />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
            fontSize: '62px',
            lineHeight: '1.1',
            marginBottom: '24px',
            fontWeight: 'bold',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.5px',
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
            maxWidth: '680px',
            fontFamily: 'Georgia, serif',
          }}>
            Fannie Mae now requires Full Review on every conventional condo loan.
            HOACONDInsight automates the entire process — from document collection
            to certified report — instantly, not in days. All 50 states. The most
            affordable option available. Period.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '80px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/order')}
              style={{
                background: '#c8860b',
                color: '#fff',
                border: 'none',
                padding: '20px 48px',
                fontSize: '18px',
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
                padding: '20px 48px',
                fontSize: '18px',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              Enterprise Access →
            </button>
          </div>

          {/* ─── STATISTICS — LARGE & BOLD ─── */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '60px',
          }}>
            <div style={{
              display: 'inline-block',
              color: '#6b7280',
              fontSize: '10px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '40px',
              fontFamily: 'Georgia, serif',
            }}>
              By the Numbers
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {stats.map((stat, i) => (
                <div key={i} style={{
                  padding: '40px 32px',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  position: 'relative',
                }}>
                  <div style={{
                    color: '#c8860b',
                    fontSize: '88px',
                    fontWeight: 'bold',
                    fontFamily: 'Georgia, serif',
                    lineHeight: '1',
                    marginBottom: '12px',
                    letterSpacing: '-2px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    color: '#e5e7eb',
                    fontSize: '15px',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                    letterSpacing: '0.3px',
                  }}>
                    {stat.label}
                  </div>
                  <div style={{
                    color: '#6b7280',
                    fontSize: '12px',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '0.3px',
                  }}>
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── REGULATORY AUTHORITY BAR ─── */}
      <div style={{
        background: '#fff',
        borderBottom: '2px solid #e5e7eb',
        padding: '0 40px',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '0',
            flexWrap: 'wrap',
            borderLeft: '1px solid #e5e7eb',
          }}>
            <div style={{
              padding: '28px 32px',
              borderRight: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
            }}>
              <span style={{
                color: '#6b7280',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontFamily: 'Georgia, serif',
                whiteSpace: 'nowrap',
              }}>
                Built for compliance<br />with:
              </span>
            </div>
            {regulators.map((r, i) => (
              <div key={i} style={{
                padding: '20px 28px',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: '0 0 auto',
                background: '#fafafa',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#1a2744',
                }} />
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  color: '#1a2744',
                  letterSpacing: '1px',
                }}>
                  {r.abbr}
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'Georgia, serif', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: '9px', color: '#c8860b', fontFamily: 'Georgia, serif', marginTop: '2px', letterSpacing: '0.5px' }}>
                  {r.sub}
                </div>
              </div>
            ))}
            <div style={{
              padding: '20px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              flexWrap: 'wrap',
              flex: 1,
              justifyContent: 'flex-end',
            }}>
              {badges.map((b, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#374151',
                  fontFamily: 'Georgia, serif',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: '14px' }}>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── DOCUMENT COLLECTION ENGINE ─── */}
      <div style={{ background: '#0d1829', padding: '100px 40px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '70px' }}>
            <div style={{
              color: '#c8860b',
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontFamily: 'Georgia, serif',
            }}>
              Patent-Pending Innovation
            </div>
            <h2 style={{
              color: '#fff',
              fontSize: '48px',
              fontFamily: 'Georgia, serif',
              marginBottom: '20px',
              lineHeight: '1.15',
            }}>
              The HOAInsight Document<br />
              <span style={{ color: '#c8860b' }}>Collection Engine</span>
            </h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '19px',
              fontFamily: 'Georgia, serif',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: '1.7',
            }}>
              We automatically contact the HOA management company to collect
              every required document on your behalf. You order. We handle everything else.
            </p>
          </div>

          {/* How It Works Steps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2px',
            marginBottom: '40px',
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                padding: '40px 28px',
                borderTop: `4px solid ${step.color}`,
                position: 'relative',
              }}>
                <div style={{
                  color: step.color,
                  fontSize: '48px',
                  fontWeight: 'bold',
                  fontFamily: 'Georgia, serif',
                  marginBottom: '16px',
                  opacity: 0.35,
                  lineHeight: 1,
                }}>
                  {step.num}
                </div>
                <div style={{
                  background: step.color,
                  color: '#fff',
                  fontSize: '10px',
                  padding: '4px 12px',
                  display: 'inline-block',
                  marginBottom: '14px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: 'Georgia, serif',
                }}>
                  {step.time}
                </div>
                <h3 style={{
                  color: '#fff',
                  fontSize: '17px',
                  fontFamily: 'Georgia, serif',
                  marginBottom: '12px',
                  lineHeight: '1.3',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '13px',
                  fontFamily: 'Georgia, serif',
                  lineHeight: '1.7',
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Collection Engine Callout */}
          <div style={{
            background: 'rgba(200,134,11,0.08)',
            border: '1px solid rgba(200,134,11,0.35)',
            padding: '32px 40px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
          }}>
            <span style={{ color: '#c8860b', fontSize: '32px', flexShrink: 0, marginTop: '2px' }}>⚡</span>
            <div>
              <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
                Industry First
              </div>
              <p style={{ color: '#d1d5db', fontFamily: 'Georgia, serif', fontSize: '16px', margin: 0, lineHeight: '1.7' }}>
                Our Document Collection Engine automatically contacts the HOA management company
                via phone, email, and certified letter — collecting all 24 Fannie Mae-required
                documents with zero human involvement. Once documents are received, your report
                is generated and delivered in under 60 seconds. No other service in the country
                does this automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── AUDIENCE TABS ─── */}
      <div style={{ background: '#f8f7f4', padding: '100px 40px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Built for Everyone
            </div>
            <h2 style={{ color: '#1a2744', fontSize: '46px', fontFamily: 'Georgia, serif' }}>
              Enterprise Grade. Individual Accessible.
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '2px', marginBottom: '40px', background: '#e5e7eb', padding: '2px' }}>
            {audiences.map(a => (
              <button
                key={a.id}
                onClick={() => setActiveTab(a.id)}
                style={{
                  flex: 1,
                  padding: '16px',
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
              padding: '56px',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid #1a2744',
            }}>
              <div style={{
                display: 'inline-block',
                background: '#f0fdf4',
                color: '#1a6b2a',
                padding: '5px 14px',
                fontSize: '12px',
                marginBottom: '24px',
                fontFamily: 'Georgia, serif',
                border: '1px solid #bbf7d0',
              }}>
                {a.urgency}
              </div>
              <h3 style={{ color: '#1a2744', fontSize: '34px', fontFamily: 'Georgia, serif', marginBottom: '18px', lineHeight: '1.2' }}>
                {a.headline}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '18px', fontFamily: 'Georgia, serif', lineHeight: '1.7', marginBottom: '36px', maxWidth: '700px' }}>
                {a.desc}
              </p>
              <button
                onClick={() => navigate(a.link)}
                style={{
                  background: '#1a2744',
                  color: '#fff',
                  border: 'none',
                  padding: '18px 40px',
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

      {/* ─── FEATURES GRID ─── */}
      <div style={{ background: '#fff', padding: '100px 40px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              The Platform
            </div>
            <h2 style={{ color: '#1a2744', fontSize: '46px', fontFamily: 'Georgia, serif' }}>
              Every Tool for HOA Compliance<br />in a Single Platform
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#e5e7eb' }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: '#fff', padding: '40px', borderLeft: '3px solid #c8860b' }}>
                <div style={{ color: '#c8860b', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
                  {f.cat}
                </div>
                <h3 style={{ color: '#1a2744', fontSize: '19px', fontFamily: 'Georgia, serif', marginBottom: '12px', lineHeight: '1.3' }}>
                  {f.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PRICING ─── */}
      <div style={{ background: '#f8f7f4', padding: '100px 40px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Pricing
            </div>
            <h2 style={{ color: '#1a2744', fontSize: '46px', fontFamily: 'Georgia, serif', marginBottom: '16px' }}>
              The Most Affordable Automated<br />HOA Compliance Available. Period.
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', fontFamily: 'Georgia, serif' }}>
              No subscription required to start. Order a single report for $79 today.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', background: '#e5e7eb' }}>
            {pricingTiers.map((tier, i) => (
              <div key={i} style={{
                background: tier.highlight ? '#1a2744' : '#fff',
                padding: '48px 36px',
                position: 'relative',
              }}>
                {tier.highlight && (
                  <div style={{
                    position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                    background: '#c8860b', color: '#fff', padding: '5px 24px', fontSize: '11px',
                    letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Georgia, serif',
                    whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ color: tier.highlight ? '#fff' : '#1a2744', fontSize: '19px', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
                  {tier.name}
                </h3>
                <p style={{ color: tier.highlight ? '#9ca3af' : '#6b7280', fontSize: '13px', fontFamily: 'Georgia, serif', marginBottom: '28px' }}>
                  {tier.desc}
                </p>
                <div style={{ marginBottom: '36px' }}>
                  <span style={{ color: tier.highlight ? '#c8860b' : '#1a2744', fontSize: '56px', fontWeight: 'bold', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                    {tier.price}
                  </span>
                  <span style={{ color: tier.highlight ? '#9ca3af' : '#6b7280', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
                    {' '}{tier.period}
                  </span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tier.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: tier.highlight ? '#d1d5db' : '#374151', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
                      <span style={{ color: '#c8860b', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
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
                    padding: '18px',
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

          {/* Attorney Optional Add-On Callout */}
          <div style={{
            marginTop: '32px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderLeft: '4px solid #7b2d8b',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
          }}>
            <span style={{ color: '#7b2d8b', fontSize: '24px', flexShrink: 0 }}>⚖</span>
            <div>
              <div style={{ color: '#7b2d8b', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                Optional Attorney Review Add-On — $149
              </div>
              <p style={{ color: '#374151', fontFamily: 'Georgia, serif', fontSize: '14px', margin: 0, lineHeight: '1.7' }}>
                Attorney certification is available as an optional add-on at $149 per report and can be added at checkout.{' '}
                <strong style={{ color: '#1a2744' }}>Attorney review is not required by Fannie Mae LL-2026-03.</strong>{' '}
                Our automated compliance report is fully compliant without it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CTA SECTION ─── */}
      <div style={{ background: '#1a2744', padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: '46px', fontFamily: 'Georgia, serif', marginBottom: '20px', lineHeight: '1.2' }}>
            Start Your First Report Today
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '18px', fontFamily: 'Georgia, serif', marginBottom: '48px', lineHeight: '1.7' }}>
            Individual report $79 · Instant processing · Enterprise and association
            programs available · All 50 states · No subscription required
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/order')}
              style={{
                background: '#c8860b',
                color: '#fff',
                border: 'none',
                padding: '20px 56px',
                fontSize: '18px',
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
                padding: '20px 56px',
                fontSize: '18px',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
              }}
            >
              View Sample Report
            </button>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#0d1829', padding: '72px 40px 48px', color: '#6b7280' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '56px' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '20px', fontFamily: 'Georgia, serif', fontWeight: 'bold', marginBottom: '16px' }}>
                HOACOND<span style={{ color: '#c8860b' }}>Insight</span>™
              </div>
              <p style={{ color: '#6b7280', fontSize: '13px', fontFamily: 'Georgia, serif', lineHeight: '1.8', marginBottom: '16px' }}>
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
                <div key={item} style={{ marginBottom: '10px' }}>
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
                <div key={item} style={{ marginBottom: '10px' }}>
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
                <div key={item} style={{ marginBottom: '10px' }}>
                  <a href='#' style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia, serif' }}
                    onMouseEnter={e => e.target.style.color = '#c8860b'}
                    onMouseLeave={e => e.target.style.color = '#6b7280'}
                  >{item}</a>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '36px' }}>
            <div style={{
              marginBottom: '20px',
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.03)',
              borderLeft: '2px solid #c8860b',
            }}>
              <div style={{ color: '#c8860b', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'Georgia, serif' }}>
                Intellectual Property — Patent Applications Pending
              </div>
              <p style={{ color: '#4b5563', fontSize: '11px', fontFamily: 'Georgia, serif', lineHeight: '1.7', margin: 0 }}>
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
