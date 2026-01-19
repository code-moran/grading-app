import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/pdf-resources/[id] - Delete a PDF resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    await prisma.pDFResource.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting PDF resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete PDF resource' },
      { status: 500 }
    );
  }
}
