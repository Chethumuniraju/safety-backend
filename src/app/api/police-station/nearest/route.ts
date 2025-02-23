import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import type { JWTPayload } from 'jose';

interface AuthPayload extends JWTPayload {
  userId: number;
}

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
    // Add CORS headers to the response
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Get latitude and longitude from query parameters
    const url = new URL(request.url);
    const latitude = parseFloat(url.searchParams.get('latitude') || '');
    const longitude = parseFloat(url.searchParams.get('longitude') || '');

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { message: 'Invalid coordinates provided' },
        { 
          status: 400,
          headers
        }
      );
    }

    // Get all police stations
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

    if (!policeStations.length) {
      return NextResponse.json(
        { message: 'No police stations found in the database' },
        { 
          status: 404,
          headers
        }
      );
    }

    // Calculate distance for each police station and sort by distance
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

    // Get the nearest 5 stations
    const nearestStations = stationsWithDistance.slice(0, 5);

    return NextResponse.json({
      message: 'Nearest police stations found',
      stations: nearestStations,
      userLocation: {
        latitude,
        longitude
      }
    }, { 
      status: 200,
      headers 
    });

  } catch (error: any) {
    console.error('Error finding nearest police station:', error);
    return NextResponse.json(
      { 
        message: 'Error finding nearest police station', 
        error: error?.message || 'Unknown error' 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
} 