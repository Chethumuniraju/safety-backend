import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email and password are required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Admin registered successfully',
      admin
    });

  } catch (error) {
    return NextResponse.json(
      { message: 'Error registering admin' },
      { status: 500 }
    );
  }
} 