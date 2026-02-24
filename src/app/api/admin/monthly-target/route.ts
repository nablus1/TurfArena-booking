// app/api/admin/monthly-target/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get current month data
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get this month's revenue from Payment model
    const thisMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const achieved = thisMonthRevenue._sum.amount || 0;

    // Get last month's revenue to set a realistic target
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: lastMonthStart,
          lt: monthStart,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const lastMonth = lastMonthRevenue._sum.amount || 0;
    
    // Set target as 20% more than last month, or default to 380K
    const target = lastMonth > 0 ? Math.ceil(lastMonth * 1.2) : 380000;
    
    const remaining = Math.max(0, target - achieved);
    const percentage = target > 0 ? ((achieved / target) * 100).toFixed(1) : '0';

    // Calculate percentage change from last month
    const change = lastMonth > 0
      ? ((achieved - lastMonth) / lastMonth * 100).toFixed(1)
      : achieved > 0 ? '100' : '0';

    return NextResponse.json({
      target: `KES ${Math.round(target / 1000)}K`,
      targetValue: target,
      achieved: `KES ${Math.round(achieved / 1000)}K`,
      achievedValue: achieved,
      remaining: `KES ${Math.round(remaining / 1000)}K`,
      remainingValue: remaining,
      percentage: parseFloat(percentage),
      change: `${parseFloat(change) >= 0 ? '+' : ''}${change}%`,
      trend: parseFloat(change) >= 0 ? 'up' : 'down',
    });

  } catch (error: any) {
    console.error('❌ Monthly target fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch monthly target',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}