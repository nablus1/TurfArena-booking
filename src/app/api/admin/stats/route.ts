// app/api/admin/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get total bookings
    const totalBookings = await prisma.booking.count();
    
    // Get bookings in time range for comparison
    const bookingsInRange = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get previous period bookings for percentage calculation
    const previousStartDate = new Date(startDate);
    if (timeRange === 'week') {
      previousStartDate.setDate(previousStartDate.getDate() - 7);
    } else if (timeRange === 'month') {
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);
    } else if (timeRange === 'year') {
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
    }

    const previousBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    // Calculate percentage change for bookings
    const bookingsChange = previousBookings > 0 
      ? ((bookingsInRange - previousBookings) / previousBookings * 100).toFixed(1)
      : bookingsInRange > 0 ? '100' : '0';

    // Get total revenue from Payment model (COMPLETED payments only)
    const revenueData = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const previousRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const revenue = revenueData._sum.amount || 0;
    const prevRevenue = previousRevenue._sum.amount || 0;
    const revenueChange = prevRevenue > 0
      ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : revenue > 0 ? '100' : '0';

    // Get today's bookings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    });

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const yesterdayBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: yesterdayStart,
          lt: todayStart,
        },
      },
    });

    const todayChange = yesterdayBookings > 0
      ? ((todayBookings - yesterdayBookings) / yesterdayBookings * 100).toFixed(1)
      : todayBookings > 0 ? '100' : '0';

    // Calculate occupancy rate
    const totalSlots = await prisma.timeSlot.count({
      where: {
        date: {
          gte: startDate,
        },
      },
    });

    const bookedSlots = await prisma.booking.count({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        createdAt: {
          gte: startDate,
        },
      },
    });

    const occupancyRate = totalSlots > 0 
      ? ((bookedSlots / totalSlots) * 100).toFixed(1)
      : '0';

    const previousTotalSlots = await prisma.timeSlot.count({
      where: {
        date: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    const previousBookedSlots = await prisma.booking.count({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    const previousOccupancy = previousTotalSlots > 0
      ? (previousBookedSlots / previousTotalSlots) * 100
      : 0;

    const currentOccupancy = parseFloat(occupancyRate);
    const occupancyChange = previousOccupancy > 0
      ? ((currentOccupancy - previousOccupancy) / previousOccupancy * 100).toFixed(1)
      : currentOccupancy > 0 ? '100' : '0';

    return NextResponse.json({
      totalBookings: totalBookings.toString(),
      bookingsChange: `${parseFloat(bookingsChange) >= 0 ? '+' : ''}${bookingsChange}%`,
      bookingsTrend: parseFloat(bookingsChange) >= 0 ? 'up' : 'down',
      
      revenue: `KES ${Math.round(revenue / 1000)}K`,
      revenueChange: `${parseFloat(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
      revenueTrend: parseFloat(revenueChange) >= 0 ? 'up' : 'down',
      
      todayBookings: todayBookings.toString(),
      todayChange: `${parseFloat(todayChange) >= 0 ? '+' : ''}${todayChange}%`,
      todayTrend: parseFloat(todayChange) >= 0 ? 'up' : 'down',
      
      occupancyRate: `${occupancyRate}%`,
      occupancyChange: `${parseFloat(occupancyChange) >= 0 ? '+' : ''}${occupancyChange}%`,
      occupancyTrend: parseFloat(occupancyChange) >= 0 ? 'up' : 'down',
    });

  } catch (error: any) {
    console.error('❌ Stats fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}