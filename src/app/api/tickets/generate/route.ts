import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { pdfService } from '@/services/pdf.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        timeSlot: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (booking.userId !== session.user.id &&
        session.user.role !== 'ADMIN' &&
        session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate PDF
    const ticketData = {
      bookingReference: booking.bookingReference,
      userName: booking.user.name,
      userEmail: booking.user.email,
      userPhone: booking.user.phone,
      date: booking.timeSlot.date.toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      startTime: booking.timeSlot.startTime,
      endTime: booking.timeSlot.endTime,
      turfName: 'Juja Turf Arena',
      amount: booking.totalAmount,
      paymentMethod: booking.payment?.paymentMethod || 'CASH',
      mpesaReceiptNumber: booking.payment?.mpesaReceiptNumber,
      qrCode: booking.qrCode || '',
    };

    const pdfBuffer = await pdfService.generateTicket(ticketData);
    const ticketUrl = await pdfService.uploadToCloudinary(
      pdfBuffer,
      booking.bookingReference
    );

    // Update booking with ticket URL
    await prisma.booking.update({
      where: { id: booking.id },
      data: { ticketUrl },
    });

    return NextResponse.json({
      success: true,
      ticketUrl,
      pdfBase64: pdfBuffer.toString('base64'),
    });
  } catch (error) {
    console.error('Generate ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ticket' },
      { status: 500 }
    );
  }
}