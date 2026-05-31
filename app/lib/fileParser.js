import * as XLSX from "xlsx";

export function parseFileBuffer(buffer, filename) {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "csv") {
    return parseCSV(buffer);
  } else if (ext === "xlsx" || ext === "xls") {
    return parseExcel(buffer);
  } else {
    throw new Error(`Unsupported file format: .${ext}. Please upload CSV or Excel files.`);
  }
}

function parseCSV(buffer) {
  const text = buffer.toString("utf-8");
  const lines = text.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows.");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length !== headers.length) continue;

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });
    rows.push(row);
  }

  return { headers, rows };
}

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (jsonData.length === 0) {
    throw new Error("Excel file is empty or has no data rows.");
  }

  const headers = Object.keys(jsonData[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows = jsonData.map((row) => {
    const normalized = {};
    Object.entries(row).forEach(([key, value]) => {
      normalized[key.trim().toLowerCase().replace(/\s+/g, "_")] = String(value).trim();
    });
    return normalized;
  });

  return { headers, rows };
}

export function validateEmployeeData(rows) {
  const required = ["employee_id", "name", "email", "designation"];
  const errors = [];

  rows.forEach((row, i) => {
    required.forEach((field) => {
      if (!row[field] || row[field].toString().trim() === "") {
        errors.push(`Row ${i + 1}: Missing required field "${field}"`);
      }
    });
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push(`Row ${i + 1}: Invalid email "${row.email}"`);
    }
  });

  return errors;
}

export function validateSalaryData(rows) {
  const required = ["employee_id", "base_salary", "hra", "allowances", "deductions"];
  const errors = [];

  rows.forEach((row, i) => {
    required.forEach((field) => {
      if (row[field] === undefined || row[field] === null || row[field].toString().trim() === "") {
        errors.push(`Row ${i + 1}: Missing required field "${field}"`);
      }
    });
    ["base_salary", "hra", "allowances", "deductions"].forEach((f) => {
      if (row[f] && isNaN(Number(row[f]))) {
        errors.push(`Row ${i + 1}: "${f}" must be a number, got "${row[f]}"`);
      }
    });
  });

  return errors;
}
