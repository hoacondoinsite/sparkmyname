/**
 * AdminLayout.jsx
 * HOACONDInsight™ Admin OS Layout
 * Modified: June 5, 2026
 * Change: Added Governance module to Admin sidebar (Rule-002 version stamp)
 * Authorized by: Peter Klein, Founder
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminOverview from './AdminOverview.jsx';
import AdminDeploymentControl from './AdminDeploymentControl.jsx';
import AdminCommunications from './AdminCommunications.jsx';
import AdminSecurity from './AdminSecurity.jsx';
import AdminTechUpdates from './AdminTechUpdates.jsx';
import AdminSopValidator from './AdminSopValidator.jsx';
import AdminAnalyses from './AdminAnalyses.jsx';
import AdminAttorneys from './AdminAttorneys.jsx';
import AdminAI from './AdminAI.jsx';
import AdminAutonomous from './AdminAutonomous.jsx';
import AdminFinance from './AdminFinance.jsx';
import AdminHR from './AdminHR.jsx';
import AdminLegal from './AdminLegal.jsx';
import AdminMarketing from './AdminMarketing.jsx';
import AdminOutreach from './AdminOutreach.jsx';
import AdminLenders from './AdminLenders.jsx';
import AdminPartners from './AdminPartners.jsx';
import AdminInsurance from './AdminInsurance.jsx';
import AdminPE from './AdminPE.jsx';
import AdminVendors from './AdminVendors.jsx';
import AdminWhiteLabel from './AdminWhiteLabel.jsx';
import AdminInternational from './AdminInternational.jsx';
import AdminMediaPR from './AdminMediaPR.jsx';
import AdminSettings from './AdminSettings.jsx';
import AdminSystemUpdates from './AdminSystemUpdates.jsx';
import AdminIntegrationSync from './AdminIntegrationSync.jsx';
import AdminLegalCompliance from './AdminLegalCompliance.jsx';
import AdminLivingAI from './AdminLivingAI.jsx';
import AdminGovernance from './AdminGovernance.jsx';

const GROUPS = [
  {
    label: 'Core',
    items: [
      { id:'overview',    icon:'◎', label:'Overview',          component: AdminOverview },
      { id:'deploy',      icon:'⊕', label:'Deployment',        component: AdminDeploymentControl, restricted:true },
      { id:'governance',  icon:'⚖', label:'Governance',        component: AdminGovernance, isNew:true },
    ]
  },
  {
    label: 'Communications',
    items: [
      { id:'comms',       icon:'✉', label:'Communications',    component: AdminCommunications, isNew:true },
    ]
  },
  {
    label: 'Security',
    items: [
      { id:'security',    icon:'⊘', label:'Security & Backup', component: AdminSecurity },
      { id:'sopval',      icon:'⊛', label:'SOP Validator',     component: AdminSopValidator, restricted:true },
      { id:'techupdates', icon:'↺', label:'Tech Updates',      component: AdminTechUpdates },
    ]
  },
  {
    label: 'Operations',
    items: [
      { id:'analyses',    icon:'◷', label:'Analyses',          component: AdminAnalyses },
      { id:'attorneys',   icon:'⊜', label:'Attorneys',         component: AdminAttorneys },
      { id:'ai',          icon:'⊙', label:'AI Engine',         component: AdminAI },
      { id:'autonomous',  icon:'⊗', label:'Autonomous',        component: AdminAutonomous },
      { id:'finance',     icon:'◈', label:'Finance',           component: AdminFinance },
      { id:'hr',          icon:'◉', label:'HR',                component: AdminHR },
      { id:'livingai',    icon:'✦', label:'AI Command Center', component: AdminLivingAI, isNew:true },
      { id:'legalcomp',   icon:'⚖', label:'Legal Compliance',  component: AdminLegalCompliance, isNew:true },
      { id:'legal',       icon:'⊡', label:'Legal',             component: AdminLegal },
    ]
  },
  {
    label: 'Revenue',
    items: [
      { id:'marketing',   icon:'◇', label:'Marketing',         component: AdminMarketing },
      { id:'outreach',    icon:'◆', label:'Outreach',          component: AdminOutreach },
      { id:'lenders',     icon:'◰', label:'Lenders',           component: AdminLenders },
      { id:'partners',    icon:'◳', label:'Partners',          component: AdminPartners },
      { id:'insurance',   icon:'◲', label:'Insurance',         component: AdminInsurance },
      { id:'pe',          icon:'◱', label:'PE / Exit',         component: AdminPE },
      { id:'vendors',     icon:'◫', label:'Vendors',           component: AdminVendors },
      { id:'wl',          icon:'◪', label:'White Label',       component: AdminWhiteLabel },
      { id:'media',       icon:'◨', label:'Media / PR',        component: AdminMediaPR },
    ]
  },
  {
    label: 'System',
    items: [
      { id:'settings',    icon:'⚙', label:'Settings',          component: AdminSettings },
      { id:'updates',     icon:'⟳', label:'System Updates',    component: AdminSystemUpdates },
      { id:'sync',        icon:'⟺', label:'Integration Sync',  component: AdminIntegrationSync },
    ]
  },
];

export default function AdminLayout({ integrations = {}, toggleIntegration, deploymentState, setDeploymentState, userRole = 'founder' }) {
  const [activeTab, setActiveTab] = useState('overview');

  const allItems = GROUPS.flatMap(g => g.items);
  const ActiveComponent = allItems.find(t => t.id === activeTab)?.component || AdminOverview;

  return (
    <div className="admin-layout">
      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '0.15rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold)' }}>HOACOND</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>Insight™</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>OS v5.2 Active</span>
          </div>
          <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>Hoa Condo Insight LLC</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
          {GROUPS.map(group => (
            <div key={group.label}>
              <p className="sidebar-group-label">{group.label}</p>
              {group.items.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`sidebar-item${activeTab === item.id ? ' active' : ''}${item.restricted ? ' restricted' : ''}`}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6, fontFamily: 'monospace', width: 14, flexShrink: 0, textAlign: 'center' }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.isNew && <span style={{ marginLeft: 'auto', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em', background: 'rgba(34,197,94,0.2)', color: 'var(--green)', padding: '0.1rem 0.375rem', borderRadius: '999px' }}>NEW</span>}
                  {item.restricted && !item.isNew && <span style={{ marginLeft: 'auto', color: 'rgba(201,168,76,0.5)', fontSize: '0.65rem' }}>🔒</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <Link to="/" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>←</span> Back to website
          </Link>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {GROUPS.find(g => g.items.some(i => i.id === activeTab))?.label || 'Admin'}
            </p>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>›</span>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
              {allItems.find(i => i.id === activeTab)?.label || 'Overview'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="badge badge-navy" style={{ fontSize: '0.65rem' }}>{userRole === 'founder' ? '🔑 Founder' : userRole}</span>
          </div>
        </div>

        <div className="admin-main">
          <ActiveComponent
            integrations={integrations}
            toggleIntegration={toggleIntegration}
            userRole={userRole}
            deploymentState={deploymentState}
            setDeploymentState={setDeploymentState}
          />
        </div>
      </div>
    </div>
  );
}
