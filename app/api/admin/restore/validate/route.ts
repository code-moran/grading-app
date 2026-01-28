import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface BackupData {
  metadata: {
    version: string;
    timestamp: string;
    exportedBy: string;
    exportedByEmail: string;
    recordCounts: Record<string, number>;
  };
  data: {
    users?: any[];
    students?: any[];
    instructors?: any[];
    courses?: any[];
    lessons?: any[];
    exercises?: any[];
    grades?: any[];
    gradeCriteria?: any[];
    quizQuestions?: any[];
    quizAttempts?: any[];
    rubrics?: any[];
    rubricCriteria?: any[];
    rubricLevels?: any[];
    rubricCriteriaMappings?: any[];
    rubricLevelMappings?: any[];
    cohorts?: any[];
    courseSubscriptions?: any[];
    courseInstructors?: any[];
    exerciseSubmissions?: any[];
    lessonNotes?: any[];
    pdfResources?: any[];
    unitStandards?: any[];
    competencyUnits?: any[];
    assessorAccreditations?: any[];
    assessmentAuditLogs?: any[];
    [key: string]: any[] | undefined;
  };
}

// POST /api/admin/restore/validate - Validate backup file without restoring
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { backupData: backupDataParam } = body;

    if (!backupDataParam) {
      return NextResponse.json(
        { error: 'Backup data is required' },
        { status: 400 }
      );
    }

    let backupData: BackupData;
    try {
      // If it's already an object, use it directly; otherwise parse it
      backupData = typeof backupDataParam === 'string' 
        ? JSON.parse(backupDataParam) 
        : backupDataParam;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate structure
    if (!backupData.metadata || !backupData.data) {
      return NextResponse.json(
        { error: 'Invalid backup file structure' },
        { status: 400 }
      );
    }

    // Validate version
    if (backupData.metadata.version !== '1.0.0') {
      return NextResponse.json(
        {
          valid: false,
          error: `Unsupported backup version: ${backupData.metadata.version}`,
        },
        { status: 400 }
      );
    }

    // Check for required data
    const requiredKeys = ['users', 'courses', 'lessons'];
    const missingKeys = requiredKeys.filter((key) => !backupData.data[key]);

    if (missingKeys.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          error: `Missing required data: ${missingKeys.join(', ')}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      metadata: backupData.metadata,
      recordCounts: backupData.metadata.recordCounts,
    });
  } catch (error: any) {
    console.error('Error validating backup:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to validate backup',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
