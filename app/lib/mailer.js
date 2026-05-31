import nodemailer from "nodemailer";
import dns from "dns/promises";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export function buildEmailHtml(employeeName, month, year) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthName = monthNames[month - 1] || "Unknown";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; padding: 40px 0; }
        .container { max-width: 520px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 28px; }
        .header h1 { color: #fff; margin: 0; font-size: 20px; letter-spacing: 0.5px; }
        .header p { color: #a0aec0; margin: 6px 0 0; font-size: 13px; }
        .body { padding: 28px; color: #2d3748; line-height: 1.7; font-size: 15px; }
        .highlight { background: #eef2ff; border-left: 4px solid #667eea; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-weight: 500; }
        .footer { padding: 20px 28px; background: #f7fafc; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Salary Slip</h1>
          <p>${monthName} ${year}</p>
        </div>
        <div class="body">
          <p>Dear <strong>${employeeName}</strong>,</p>
          <p>Please find your salary slip for the month of <strong>${monthName} ${year}</strong> attached to this email.</p>
          <div class="highlight">
            📎 Your salary slip PDF is attached below.
          </div>
          <p>If you have any questions regarding your salary, please reach out to the HR department.</p>
          <p>Best regards,<br><strong>HR Department</strong></p>
        </div>
        <div class="footer">
          This is an automated email. Please do not reply directly.
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendSalaryEmail(employee, month, year, pdfBuffer) {
  if (!employee.email || !employee.email.includes('@')) {
    throw new Error(`Invalid email address format for ${employee.name}`);
  }
  
  const domain = employee.email.split('@')[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      throw new Error(`Domain ${domain} has no mail servers.`);
    }
  } catch (err) {
    throw new Error(`Invalid or non-existent email domain for ${employee.email}`);
  }

  const html = buildEmailHtml(employee.name, month, year);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthName = monthNames[month - 1] || "Unknown";

  const mailOptions = {
    from: `"HR Department" <${process.env.GMAIL_USER}>`,
    to: employee.email,
    subject: `Salary Slip - ${monthName} ${year}`,
    html,
    attachments: [
      {
        filename: `SalarySlip_${employee.name.replace(/\s+/g, "_")}_${monthName}_${year}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  return transporter.sendMail(mailOptions);
}
