"use client";

import { useState } from "react";
import { api } from "../lib/api";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setUploadResult(null);
      setSendResult(null);
      
      const res = await api.uploadSalary(file, month, year);
      setUploadResult({ success: true, message: res.message, data: res.data });
    } catch (err) {
      setUploadResult({ success: false, message: err.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleSendEmails() {
    try {
      setSending(true);
      const res = await api.sendSalarySlips(month, year);
      setSendResult({ success: true, message: res.message, data: res.data });
    } catch (err) {
      setSendResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Generate Salary Slips</h1>
        <p className="page-subtitle">Upload monthly payroll data and dispatch PDFs to employees</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '24px' }}>
        {/* Step 1: Upload */}
        <div className="card">
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary-color)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Upload Payroll Data</h2>
          </div>
          
          <form onSubmit={handleUpload}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Month</label>
                <select className="form-input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Year</label>
                <input type="number" className="form-input" value={year} onChange={(e) => setYear(Number(e.target.value))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select File (CSV/Excel)</label>
              <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: '8px', 
                padding: '32px 16px', 
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('salary-file').click()}
              >
                <input 
                  type="file" 
                  id="salary-file" 
                  accept=".csv,.xlsx,.xls" 
                  style={{ display: 'none' }} 
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>Browse Files</div>
                {file ? (
                  <div style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{file.name}</div>
                ) : (
                  <>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Click to browse</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>CSV or Excel with base_salary, hra, allowances, deductions</div>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!file || uploading}>
              {uploading ? "Processing..." : "Process Salary Data"}
            </button>
          </form>

          {uploadResult && (
            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              {uploadResult.message}
            </div>
          )}
        </div>

        {/* Step 2: Dispatch */}
        <div className="card" style={{ opacity: uploadResult?.success ? 1 : 0.5, pointerEvents: uploadResult?.success ? 'auto' : 'none' }}>
           <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: uploadResult?.success ? 'var(--primary-color)' : 'var(--border-color)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'all 0.3s ease' }}>2</div>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Review & Dispatch</h2>
            </div>
            
            {uploadResult?.success && (
              <button className="btn btn-primary" onClick={handleSendEmails} disabled={sending}>
                {sending ? "Sending..." : "Generate & Send All PDFs"}
              </button>
            )}
          </div>

          {sendResult && (
            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              {sendResult.message}
            </div>
          )}

          {uploadResult?.success ? (
            <div className="table-container" style={{ maxHeight: '400px' }}>
              <table>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-surface)' }}>
                  <tr>
                    <th>Employee</th>
                    <th>Base</th>
                    <th>Earned</th>
                    <th>Deducted</th>
                    <th style={{ color: 'var(--text-primary)' }}>Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResult.data.map(record => (
                    <tr key={record.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{record.employee.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{record.employee.employeeId}</div>
                      </td>
                      <td>₹{record.baseSalary.toLocaleString()}</td>
                      <td>₹{(record.hra + record.allowances).toLocaleString()}</td>
                      <td>-₹{record.deductions.toLocaleString()}</td>
                      <td style={{ fontWeight: 700 }}>₹{record.netSalary.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              Upload and process a file to see preview here.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
