"use client";

import { useState, useEffect } from "react";
import { api } from "./lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getStats();
        setStats(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ borderColor: 'var(--danger-color)' }}>
        <p style={{ color: 'var(--danger-color)' }}>⚠️ Error loading dashboard: {error}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>Make sure your database connection is set up and working.</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your salary automation operations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatsCard 
          title="Total Employees" 
          value={stats?.totalEmployees || 0} 
        />
        <StatsCard 
          title="Slips This Month" 
          value={stats?.totalSlipsThisMonth || 0} 
        />
        <StatsCard 
          title="Emails Sent" 
          value={stats?.emailsSent || 0} 
        />
        <StatsCard 
          title="Failed Emails" 
          value={stats?.emailsFailed || 0} 
        />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Email Activity</h2>
        {stats?.recentLogs?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>Status</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{log.employee.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.employee.employeeId}</div>
                    </td>
                    <td>{log.salaryRecord.month}/{log.salaryRecord.year}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)' }}>
                        {log.status === 'sent' ? 'Sent' : log.status === 'failed' ? 'Failed' : 'Pending'}
                      </span>
                    </td>
                    <td>{log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
            No recent email activity. Start by uploading payroll data.
          </div>
        )}
      </div>
    </>
  );
}

function StatsCard({ title, value }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
