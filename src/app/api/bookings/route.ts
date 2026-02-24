import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId, timeSlotId, playerCount = 1, totalAmount, notes } = data;

    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({
        where: { id: timeSlotId },
        include: { bookings: true },
      });

      if (!slot) throw new Error("Time slot not found");

      const activeBookings = slot.bookings.filter(
        b =>
          b.status === BookingStatus.PENDING ||
          b.status === BookingStatus.CONFIRMED
      ).length;

      if (activeBookings >= slot.maxBookings) {
        throw new Error("This slot is fully booked");
      }

      const booking = await tx.booking.create({
        data: {
          userId: userId ?? null,
          timeSlotId,
          totalAmount,
          playerCount,
          notes: notes ?? null,
          status: BookingStatus.CONFIRMED, // auto-confirm for demo
        },
      });

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId: userId ?? null,
          amount: totalAmount,
          currency: "KES",
          paymentMethod: "CASH",
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });

      return { booking, payment };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 400 }
    );
  }
}
//  GET all bookings(for Admin page)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        timeSlot: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

