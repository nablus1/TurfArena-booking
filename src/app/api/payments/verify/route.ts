// src/app/api/payments/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: "checkoutRequestId is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: {
        checkoutRequestId,
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        receiptNumber: payment.mpesaReceiptNumber,
        paidAt: payment.paidAt,
      },
      booking: {
        id: payment.booking.id,
        bookingReference: payment.booking.bookingReference,
        status: payment.booking.status,
      },
    });

  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}