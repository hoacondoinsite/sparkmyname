/**
 * HOA_CODE_07 — AdminLayout.jsx
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Admin OS layout with Future Growth tab added to sidebar.
 * Founder-only. Invisible to all other roles. 31 modules plus Future Growth.
 *
 * SOP (embedded per Founder Override):
 * 1. Replace src/pages/admin/AdminLayout.jsx with this file
 * 2. Future Growth tab only renders if user.role === 'founder'
 * 3. All 31 original modules preserved — Future Growth is tab 32
 * ROLLBACK: Revert to previous AdminLayout.jsx from GitHub history
 */

import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { usePlatform } from '../../HOA_App';

// ─────────────────────────────────────────────
// NAV ITEMS — 31 core modules
// ─────────────────────────────────────────────
const CORE_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '' },
  { id: 'orders', label: 'Orders', icon: '📋', path: 'orders' },
  { id: 'reports', label: 'Reports', icon: '📊', path: 'reports' },
  { id: 'customers', label: 'Customers', icon: '👤', path: 'customers' },
  { id: 'documents', label: 'Documents', icon: '📁', path: 'documents' },
  { id: 'analysis', label: 'AI Analysis', icon: '🤖', path: 'analysis' },
  { id: 'compliance', label: 'Compliance', icon: '✅', path: 'compliance' },
  { id: 'hoa-monitor', label: 'HOA Monitor', icon: '🏘️', path: 'hoa-monitor' },
  { id: 'form-1076', label: 'Form 1076', icon: '📝', path: 'form-1076' },
  { id: 'll-2026-03', label: 'LL-2026-03', icon: '⚖️', path: 'll-2026-03' },
  { id: 'revenue', label: 'Revenue', icon: '💰', path: 'revenue' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '🔄', path: 'subscriptions' },
  { id: 'stripe', label: 'Stripe', icon: '💳', path: 'stripe' },
  { id: 'email', label: 'Email', icon: '📧', path: 'email' },
  { id: 'marketing', label: 'Marketing', icon: '📣', path: 'marketing' },
  { id: 'prospects', label: 'Prospects', icon: '🎯', path: 'prospects' },
  { id: 'enterprise', label: 'Enterprise', icon: '🏢', path: 'enterprise' },
  { id: 'api', label: 'API Access', icon: '🔌', path: 'api' },
  { id: 'integrations', label: 'Integrations', icon: '⚙️', path: 'integrations' },
  { id: 'users', label: 'Users', icon: '👥', path: 'users' },
  { id: 'roles', label: 'Roles', icon: '🔑', path: 'roles' },
  { id: 'audit', label: 'Audit Log', icon: '📜', path: 'audit' },
  { id: 'patents', label: 'Patents', icon: '🏛️', path: 'patents' },
  { id: 'legal', label: 'Legal', icon: '⚖️', path: 'legal' },
  { id: 'ip', label: 'IP Assets', icon: '🔒', path: 'ip' },
  { id: 'vorrex', label: 'Vorrex LLC', icon: '🏗️', path: 'vorrex' },
  { id: 'valuation', label: 'Valuation', icon: '📈', path: 'valuation' },
  { id: 'investor', label: 'Investor', icon: '🤝', path: 'investor' },
  { id: 'platform', label: 'Platform OS', icon: '🖥️', path: 'platform' },
  { id: 'deployment', label: 'Deployment', icon: '🚀', path: 'deployment' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: 'settings' },
];

// Founder-only nav items
const FOUNDER_NAV = [
  { id: 'future-growth', label: 'Future Growth', icon: '🌱', path: 'future-growth', founderOnly: true },
  { id: 'founder-control', label: 'Founder Control', icon: '👑', path: 'founder-control', founderOnly: true },
];

