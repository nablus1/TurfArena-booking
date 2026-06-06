// Create a single time slot
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const { date, startTime, endTime, price } = await req.json();

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSlot = await prisma.timeSlot.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        price: price ?? 1500,
      },
    });

    return NextResponse.json({ slot: newSlot });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
  }
}
