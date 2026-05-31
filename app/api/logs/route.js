import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "../../lib/prisma";

// GET /api/logs — get email logs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where = {};
    if (status) where.status = status;

    if (month || year) {
      where.salaryRecord = {};
      if (month) where.salaryRecord.month = parseInt(month);
      if (year) where.salaryRecord.year = parseInt(year);
    }

    const logs = await prisma.emailLog.findMany({
      where,
      include: {
        employee: { select: { name: true, employeeId: true } },
        salaryRecord: { select: { month: true, year: true, netSalary: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch email logs", error: error.message },
      { status: 500 }
    );
  }
}
