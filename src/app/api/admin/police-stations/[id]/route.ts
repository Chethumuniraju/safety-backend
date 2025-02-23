import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';

// Update police station
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!request.body) {
      return NextResponse.json(
        { message: 'Request body is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Log for debugging
    console.log('Update request for ID:', id, 'Body:', body);

    const { name, area, city, state, pincode, phoneNumber, email, password, latitude, longitude } = body;

    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (area) updateData.area = area;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await hash(password, 10);
    }
    if (latitude) updateData.latitude = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    if (longitude) updateData.longitude = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

    const updatedStation = await prisma.policeStation.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Remove password from response
    const { password: _, ...stationWithoutPassword } = updatedStation;

    return NextResponse.json({
      message: 'Police station updated successfully',
      policeStation: stationWithoutPassword
    });
  } catch (error: any) {
    // Better error logging
    console.error('Update police station error:', {
      message: error?.message,
      stack: error?.stack
    });

    return NextResponse.json(
      { 
        message: 'Error updating police station',
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Delete police station
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Convert string id to number
    const policeStationId = parseInt(id);

    // Check if station exists before deleting
    const existingStation = await prisma.policeStation.findUnique({
      where: { id: policeStationId }
    });

    if (!existingStation) {
      return NextResponse.json(
        { message: 'Police station not found' },
        { status: 404 }
      );
    }

    await prisma.policeStation.delete({
      where: { id: policeStationId }
    });

    return NextResponse.json({
      message: 'Police station deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete police station error:', {
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { 
        message: 'Error deleting police station',
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get single police station
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const policeStation = await prisma.policeStation.findUnique({
      where: { id }
    });

    if (!policeStation) {
      return NextResponse.json(
        { message: 'Police station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(policeStation);
  } catch (error) {
    console.error('Get police station error:', error);
    return NextResponse.json(
      { message: 'Error fetching police station' },
      { status: 500 }
    );
  }
} 