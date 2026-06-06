// src/app/api/bookings/validate/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, validatedBy, location } = body;

    if (!bookingId || !validatedBy) {
      return NextResponse.json(
        { error: "bookingId and validatedBy are required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        isValidated: true,
        validatedAt: new Date(),
        validatedBy,
        status: "COMPLETED",
      },
    });

    // optional: create validation record if you want audit trail
    await prisma.validation.create({
      data: {
        bookingId,
        validatedBy,
        location: location || "Main Entrance",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking validated successfully",
      booking: updated,
    });
  } catch (error: any) {
    console.error("Validation error:", error);

    return NextResponse.json(
      {
        error: "Failed to validate booking",
        details: error.message,
      },
      { status: 500 }
    );
  }
}