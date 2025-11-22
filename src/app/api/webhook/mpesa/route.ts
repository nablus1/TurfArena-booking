import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('M-Pesa Callback:', JSON.stringify(body, null, 2));

    // M-Pesa callback structure
    const { Body } = body;
    const { stkCallback } = Body;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
      include: {
        booking: {
          include: {
            timeSlot: true,
            user: true,
          },
        },
      },
    });

    if (!payment) {
      console.error('Payment not found for checkout:', CheckoutRequestID);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // ResultCode 0 means success
    if (ResultCode === 0) {
      // Extract callback data
      const metadata = CallbackMetadata?.Item || [];
      const receiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNumber: receiptNumber,
          paidAt: new Date(),
        },
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });

      console.log('✓ Payment successful:', receiptNumber);

      // TODO: Generate PDF ticket here
      // TODO: Send email with ticket
      
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
        },
      });

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CANCELLED' },
      });

      console.log('✗ Payment failed:', ResultDesc);
    }

    return NextResponse.json({ 
      ResultCode: 0,
      ResultDesc: 'Success' 
    });
    
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json(
      { 
        ResultCode: 1,
        ResultDesc: 'Failed' 
      },
      { status: 500 }
    );
  }
}
