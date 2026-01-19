import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PDFResource } from '@/lib/types';

// GET /api/pdf-resources - Get PDF resources with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    const whereClause: any = {};
    
    if (lessonId) {
      whereClause.lessonId = lessonId;
    }

    const resources = await prisma.pDFResource.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
    });

    const formattedResources: PDFResource[] = resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      lessonId: resource.lessonId || undefined,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      fileSize: resource.fileSize,
      uploadedAt: resource.uploadedAt
    }));

    return NextResponse.json({ resources: formattedResources });
  } catch (error) {
    console.error('Error fetching PDF resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PDF resources' },
      { status: 500 }
    );
  }
}

// POST /api/pdf-resources - Upload a new PDF resource
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const lessonId = formData.get('lessonId') as string;
    const file = formData.get('file') as File;

    // Validate required fields
    if (!title || !description || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // In a real application, you would upload the file to a cloud storage service
    // For now, we'll simulate the upload process
    const fileUrl = `/uploads/${Date.now()}-${file.name}`;
    const fileSize = Math.round(file.size / 1024); // Convert to KB

    const newResource = await prisma.pDFResource.create({
      data: {
        title,
        description,
        lessonId: lessonId || null,
        fileUrl,
        fileName: file.name,
        fileSize,
      },
    });

    const formattedResource: PDFResource = {
      id: newResource.id,
      title: newResource.title,
      description: newResource.description,
      lessonId: newResource.lessonId || undefined,
      fileUrl: newResource.fileUrl,
      fileName: newResource.fileName,
      fileSize: newResource.fileSize,
      uploadedAt: newResource.uploadedAt
    };

    return NextResponse.json({ resource: formattedResource }, { status: 201 });
  } catch (error) {
    console.error('Error uploading PDF resource:', error);
    return NextResponse.json(
      { error: 'Failed to upload PDF resource' },
      { status: 500 }
    );
  }
}
