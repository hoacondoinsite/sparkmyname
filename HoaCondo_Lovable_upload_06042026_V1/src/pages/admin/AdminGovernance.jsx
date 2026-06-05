/**
 * AdminGovernance.jsx
 * HOACONDInsight™ Platform Governance Panel
 * Added: June 5, 2026
 * Authorized by: Peter Klein, Founder
 * Change: New module — displays all 7 platform governance rules in Admin OS
 */

import React from 'react';
import { PLATFORM_GOVERNANCE } from '../../lib/PLATFORM_GOVERNANCE.js';

const RULE_ICONS = ['📋','🏷️','1️⃣','💬','↩️','🔗','📝'];

export default function AdminGovernance() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--navy)', letterSpacing:'-0.02em', lineHeight:1.2 }}>
          Platform Governance
        </h2>
        <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'0.375rem' }}>
          HOACONDInsight™ OS · Established {PLATFORM_GOVERNANCE.established} · Authorized by {PLATFORM_GOVERNANCE.authorizedBy}
        </p>
      </div>

      {/* Header card */}
      <div style={{ background:'var(--navy)', borderRadius:'var(--radius-xl)', padding:'1.5rem 2rem', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:'0.5rem' }}>Governance Framework</p>
          <p style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', color:'var(--gold)', lineHeight:1 }}>v{PLATFORM_GOVERNANCE.version}</p>
          <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginTop:'0.375rem' }}>All rules active · Founder authorized</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:'3rem', fontFamily:'var(--font-display)', color:'var(--gold)', lineHeight:1 }}>{PLATFORM_GOVERNANCE.totalRules}</p>
          <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)' }}>Active Rules</p>
        </div>
      </div>

      {/* Rules */}
      <div style={{ display:'grid', gap:'1rem' }}>
        {PLATFORM_GOVERNANCE.rules.map((rule, i) => (
          <div key={rule.id} className="card" style={{ padding:'1.25rem 1.5rem' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem' }}>
              <div style={{ fontSize:'1.5rem', flexShrink:0, marginTop:'0.1rem' }}>{RULE_ICONS[i]}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.375rem' }}>
                  <span style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.06em', color:'var(--gold)', background:'rgba(201,168,76,0.1)', padding:'0.15rem 0.5rem', borderRadius:'999px', border:'1px solid rgba(201,168,76,0.2)' }}>{rule.id}</span>
                  <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--green)', background:'rgba(34,197,94,0.1)', padding:'0.15rem 0.5rem', borderRadius:'999px' }}>ACTIVE</span>
                  {rule.mandatory && <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--red)', background:'rgba(220,38,38,0.08)', padding:'0.15rem 0.5rem', borderRadius:'999px' }}>MANDATORY</span>}
                </div>
                <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)', marginBottom:'0.375rem' }}>{rule.name}</p>
                <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6 }}>{rule.description}</p>
                <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'0.5rem' }}>Established: {rule.established} · Authority: {rule.authority}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{ marginTop:'1.5rem', padding:'1rem 1.5rem', background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'var(--radius-lg)' }}>
        <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.7 }}>
          <strong style={{ color:'var(--navy)' }}>Governance Authority:</strong> Only Peter Klein (Founder) may modify these rules. 
          All changes require a new version stamp, written authorization, and an SOP. 
          These rules form part of the platform's quality control framework and will be 
          presented during acquisition due diligence as evidence of disciplined enterprise governance.
        </p>
      </div>
    </div>
  );
}
