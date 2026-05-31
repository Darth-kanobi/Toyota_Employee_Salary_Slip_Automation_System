"use client";

import { useState, useEffect } from "react";
import { api } from "../lib/api";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ employeeId: "", name: "", email: "", designation: "", department: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const res = await api.getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await api.uploadEmployees(file);
      await loadEmployees();
      alert("Employees uploaded successfully");
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.addEmployee(formData);
      await loadEmployees();
      setIsModalOpen(false);
      setFormData({ employeeId: "", name: "", email: "", designation: "", department: "" });
    } catch (err) {
      alert(`Add failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.deleteEmployee(id);
      await loadEmployees();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your organization's workforce</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div>
            <input 
              type="file" 
              id="csv-upload" 
              accept=".csv,.xlsx,.xls" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <label htmlFor="csv-upload" className="btn btn-secondary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
              {uploading ? (
                <>
                  <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1px' }}></div>
                  Uploading...
                </>
              ) : "Bulk Upload"}
            </label>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Employee
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="form-input" 
            style={{ maxWidth: '300px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : error ? (
          <div style={{ color: 'var(--danger-color)', padding: '20px' }}>{error}</div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No employees found. Add one or upload a CSV file.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 500 }}>{emp.employeeId}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.department || "-"}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <div className={`modal-overlay ${isModalOpen ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
        <div className="modal-content">
          <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>Add New Employee</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Employee ID *</label>
              <input required type="text" className="form-input" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} placeholder="e.g. EMP001" />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@company.com" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Designation *</label>
                <input required type="text" className="form-input" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Software Engineer" />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input type="text" className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Engineering" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
