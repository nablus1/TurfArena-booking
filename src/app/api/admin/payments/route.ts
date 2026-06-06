// app/api/admin/payments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all payments with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (method && method !== 'ALL') {
      where.paymentMethod = method;
    }

    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = {
        ...where.createdAt,
        lte: end,
      };
    }

    // Fetch payments with relations
    let payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            timeSlot: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      payments = payments.filter(payment => 
        payment.booking.bookingReference.toLowerCase().includes(searchLower) ||
        payment.mpesaReceiptNumber?.toLowerCase().includes(searchLower) ||
        payment.user?.name?.toLowerCase().includes(searchLower) ||
        payment.user?.email?.toLowerCase().includes(searchLower) ||
        payment.user?.phone?.includes(search)
      );
    }

    // Format payments for frontend
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      bookingReference: payment.booking.bookingReference,
      customerName: payment.user?.name || 'Guest User',
      customerEmail: payment.user?.email || 'N/A',
      customerPhone: payment.user?.phone || payment.mpesaPhoneNumber || 'N/A',
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      mpesaReceiptNumber: payment.mpesaReceiptNumber || 'N/A',
      mpesaPhoneNumber: payment.mpesaPhoneNumber || 'N/A',
      checkoutRequestId: payment.checkoutRequestId || 'N/A',
      date: payment.booking.timeSlot.date.toISOString().split('T')[0],
      time: `${payment.booking.timeSlot.startTime} - ${payment.booking.timeSlot.endTime}`,
      paidAt: payment.paidAt?.toISOString() || null,
      createdAt: payment.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedPayments);

  } catch (error: any) {
    console.error('❌ Payments fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch payments',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update payment status (for manual updates)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, status, notes } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      );
    }

    // Valid status values
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        paidAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    // If payment is completed, update booking status
    if (status === 'COMPLETED') {
      await prisma.booking.update({
        where: { id: updatedPayment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    // If payment is refunded, update booking status
    if (status === 'REFUNDED') {
      await prisma.booking.update({
        where: { id: updatedPayment.bookingId },
        data: { status: 'CANCELLED' },
      });
    }

    console.log('✅ Payment updated:', paymentId, 'Status:', status);

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    });

  } catch (error: any) {
    console.error('❌ Payment update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update payment',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}