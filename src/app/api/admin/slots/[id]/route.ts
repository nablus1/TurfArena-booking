// app/api/admin/slots/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const slotId = params.id;
    const body = await req.json();

    // Check if slot exists
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
    });

    if (!existingSlot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Update the slot
    const updatedSlot = await prisma.timeSlot.update({
      where: { id: slotId },
      data: {
        ...(body.startTime && { startTime: body.startTime }),
        ...(body.endTime && { endTime: body.endTime }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      },
    });

    return NextResponse.json(updatedSlot);
  } catch (err) {
    console.error('Update slot error:', err);
    return NextResponse.json({ 
      error: "Failed to update slot",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const slotId = params.id;

    // Check if slot has bookings
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot._count.bookings > 0) {
      return NextResponse.json({ 
        error: "Cannot delete slot with existing bookings" 
      }, { status: 400 });
    }

    // Delete the slot
    await prisma.timeSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({ 
      message: "Slot deleted successfully" 
    });
  } catch (err) {
    console.error('Delete slot error:', err);
    return NextResponse.json({ 
      error: "Failed to delete slot",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}