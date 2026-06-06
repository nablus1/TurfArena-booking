// app/api/admin/recent-bookings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to format time ago
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  
  return date.toLocaleDateString();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const bookings = await prisma.booking.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        timeSlot: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customer: booking.user?.name || 'Guest User',
      time: `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}`,
      status: booking.status === 'CONFIRMED' ? 'Confirmed' 
              : booking.status === 'PENDING' ? 'Pending'
              : booking.status === 'CANCELLED' ? 'Cancelled'
              : booking.status === 'COMPLETED' ? 'Completed'
              : booking.status === 'NO_SHOW' ? 'No Show'
              : 'Unknown',
      amount: `KES ${booking.totalAmount.toLocaleString()}`,
      timestamp: timeAgo(booking.createdAt),
    }));

    return NextResponse.json(formattedBookings);

  } catch (error: any) {
    console.error('❌ Recent bookings fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch recent bookings',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
