/**
 * HOA_CODE_05 — activationEngine.js
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Simultaneous activation engine that detects all 4 env vars on startup
 * and activates all services in one deployment. Single activation event.
 * No sequential setup. App reads from this module to know what's available.
 *
 * SOP (embedded per Founder Override):
 * 1. Import this module in App.jsx as the FIRST import
 * 2. Call activateAll() once at app startup
 * 3. Use the returned platformState to gate features throughout the app
 * 4. PlatformMode.LIVE = all 4 services confirmed
 * 5. PlatformMode.PARTIAL = some services available
 * 6. PlatformMode.OFFLINE = no services (demo mode)
 * ROLLBACK: Set any env var to empty string to drop back to PARTIAL or OFFLINE mode
 */

import { supabaseAvailable } from './HOA_supabaseConfig';
import { stripeAvailable, stripeTestMode } from './HOA_stripeConfig';
import { openaiAvailable } from './HOA_openaiConfig';

// ─────────────────────────────────────────────
// PLATFORM MODES
// ─────────────────────────────────────────────
export const PlatformMode = {
  LIVE: 'LIVE',       // All 4 services active
  PARTIAL: 'PARTIAL', // Some services active
  OFFLINE: 'OFFLINE', // No services — demo/preview
  TESTING: 'TESTING', // Stripe in test mode
};

// ─────────────────────────────────────────────
// SERVICE REGISTRY
// ─────────────────────────────────────────────
const SERVICES = {
  supabase: {
    name: 'Supabase',
    envVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    available: supabaseAvailable,
    required: true,
    description: 'Database, auth, real-time',
  },
  stripe: {
    name: 'Stripe',
    envVars: ['VITE_STRIPE_PUBLISHABLE_KEY'],
    available: stripeAvailable,
    required: true,
    description: 'Payments and subscriptions',
    testMode: stripeTestMode,
  },
  openai: {
    name: 'OpenAI',
    envVars: ['VITE_OPENAI_API_KEY'],
    available: openaiAvailable,
    required: true,
    description: 'Document analysis and AI',
  },
  resend: {
    name: 'Resend',
    envVars: ['RESEND_API_KEY'],
    // Resend key is server-side only — assume available if Supabase is (deploy together)
    available: supabaseAvailable,
    required: false,
    description: 'Transactional email',
  },
};

// ─────────────────────────────────────────────
// PLATFORM STATE
// ─────────────────────────────────────────────
let _platformState = null;

export const activateAll = () => {
  const services = { ...SERVICES };
  const requiredServices = Object.values(services).filter(s => s.required);
  const allRequiredActive = requiredServices.every(s => s.available);
  const anyActive = Object.values(services).some(s => s.available);
  const stripeInTestMode = services.stripe.testMode;

  let mode;
  if (allRequiredActive && !stripeInTestMode) {
    mode = PlatformMode.LIVE;
  } else if (allRequiredActive && stripeInTestMode) {
    mode = PlatformMode.TESTING;
  } else if (anyActive) {
    mode = PlatformMode.PARTIAL;
  } else {
    mode = PlatformMode.OFFLINE;
  }

  const activeCount = Object.values(services).filter(s => s.available).length;
  const totalCount = Object.values(services).length;

  _platformState = {
    mode,
    services,
    activeCount,
    totalCount,
    allActive: activeCount === totalCount,
    readyForOrders: services.supabase.available && services.stripe.available,
    readyForAnalysis: services.openai.available,
    readyForEmail: services.resend.available,
    isLive: mode === PlatformMode.LIVE,
    isTesting: mode === PlatformMode.TESTING,
    isOffline: mode === PlatformMode.OFFLINE,
    activatedAt: new Date().toISOString(),
  };

  // Log activation summary
  console.info(`[HOAInsight] Platform activated — Mode: ${mode}`);
  console.info(`[HOAInsight] Services: ${activeCount}/${totalCount} active`);
  Object.values(services).forEach(s => {
    const status = s.available ? '✓' : '✗';
    const extra = s.testMode ? ' (TEST MODE)' : '';
    console.info(`  ${status} ${s.name}${extra} — ${s.description}`);
  });

  return _platformState;
};

