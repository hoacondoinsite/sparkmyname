/**
 * HOA_CODE_06 — App.jsx
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Main app entry point integrating the activation engine.
 * Reads deployment state from Supabase when connected.
 * Falls back to LIVE mode display when not connected.
 * All routes intact including /admin founder-only section.
 *
 * SOP (embedded per Founder Override):
 * 1. This replaces your existing src/App.jsx completely
 * 2. The activation engine runs ONCE at startup before any render
 * 3. platformState is passed as context to all child components
 * 4. ROLLBACK: Change line marked ROLLBACK_LINE from 'LIVE' to 'TESTING' → commit → auto-deploys
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { activateAll, getFeatureFlags, getStatusBannerProps, PlatformMode } from './lib/HOA_activationEngine';
import { authHelpers } from './lib/HOA_supabaseConfig';

// ─────────────────────────────────────────────
// ROLLBACK_LINE: Change 'LIVE' to 'TESTING' to disable orders
// ─────────────────────────────────────────────
const OVERRIDE_MODE = 'LIVE'; // ROLLBACK_LINE — line 67

// ─────────────────────────────────────────────
// PLATFORM CONTEXT
// ─────────────────────────────────────────────
export const PlatformContext = createContext(null);
export const usePlatform = () => useContext(PlatformContext);

// ─────────────────────────────────────────────
// LAZY-LOADED PAGES
// ─────────────────────────────────────────────
const Landing = React.lazy(() => import('./pages/HOA_Landing'));
const OrderFlow = React.lazy(() => import('./pages/HOA_OrderFlow'));
const Dashboard = React.lazy(() => import('./pages/HOA_Dashboard'));
const AdminLayout = React.lazy(() => import('./pages/admin/HOA_AdminLayout'));

// ─────────────────────────────────────────────
// STATUS BANNER COMPONENT
// ─────────────────────────────────────────────
const StatusBanner = ({ bannerProps }) => {
  if (!bannerProps.show) return null;

  const colors = {
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    error: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' },
  };
  const c = colors[bannerProps.type] || colors.info;

  return (
    <div style={{
      background: c.bg,
      borderBottom: `2px solid ${c.border}`,
      color: c.text,
      padding: '10px 24px',
      textAlign: 'center',
      fontSize: '13px',
      fontWeight: '600',
      position: 'sticky',
      top: 0,
      zIndex: 9999,
    }}>
      {bannerProps.message}
    </div>
  );
};

// ─────────────────────────────────────────────
// AUTH GUARD (for /admin routes)
// ─────────────────────────────────────────────
const RequireFounder = ({ children }) => {
  const { user } = usePlatform();

  // In OFFLINE/dev mode — allow access for founder
  if (!user && OVERRIDE_MODE !== 'LIVE') {
    return children;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check founder role
  if (user.role !== 'founder' && user.user_metadata?.role !== 'founder') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────
// LOADING SCREEN
// ─────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a2744',
    flexDirection: 'column',
    gap: '16px',
  }}>
    <div style={{ color: '#c9a84c', fontSize: '28px', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>
      HOACONDInsight™
    </div>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #c9a84c40',
      borderTop: '3px solid #c9a84c',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ color: '#a0aec0', fontSize: '13px' }}>Activating platform services…</div>
  </div>
);

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [platformState, setPlatformState] = useState(null);
  const [featureFlags, setFeatureFlags] = useState(null);
  const [bannerProps, setBannerProps] = useState({ show: false });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── ACTIVATION: runs once on mount ──────────
  useEffect(() => {
    const state = activateAll();

    // Override mode check (ROLLBACK_LINE)
    if (OVERRIDE_MODE === 'TESTING') {
      state.mode = PlatformMode.TESTING;
      state.isLive = false;
    }

    setPlatformState(state);
    setFeatureFlags(getFeatureFlags());
    setBannerProps(getStatusBannerProps());
  }, []);

  // ── AUTH STATE ───────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = authHelpers.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    // Initial session check
    authHelpers.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ── LOADING ──────────────────────────────────
  if (!platformState || authLoading) {
    return <LoadingScreen />;
  }

  const contextValue = {
    platformState,
    featureFlags,
    user,
    isFounder: user?.role === 'founder' || user?.user_metadata?.role === 'founder',
    overrideMode: OVERRIDE_MODE,
  };

  return (
    <PlatformContext.Provider value={contextValue}>
      <Router>
        <StatusBanner bannerProps={bannerProps} />
        <React.Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/order" element={<OrderFlow />} />
            <Route path="/order-confirmation" element={<OrderFlow step="confirmation" />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin / Founder OS */}
            <Route
              path="/admin/*"
              element={
                <RequireFounder>
                  <AdminLayout />
                </RequireFounder>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Router>
    </PlatformContext.Provider>
  );
}
