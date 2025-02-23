import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import prisma from '@/lib/db';

// Add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS request (preflight)
export async function OPTIONS() {
  return addCorsHeaders(
    new NextResponse(null, {
      status: 200
    })
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Email and password are required' },
          { status: 400 }
        )
      );
    }

    const station = await prisma.policeStation.findUnique({
      where: { email },
    });

    if (!station) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        )
      );
    }

    // For police stations, you might want to implement a different authentication mechanism
    // This is a simple example using the same password field
    const isValidPassword = await compare(password, station.password);

    if (!isValidPassword) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        )
      );
    }

    const token = await new SignJWT({ 
      stationId: station.id, 
      name: station.name,
      role: 'POLICE_STATION'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    return addCorsHeaders(
      NextResponse.json({
        message: 'Login successful',
        token,
        station: {
          id: station.id,
          name: station.name,
          area: station.area,
          city: station.city,
          email: station.email,
        },
      })
    );
  } catch (error) {
    console.error('Police station login error:', error);
    return addCorsHeaders(
      NextResponse.json(
        { message: 'Error logging in' },
        { status: 500 }
      )
    );
  }
} 