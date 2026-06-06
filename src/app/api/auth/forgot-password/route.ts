import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Security: don't reveal whether email exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    // TODO:
    // Generate reset token
    // Save token to database
    // Send email with reset link

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);

    return NextResponse.json(
      {
        error: "Failed to process request",
      },
      { status: 500 }
    );
  }
}