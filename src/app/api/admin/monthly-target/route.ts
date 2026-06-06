// app/api/admin/monthly-target/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    const now = new Date();

    let startDate = new Date();
    let endDate = new Date();

    let previousStartDate = new Date();
    let previousEndDate = new Date();

    // =========================
    // DATE RANGE LOGIC
    // =========================

    if (timeRange === 'week') {
      // Start of current week (Monday)
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);

      startDate = new Date(now);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);

      endDate = now;

      // Previous week
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);

      previousEndDate = new Date(startDate);

    } else if (timeRange === 'month') {

      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;

      // Previous month
      previousStartDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      previousEndDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    } else if (timeRange === 'year') {

      // Current year
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;

      // Previous year
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1);

      previousEndDate = new Date(now.getFullYear(), 0, 1);
    }

    // =========================
    // CURRENT PERIOD REVENUE
    // =========================

    const currentRevenueData = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // =========================
    // PREVIOUS PERIOD REVENUE
    // =========================

    const previousRevenueData = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: previousStartDate,
          lt: previousEndDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const achieved = currentRevenueData._sum.amount || 0;
    const previousRevenue = previousRevenueData._sum.amount || 0;

    // =========================
    // TARGET CALCULATION
    // =========================

    // Target = 20% above previous period
    const defaultTarget =
      timeRange === 'week'
        ? 100000
        : timeRange === 'month'
        ? 380000
        : 4500000;

    const target =
      previousRevenue > 0
        ? Math.ceil(previousRevenue * 1.2)
        : defaultTarget;

    const remaining = Math.max(0, target - achieved);

    const percentage =
      target > 0
        ? ((achieved / target) * 100).toFixed(1)
        : '0';

    // =========================
    // CHANGE CALCULATION
    // =========================

    const change =
      previousRevenue > 0
        ? (
            ((achieved - previousRevenue) / previousRevenue) *
            100
          ).toFixed(1)
        : achieved > 0
        ? '100'
        : '0';

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      target:
        target >= 1000
          ? `KES ${(target / 1000).toFixed(1)}K`
          : `KES ${target}`,

      targetValue: target,

      achieved:
        achieved >= 1000
          ? `KES ${(achieved / 1000).toFixed(1)}K`
          : `KES ${achieved}`,

      achievedValue: achieved,

      remaining:
        remaining >= 1000
          ? `KES ${(remaining / 1000).toFixed(1)}K`
          : `KES ${remaining}`,

      remainingValue: remaining,

      percentage: parseFloat(percentage),

      change: `${parseFloat(change) >= 0 ? '+' : ''}${change}%`,

      trend: parseFloat(change) >= 0 ? 'up' : 'down',
    });

  } catch (error: any) {
    console.error('❌ Target analytics fetch error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch target analytics',
        details: error.message,
      },
      { status: 500 }
    );
  }
}