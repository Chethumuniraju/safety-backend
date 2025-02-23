import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import type { JWTPayload } from 'jose';

interface AuthPayload extends JWTPayload {
  userId: number;
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request) as AuthPayload | null;
    
    if (!auth?.userId) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      );
    }

    // Verify contact belongs to user
    const contact = await prisma.emergencyContact.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!contact || contact.userId !== auth.userId) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Contact not found or unauthorized' },
          { status: 404 }
        )
      );
    }

    await prisma.emergencyContact.delete({
      where: { id: parseInt(params.id) }
    });

    return addCorsHeaders(
      NextResponse.json({
        message: 'Contact deleted successfully'
      })
    );
  } catch (error: any) {
    console.error('Delete contact error:', error);
    return addCorsHeaders(
      NextResponse.json(
        { message: 'Error deleting contact', error: error.message },
        { status: 500 }
      )
    );
  }
} 