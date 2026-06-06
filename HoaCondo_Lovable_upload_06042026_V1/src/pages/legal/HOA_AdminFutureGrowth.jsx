/**
 * HOA_CODE_08 — AdminFutureGrowth.jsx
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Complete Future Growth tab with Top 15 opportunity cards.
 * Each card has business case, legal requirements, platform readiness,
 * SOP, pre-launch checklist, and Claude instruction document.
 * FOUNDER-ONLY — invisible to all other roles.
 */

import React, { useState } from 'react';

// ─────────────────────────────────────────────
// OPPORTUNITY DATA
// ─────────────────────────────────────────────
const OPPORTUNITIES = [
  {
    id: 1,
    title: 'Title Company Enterprise API',
    category: 'Enterprise B2B',
    revenuePotential: '$50K–$200K/yr per client',
    readiness: 85,
    urgency: 'high',
    businessCase: 'Title companies close hundreds of HOA transactions monthly. LL-2026-03 creates mandatory HOA review before closing. Direct API integration into their workflow makes HOACONDInsight an invisible infrastructure layer.',
    legalRequirements: 'API terms of service, data processing agreement, E&O insurance recommended ($1M minimum).',
    platformReadiness: 'API endpoints needed. Rate limiting, API key management, webhook callbacks required. 2–3 week build.',
    sop: '1. Build API layer in Netlify functions. 2. Create API key management module. 3. Document endpoints at api.hoacondoinsight.com. 4. Pilot with 1 title company. 5. Price at $0.50–$2.00 per query.',
    preLaunchChecklist: ['API documentation complete', 'Rate limiting live', 'API key management in admin OS', 'Pilot title company signed', 'Data processing agreement reviewed by attorney'],
    claudeInstruction: 'Build a REST API wrapper around the document analysis engine with key-based auth, rate limiting, and webhook support for order completion callbacks.',
  },
  {
    id: 2,
    title: 'National Mortgage Lender Suite',
    category: 'Enterprise B2B',
    revenuePotential: '$100K–$500K/yr per lender',
    readiness: 70,
    urgency: 'high',
    businessCase: 'Fannie Mae-approved lenders are mandated buyers. Top 50 national lenders each process thousands of HOA-adjacent loans monthly. A $299/month enterprise plan at scale yields $15K+/yr per seat.',
    legalRequirements: 'RESPA compliance review. Lender data security requirements (SOC 2 may be required by larger lenders). Attorney review of lender service agreement.',
    platformReadiness: 'White-label PDF reports needed. Bulk upload UI. LOS integration (Encompass, Calyx). 4–6 week build for lender-ready package.',
    sop: '1. Build white-label report module. 2. Create bulk upload endpoint. 3. Research top 50 lender LOS platforms. 4. Build Encompass plugin first (largest market share). 5. Cold outreach via Apollo.io targeting compliance officers.',
    preLaunchChecklist: ['White-label reports live', 'Bulk upload tested', 'Lender service agreement drafted', 'SOC 2 roadmap created', '10 target lenders identified in Apollo.io'],
    claudeInstruction: 'Build a white-label PDF report engine with lender branding support and a bulk order upload interface accepting CSV of property addresses.',
  },
  {
    id: 3,
    title: 'Real Estate Law Firm Package',
    category: 'Professional Services',
    revenuePotential: '$25K–$100K/yr per firm',
    readiness: 90,
    urgency: 'medium',
    businessCase: 'Real estate attorneys need HOA compliance documentation for closings, disputes, and litigation. HOACONDInsight provides attorney-grade analysis with legal citations. Easy sell: they already pay for similar research manually.',
    legalRequirements: 'Cannot provide legal advice. Disclaimer on all reports: "For informational purposes. Not legal advice." Attorney already approved existing disclaimers.',
    platformReadiness: 'Near-ready. Add attorney-specific report template with legal citation formatting. 1 week build.',
    sop: '1. Create attorney report template. 2. Add legal citation formatting to OpenAI prompts. 3. Build law firm account tier. 4. Target Florida real estate bar association first. 5. Speak at 1 Florida real estate law CLE.',
    preLaunchChecklist: ['Attorney report template complete', 'Legal disclaimers reviewed', 'Attorney account tier in Stripe', 'Florida Bar contact identified', 'Pilot firm recruited'],
    claudeInstruction: 'Create an attorney-grade report template that formats HOA compliance findings with Florida statute citations and Fannie Mae guideline references.',
  },
  {
    id: 4,
    title: 'HOA Management Company Portal',
    category: 'B2B Platform',
    revenuePotential: '$30K–$150K/yr',
    readiness: 65,
    urgency: 'medium',
    businessCase: 'HOA management companies manage 100–1,000+ communities each. They need compliance status dashboards for their entire portfolio. A per-community SaaS model at $10–25/month per community = massive recurring revenue.',
    legalRequirements: 'Property management company licensing requirements vary by state. Data sharing agreements required. HOA document confidentiality review.',
    platformReadiness: 'Multi-community dashboard needed. Portfolio view. Bulk community onboarding. 6–8 week build.',
    sop: '1. Build portfolio management module in admin OS. 2. Create community manager role (below admin, above customer). 3. Build portfolio dashboard with map view. 4. Target FLCAJ (Florida Community Association Journal) advertisers. 5. Attend CAI Florida Chapter events.',
    preLaunchChecklist: ['Portfolio dashboard built', 'Community manager role live', 'Per-community billing in Stripe', 'CAI membership secured', '3 management companies in pilot'],
    claudeInstruction: 'Build a portfolio management module showing compliance status for multiple HOA communities with map visualization and bulk compliance score calculation.',
  },
  {
    id: 5,
    title: 'Bank & Credit Union HOA Lending Module',
    category: 'Enterprise B2B',
    revenuePotential: '$75K–$300K/yr per institution',
    readiness: 60,
    urgency: 'high',
    businessCase: 'Community banks and credit unions offering HOA-adjacent mortgages face the same LL-2026-03 requirements as national lenders. They lack compliance infrastructure. HOACONDInsight fills the gap at a price point they can afford.',
    legalRequirements: 'Bank vendor due diligence process (lengthy — 3–6 months). SOC 2 Type II likely required for banks over $1B assets. Start with community banks under $500M assets.',
    platformReadiness: 'Same as lender suite. Start with lender suite build — bank module is a pricing/packaging variant.',
    sop: '1. Complete lender suite first. 2. Create bank-specific pricing page. 3. Target community banks in Florida first. 4. Contact Florida Bankers Association. 5. Attend community bank lending conference.',
    preLaunchChecklist: ['Lender suite complete', 'Bank pricing page live', 'Vendor questionnaire template prepared', 'Florida Bankers Association contact identified', '5 target community banks in CRM'],
    claudeInstruction: 'Adapt the lender suite for community bank compliance teams with simplified onboarding and a vendor due diligence documentation package.',
  },
  {
    id: 6,
    title: 'Realtor Association Partnership',
    category: 'Channel Distribution',
    revenuePotential: '$50K–$200K/yr (volume)',
    readiness: 75,
    urgency: 'medium',
    businessCase: 'State and local realtor associations can endorse HOACONDInsight as a preferred vendor. A $15–20 referral on every $39 basic report across a 10,000-member association generates significant volume with zero sales effort.',
    legalRequirements: 'Association endorsement agreements. RESPA affiliate disclosure if referral fees involved. State-specific realtor license compliance.',
    platformReadiness: 'Affiliate/referral code system needed. Branded landing pages for each association. 2 week build.',
    sop: '1. Build referral code system in Stripe. 2. Create white-label landing page generator. 3. Target Florida Realtors (220,000 members). 4. Pitch to Florida Realtors tech committee. 5. Structure as preferred vendor, not affiliate, to avoid RESPA issues.',
    preLaunchChecklist: ['Referral code system live', 'White-label landing page built', 'Florida Realtors contact identified', 'Legal review of endorsement structure', 'One association in pilot'],
    claudeInstruction: 'Build a referral and affiliate system with unique codes, branded landing pages, and an affiliate dashboard showing referral revenue and conversion rates.',
  },
  {
    id: 7,
    title: 'HOA Attorney Dispute Toolkit',
    category: 'Specialized Product',
    revenuePotential: '$150–$500 per report',
    readiness: 80,
    urgency: 'low',
    businessCase: 'Peter has lived the HOA dispute process. A specialized toolkit for unit owners in disputes — covering assessment challenges, consent process deficiencies, director certification failures — fills a gap no competitor touches. Premium pricing justified.',
    legalRequirements: 'UPL (unauthorized practice of law) risk is the primary concern. Product must be clearly positioned as document analysis, not legal advice. Attorney review of all output templates essential.',
    platformReadiness: 'New product page and order flow needed. Analysis prompts require specialized dispute-analysis training. 2–3 week build.',
    sop: '1. Draft dispute toolkit product spec. 2. Create specialized OpenAI prompts for dispute document analysis. 3. Add product to Stripe catalog. 4. Create separate order flow for dispute toolkit. 5. Price at $149 basic, $299 full.',
    preLaunchChecklist: ['UPL disclaimer reviewed by attorney', 'Dispute analysis prompts trained and tested', 'Product page live', 'Stripe product created', 'Beta tested with 3 real disputes'],
    claudeInstruction: 'Create a specialized HOA dispute document analysis engine that reviews assessment procedures, board authorization, member consent processes, and director certifications against Florida HOA statute requirements.',
  },
  {
    id: 8,
    title: 'Insurance Carrier Integration',
    category: 'Enterprise B2B',
    revenuePotential: '$100K–$400K/yr',
    readiness: 40,
    urgency: 'low',
    businessCase: 'HOA master policy insurers need property-level data to underwrite accurately. HOACONDInsight\'s compliance data is valuable underwriting input. A data licensing deal with 1–2 major HOA insurers could exceed the entire consumer business.',
    legalRequirements: 'Insurance data licensing is heavily regulated. State insurance department approval may be required. Data anonymization and aggregation requirements. 12+ month legal process.',
    platformReadiness: 'Data pipeline and API for insurance format required. Privacy/CCPA compliance audit first. Long-term build.',
    sop: '1. Build anonymized data export capability. 2. Consult insurance regulatory attorney. 3. Identify 3 HOA master policy carriers. 4. Open conversation as data partner, not vendor. 5. Structure as pilot program with 6-month data sharing agreement.',
    preLaunchChecklist: ['Privacy attorney consulted', 'Data anonymization protocol documented', 'Insurance regulatory review initiated', '3 HOA insurers identified', 'Pilot structure proposed to one carrier'],
    claudeInstruction: 'Design an anonymized data export pipeline that aggregates HOA compliance metrics by geography, building type, and risk category for insurance underwriting use cases.',
  },
  {
    id: 9,
    title: 'Condo Developer Pre-Sale Compliance',
    category: 'Specialized Product',
    revenuePotential: '$500–$5,000 per project',
    readiness: 70,
    urgency: 'medium',
    businessCase: 'New condo developments need Fannie Mae warrantability certification before closing any units with mortgages. Getting certified pre-sale vs. post-problems saves developers millions. Premium pricing for developer-facing product is justified.',
    legalRequirements: 'Securities law considerations if developer uses compliance report in marketing. Engineer certification requirements for structural review. Attorney review required.',
    platformReadiness: 'Developer-specific order flow and report template needed. Integration with county permit databases would add value. 3–4 week build for basic version.',
    sop: '1. Create developer product spec. 2. Build developer order flow with project details collection. 3. Create Fannie Mae project certification checklist. 4. Target South Florida condo developers. 5. Price at $500 basic, $2,500 full certification package.',
    preLaunchChecklist: ['Developer report template complete', 'Fannie Mae project eligibility checklist built', 'Developer pricing live', 'Attorney review of marketing use restrictions', '3 South Florida developers identified'],
    claudeInstruction: 'Build a new construction condo compliance module that evaluates Fannie Mae project eligibility requirements including owner-occupancy thresholds, investor concentration, and pre-sale percentage requirements.',
  },
  {
    id: 10,
    title: 'FHA/VA Condo Approval Module',
    category: 'Complementary Product',
    revenuePotential: '$39–$99 per report (high volume)',
    readiness: 75,
    urgency: 'medium',
    businessCase: 'FHA and VA loans have separate condo approval requirements from Fannie Mae. Adding FHA/VA analysis to every Fannie Mae report increases average order value with minimal additional AI work. Natural upsell.',
    legalRequirements: 'HUD/FHA regulation compliance. VA condo eligibility guidelines. No additional licensing required — same disclaimer framework.',
    platformReadiness: 'Add FHA/VA analysis to existing OpenAI prompts. Add upsell to order flow. Add-on pricing model. 1 week build.',
    sop: '1. Research current FHA and VA condo approval requirements. 2. Add FHA/VA analysis to OpenAI system prompt. 3. Create add-on product in Stripe ($25 add-on to basic). 4. Add upsell step to order flow. 5. Test with 5 real FHA submissions.',
    preLaunchChecklist: ['FHA/VA prompt research complete', 'Add-on product in Stripe', 'Upsell flow built in OrderFlow.jsx', 'FHA/VA report section added to template', '5 test reports validated'],
    claudeInstruction: 'Extend the HOA analysis engine to include FHA condo project approval requirements (HRAP/DELRAP) and VA condo eligibility standards alongside the existing Fannie Mae LL-2026-03 analysis.',
  },
  {
    id: 11,
    title: 'CoStar / Commercial HOA Database',
    category: 'Data Product',
    revenuePotential: '$500K–$2M (acquisition target)',
    readiness: 20,
    urgency: 'low',
    businessCase: 'Building a proprietary database of HOA compliance data across the US creates an acquisition-attractive data asset. CoStar, CoreLogic, and similar companies pay 8–15x revenue for property data assets. This is the $15M Vorrex valuation path.',
    legalRequirements: 'Data ownership and licensing chain must be airtight. User consent for data retention and aggregation required in Terms of Service. IP protection for database structure.',
    platformReadiness: 'Long-term data accumulation strategy. Every report filed enriches the database. Current platform is foundation. 2–3 year build.',
    sop: '1. Add data retention clauses to Terms of Service (attorney review). 2. Build anonymized community database schema. 3. Begin tagging every report to geography and community type. 4. Set 2-year data accumulation milestone. 5. Commission database valuation at 50,000 communities.',
    preLaunchChecklist: ['Terms of Service data retention clause live', 'Database schema designed', 'Anonymization protocol documented', 'Geography tagging in all new reports', 'CoStar/CoreLogic acquisition contact identified'],
    claudeInstruction: 'Design an anonymized HOA compliance database schema that aggregates report data by geography, community type, and compliance metrics while stripping all PII, structured for eventual data licensing or acquisition.',
  },
  {
    id: 12,
    title: 'HOA Board Member Training Certification',
    category: 'Education Product',
    revenuePotential: '$99–$299 per certification',
    readiness: 55,
    urgency: 'low',
    businessCase: 'Florida requires HOA directors to complete certification under §720.3033. A digital certification course tied to HOACONDInsight creates recurring revenue, market authority, and a pipeline for compliance reports.',
    legalRequirements: 'Florida statute §720.3033 compliance. Course content must meet statutory requirements. Potential for DBPR continuing education approval.',
    platformReadiness: 'Learning management system (LMS) integration needed. Video content required. Certificate generation. 8–12 week build.',
    sop: '1. Research §720.3033 certification requirements. 2. Outline 4-hour course curriculum. 3. Select LMS platform (Teachable or custom). 4. Produce video content (Peter as instructor). 5. Apply for DBPR CE credit approval.',
    preLaunchChecklist: ['§720.3033 requirements documented', 'Course curriculum approved by attorney', 'LMS platform selected', 'Video content produced', 'DBPR application submitted'],
    claudeInstruction: 'Build an HOA director certification course module covering Florida §720.3033 requirements, Fannie Mae LL-2026-03 compliance duties, reserve funding obligations, and proper consent collection procedures.',
  },
  {
    id: 13,
    title: 'Relocation Company / Corporate Housing',
    category: 'Channel Distribution',
    revenuePotential: '$20K–$80K/yr',
    readiness: 65,
    urgency: 'low',
    businessCase: 'Relocation companies arranging corporate housing frequently deal with HOA-governed properties. LL-2026-03 compliance affects their financing. A B2B package at $199/month for unlimited basic reports is a simple sell.',
    legalRequirements: 'Standard commercial service agreement. No additional licensing.',
    platformReadiness: 'Existing enterprise tier covers this. Custom pricing page and outreach only. 1 week build.',
    sop: '1. Create relocation company landing page. 2. Build enterprise pricing at $199/month for 50 reports. 3. Identify Cartus, SIRVA, Crown World Mobility as targets. 4. Contact via LinkedIn Sales Navigator. 5. Offer 30-day free trial.',
    preLaunchChecklist: ['Relocation landing page live', 'Pricing tier created', '10 relocation companies identified', 'Trial offer configured in Stripe', 'Outreach sequence written'],
    claudeInstruction: 'Create a relocation company landing page and onboarding flow emphasizing volume pricing and the compliance requirement triggered by LL-2026-03 for corporate housing placements.',
  },
  {
    id: 14,
    title: 'Vorrex Licensing — Sub-Licensee Program',
    category: 'Vorrex / IP',
    revenuePotential: '$500K–$5M (licensing)',
    readiness: 30,
    urgency: 'low',
    businessCase: 'Once provisional patents convert to nonprovisionals, Vorrex LLC can sub-license the HOACONDInsight technology to regional compliance firms, title underwriters, or foreign markets (Canada, Australia). This is the IP monetization path.',
    legalRequirements: 'Patent prosecution must be complete. Fish & Richardson engagement required first. License structure needs IP attorney drafting. International filing (PCT) needed for foreign licensing.',
    platformReadiness: 'Sub-licensee portal needed. API white-labeling. Long-term after patent grant.',
    sop: '1. Engage Fish & Richardson (deadline: within 90 days). 2. File nonprovisional by June 2, 2027. 3. Research PCT filing for Canada/Australia. 4. Draft sub-license term sheet. 5. Identify 3 potential sub-licensees.',
    preLaunchChecklist: ['Fish & Richardson engaged', 'Nonprovisional patent filed', 'PCT application filed', 'Sub-license term sheet drafted', 'First sub-licensee conversation initiated'],
    claudeInstruction: 'Draft a technology sub-license agreement template from Vorrex LLC to a regional compliance firm, covering scope of license, royalty structure, territory, performance requirements, and IP protection obligations.',
  },
  {
    id: 15,
    title: 'HOA Monitoring — Continuous Subscription',
    category: 'Recurring Revenue',
    revenuePotential: '$19–$49/month per community (consumer)',
    readiness: 50,
    urgency: 'medium',
    businessCase: 'Unit owners and investors in HOA communities want ongoing monitoring — not just a one-time report. A $19/month subscription that re-runs compliance checks quarterly and sends email alerts when the community falls out of compliance is highly retainable.',
    legalRequirements: 'Subscription disclosure requirements. Auto-renewal disclosure per FTC regulations. Data currency disclosures.',
    platformReadiness: 'Subscription billing via Stripe already in plan. Cron job for quarterly re-analysis needed. Alert system via Resend needed. 3–4 week build.',
    sop: '1. Build quarterly re-analysis cron job (Netlify scheduled functions). 2. Create alert email templates. 3. Add subscription tier to Stripe at $19/month. 4. Build subscription management in customer dashboard. 5. Upsell existing one-time customers.',
    preLaunchChecklist: ['Cron job for quarterly analysis built', 'Alert emails in Resend', 'Subscription tier live in Stripe', 'Subscription management in Dashboard.jsx', 'Upsell email sequence written'],
    claudeInstruction: 'Build a community monitoring subscription system with quarterly re-analysis, compliance status change alerts via Resend, and a subscriber dashboard showing HOA Health Score history and trend over time.',
  },
];

