const API_BASE = "";

async function handleResponse(res) {
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export const api = {
  // Stats
  getStats: () => fetch(`${API_BASE}/api/stats`).then(handleResponse),

  // Employees
  getEmployees: () => fetch(`${API_BASE}/api/employees`).then(handleResponse),

  uploadEmployees: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_BASE}/api/employees`, { method: "POST", body: formData }).then(handleResponse);
  },

  addEmployee: (data) =>
    fetch(`${API_BASE}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateEmployee: (id, data) =>
    fetch(`${API_BASE}/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteEmployee: (id) =>
    fetch(`${API_BASE}/api/employees/${id}`, { method: "DELETE" }).then(handleResponse),

  // Salary
  uploadSalary: (file, month, year) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("month", month);
    formData.append("year", year);
    return fetch(`${API_BASE}/api/salary`, { method: "POST", body: formData }).then(handleResponse);
  },

  getSalaryRecords: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    return fetch(`${API_BASE}/api/salary?${params}`).then(handleResponse);
  },

  sendSalarySlips: (month, year) =>
    fetch(`${API_BASE}/api/salary/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    }).then(handleResponse),

  // Logs
  getEmailLogs: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.month) params.append("month", filters.month);
    if (filters.year) params.append("year", filters.year);
    return fetch(`${API_BASE}/api/logs?${params}`).then(handleResponse);
  },
};
