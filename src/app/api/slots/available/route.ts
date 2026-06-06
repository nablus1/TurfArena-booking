// app/api/slots/available/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Normalize selected date (00:00:00)
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

   const startOfDay = new Date(selectedDate);
   startOfDay.setHours(0, 0, 0, 0);

   const endOfDay = new Date(selectedDate);
   endOfDay.setHours(23, 59, 59, 999);

   const whereClause: any = {
   date: {
    gte: startOfDay,
    lte: endOfDay,
  },
  isAvailable: true,
};


    if (selectedDate.getTime() === today.getTime()) {
      // Hide past slots today
      whereClause.startTime = { gt: currentTime };
    }

    if (selectedDate < today) {
      // Past date, return empty
      return NextResponse.json({ slots: [] });
    }

    // Fetch slots with bookings count and maxBookings
    const slots = await prisma.timeSlot.findMany({
      where: whereClause,
      include: {
        bookings: true, // fetch bookings to calculate full status
      },
      orderBy: { startTime: 'asc' },
    });

    const transformedSlots = slots.map(slot => {
      const bookedPlayers = slot.bookings.reduce((sum, b) => sum + b.playerCount, 0);
      const isFullyBooked = bookedPlayers >= slot.maxBookings;

      return {
        id: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        isAvailable: slot.isAvailable && !isFullyBooked,
        bookingsCount: bookedPlayers,
        maxBookings: slot.maxBookings,
        isFullyBooked,
      };
    });

    return NextResponse.json({ slots: transformedSlots });

  } catch (err) {
    console.error('Failed to fetch slots:', err);
    return NextResponse.json(
      {
        error: "Failed to fetch slots",
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
