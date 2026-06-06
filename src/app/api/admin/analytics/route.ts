import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, BookingStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const timeRange = searchParams.get("timeRange") || "month";

    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // =========================
    // OVERVIEW
    // =========================

    const totalBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const completedBookings = await prisma.booking.count({
      where: {
        status: BookingStatus.COMPLETED,
        createdAt: {
          gte: startDate,
        },
      },
    });

    const cancelledBookings = await prisma.booking.count({
      where: {
        status: BookingStatus.CANCELLED,
        createdAt: {
          gte: startDate,
        },
      },
    });

    const revenueAgg = await prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
      _avg: {
        amount: true,
      },
    });

    const totalRevenue = revenueAgg._sum.amount || 0;
    const averageBookingValue = revenueAgg._avg.amount || 0;

    const conversionRate =
      totalBookings > 0
        ? Number(
            ((completedBookings / totalBookings) * 100).toFixed(1)
          )
        : 0;

    // =========================
    // BOOKING TREND
    // =========================

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const bookingTrendMap: Record<string, number> = {};

    bookings.forEach((booking) => {
      const day = booking.createdAt.toISOString().split("T")[0];

      bookingTrendMap[day] =
        (bookingTrendMap[day] || 0) + 1;
    });

    const bookingTrend = Object.entries(bookingTrendMap).map(
      ([date, bookings]) => ({
        date,
        bookings,
      })
    );

    // =========================
    // REVENUE TREND
    // =========================

    const revenueTrend = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1
      );

      const revenue = await prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      revenueTrend.push({
        month: monthStart.toLocaleString("default", {
          month: "short",
        }),
        revenue: revenue._sum.amount || 0,
      });
    }

    // =========================
    // PEAK HOURS
    // =========================

    const bookingsWithSlots =
      await prisma.booking.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          timeSlot: true,
        },
      });

    const hourMap: Record<string, number> = {};

    bookingsWithSlots.forEach((booking) => {
      const hour = booking.timeSlot?.startTime;

      if (!hour) return;

      hourMap[hour] =
        (hourMap[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourMap)
      .map(([hour, bookings]) => ({
        hour,
        bookings,
      }))
      .sort((a, b) =>
        a.hour.localeCompare(b.hour)
      );

    // =========================
    // PAYMENT METHODS
    // =========================

    const paymentMethods =
      await prisma.payment.groupBy({
        by: ["paymentMethod"],
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
        _sum: {
          amount: true,
        },
      });

    // =========================
    // TOP CUSTOMERS
    // =========================

    const users = await prisma.user.findMany({
      include: {
        payments: {
          where: {
            status: PaymentStatus.COMPLETED,
            createdAt: {
              gte: startDate,
            },
          },
        },
      },
    });

    const topCustomers = users
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        bookings: user.payments.length,
        totalSpent: user.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        ),
      }))
      .filter((user) => user.totalSpent > 0)
      .sort(
        (a, b) =>
          b.totalSpent - a.totalSpent
      )
      .slice(0, 10);

    return NextResponse.json({
      overview: {
        totalRevenue,
        totalBookings,
        completedBookings,
        cancelledBookings,
        conversionRate,
        averageBookingValue,
      },

      bookingTrend,

      revenueTrend,

      peakHours,

      paymentMethods: paymentMethods.map(
        (method) => ({
          method: method.paymentMethod,
          count: method._count,
          revenue: method._sum.amount || 0,
        })
      ),

      topCustomers,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load analytics",
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}