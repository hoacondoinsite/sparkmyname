/**
 * HOA_CODE_12 — Dashboard.jsx
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Customer dashboard with real Supabase data when connected,
 * order history, report status, active monitoring.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../HOA_App';
import { authHelpers, db, subscribeToOrders } from '../lib/HOA_supabaseConfig';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, featureFlags } = usePlatform() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      if (featureFlags?.DATABASE_ENABLED) {
        const [ordersResult, notifsResult] = await Promise.all([
          db.getOrders(user.id),
          db.getNotifications(user.id),
        ]);
        if (ordersResult.data) setOrders(ordersResult.data);
        if (notifsResult.data) setNotifications(notifsResult.data);
      } else {
        // Demo data
        setOrders([
          {
            id: 'demo-1',
            order_number: 'HOA-DEMO-001',
            status: 'completed',
            product_type: 'basic_report',
            amount_cents: 3900,
            hoa_community_name: 'Lakeshore Colony Master Association',
            hoa_state: 'FL',
            created_at: new Date().toISOString(),
            reports: [{ hoa_health_score: 72, fannie_mae_compliant: true, status: 'completed' }],
          },
        ]);
      }
      setLoading(false);
    };

    loadData();

    // Real-time subscription
    if (featureFlags?.DATABASE_ENABLED && user) {
      const unsub = subscribeToOrders(user.id, () => loadData());
      return unsub;
    }
  }, [user, featureFlags]);

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
    processing: { bg: '#eff6ff', text: '#1e40af', label: 'Processing' },
    completed: { bg: '#f0fdf4', text: '#166534', label: 'Completed' },
    cancelled: { bg: '#fef2f2', text: '#991b1b', label: 'Cancelled' },
  };

  const scoreColor = (score) => score >= 75 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626';

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f7f4', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#1a2744', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
          HOACONDInsight™
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>{user?.email}</span>
          <button
            onClick={() => authHelpers.signOut().then(() => navigate('/'))}
            style={{ background: 'transparent', border: '1px solid #4b5563', color: '#9ca3af', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia, serif' }}
          >Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '48px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#1a2744', margin: '0 0 4px' }}>My Reports</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>HOA compliance reports and analysis history</p>
          </div>
          <button
            onClick={() => navigate('/order')}
            style={{ background: '#1a2744', color: '#fff', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
          >
            + Order New Report
          </button>
        </div>

        {/* Notifications */}
        {notifications.filter(n => !n.read).length > 0 && (
          <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', padding: '16px 20px', marginBottom: '24px', borderRadius: '4px' }}>
            <div style={{ color: '#1e40af', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
              🔔 {notifications.filter(n => !n.read).length} New Notification{notifications.filter(n => !n.read).length > 1 ? 's' : ''}
            </div>
            {notifications.filter(n => !n.read).slice(0, 3).map(n => (
              <div key={n.id} style={{ color: '#1e40af', fontSize: '13px', marginBottom: '4px' }}>• {n.title}</div>
            ))}
          </div>
        )}

        {/* Orders */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280' }}>Loading your reports…</div>
        ) : orders.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e0ddd5', padding: '80px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: '#1a2744', marginBottom: '8px' }}>No reports yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Order your first HOA compliance report today.</p>
            <button onClick={() => navigate('/order')} style={{
              background: '#1a2744', color: '#fff', border: 'none', padding: '14px 32px',
              fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif',
            }}>Order Report — $39 →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const report = order.reports?.[0];
              const sc = statusColors[order.status] || statusColors.pending;
              return (
                <div key={order.id} style={{ background: '#fff', border: '1px solid #e0ddd5', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#1a2744', fontWeight: 'bold', fontSize: '16px' }}>{order.hoa_community_name}</span>
                        <span style={{ background: sc.bg, color: sc.text, padding: '2px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>
                          {sc.label}
                        </span>
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>
                        {order.order_number} · {order.hoa_state} · ${(order.amount_cents / 100).toFixed(2)} ·{' '}
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {report && report.hoa_health_score && (
                      <div style={{ textAlign: 'center', minWidth: '80px' }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: scoreColor(report.hoa_health_score), lineHeight: '1' }}>
                          {report.hoa_health_score}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>HEALTH SCORE</div>
                        <div style={{ color: report.fannie_mae_compliant ? '#16a34a' : '#dc2626', fontSize: '11px', fontWeight: 'bold', marginTop: '2px' }}>
                          {report.fannie_mae_compliant ? '✓ WARRANTABLE' : '✗ NON-WARRANTABLE'}
                        </div>
                      </div>
                    )}

                    {order.status === 'completed' && report?.pdf_url && (
                      <a href={report.pdf_url} target="_blank" rel="noopener noreferrer" style={{
                        background: '#1a2744', color: '#fff', padding: '10px 20px',
                        textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', alignSelf: 'center',
                      }}>
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
