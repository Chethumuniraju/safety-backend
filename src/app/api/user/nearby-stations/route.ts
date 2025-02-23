import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Number(distance.toFixed(2)); // Round to 2 decimal places
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
  });
}

export async function GET(request: Request) {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    const url = new URL(request.url);
    const latitude = parseFloat(url.searchParams.get('latitude') || '');
    const longitude = parseFloat(url.searchParams.get('longitude') || '');

    console.log('Received coordinates:', { latitude, longitude });

    if (isNaN(latitude) || isNaN(longitude)) {
      const errorResponse = { 
        success: false,
        message: 'Invalid coordinates provided',
        data: []
      };
      console.log('Invalid coordinates response:', errorResponse);
      return NextResponse.json(errorResponse, { status: 400, headers });
    }

    const policeStations = await prisma.policeStation.findMany({
      select: {
        id: true,
        name: true,
        area: true,
        city: true,
        state: true,
        pincode: true,
        phoneNumber: true,
        email: true,
        latitude: true,
        longitude: true
      }
    });

    console.log('Found police stations:', policeStations.length);

    if (!policeStations.length) {
      const noStationsResponse = { 
        success: false,
        message: 'No police stations found',
        data: []
      };
      console.log('No stations response:', noStationsResponse);
      return NextResponse.json(noStationsResponse, { status: 404, headers });
    }

    const stationsWithDistance = policeStations
      .map(station => ({
        ...station,
        distance: calculateDistance(
          latitude,
          longitude,
          Number(station.latitude),
          Number(station.longitude)
        )
      }))
      .sort((a, b) => a.distance - b.distance);

    console.log('Calculated distances:', stationsWithDistance.map(s => ({
      name: s.name,
      distance: s.distance
    })));

    const nearestStations = stationsWithDistance.slice(0, 5);

    const successResponse = {
      success: true,
      message: 'Nearest police stations found',
      data: nearestStations,
      userLocation: {
        latitude,
        longitude
      }
    };

    console.log('Success response:', {
      ...successResponse,
      data: successResponse.data.map(s => ({
        name: s.name,
        distance: s.distance
      }))
    });

    return NextResponse.json(successResponse, { status: 200, headers });

  } catch (error: any) {
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });

    const errorResponse = { 
      success: false,
      message: 'Error finding nearest police station',
      error: error?.message || 'Unknown error',
      data: []
    };

    console.log('Error response:', errorResponse);

    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
} 