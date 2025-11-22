import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import prisma from '@/src/lib/db';

interface RouteParams {
  params: { checkoutRequestId: string };
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: params.checkoutRequestId },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      status: payment.status,
      receiptNumber: payment.mpesaReceiptNumber,
      booking: {
        id: payment.booking.id,
        status: payment.booking.status,
        ticketUrl: payment.booking.ticketUrl,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}