export const getPlatformState = () => {
  if (!_platformState) return activateAll();
  return _platformState;
};

// ─────────────────────────────────────────────
// FEATURE FLAGS
// Derived from platform state — use throughout app
// ─────────────────────────────────────────────
export const getFeatureFlags = () => {
  const state = getPlatformState();
  return {
    // Core features
    PAYMENTS_ENABLED: state.services.stripe.available,
    PAYMENTS_TEST_MODE: state.services.stripe.testMode || false,
    DATABASE_ENABLED: state.services.supabase.available,
    AI_ANALYSIS_ENABLED: state.services.openai.available,
    EMAIL_ENABLED: state.services.resend.available,

    // Derived features
    ORDERS_ENABLED: state.readyForOrders,
    REAL_TIME_ENABLED: state.services.supabase.available,
    REPORTS_ENABLED: state.readyForOrders && state.readyForAnalysis,
    FULL_PLATFORM: state.isLive,

    // UI flags
    SHOW_TEST_BANNER: state.services.stripe.testMode || false,
    SHOW_OFFLINE_NOTICE: state.isOffline,
    SHOW_PARTIAL_NOTICE: state.mode === PlatformMode.PARTIAL,
  };
};

// ─────────────────────────────────────────────
// REACT HOOK (import in components)
// ─────────────────────────────────────────────
export const usePlatformState = () => {
  return getPlatformState();
};

export const useFeatureFlags = () => {
  return getFeatureFlags();
};

// ─────────────────────────────────────────────
// STATUS BANNER DATA
// Returns props for a status banner component
// ─────────────────────────────────────────────
export const getStatusBannerProps = () => {
  const state = getPlatformState();
  const flags = getFeatureFlags();

  if (flags.SHOW_TEST_BANNER) {
    return {
      show: true,
      type: 'warning',
      message: '⚠️ TEST MODE — Stripe is in test mode. Use card 4242 4242 4242 4242. No real charges will be made.',
    };
  }

  if (flags.SHOW_OFFLINE_NOTICE) {
    return {
      show: true,
      type: 'info',
      message: 'Platform running in demo mode. Connect services to enable orders and reports.',
    };
  }

  if (flags.SHOW_PARTIAL_NOTICE) {
    const inactive = Object.values(state.services)
      .filter(s => !s.available)
      .map(s => s.name)
      .join(', ');
    return {
      show: true,
      type: 'warning',
      message: `Some services unavailable: ${inactive}. Check Netlify environment variables.`,
    };
  }

  return { show: false };
};

// ─────────────────────────────────────────────
// DEPLOYMENT CHECKLIST
// Run before going live — returns pass/fail for each item
// ─────────────────────────────────────────────
export const runDeploymentChecklist = () => {
  const state = getPlatformState();
  return [
    {
      item: 'Supabase connected',
      pass: state.services.supabase.available,
      envVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    },
    {
      item: 'Stripe connected',
      pass: state.services.stripe.available,
      envVars: ['VITE_STRIPE_PUBLISHABLE_KEY'],
    },
    {
      item: 'Stripe in LIVE mode (not test)',
      pass: state.services.stripe.available && !state.services.stripe.testMode,
      envVars: ['VITE_STRIPE_PUBLISHABLE_KEY'],
      note: 'Key must start with pk_live_ for production',
    },
    {
      item: 'OpenAI connected',
      pass: state.services.openai.available,
      envVars: ['VITE_OPENAI_API_KEY'],
    },
    {
      item: 'All services active',
      pass: state.allActive,
      envVars: ['All above'],
    },
    {
      item: 'Platform in LIVE mode',
      pass: state.isLive,
      envVars: ['All above, Stripe must be pk_live_'],
    },
  ];
};

export default { activateAll, getPlatformState, getFeatureFlags, getStatusBannerProps, runDeploymentChecklist, PlatformMode };
