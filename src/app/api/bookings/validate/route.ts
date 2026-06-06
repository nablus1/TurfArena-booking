// src/app/api/bookings/validate/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { bookingReference } = await req.json();

    if (!bookingReference) {
      return NextResponse.json(
        { error: "Booking reference is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        bookingReference,
      },
      include: {
        timeSlot: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          valid: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    if (booking.isValidated) {
      return NextResponse.json(
        {
          valid: false,
          message: "Booking already validated",
          booking,
        },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        isValidated: true,
        validatedAt: new Date(),
      },
    });

    return NextResponse.json({
      valid: true,
      message: "Booking validated successfully",
      booking: updatedBooking,
    });

  } catch (error) {
    console.error("Booking validation error:", error);

    return NextResponse.json(
      {
        error: "Failed to validate booking",
      },
      { status: 500 }
    );
  }
}