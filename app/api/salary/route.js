import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "../../lib/prisma";
import { parseFileBuffer, validateSalaryData } from "../../lib/fileParser";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { generateSalarySlipPDF } from "../../lib/pdfGenerator";
import { sendSalaryEmail } from "../../lib/mailer";

// GET /api/salary — get salary records (optional ?month=&year=&employeeId=)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const employeeId = searchParams.get("employeeId");

    const where = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (employeeId) where.employeeId = employeeId;

    const records = await prisma.salaryRecord.findMany({
      where,
      include: {
        employee: { select: { name: true, email: true, designation: true, department: true } },
        emailLog: { select: { status: true, sentAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("GET /api/salary error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch salary records", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/salary — upload salary CSV/Excel for a given month/year
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const month = parseInt(formData.get("month"));
    const year = parseInt(formData.get("year"));

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }
    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json({ success: false, message: "Invalid month or year" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { rows } = parseFileBuffer(buffer, file.name);

    // Validate salary data
    const errors = validateSalaryData(rows);
    if (errors.length > 0) {
      return NextResponse.json({ success: false, message: "Validation errors", errors }, { status: 400 });
    }

    // Check all employee IDs exist
    const employeeIds = rows.map((r) => r.employee_id);
    const existingEmployees = await prisma.employee.findMany({
      where: { employeeId: { in: employeeIds } },
      select: { employeeId: true, name: true, email: true, designation: true, department: true },
    });
    const existingSet = new Set(existingEmployees.map((e) => e.employeeId));
    const missing = employeeIds.filter((id) => !existingSet.has(id));

    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, message: `Employee IDs not found: ${missing.join(", ")}. Please register them first.` },
        { status: 400 }
      );
    }

    // Upload file to Cloudinary
    try {
      await uploadToCloudinary(buffer, file.name);
    } catch (cloudErr) {
      console.error("Cloudinary upload failed (non-blocking):", cloudErr.message);
    }

    // Upsert salary records
    const results = [];
    for (const row of rows) {
      const baseSalary = parseFloat(row.base_salary);
      const hra = parseFloat(row.hra);
      const allowances = parseFloat(row.allowances);
      const deductions = parseFloat(row.deductions);
      const netSalary = baseSalary + hra + allowances - deductions;

      const record = await prisma.salaryRecord.upsert({
        where: {
          employeeId_month_year: {
            employeeId: row.employee_id,
            month,
            year,
          },
        },
        update: { baseSalary, hra, allowances, deductions, netSalary },
        create: {
          employeeId: row.employee_id,
          baseSalary,
          hra,
          allowances,
          deductions,
          netSalary,
          month,
          year,
        },
        include: {
          employee: { select: { name: true, email: true, designation: true, department: true } },
        },
      });
      results.push(record);
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} salary records processed for ${month}/${year}`,
      data: results,
    });
  } catch (error) {
    console.error("POST /api/salary error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process salary data", error: error.message },
      { status: 500 }
    );
  }
}
