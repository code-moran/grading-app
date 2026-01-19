import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/init-db';

// POST /api/init-db - Initialize the database with schema and seed data
export async function POST(request: NextRequest) {
  try {
    // Check for authorization (you might want to add proper authentication)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.INIT_DB_SECRET || 'init-secret'}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting database initialization...');
    
    const success = await initializeDatabase();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Database initialization failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Database initialization failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/init-db - Check database status
export async function GET() {
  try {
    const { testConnection } = await import('@/lib/database');
    const connected = await testConnection();
    
    return NextResponse.json({
      connected,
      message: connected ? 'Database is connected' : 'Database connection failed'
    });
  } catch (error) {
    console.error('Database status check error:', error);
    return NextResponse.json(
      { error: 'Database status check failed' },
      { status: 500 }
    );
  }
}
