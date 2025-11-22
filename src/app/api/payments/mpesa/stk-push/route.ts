import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import prisma from '@/src/lib/db';
import { mpesaService } from '@/src/services/mpesa.service';
import { z } from 'zod';

const stkPushSchema = z.object({
  bookingId: z.string(),
  phoneNumber: z.string().regex(/^(254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = stkPushSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId },
      include: {
        timeSlot: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: booking.id },
    });

    if (existingPayment?.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Booking already paid' },
        { status: 400 }
      );
    }

    const stkResponse = await mpesaService.stkPush({
      phoneNumber: validated.phoneNumber,
      amount: booking.totalAmount,
      accountReference: booking.bookingReference,
      transactionDesc: `Juja Turf Booking - ${booking.bookingReference}`,
    });

    if (!stkResponse.success) {
      return NextResponse.json(
        { error: stkResponse.error },
        { status: 400 }
      );
    }

    const payment = existingPayment
      ? await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            checkoutRequestId: stkResponse.data.checkoutRequestId,
            merchantRequestId: stkResponse.data.merchantRequestId,
            mpesaPhoneNumber: validated.phoneNumber,
            status: 'PROCESSING',
          },
        })
      : await prisma.payment.create({
          data: {
            bookingId: booking.id,
            userId: session.user.id,
            amount: booking.totalAmount,
            paymentMethod: 'MPESA',
            checkoutRequestId: stkResponse.data.checkoutRequestId,
            merchantRequestId: stkResponse.data.merchantRequestId,
            mpesaPhoneNumber: validated.phoneNumber,
            status: 'PROCESSING',
          },
        });

    return NextResponse.json({
      success: true,
      message: stkResponse.data.customerMessage,
      payment: {
        id: payment.id,
        checkoutRequestId: payment.checkoutRequestId,
        status: payment.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('STK Push error:', error);
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}