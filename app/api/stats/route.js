import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "../../lib/prisma";

// GET /api/stats — dashboard stats
export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [
      totalEmployees,
      totalSlipsThisMonth,
      emailsSent,
      emailsFailed,
      emailsPending,
      recentLogs,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.salaryRecord.count({
        where: { month: currentMonth, year: currentYear },
      }),
      prisma.emailLog.count({ 
        where: { 
          status: "sent",
          salaryRecord: { month: currentMonth, year: currentYear }
        } 
      }),
      prisma.emailLog.count({ 
        where: { 
          status: "failed",
          salaryRecord: { month: currentMonth, year: currentYear }
        } 
      }),
      prisma.salaryRecord.count({
        where: {
          month: currentMonth,
          year: currentYear,
          emailLog: { is: null },
        },
      }),
      prisma.emailLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          employee: { select: { name: true, employeeId: true } },
          salaryRecord: { select: { month: true, year: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        totalSlipsThisMonth,
        emailsSent,
        emailsFailed,
        emailsPending,
        recentLogs,
      },
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats", error: error.message },
      { status: 500 }
    );
  }
}
