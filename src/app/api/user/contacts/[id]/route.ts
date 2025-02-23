import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Update contact
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth();
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, phoneNumber, relation } = body;

    // Verify ownership
    const existingContact = await prisma.emergencyContact.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingContact || existingContact.userId !== auth.userId) {
      return NextResponse.json(
        { message: 'Contact not found or unauthorized' },
        { status: 404 }
      );
    }

    const contact = await prisma.emergencyContact.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phoneNumber,
        relation
      }
    });

    return NextResponse.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error: any) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { message: 'Error updating contact', error: error.message },
      { status: 500 }
    );
  }
}

// Delete contact
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth();
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verify ownership
    const existingContact = await prisma.emergencyContact.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingContact || existingContact.userId !== auth.userId) {
      return NextResponse.json(
        { message: 'Contact not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.emergencyContact.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      message: 'Contact deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { message: 'Error deleting contact', error: error.message },
      { status: 500 }
    );
  }
} 