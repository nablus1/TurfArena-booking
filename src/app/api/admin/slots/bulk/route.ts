// Create bulk time slots
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const { startDate, endDate, timeSlots } = await req.json();

    if (!startDate || !endDate || !Array.isArray(timeSlots)) {
      return NextResponse.json({ error: "Invalid request: startDate, endDate, and timeSlots are required" }, { status: 400 });
    }

    // Generate all dates between startDate and endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: Date[] = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    // Create slots for each date
    const allSlots = dates.flatMap(date => 
      timeSlots.map(slot => ({
        date: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price ?? 1500,
      }))
    );

    const createdSlots = await prisma.timeSlot.createMany({
      data: allSlots,
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      count: createdSlots.count,
      message: `Created ${createdSlots.count} slots across ${dates.length} days`
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create slots" }, { status: 500 });
  }
}