
 * App.jsx
 * HOACONDInsight™ Main Application
 * Modified: June 5, 2026
 * Change: Option A — deploymentState hardcoded to LIVE so platform
 *         is visible without Supabase connection. Governance import added.
 *         This is a temporary setting. When Supabase is connected,
 *         deploymentState will be read from the database instead.
 * Authorized by: Peter Klein, Founder
 * Rollback: Change useState('LIVE') back to useState('TESTING') if needed
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Landing from './pages/Landing.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Features from './pages/Features.jsx';
import Pricing from './pages/Pricing.jsx';
import OrderFlow from './pages/OrderFlow.jsx';
import SampleReport from './pages/SampleReport.jsx';
import Partners from './pages/Partners.jsx';
import Contact from './pages/Contact.jsx';
import Dashboard from './pages/Dashboard.jsx';
import WhiteLabel from './pages/WhiteLabel.jsx';
import FounderDashboard from './pages/FounderDashboard.jsx';
import LivingAIInterface from './pages/LivingAIInterface.jsx';
import StatusPage from './pages/StatusPage.jsx';
import VideoTrainingDashboard from './pages/VideoTrainingDashboard.jsx';
import EmergencyOperationsDashboard from './pages/EmergencyOperationsDashboard.jsx';
import AssociationPortal from './pages/AssociationPortal.jsx';
import MarketingStudio from './pages/MarketingStudio.jsx';

// Legal pages
import Terms from './pages/legal/Terms.jsx';
import Privacy from './pages/legal/Privacy.jsx';
import Disclaimer from './pages/legal/Disclaimer.jsx';
import Cancellation from './pages/legal/Cancellation.jsx';

// Lender
import ForLenders from './pages/lender/ForLenders.jsx';
import LenderSignup from './pages/lender/LenderSignup.jsx';
import LenderDashboard from './pages/lender/LenderDashboard.jsx';
import LenderComplianceGuide from './pages/lender/LenderComplianceGuide.jsx';

// Attorney
import AttorneyApply from './pages/attorney/AttorneyApply.jsx';
import AttorneyDashboard from './pages/attorney/AttorneyDashboard.jsx';

// Admin
import AdminLayout from './pages/admin/AdminLayout.jsx';

// Engines
import { isAcceptingOrders, isInTestMode } from './lib/deploymentControlEngine.js';
import { initTechnologyCompatibility } from './lib/technologyCompatibilityEngine.js';

// Governance
import PLATFORM_GOVERNANCE from './lib/PLATFORM_GOVERNANCE.js';

// Consent
import ConsentModal from './components/ConsentModal.jsx';

/**
 * HOACONDInsight™ Operating System v5.2
 * Legal entity: Hoa Condo Insight LLC (Florida LLC)
 * 61 N Lakeshore Drive, Hypoluxo, Florida 33462
 * Governance Framework: v1.0 — Established June 5, 2026
 * Consent required: Florida F.S. § 934.03 (two-party consent state)
 */

const CONSENT_REQUIRED_PATHS = ['/order', '/dashboard', '/lenders/dashboard', '/attorneys/dashboard', '/association-portal', '/admin', '/founder'];
const PUBLIC_PATHS = ['/', '/how-it-works', '/features', '/pricing', '/sample-report', '/partners', '/contact', '/white-label', '/lenders', '/legal/', '/status'];

