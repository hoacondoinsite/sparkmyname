/**
 * HOA_CODE_01 — supabaseConfig.js
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Complete Supabase connection module with all table schemas,
 * auth configuration, and real-time subscriptions.
 * Connects automatically when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * environment variables are present.
 *
 * SOP (embedded per Founder Override):
 * 1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify env vars
 * 2. Also set SUPABASE_SERVICE_ROLE_KEY for admin operations
 * 3. This module auto-detects presence of vars at runtime
 * 4. If vars are missing, module returns null client and logs warning
 * ROLLBACK: Remove env vars from Netlify to disable Supabase connection
 */

import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// ENV VAR DETECTION
// ─────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseAvailable = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!supabaseAvailable) {
  console.warn('[HOAInsight] Supabase env vars not detected. Running in offline mode.');
}

// ─────────────────────────────────────────────
// SUPABASE CLIENT
// ─────────────────────────────────────────────
export const supabase = supabaseAvailable
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })
  : null;

// ─────────────────────────────────────────────
// TABLE SCHEMA REFERENCE
// These match the Supabase tables required by HOACONDInsight
// ─────────────────────────────────────────────
export const TABLES = {
  USERS: 'users',
  ORDERS: 'orders',
  REPORTS: 'reports',
  DOCUMENTS: 'documents',
  AUDIT_LOG: 'audit_log',
  SUBSCRIPTIONS: 'subscriptions',
  HOA_COMMUNITIES: 'hoa_communities',
  COMPLIANCE_CHECKS: 'compliance_checks',
  NOTIFICATIONS: 'notifications',
  FOUNDER_CONTROL: 'founder_control', // Founder-only — DB-layer restricted
};

// ─────────────────────────────────────────────
// SQL SCHEMA — run in Supabase SQL editor to create all tables
// ─────────────────────────────────────────────
export const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('founder','admin','analyst','customer')),
  full_name TEXT,
  company_name TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','refunded','cancelled')),
  product_type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  hoa_community_name TEXT,
  hoa_address TEXT,
  hoa_state TEXT,
  documents_uploaded BOOLEAN DEFAULT FALSE,
  report_delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES users(id),
  report_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','completed','error')),
  hoa_health_score INTEGER,
  fannie_mae_compliant BOOLEAN,
  ll_2026_03_flags JSONB,
  report_url TEXT,
  pdf_url TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES users(id),
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  analyzed BOOLEAN DEFAULT FALSE,
  analysis_result JSONB,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (enterprise)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOA Communities (for monitoring)
CREATE TABLE IF NOT EXISTS hoa_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_name TEXT NOT NULL,
  address TEXT,
  state TEXT,
  unit_count INTEGER,
  last_analyzed TIMESTAMPTZ,
  compliance_status TEXT,
  reserve_funding_pct DECIMAL,
  master_policy_deductible DECIMAL,
  ll_2026_03_status JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance checks
CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hoa_community_id UUID REFERENCES hoa_communities(id),
  order_id UUID REFERENCES orders(id),
  check_type TEXT NOT NULL,
  result TEXT,
  details JSONB,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Founder control (RLS: founder role only)
CREATE TABLE IF NOT EXISTS founder_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE founder_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder only" ON founder_control
  USING (auth.jwt() ->> 'role' = 'founder');
`;

// ─────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────
export const authHelpers = {
  signIn: async (email, password) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    if (!supabase) return;
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    if (!supabase) return { data: { session: null } };
    return await supabase.auth.getSession();
  },

  getUser: async () => {
    if (!supabase) return { data: { user: null } };
    return await supabase.auth.getUser();
  },

  onAuthStateChange: (callback) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ─────────────────────────────────────────────
// REAL-TIME SUBSCRIPTIONS
// ─────────────────────────────────────────────
export const subscribeToOrders = (userId, callback) => {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`orders:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: TABLES.ORDERS,
      filter: `user_id=eq.${userId}`,
    }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const subscribeToReports = (userId, callback) => {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`reports:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: TABLES.REPORTS,
      filter: `user_id=eq.${userId}`,
    }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

// ─────────────────────────────────────────────
// DATA ACCESS HELPERS
// ─────────────────────────────────────────────
export const db = {
  // Orders
  getOrders: async (userId) => {
    if (!supabase) return { data: [], error: null };
    return await supabase
      .from(TABLES.ORDERS)
      .select('*, reports(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  createOrder: async (orderData) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.from(TABLES.ORDERS).insert(orderData).select().single();
  },

  updateOrder: async (orderId, updates) => {
    if (!supabase) return { data: null, error: null };
    return await supabase
      .from(TABLES.ORDERS)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
  },

  // Reports
  getReport: async (orderId) => {
    if (!supabase) return { data: null, error: null };
    return await supabase
      .from(TABLES.REPORTS)
      .select('*')
      .eq('order_id', orderId)
      .single();
  },

  // Users
  getUserProfile: async (userId) => {
    if (!supabase) return { data: null, error: null };
    return await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
  },

  upsertUser: async (userData) => {
    if (!supabase) return { data: null, error: null };
    return await supabase
      .from(TABLES.USERS)
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single();
  },

  // Audit
  logAction: async (userId, action, resourceType, resourceId, metadata) => {
    if (!supabase) return;
    await supabase.from(TABLES.AUDIT_LOG).insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
  },

  // Notifications
  getNotifications: async (userId) => {
    if (!supabase) return { data: [], error: null };
    return await supabase
      .from(TABLES.NOTIFICATIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
  },

  markNotificationRead: async (notificationId) => {
    if (!supabase) return;
    await supabase
      .from(TABLES.NOTIFICATIONS)
      .update({ read: true })
      .eq('id', notificationId);
  },
};

export default supabase;
