import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, phoneNumber } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email and password are required' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phoneNumber
      },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'User registered successfully',
      user
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error registering user', error: error.message },
      { status: 500 }
    );
  }
} 