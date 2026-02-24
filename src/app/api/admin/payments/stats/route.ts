// app/api/admin/payments/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get total payments
    const totalPayments = await prisma.payment.count();

    // Get payments by status
    const completedPayments = await prisma.payment.count({
      where: { status: 'COMPLETED' },
    });

    const pendingPayments = await prisma.payment.count({
      where: { status: 'PENDING' },
    });

    const failedPayments = await prisma.payment.count({
      where: { status: 'FAILED' },
    });

    const refundedPayments = await prisma.payment.count({
      where: { status: 'REFUNDED' },
    });

    // Get total revenue (completed payments only)
    const revenueData = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const totalRevenue = revenueData._sum.amount || 0;

    // Get today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        paidAt: {
          gte: todayStart,
        },
      },
      _sum: { amount: true },
    });

    // Get payment methods breakdown
    const mpesaCount = await prisma.payment.count({
      where: { paymentMethod: 'MPESA', status: 'COMPLETED' },
    });

    const cashCount = await prisma.payment.count({
      where: { paymentMethod: 'CASH', status: 'COMPLETED' },
    });

    const cardCount = await prisma.payment.count({
      where: { paymentMethod: 'CARD', status: 'COMPLETED' },
    });

    return NextResponse.json({
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalRevenue,
      todayRevenue: todayRevenue._sum.amount || 0,
      paymentMethods: {
        mpesa: mpesaCount,
        cash: cashCount,
        card: cardCount,
      },
    });

  } catch (error: any) {
    console.error('❌ Payment stats fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch payment stats',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}