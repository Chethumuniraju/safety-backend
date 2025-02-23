import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import type { ComplaintStatus } from '@prisma/client';
import type { JWTPayload } from 'jose';

// Add interface for police auth payload
interface PoliceAuthPayload extends JWTPayload {
  stationId: number;
  role: 'POLICE_STATION';
}

// Add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS preflight
export async function OPTIONS() {
  return addCorsHeaders(
    new NextResponse(null, {
      status: 200
    })
  );
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request) as PoliceAuthPayload | null;
    
    if (!auth?.stationId || auth.role !== 'POLICE_STATION') {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Unauthorized - Police station access required' },
          { status: 401 }
        )
      );
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        policeStationId: Number(auth.stationId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return addCorsHeaders(
      NextResponse.json({
        message: 'Complaints retrieved successfully',
        complaints
      })
    );
  } catch (error: any) {
    console.error('Get complaints error:', error);
    return addCorsHeaders(
      NextResponse.json(
        { message: 'Error fetching complaints', error: error.message },
        { status: 500 }
      )
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Log the incoming request for debugging
    const body = await request.json();
    console.log('Received request body:', body);
    console.log('Request headers:', Object.fromEntries(request.headers));

    const auth = await verifyAuth(request) as PoliceAuthPayload | null;
    console.log('Auth result:', auth); // Debug auth result
    
    if (!auth?.stationId || auth.role !== 'POLICE_STATION') {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Unauthorized - Police station access required' },
          { status: 401 }
        )
      );
    }

    const { complaintId, status, remarks } = body;

    // Validate input
    if (!complaintId || !status) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Complaint ID and status are required' },
          { status: 400 }
        )
      );
    }

    // Log the values for debugging
    console.log('Processing update:', {
      complaintId: Number(complaintId),
      status,
      remarks,
      stationId: auth.stationId
    });

    // Verify the complaint belongs to this police station
    const complaint = await prisma.complaint.findUnique({
      where: { id: Number(complaintId) }
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

    const updatedComplaint = await prisma.complaint.update({
      where: { 
        id: Number(complaintId)
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
    // Log the full error
    console.error('Update complaint error:', {
      message: error.message,
      stack: error.stack
    });

    return addCorsHeaders(
      NextResponse.json(
        { 
          message: 'Error updating complaint', 
          error: error.message,
          details: error.stack
        },
        { status: 500 }
      )
    );
  }
} 