// app/api/admin/analytics/route.ts

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

    // 1. Booking Status Distribution
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // 2. Revenue by Payment Method
    const revenueByMethod = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // 3. Daily Bookings Trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const dailyBookings = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Format daily bookings
    const bookingsByDay: Record<string, number> = {};
    dailyBookings.forEach(day => {
      const date = new Date(day.createdAt).toISOString().split('T')[0];
      bookingsByDay[date] = (bookingsByDay[date] || 0) + day._count;
    });

    // 4. Peak Hours Analysis
    const bookingsWithTime = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        timeSlot: {
          select: {
            startTime: true,
          },
        },
      },
    });

    const bookingsByHour: Record<string, number> = {};
    bookingsWithTime.forEach(booking => {
      const hour = booking.timeSlot.startTime;
      bookingsByHour[hour] = (bookingsByHour[hour] || 0) + 1;
    });

    // 5. Revenue Trend (last 12 months)
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const revenue = await prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paidAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

      revenueByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: revenue._sum.amount || 0,
        bookings: revenue._count,
      });
    }

    // 6. Top Customers (by spending)
    const topCustomers = await prisma.payment.groupBy({
      by: ['userId'],
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 10,
    });

    // Get user details for top customers
    const topCustomersWithDetails = await Promise.all(
      topCustomers.map(async (customer) => {
        const user = await prisma.user.findUnique({
          where: { id: customer.userId },
          select: {
            name: true,
            email: true,
            phone: true,
          },
        });

        return {
          userId: customer.userId,
          name: user?.name || 'Unknown',
          email: user?.email || 'N/A',
          phone: user?.phone || 'N/A',
          totalSpent: customer._sum.amount || 0,
          bookingsCount: customer._count,
        };
      })
    );

    // 7. Cancellation Rate
    const totalBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const cancelledBookings = await prisma.booking.count({
      where: {
        status: 'CANCELLED',
        createdAt: {
          gte: startDate,
        },
      },
    });

    const cancellationRate = totalBookings > 0 
      ? ((cancelledBookings / totalBookings) * 100).toFixed(1)
      : '0';

    // 8. Average Booking Value
    const avgBookingValue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      _avg: {
        amount: true,
      },
    });

    // 9. Conversion Rate (Pending -> Confirmed)
    const pendingBookings = await prisma.booking.count({
      where: {
        status: 'PENDING',
        createdAt: {
          gte: startDate,
        },
      },
    });

    const confirmedBookings = await prisma.booking.count({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        createdAt: {
          gte: startDate,
        },
      },
    });

    const conversionRate = totalBookings > 0
      ? ((confirmedBookings / totalBookings) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      bookingsByStatus: bookingsByStatus.map(b => ({
        status: b.status,
        count: b._count,
      })),
      revenueByMethod: revenueByMethod.map(r => ({
        method: r.paymentMethod,
        revenue: r._sum.amount || 0,
        count: r._count,
      })),
      bookingsByDay,
      bookingsByHour,
      revenueByMonth,
      topCustomers: topCustomersWithDetails,
      metrics: {
        cancellationRate: parseFloat(cancellationRate),
        averageBookingValue: avgBookingValue._avg.amount || 0,
        conversionRate: parseFloat(conversionRate),
        totalBookings,
        cancelledBookings,
        confirmedBookings,
      },
    });

  } catch (error: any) {
    console.error('❌ Analytics fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}