// app/api/admin/bookings/export/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    // Build where clause
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        timeSlot: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Create CSV content
    const headers = [
      'Booking Reference',
      'Customer Name',
      'Email',
      'Phone',
      'Date',
      'Time',
      'Amount (KES)',
      'Status',
      'Payment Status',
      'Created At',
    ];

    const rows = bookings.map(booking => [
      booking.bookingReference,
      booking.userName,
      booking.userEmail,
      booking.userPhone,
      booking.date.toISOString().split('T')[0],
      `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}`,
      booking.amount.toString(),
      booking.status,
      booking.paymentStatus,
      booking.createdAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bookings-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting bookings:', error);
    return NextResponse.json(
      { error: 'Failed to export bookings' },
      { status: 500 }
    );
  }
}