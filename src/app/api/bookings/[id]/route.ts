import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import prisma from '@/src/lib/db';

interface RouteParams {
  params: { id: string };
}

// GET - Get single booking by ID
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        timeSlot: true,
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            mpesaReceiptNumber: true,
            mpesaPhoneNumber: true,
            paidAt: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        validation: {
          select: {
            id: true,
            validatedBy: true,
            validatedAt: true,
            location: true,
            notes: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization - user can only see their own bookings, admin can see all
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    if (booking.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PATCH - Update booking (user can cancel, admin can do more)
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    if (booking.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    
    // Users can only cancel their own bookings
    // Admins can update any field
    let updateData: any = {};
    
    if (isAdmin) {
      // Admin can update anything
      updateData = body;
    } else {
      // Regular user can only cancel
      if (body.status === 'CANCELLED') {
        updateData.status = 'CANCELLED';
      } else {
        return NextResponse.json(
          { error: 'Users can only cancel bookings' },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        timeSlot: true,
        payment: true,
      },
    });

    console.log(`✅ Booking ${params.id} updated by ${session.user.email}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Delete booking (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete bookings
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can delete bookings' },
        { status: 403 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Delete associated payment first (if exists)
    await prisma.payment.deleteMany({
      where: { bookingId: params.id },
    });

    // Delete the booking
    await prisma.booking.delete({
      where: { id: params.id },
    });

    console.log(`🗑️ Booking ${params.id} deleted by admin ${session.user.email}`);

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