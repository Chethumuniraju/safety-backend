import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { getAddressFromCoordinates } from '@/lib/geocoding';
import type { JWTPayload } from 'jose';
import type { Prisma } from '@prisma/client';
import { sendEmergencySMS } from '@/lib/twilio';

interface AuthPayload extends JWTPayload {
  userId: number;
  username: string;
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request) as AuthPayload | null;
    
    if (!auth?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
      if (!body || Object.keys(body).length === 0) {
        throw new Error("Request body is empty");
      }
    } catch (err) {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { latitude, longitude, description, emergencyContacts, message } = body;

    if (!latitude || !longitude || !description) {
      return NextResponse.json(
        { message: 'Missing required fields (latitude, longitude, description)' },
        { status: 400 }
      );
    }

    // Get address first
    let addressLine2 = 'Address not available';
    try {
      const addressDetails = await getAddressFromCoordinates(
        Number(latitude),
        Number(longitude)
      );
      addressLine2 = addressDetails?.results?.[0]?.address_line2 || 'Address not available';
    } catch (error) {
      console.log('Address lookup failed:', error);
    }

    // Create complaint with address
    const complaint = await prisma.complaint.create({
      data: {
        userId: auth.userId,
        policeStationId: 1,
        location: `${latitude},${longitude}`,
        latitude: Number(latitude),
        longitude: Number(longitude),
        description,
        emergencyContacts: emergencyContacts || '',
        status: 'PENDING',
        address: addressLine2
      }
    });

    // Send SMS to emergency contacts with address
    if (emergencyContacts) {
      console.log('Processing emergency contacts:', emergencyContacts);
      const contactNumbers = emergencyContacts.split(',');
      
      console.log('Sending SMS to contacts:', contactNumbers);
      
      for (const phoneNumber of contactNumbers) {
        try {
          console.log('Attempting to send SMS to:', phoneNumber);
          
          const messageSid = await sendEmergencySMS(
            phoneNumber,
            auth?.username || 'Unknown User',
            `${latitude},${longitude}`,
            description,
            message || undefined,
            addressLine2
          );
          
          console.log('SMS sent successfully to:', {
            phoneNumber,
            messageSid
          });
          
        } catch (error: any) {
          console.error('Detailed SMS failure:', {
            phoneNumber,
            errorMessage: error?.message,
            errorCode: error?.code,
            errorStatus: error?.status,
            stack: error?.stack
          });
        }
      }
    }

    // Return the complaint with included relations
    const complaintWithRelations = await prisma.complaint.findUnique({
      where: { id: complaint.id },
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
      }
    });

    return NextResponse.json({
      message: 'Complaint registered successfully',
      complaint: complaintWithRelations
    });

  } catch (error: any) {
    console.error('Error creating complaint:', error?.message || error);
    return NextResponse.json(
      { message: 'Error creating complaint', error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request) as AuthPayload | null;
    
    if (!auth?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        userId: auth.userId
      },
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
