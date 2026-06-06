// src/app/api/admin/reports/route.ts

import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const reportType = searchParams.get("type") || "summary";

    if (reportType !== "summary") {
      return Response.json(
        {
          error: "Only summary PDF report is currently supported",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // =========================
    // BOOKINGS
    // =========================

    const totalBookings = await prisma.booking.count();

    const confirmedBookings = await prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    });

    const completedBookings = await prisma.booking.count({
      where: {
        status: "COMPLETED",
      },
    });

    const cancelledBookings = await prisma.booking.count({
      where: {
        status: "CANCELLED",
      },
    });

    const pendingBookings = await prisma.booking.count({
      where: {
        status: "PENDING",
      },
    });

    // =========================
    // REVENUE
    // =========================

    const revenueData = await prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
      _avg: {
        amount: true,
      },
      _count: true,
    });

    const totalRevenue = revenueData._sum.amount ?? 0;
    const averageBookingValue = revenueData._avg.amount ?? 0;

    // =========================
    // USERS
    // =========================

    const totalUsers = await prisma.user.count();

    // =========================
    // TOP CUSTOMERS
    // =========================

    const topCustomersRaw = await prisma.payment.groupBy({
      by: ["userId"],
      where: {
        status: "COMPLETED",
        userId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: 5,
    });

    const topCustomers = await Promise.all(
      topCustomersRaw.map(async (customer) => {
        if (!customer.userId) return null;

        const user = await prisma.user.findUnique({
          where: {
            id: customer.userId,
          },
          select: {
            name: true,
            email: true,
          },
        });

        return {
          name: user?.name ?? "Unknown User",
          email: user?.email ?? "N/A",
          amount: customer._sum.amount ?? 0,
          bookings: customer._count,
        };
      })
    );

    // =========================
    // PAYMENT METHODS
    // =========================

    const paymentMethods = await prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: {
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // =========================
    // PDF DOCUMENT
    // =========================

    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([595, 842]); // A4

    const boldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    const regularFont = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    let y = 800;

    const writeLine = (
      text: string,
      size = 11,
      bold = false,
      spacing = 18
    ) => {
      page.drawText(text, {
        x: 50,
        y,
        size,
        font: bold ? boldFont : regularFont,
        color: rgb(0, 0, 0),
      });

      y -= spacing;
    };

    // =========================
    // HEADER
    // =========================

    writeLine("TURF BOOKING SYSTEM", 22, true, 30);
    writeLine("Executive Summary Report", 16, true, 25);
    writeLine(`Generated On: ${now.toLocaleString()}`, 10);
    y -= 15;

    // =========================
    // EXECUTIVE SUMMARY
    // =========================

    writeLine("EXECUTIVE SUMMARY", 14, true, 25);

    writeLine(`Total Bookings: ${totalBookings}`);
    writeLine(`Confirmed Bookings: ${confirmedBookings}`);
    writeLine(`Completed Bookings: ${completedBookings}`);
    writeLine(`Pending Bookings: ${pendingBookings}`);
    writeLine(`Cancelled Bookings: ${cancelledBookings}`);

    y -= 10;

    writeLine(
      `Total Revenue: KES ${Math.round(
        totalRevenue
      ).toLocaleString()}`
    );

    writeLine(
      `Average Booking Value: KES ${Math.round(
        averageBookingValue
      ).toLocaleString()}`
    );

    writeLine(`Registered Users: ${totalUsers}`);

    y -= 25;

    // =========================
    // PAYMENT METHODS
    // =========================

    writeLine("REVENUE BY PAYMENT METHOD", 14, true, 25);

    paymentMethods.forEach((method) => {
      writeLine(
        `${method.paymentMethod} | ${method._count} Transactions | KES ${(
          method._sum.amount ?? 0
        ).toLocaleString()}`
      );
    });

    y -= 25;

    // =========================
    // TOP CUSTOMERS
    // =========================

    writeLine("TOP CUSTOMERS", 14, true, 25);

    topCustomers
      .filter(Boolean)
      .forEach((customer, index) => {
        if (!customer) return;

        writeLine(
          `${index + 1}. ${customer.name} (${customer.email})`
        );

        writeLine(
          `Bookings: ${customer.bookings} | Total Spent: KES ${customer.amount.toLocaleString()}`
        );
      });

    y -= 30;

    // =========================
    // FOOTER
    // =========================

    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    y -= 20;

    page.drawText(
      "This report was automatically generated by the Turf Booking Management System.",
      {
        x: 50,
        y,
        size: 9,
        font: regularFont,
        color: rgb(0.4, 0.4, 0.4),
      }
    );

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="executive-summary-report.pdf"',
      },
    });
  } catch (error: any) {
    console.error("PDF Report Error:", error);

    return Response.json(
      {
        error: "Failed to generate PDF report",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}