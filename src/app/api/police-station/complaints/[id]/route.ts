import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import type { ComplaintStatus } from '@prisma/client';
import type { JWTPayload } from 'jose';

interface PoliceAuthPayload extends JWTPayload {
  stationId: number;
  role: 'POLICE_STATION';
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Updating complaint:', params.id);
    
    const auth = await verifyAuth(request) as PoliceAuthPayload | null;
    console.log('Auth:', auth);

    if (!auth?.stationId || auth.role !== 'POLICE_STATION') {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Unauthorized - Police station access required' },
          { status: 401 }
        )
      );
    }

    const body = await request.json();
    const { status, remarks } = body;

    // Validate status
    if (!status) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Status is required' },
          { status: 400 }
        )
      );
    }

    // Find complaint and verify ownership
    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!complaint) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Complaint not found' },
          { status: 404 }
        )
      );
    }

    if (complaint.policeStationId !== auth.stationId) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Unauthorized - This complaint belongs to another station' },
          { status: 403 }
        )
      );
    }

    // Update complaint
    const updatedComplaint = await prisma.complaint.update({
      where: { 
        id: parseInt(params.id) 
      },
      data: {
        status: status as ComplaintStatus,
        ...(remarks && { remarks })
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    return addCorsHeaders(
      NextResponse.json({
        message: 'Complaint status updated successfully',
        complaint: updatedComplaint
      })
    );

  } catch (error: any) {
    console.error('Update complaint error:', error);
    return addCorsHeaders(
      NextResponse.json(
        { message: 'Error updating complaint', error: error.message },
        { status: 500 }
      )
    );
  }
} 