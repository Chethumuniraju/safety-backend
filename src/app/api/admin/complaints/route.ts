import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import type { JWTPayload } from 'jose';

interface AdminAuthPayload extends JWTPayload {
  adminId: number;
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request) as AdminAuthPayload | null;
    
    if (!auth?.adminId) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phoneNumber: true
          }
        },
        policeStation: {
          select: {
            name: true,
            area: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      message: 'Complaints retrieved successfully',
      complaints
    });

  } catch (error: any) {
    console.error('Error fetching complaints:', error?.message || error);
    return NextResponse.json(
      { message: 'Error fetching complaints', error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 