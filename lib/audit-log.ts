import { prisma } from '@/lib/prisma';

export interface AuditLogData {
  gradeId: string;
  action: 'assessed' | 'verified' | 'moderated' | 'updated' | 'exported';
  performedBy: string;
  performedByRole: 'instructor' | 'assessor' | 'verifier' | 'moderator' | 'admin';
  previousValue?: any;
  newValue?: any;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry for assessment actions
 * This ensures compliance with TVETA requirements for tracking all assessment activities
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    const auditLog = await prisma.assessmentAuditLog.create({
      data: {
        gradeId: data.gradeId,
        action: data.action,
        performedBy: data.performedBy,
        performedByRole: data.performedByRole,
        previousValue: data.previousValue || null,
        newValue: data.newValue || null,
        notes: data.notes || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break the main flow
    return null;
  }
}

/**
 * Get audit logs for a specific grade
 */
export async function getAuditLogs(gradeId: string) {
  try {
    const auditLogs = await prisma.assessmentAuditLog.findMany({
      where: { gradeId },
      orderBy: { createdAt: 'desc' },
    });

    return auditLogs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific user/instructor
 */
export async function getAuditLogsByUser(userId: string, limit: number = 100) {
  try {
    const auditLogs = await prisma.assessmentAuditLog.findMany({
      where: { performedBy: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return auditLogs;
  } catch (error) {
    console.error('Error fetching audit logs by user:', error);
    return [];
  }
}
