import PDFDocument from "pdfkit";

export function generateSalarySlipPDF(employee, salaryRecord) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December",
      ];
      const monthName = monthNames[salaryRecord.month - 1] || "Unknown";
      const pageWidth = doc.page.width - 100;

      // Header background
      doc.rect(50, 50, pageWidth, 70).fill("#1a1a2e");
      doc.fontSize(22).fillColor("#ffffff").text("SALARY SLIP", 70, 65, { align: "left" });
      doc.fontSize(11).fillColor("#a0aec0").text(`${monthName} ${salaryRecord.year}`, 70, 92);

      // Company line
      doc.moveTo(50, 130).lineTo(50 + pageWidth, 130).strokeColor("#e2e8f0").lineWidth(1).stroke();
      doc.fontSize(9).fillColor("#a0aec0").text("CONFIDENTIAL - FOR EMPLOYEE USE ONLY", 50, 138, { align: "center", width: pageWidth });

      // Employee Details Section
      const detailsY = 165;
      doc.rect(50, detailsY, pageWidth, 90).fill("#f7fafc").stroke("#e2e8f0");

      doc.fontSize(10).fillColor("#667eea").font("Helvetica-Bold").text("EMPLOYEE DETAILS", 70, detailsY + 12);

      doc.font("Helvetica").fontSize(9).fillColor("#718096");
      const col1X = 70;
      const col2X = 310;
      let row = detailsY + 32;

      doc.text("Employee ID:", col1X, row);
      doc.font("Helvetica-Bold").fillColor("#2d3748").text(employee.employeeId, col1X + 80, row);

      doc.font("Helvetica").fillColor("#718096").text("Name:", col2X, row);
      doc.font("Helvetica-Bold").fillColor("#2d3748").text(employee.name, col2X + 80, row);

      row += 20;
      doc.font("Helvetica").fillColor("#718096").text("Designation:", col1X, row);
      doc.font("Helvetica-Bold").fillColor("#2d3748").text(employee.designation, col1X + 80, row);

      doc.font("Helvetica").fillColor("#718096").text("Department:", col2X, row);
      doc.font("Helvetica-Bold").fillColor("#2d3748").text(employee.department || "N/A", col2X + 80, row);

      // Earnings and Deductions Table
      const tableY = detailsY + 110;
      doc.fontSize(10).fillColor("#667eea").font("Helvetica-Bold").text("EARNINGS & DEDUCTIONS", 70, tableY);

      const tableStartY = tableY + 22;
      const colWidths = [pageWidth * 0.6, pageWidth * 0.4];

      // Table header
      doc.rect(50, tableStartY, pageWidth, 28).fill("#eef2ff");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#4a5568");
      doc.text("COMPONENT", 70, tableStartY + 9);
      doc.text("AMOUNT (₹)", 50 + colWidths[0] + 20, tableStartY + 9);

      // Table rows
      const rows = [
        { label: "Base Salary", amount: salaryRecord.baseSalary, type: "earning" },
        { label: "HRA (House Rent Allowance)", amount: salaryRecord.hra, type: "earning" },
        { label: "Other Allowances", amount: salaryRecord.allowances, type: "earning" },
        { label: "Total Earnings", amount: salaryRecord.baseSalary + salaryRecord.hra + salaryRecord.allowances, type: "subtotal" },
        { label: "Deductions", amount: salaryRecord.deductions, type: "deduction" },
      ];

      let currentY = tableStartY + 28;
      rows.forEach((row, i) => {
        const bgColor = row.type === "subtotal" ? "#edf2f7" : i % 2 === 0 ? "#ffffff" : "#fafafa";
        doc.rect(50, currentY, pageWidth, 26).fill(bgColor);

        if (row.type === "subtotal") {
          doc.font("Helvetica-Bold").fontSize(9).fillColor("#2d3748");
        } else {
          doc.font("Helvetica").fontSize(9).fillColor("#4a5568");
        }

        doc.text(row.label, 70, currentY + 8);
        const amountPrefix = row.type === "deduction" ? "- " : "";
        doc.text(`${amountPrefix}₹${row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 50 + colWidths[0] + 20, currentY + 8);
        currentY += 26;
      });

      // Net Salary
      currentY += 8;
      doc.rect(50, currentY, pageWidth, 40).fill("#1a1a2e");
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#ffffff");
      doc.text("NET SALARY", 70, currentY + 13);
      doc.fontSize(14).text(
        `₹${salaryRecord.netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        50 + colWidths[0] + 20,
        currentY + 12
      );

      // Footer
      currentY += 60;
      doc.moveTo(50, currentY).lineTo(50 + pageWidth, currentY).strokeColor("#e2e8f0").lineWidth(0.5).stroke();
      doc.fontSize(8).fillColor("#a0aec0").font("Helvetica");
      doc.text("This is a system-generated document and does not require a signature.", 50, currentY + 10, { align: "center", width: pageWidth });
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, 50, currentY + 24, { align: "center", width: pageWidth });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
