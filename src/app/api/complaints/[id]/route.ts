import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Update complaint status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const complaint = await prisma.complaint.update({
      where: { id: parseInt(id) },
      data: { status },
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
            phoneNumber: true,
            area: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error: any) {
    console.error('Update complaint error:', error);
    return NextResponse.json(
      { message: 'Error updating complaint', error: error.message },
      { status: 500 }
    );
  }
}

// Get single complaint
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(id) },
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
            phoneNumber: true,
            area: true
          }
        }
      }
    });

    if (!complaint) {
      return NextResponse.json(
        { message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint);
  } catch (error: any) {
    console.error('Get complaint error:', error);
    return NextResponse.json(
      { message: 'Error fetching complaint', error: error.message },
      { status: 500 }
    );
  }
} 