// ─────────────────────────────────────────────
// OPPORTUNITY CARD COMPONENT
// ─────────────────────────────────────────────
const OpportunityCard = ({ opp }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('business');

  const urgencyColors = {
    high: { bg: '#7f1d1d', text: '#fca5a5', label: 'HIGH PRIORITY' },
    medium: { bg: '#713f12', text: '#fde68a', label: 'MEDIUM PRIORITY' },
    low: { bg: '#1e3a5f', text: '#93c5fd', label: 'LONG TERM' },
  };
  const uc = urgencyColors[opp.urgency];

  const tabs = [
    { id: 'business', label: 'Business Case' },
    { id: 'legal', label: 'Legal' },
    { id: 'platform', label: 'Platform' },
    { id: 'sop', label: 'SOP' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'claude', label: 'Claude Brief' },
  ];

  const tabContent = {
    business: opp.businessCase,
    legal: opp.legalRequirements,
    platform: opp.platformReadiness,
    sop: opp.sop,
    checklist: opp.preLaunchChecklist.map((item, i) => `${i + 1}. ${item}`).join('\n'),
    claude: opp.claudeInstruction,
  };

  return (
    <div style={{
      background: '#1a2744',
      border: '1px solid #2d3f6b',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px',
    }}>
      {/* Card Header */}
      <div
        style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{
              background: '#0f172a',
              color: '#c9a84c',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}>#{opp.id}</span>
            <span style={{
              background: uc.bg,
              color: uc.text,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}>{uc.label}</span>
            <span style={{
              background: '#0f172a',
              color: '#6b7280',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
            }}>{opp.category}</span>
          </div>
          <h3 style={{ color: '#e2e8f0', margin: '0 0 4px', fontSize: '16px' }}>{opp.title}</h3>
          <div style={{ color: '#4ade80', fontSize: '13px', fontFamily: 'monospace' }}>{opp.revenuePotential}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Readiness bar */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>PLATFORM READY</div>
            <div style={{ width: '80px', height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${opp.readiness}%`,
                height: '100%',
                background: opp.readiness >= 75 ? '#4ade80' : opp.readiness >= 50 ? '#fbbf24' : '#f87171',
                borderRadius: '3px',
              }} />
            </div>
            <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px', textAlign: 'right' }}>{opp.readiness}%</div>
          </div>
          <span style={{ color: '#6b7280', fontSize: '18px' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ borderTop: '1px solid #2d3f6b' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#0f172a', borderBottom: '1px solid #2d3f6b' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#1a2744' : 'transparent',
                  color: activeTab === tab.id ? '#c9a84c' : '#6b7280',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #c9a84c' : '2px solid transparent',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'Georgia, serif',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '20px 24px' }}>
            {activeTab === 'checklist' ? (
              <div>
                {opp.preLaunchChecklist.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#c9a84c', flexShrink: 0, marginTop: '2px' }}>☐</span>
                    <span style={{ color: '#e2e8f0', fontSize: '14px' }}>{item}</span>
                  </div>
                ))}
              </div>
            ) : activeTab === 'claude' ? (
              <div style={{
                background: '#0f172a',
                border: '1px solid #2d3f6b',
                borderRadius: '6px',
                padding: '16px',
                color: '#c9a84c',
                fontSize: '13px',
                fontFamily: 'monospace',
                lineHeight: '1.6',
              }}>
                <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '8px', letterSpacing: '1px' }}>
                  CLAUDE INSTRUCTION — COPY AND USE IN NEW CHAT
                </div>
                {tabContent.claude}
              </div>
            ) : (
              <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>
                {tabContent[activeTab]}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function AdminFutureGrowth() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  const categories = ['all', ...new Set(OPPORTUNITIES.map(o => o.category))];

  const filtered = OPPORTUNITIES
    .filter(o => filter === 'all' || o.category === filter)
    .sort((a, b) => {
      if (sortBy === 'urgency') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.urgency] - order[b.urgency];
      }
      if (sortBy === 'readiness') return b.readiness - a.readiness;
      return a.id - b.id;
    });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌱</span>
          <h1 style={{ color: '#c9a84c', fontFamily: 'Georgia, serif', fontSize: '24px', margin: 0 }}>
            Future Growth Opportunities
          </h1>
          <span style={{
            background: '#78350f',
            color: '#fbbf24',
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
          }}>👑 FOUNDER ONLY</span>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          15 strategic expansion opportunities. Each with business case, legal requirements, platform readiness, SOP, and Claude instructions.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                background: filter === cat ? '#c9a84c' : '#1a2744',
                color: filter === cat ? '#0f172a' : '#9ca3af',
                border: '1px solid #2d3f6b',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'Georgia, serif',
              }}
            >
              {cat === 'all' ? 'All 15' : cat}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>Sort:</span>
          {['urgency', 'readiness', 'id'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                background: sortBy === s ? '#2d3f6b' : 'transparent',
                color: sortBy === s ? '#c9a84c' : '#6b7280',
                border: '1px solid #2d3f6b',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'Georgia, serif',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Cards */}
      {filtered.map(opp => (
        <OpportunityCard key={opp.id} opp={opp} />
      ))}
    </div>
  );
}
