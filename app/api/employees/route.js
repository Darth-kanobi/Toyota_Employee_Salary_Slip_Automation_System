import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "../../lib/prisma";
import { parseFileBuffer, validateEmployeeData } from "../../lib/fileParser";
import { uploadToCloudinary } from "../../lib/cloudinary";

// GET /api/employees — list all employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { salaries: true } } },
    });
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch employees", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/employees — add single or bulk employees (JSON body or file upload)
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle file upload (CSV/Excel)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file) {
        return NextResponse.json(
          { success: false, message: "No file uploaded" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { rows } = parseFileBuffer(buffer, file.name);

      // Validate
      const errors = validateEmployeeData(rows);
      if (errors.length > 0) {
        return NextResponse.json(
          { success: false, message: "Validation errors", errors },
          { status: 400 }
        );
      }

      // Upload file to Cloudinary for archival
      try {
        await uploadToCloudinary(buffer, file.name);
      } catch (cloudErr) {
        console.error("Cloudinary upload failed (non-blocking):", cloudErr.message);
      }

      // Upsert employees
      const results = [];
      for (const row of rows) {
        const employee = await prisma.employee.upsert({
          where: { employeeId: row.employee_id },
          update: {
            name: row.name,
            email: row.email,
            designation: row.designation,
            department: row.department || null,
          },
          create: {
            employeeId: row.employee_id,
            name: row.name,
            email: row.email,
            designation: row.designation,
            department: row.department || null,
          },
        });
        results.push(employee);
      }

      return NextResponse.json({
        success: true,
        message: `${results.length} employees imported successfully`,
        data: results,
      });
    }

    // Handle JSON body (single employee)
    const body = await request.json();
    const { employeeId, name, email, designation, department } = body;

    if (!employeeId || !name || !email || !designation) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: employeeId, name, email, designation" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: { employeeId, name, email, designation, department: department || null },
    });

    return NextResponse.json({ success: true, data: employee }, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Employee ID already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create employee", error: error.message },
      { status: 500 }
    );
  }
}
