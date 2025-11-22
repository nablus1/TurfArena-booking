import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import prisma from '@/src/lib/db';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const createBookingSchema = z.object({
  timeSlotId: z.string(),
  playerCount: z.number().min(1).max(22),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = {
      userId: session.user.id,
      ...(status && { status: status as any }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          timeSlot: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('📝 Creating booking:', body);
    
    const validated = createBookingSchema.parse(body);

    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: validated.timeSlotId },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        },
      },
    });

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      );
    }

    if (!timeSlot.isAvailable) {
      return NextResponse.json(
        { error: 'Time slot is not available' },
        { status: 400 }
      );
    }

    if (timeSlot.bookings.length >= timeSlot.maxBookings) {
      return NextResponse.json(
        { error: 'Time slot is fully booked' },
        { status: 400 }
      );
    }

    const qrCode = nanoid(32);
    const bookingReference = `JTA-${Date.now()}-${nanoid(6).toUpperCase()}`;

    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        userId: session.user.id,
        timeSlotId: validated.timeSlotId,
        totalAmount: timeSlot.price,
        playerCount: validated.playerCount,
        notes: validated.notes,
        qrCode,
        status: 'PENDING',
      },
      include: {
        timeSlot: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    console.log('✅ Booking created:', booking.id);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('❌ Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}