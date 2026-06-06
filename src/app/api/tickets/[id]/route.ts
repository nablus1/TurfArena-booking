// src/app/api/tickets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
      include: {
        payment: true,
        timeSlot: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error: "Ticket not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        ticketUrl: booking.ticketUrl,
        qrCode: booking.qrCode,
        isValidated: booking.isValidated,
        validatedAt: booking.validatedAt,
        amount: booking.totalAmount,
        date: booking.timeSlot?.date,
        startTime: booking.timeSlot?.startTime,
        endTime: booking.timeSlot?.endTime,
      },
    });

  } catch (error) {
    console.error("Ticket fetch error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch ticket",
      },
      { status: 500 }
    );
  }
}