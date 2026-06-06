import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.settings.findMany({
      orderBy: {
        key: "asc",
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Settings GET Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch settings",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      turfPrice,
      maxBookings,
      mpesaEnabled,
      cashEnabled,
      cardEnabled,
      bookingNotifications,
      paymentNotifications,
      dailyReports,
      sessionTimeout,
      currency,
      timezone,
    } = body;

    const settingsToSave = [
      { key: "turfPrice", value: String(turfPrice ?? 1500) },
      { key: "maxBookings", value: String(maxBookings ?? 1) },
      { key: "mpesaEnabled", value: String(mpesaEnabled ?? true) },
      { key: "cashEnabled", value: String(cashEnabled ?? true) },
      { key: "cardEnabled", value: String(cardEnabled ?? false) },
      {
        key: "bookingNotifications",
        value: String(bookingNotifications ?? true),
      },
      {
        key: "paymentNotifications",
        value: String(paymentNotifications ?? true),
      },
      {
        key: "dailyReports",
        value: String(dailyReports ?? true),
      },
      {
        key: "sessionTimeout",
        value: String(sessionTimeout ?? 60),
      },
      {
        key: "currency",
        value: currency ?? "KES",
      },
      {
        key: "timezone",
        value: timezone ?? "Africa/Nairobi",
      },
    ];

    for (const setting of settingsToSave) {
      await prisma.settings.upsert({
        where: {
          key: setting.key,
        },
        update: {
          value: setting.value,
        },
        create: {
          key: setting.key,
          value: setting.value,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error: any) {
    console.error("Settings POST Error:", error);

    return NextResponse.json(
      {
        error: "Failed to save settings",
      },
      { status: 500 }
    );
  }
}