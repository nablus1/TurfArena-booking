import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

// GET single booking
export async function GET(_: Request, { params }: any) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        timeSlot: true,
        payment: true,
      },
    });

    if (!booking)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("GET booking error:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

// UPDATE booking
export async function PUT(req: Request, { params }: any) {
  try {
    const data = await req.json();

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT booking error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

// DELETE booking
export async function DELETE(_: Request, { params }: any) {
  try {
    await prisma.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE booking error:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
