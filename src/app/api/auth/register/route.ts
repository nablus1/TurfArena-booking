import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/src/lib/db';
import { z } from 'zod';  

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^(?:254|\+254|0)?7\d{8}$/),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received registration data:', { ...body, password: '[REDACTED]' });
    
    const validated = registerSchema.parse(body);
    console.log('Validation passed');

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.email },
          { phone: validated.phone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json(
      { user, message: 'Registration successful' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Registration failed' },
      { status: 500 }
    );
  }
}