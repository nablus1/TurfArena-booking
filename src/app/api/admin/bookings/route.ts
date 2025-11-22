import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import prisma from '@/src/lib/db';

// GET - Admin sees ALL bookings (not just their own)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || 
        (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const sort = searchParams.get('sort') || 'latest';

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    // Admin sees ALL bookings from all users
    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          timeSlot: true,
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentMethod: true,
              mpesaReceiptNumber: true,
              paidAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Transform for easier frontend use
    const transformed = bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      status: booking.status,
      totalAmount: booking.totalAmount,
      playerCount: booking.playerCount,
      isValidated: booking.isValidated,
      validatedAt: booking.validatedAt,
      createdAt: booking.createdAt,
      user: {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone,
      },
      timeSlot: {
        id: booking.timeSlot.id,
        date: booking.timeSlot.date,
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
        price: booking.timeSlot.price,
      },
      payment: booking.payment,
    }));

    return NextResponse.json({
      bookings: transformed,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// PATCH - Admin can update booking status
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || 
        (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, status, notes } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Valid booking statuses
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status,
        ...(notes && { notes }),
      },
      include: {
        timeSlot: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
      },
    });

    console.log(`✅ Admin updated booking ${bookingId} to ${status}`);

    return NextResponse.json({ 
      success: true, 
      booking,
      message: `Booking status updated to ${status}` 
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Admin can delete bookings (optional)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only SUPER_ADMIN can delete
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    console.log(`🗑️ Admin deleted booking ${bookingId}`);

    return NextResponse.json({ 
      success: true,
      message: 'Booking deleted successfully' 
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}