import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "../../../lib/prisma";

// PUT /api/employees/[id] — update employee
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, designation, department } = body;

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(designation && { designation }),
        ...(department !== undefined && { department }),
      },
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error("PUT /api/employees/[id] error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update employee", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] — delete employee
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Employee deleted" });
  } catch (error) {
    console.error("DELETE /api/employees/[id] error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to delete employee", error: error.message },
      { status: 500 }
    );
  }
}