// ─────────────────────────────────────────────
// ADMIN LAYOUT
// ─────────────────────────────────────────────
export default function AdminLayout() {
  const { user, isFounder, platformState } = usePlatform();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const allNav = isFounder ? [...CORE_NAV, ...FOUNDER_NAV] : CORE_NAV;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Georgia, serif' }}>
      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width: sidebarOpen ? '240px' : '60px',
        background: '#1a2744',
        borderRight: '1px solid #2d3f6b',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid #2d3f6b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
        }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>⊞</span>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#c9a84c', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>
                HOACONDInsight™
              </div>
              <div style={{ color: '#6b7280', fontSize: '10px' }}>Enterprise OS</div>
            </div>
          )}
        </div>

        {/* Platform mode badge */}
        {sidebarOpen && (
          <div style={{ padding: '8px 16px' }}>
            <div style={{
              background: platformState?.isLive ? '#14532d' : platformState?.isTesting ? '#713f12' : '#1e1b4b',
              color: platformState?.isLive ? '#4ade80' : platformState?.isTesting ? '#fbbf24' : '#a5b4fc',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'monospace',
              textAlign: 'center',
              letterSpacing: '1px',
            }}>
              {platformState?.mode || 'OFFLINE'}
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {/* Core modules */}
          {sidebarOpen && (
            <div style={{ padding: '8px 16px 4px', color: '#4b5563', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Platform
            </div>
          )}
          {CORE_NAV.map(item => (
            <NavLink
              key={item.id}
              to={`/admin/${item.path}`}
              end={item.path === ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                color: isActive ? '#c9a84c' : '#9ca3af',
                background: isActive ? '#0f172a40' : 'transparent',
                textDecoration: 'none',
                fontSize: '13px',
                borderLeft: isActive ? '3px solid #c9a84c' : '3px solid transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              })}
            >
              <span style={{ flexShrink: 0, fontSize: '14px' }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </NavLink>
          ))}

          {/* Founder-only section */}
          {isFounder && (
            <>
              {sidebarOpen && (
                <div style={{
                  padding: '12px 16px 4px',
                  color: '#c9a84c60',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  borderTop: '1px solid #2d3f6b',
                  marginTop: '8px',
                }}>
                  👑 Founder Only
                </div>
              )}
              {FOUNDER_NAV.map(item => (
                <NavLink
                  key={item.id}
                  to={`/admin/${item.path}`}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 16px',
                    color: isActive ? '#fbbf24' : '#d97706',
                    background: isActive ? '#78350f20' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '13px',
                    borderLeft: isActive ? '3px solid #fbbf24' : '3px solid transparent',
                    whiteSpace: 'nowrap',
                  })}
                >
                  <span style={{ flexShrink: 0, fontSize: '14px' }}>{item.icon}</span>
                  {sidebarOpen && item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid #2d3f6b',
            color: '#4b5563',
            fontSize: '11px',
          }}>
            <div>Peter Klein · Founder</div>
            <div style={{ color: '#374151', marginTop: '4px' }}>HOACONDInsight LLC</div>
          </div>
        )}
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{
        marginLeft: sidebarOpen ? '240px' : '60px',
        flex: 1,
        transition: 'margin-left 0.2s ease',
        minHeight: '100vh',
        background: '#0f172a',
      }}>
        {/* Top bar */}
        <div style={{
          background: '#1a2744',
          borderBottom: '1px solid #2d3f6b',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ color: '#e2e8f0', fontSize: '16px' }}>
            Enterprise OS Dashboard
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            {isFounder && (
              <div style={{
                background: '#78350f',
                color: '#fbbf24',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
              }}>
                👑 FOUNDER
              </div>
            )}
          </div>
        </div>

        {/* Route content */}
        <div style={{ padding: '32px' }}>
          <Routes>
            <Route path="/" element={<AdminDashboardHome />} />
            <Route path="future-growth" element={
              isFounder
                ? React.createElement(React.lazy(() => import('./HOA_AdminFutureGrowth')))
                : <Navigate to="/admin" replace />
            } />
            {/* All other routes render a placeholder — replace with real modules */}
            <Route path="*" element={<AdminModulePlaceholder />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// PLACEHOLDER COMPONENTS
// ─────────────────────────────────────────────
function AdminDashboardHome() {
  const { platformState } = usePlatform();
  const checks = platformState ? [
    { label: 'Database (Supabase)', ok: platformState.services?.supabase?.available },
    { label: 'Payments (Stripe)', ok: platformState.services?.stripe?.available },
    { label: 'AI Engine (OpenAI)', ok: platformState.services?.openai?.available },
    { label: 'Email (Resend)', ok: platformState.services?.resend?.available },
  ] : [];

  return (
    <div>
      <h1 style={{ color: '#c9a84c', fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '8px' }}>
        Enterprise OS — Command Center
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>HOACONDInsight LLC · Peter Klein · Sole Founder</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {checks.map(c => (
          <div key={c.label} style={{
            background: '#1a2744',
            border: `1px solid ${c.ok ? '#14532d' : '#7f1d1d'}`,
            borderRadius: '8px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{c.ok ? '✅' : '❌'}</div>
            <div style={{ color: '#e2e8f0', fontSize: '14px' }}>{c.label}</div>
            <div style={{ color: c.ok ? '#4ade80' : '#f87171', fontSize: '12px', marginTop: '4px' }}>
              {c.ok ? 'Connected' : 'Not configured'}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#1a2744',
        border: '1px solid #2d3f6b',
        borderRadius: '8px',
        padding: '24px',
      }}>
        <h3 style={{ color: '#c9a84c', marginBottom: '16px' }}>Compliance Deadlines</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { date: 'July 1, 2026', label: 'Master policy deductible requirements — LL-2026-03', urgent: true },
            { date: 'January 4, 2027', label: 'Reserve funding minimum 10% → 15% — LL-2026-03', urgent: false },
            { date: 'June 2, 2027', label: 'Nonprovisional patent deadline — App 64/081,022', urgent: false },
          ].map(d => (
            <div key={d.date} style={{
              display: 'flex',
              gap: '16px',
              padding: '12px',
              background: d.urgent ? '#7f1d1d20' : '#0f172a',
              borderRadius: '6px',
              borderLeft: `3px solid ${d.urgent ? '#dc2626' : '#2d3f6b'}`,
            }}>
              <div style={{ color: d.urgent ? '#f87171' : '#9ca3af', fontSize: '13px', minWidth: '130px', fontFamily: 'monospace' }}>{d.date}</div>
              <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminModulePlaceholder() {
  return (
    <div style={{ color: '#6b7280', padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔧</div>
      <div style={{ color: '#9ca3af', fontSize: '16px' }}>Module coming soon</div>
      <div style={{ color: '#4b5563', fontSize: '13px', marginTop: '8px' }}>This module is in the OS build queue</div>
    </div>
  );
}
