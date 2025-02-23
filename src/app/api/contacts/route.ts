import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import type { JWTPayload } from 'jose';

interface AuthPayload extends JWTPayload {
  userId: number;
}

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(
    new NextResponse(null, {
      status: 200
    })
  );
}

// Get user's emergency contacts
export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request) as AuthPayload | null;
    
    if (!auth?.userId) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      );
    }

    const contacts = await prisma.emergencyContact.findMany({
      where: {
        userId: auth.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return addCorsHeaders(
      NextResponse.json({
        message: 'Contacts retrieved successfully',
        contacts
      })
    );
  } catch (error: any) {
    console.error('Get contacts error:', error);
    return addCorsHeaders(
      NextResponse.json(
        { message: 'Error fetching contacts', error: error.message },
        { status: 500 }
      )
    );
  }
}

// Add new emergency contact
export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request) as AuthPayload | null;
    
    if (!auth?.userId) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      );
    }

    const body = await request.json();
    const { name, phoneNumber, relation } = body;

    if (!name || !phoneNumber) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Name and phone number are required' },
          { status: 400 }
        )
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

    return addCorsHeaders(
      NextResponse.json({
        message: 'Contact added successfully',
        contact
      })
    );
  } catch (error: any) {
    console.error('Create contact error:', error);
    return addCorsHeaders(
      NextResponse.json(
        { message: 'Error creating contact', error: error.message },
        { status: 500 }
      )
    );
  }
} 