export default function App() {
  const [integrations, setIntegrations] = useState({ supabase:true, stripe:true, openai:true, resend:true });

  // ── OPTION A FIX ──────────────────────────────────────────────────────
  // deploymentState is set to 'LIVE' so the platform is fully visible.
  // When Supabase is connected (Option B), this will be replaced with
  // a database read. To rollback: change 'LIVE' back to 'TESTING'.
  const [deploymentState, setDeploymentState] = useState('LIVE');
  // ── END OPTION A FIX ──────────────────────────────────────────────────

  const [consentGiven, setConsentGiven] = useState(() => {
    try { return sessionStorage.getItem('hoacond_consent') === 'true'; }
    catch { return false; }
  });
  const [showConsent, setShowConsent] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  useEffect(() => {
    initTechnologyCompatibility();
    // Log governance version on startup
    console.info(`HOACONDInsight™ OS v5.2 — Governance Framework v${PLATFORM_GOVERNANCE.version} active — ${PLATFORM_GOVERNANCE.totalRules} rules enforced`);
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'test') setDeploymentState('TESTING');
    const path = window.location.pathname;
    if (!consentGiven && CONSENT_REQUIRED_PATHS.some(p => path.startsWith(p))) {
      setShowConsent(true);
      setPendingPath(path);
    }
  }, []);

  const handleConsent = () => {
    setConsentGiven(true);
    setShowConsent(false);
    try {
      sessionStorage.setItem('hoacond_consent', 'true');
      sessionStorage.setItem('hoacond_consent_timestamp', new Date().toISOString());
      sessionStorage.setItem('hoacond_consent_version', '5.2');
    } catch(e) {}
  };

  const toggleIntegration = (id) => setIntegrations(prev => ({ ...prev, [id]: !prev[id] }));
  const siteAcceptsOrders = isAcceptingOrders(deploymentState);
  const siteIsTestMode = isInTestMode(deploymentState);

  return (
    <Router>
      {showConsent && (
        <ConsentModal
          onConsent={handleConsent}
          onDecline={() => { setShowConsent(false); window.location.href = '/'; }}
          userType="customer"
        />
      )}

      {siteIsTestMode && (
        <div style={{ background:'#dc2626', color:'white', padding:'6px 16px', textAlign:'center', fontSize:12, fontWeight:700, position:'sticky', top:0, zIndex:9999 }}>
          🧪 TEST MODE — No real charges · Test card: 4242 4242 4242 4242 · All reports watermarked
        </div>
      )}
      {deploymentState === 'OFFLINE' && (
        <div style={{ background:'#7f1d1d', color:'white', padding:'6px 16px', textAlign:'center', fontSize:12, fontWeight:700, position:'sticky', top:0, zIndex:9999 }}>
          🔴 PLATFORM OFFLINE — Contact peter@hoacondinsight.com
        </div>
      )}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing deploymentState={deploymentState} />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/sample-report" element={<SampleReport />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/white-label" element={<WhiteLabel />} />
        <Route path="/status" element={<StatusPage deploymentState={deploymentState} />} />
        <Route path="/lenders" element={<ForLenders />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/disclaimer" element={<Disclaimer />} />
        <Route path="/legal/cancellation" element={<Cancellation />} />
        <Route path="/attorneys/apply" element={<AttorneyApply />} />

        {/* Consent-required */}
        <Route path="/order" element={<OrderFlow siteAcceptsOrders={siteAcceptsOrders} deploymentState={deploymentState} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/association-portal" element={<AssociationPortal />} />
        <Route path="/living-ai" element={<LivingAIInterface />} />
        <Route path="/lenders/signup" element={<LenderSignup />} />
        <Route path="/lenders/dashboard" element={<LenderDashboard />} />
        <Route path="/lenders/compliance-guide" element={<LenderComplianceGuide />} />
        <Route path="/attorneys/dashboard" element={<AttorneyDashboard />} />

        {/* Founder only */}
        <Route path="/founder" element={<FounderDashboard />} />
        <Route path="/marketing-studio" element={<MarketingStudio />} />
        <Route path="/video-training" element={<VideoTrainingDashboard />} />
        <Route path="/emergency-ops" element={<EmergencyOperationsDashboard />} />

        {/* Admin OS */}
        <Route path="/admin/*" element={
          <AdminLayout
            integrations={integrations}
            toggleIntegration={toggleIntegration}
            deploymentState={deploymentState}
            setDeploymentState={setDeploymentState}
            userRole="founder"
          />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

