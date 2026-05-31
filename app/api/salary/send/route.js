import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "../../../lib/prisma";
import { generateSalarySlipPDF } from "../../../lib/pdfGenerator";
import { sendSalaryEmail } from "../../../lib/mailer";

// POST /api/salary/send — generate PDFs and send emails for a given month/year
export async function POST(request) {
  try {
    const body = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json(
        { success: false, message: "month and year are required" },
        { status: 400 }
      );
    }

    const records = await prisma.salaryRecord.findMany({
      where: { month: parseInt(month), year: parseInt(year) },
      include: {
        employee: true,
        emailLog: true,
      },
    });

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, message: `No salary records found for ${month}/${year}` },
        { status: 404 }
      );
    }

    const results = { sent: 0, failed: 0, errors: [] };

    for (const record of records) {
      try {
        // Generate PDF
        const pdfBuffer = await generateSalarySlipPDF(record.employee, record);

        // Send email
        await sendSalaryEmail(record.employee, parseInt(month), parseInt(year), pdfBuffer);

        // Log success
        await prisma.emailLog.upsert({
          where: { salaryRecordId: record.id },
          update: {
            status: "sent",
            sentAt: new Date(),
            errorMessage: null,
          },
          create: {
            salaryRecordId: record.id,
            employeeId: record.employeeId,
            recipientEmail: record.employee.email,
            status: "sent",
            sentAt: new Date(),
          },
        });

        results.sent++;
      } catch (err) {
        console.error(`Failed to send to ${record.employee.email}:`, err.message);

        // Log failure
        await prisma.emailLog.upsert({
          where: { salaryRecordId: record.id },
          update: {
            status: "failed",
            errorMessage: err.message,
          },
          create: {
            salaryRecordId: record.id,
            employeeId: record.employeeId,
            recipientEmail: record.employee.email,
            status: "failed",
            errorMessage: err.message,
          },
        });

        results.failed++;
        results.errors.push({
          employeeId: record.employeeId,
          email: record.employee.email,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${records.length} salary slips: ${results.sent} sent, ${results.failed} failed`,
      data: results,
    });
  } catch (error) {
    console.error("POST /api/salary/send error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send salary slips", error: error.message },
      { status: 500 }
    );
  }
}
