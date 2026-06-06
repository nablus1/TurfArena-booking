// app/api/admin/monthly-trends/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get data for the last 12 months
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const bookings = await prisma.booking.count({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonth,
          },
        },
      });

      // Calculate target based on average of previous months + 20%
      let avgTarget = 0;
      if (monthlyData.length > 0) {
        const totalBookings = monthlyData.reduce((sum, m) => sum + m.bookings, 0);
        const avgBookings = totalBookings / monthlyData.length;
        avgTarget = Math.ceil(avgBookings * 1.2);
      } else {
        // For first month, use actual bookings + 20% or minimum 50
        avgTarget = Math.max(Math.ceil(bookings * 1.2), 50);
      }

      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        bookings: bookings,
        target: avgTarget,
      });
    }

    return NextResponse.json(monthlyData);

  } catch (error: any) {
    console.error('❌ Monthly trends fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch monthly trends',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}