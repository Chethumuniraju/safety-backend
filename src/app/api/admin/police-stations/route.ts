import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    if (!request.body) {
      return NextResponse.json(
        { message: 'Request body is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Log the received body for debugging
    console.log('Received body:', body);

    const { name, area, city, state, pincode, phoneNumber, email, password, latitude, longitude } = body;

    // Validate all required fields
    if (!name || !area || !city || !state || !pincode || !phoneNumber || !password || !latitude || !longitude) {
      return NextResponse.json(
        { 
          message: 'All required fields must be provided',
          received: { name, area, city, state, pincode, phoneNumber, email, latitude, longitude }
        },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    const policeStation = await prisma.policeStation.create({
      data: {
        name,
        area,
        city,
        state,
        pincode,
        phoneNumber,
        email,
        password: hashedPassword,
        latitude: typeof latitude === 'string' ? parseFloat(latitude) : latitude,
        longitude: typeof longitude === 'string' ? parseFloat(longitude) : longitude
      }
    });

    // Remove password from response
    const { password: _, ...stationWithoutPassword } = policeStation;

    return NextResponse.json(
      { 
        message: 'Police station created successfully', 
        policeStation: stationWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    // Better error logging
    console.error('Create police station error:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        message: 'Error creating police station', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Get all police stations
export async function GET() {
  try {
    const policeStations = await prisma.policeStation.findMany();
    console.log('Police stations:', policeStations);
    return NextResponse.json(policeStations);
  } catch (error) {
    console.error('Get police stations error:', error);
    return NextResponse.json(
      { message: 'Error fetching police stations', error: error.message },
      { status: 500 }
    );
  }
} 