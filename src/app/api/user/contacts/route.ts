import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import type { JWTPayload } from 'jose';

interface AuthPayload extends JWTPayload {
  userId: number;
}

// Create new contact
export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request) as AuthPayload;
    if (!auth?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phoneNumber, relation } = body;

    if (!name || !phoneNumber) {
      return NextResponse.json(
        { message: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: auth.userId,
        name,
        phoneNumber,
        relation
      }
    });

    return NextResponse.json(
      { message: 'Contact added successfully', contact },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { message: 'Error adding contact', error: error.message },
      { status: 500 }
    );
  }
}

// Get user's contacts
export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request) as AuthPayload;
    if (!auth?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const contacts = await prisma.emergencyContact.findMany({
      where: {
        userId: auth.userId
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        relation: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      message: 'Contacts retrieved successfully',
      contacts
    });
  } catch (error: any) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { message: 'Error fetching contacts', error: error.message },
      { status: 500 }
    );
  }
} 