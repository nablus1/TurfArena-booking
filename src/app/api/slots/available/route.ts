import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);

    const slots = await prisma.timeSlot.findMany({
      where: {
        date,
        isAvailable: true,
      },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Filter out fully booked slots
    const availableSlots = slots.filter(
      slot => slot.bookings.length < slot.maxBookings
    );

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('Fetch slots error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}