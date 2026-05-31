"use client";

import { useState, useEffect } from "react";
import { api } from "../lib/api";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      const res = await api.getEmailLogs();
      setLogs(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(log => filter === "all" || log.status === filter);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Email Logs</h1>
          <p className="page-subtitle">Track the status of all sent salary slips</p>
        </div>
        
        <div>
          <select 
            className="form-input" 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent Successfully</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading logs...</div>
        ) : error ? (
          <div style={{ color: 'var(--danger-color)', padding: '20px' }}>{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            No email logs found for the selected filter.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Salary Month</th>
                  <th>Recipient Email</th>
                  <th>Status</th>
                  <th>Sent Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{log.employee.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.employee.employeeId}</div>
                    </td>
                    <td>{log.salaryRecord.month}/{log.salaryRecord.year}</td>
                    <td>
                      <div style={{ wordBreak: 'break-all' }}>{log.recipientEmail}</div>
                      {log.errorMessage && (
                        <div style={{ color: 'var(--danger-color)', fontSize: '12px', marginTop: '4px' }}>
                          Error: {log.errorMessage}
                        </div>
                      )}
                    </td>
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
        )}
      </div>
    </>
  );
}
