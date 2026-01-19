import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { BulkGradeExport } from '@/lib/types';

// GET /api/grades/export - Export all grades for bulk download
export async function GET() {
  try {
    // Get all students with their grades
    const result = await query(`
      SELECT 
        s.id as student_id, s.name as student_name, s.registration_number,
        g.id as grade_id, g.lesson_id, g.exercise_id, g.total_points, g.percentage, g.letter_grade,
        l.number as lesson_number, l.title as lesson_title,
        e.title as exercise_title, e.max_points
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN lessons l ON g.lesson_id = l.id
      LEFT JOIN exercises e ON g.exercise_id = e.id
      ORDER BY s.name, l.number, e.title
    `);

    // Group grades by student
    const studentGradesMap = new Map<string, any[]>();
    const studentsMap = new Map<string, any>();

    result.rows.forEach(row => {
      const studentId = row.student_id;
      
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          studentId: row.student_id,
          studentName: row.student_name,
          registrationNumber: row.registration_number
        });
      }

      if (row.grade_id) {
        if (!studentGradesMap.has(studentId)) {
          studentGradesMap.set(studentId, []);
        }
        
        studentGradesMap.get(studentId)!.push({
          lessonId: row.lesson_id,
          lessonTitle: `Lesson ${row.lesson_number}: ${row.lesson_title}`,
          exerciseId: row.exercise_id,
          exerciseTitle: row.exercise_title,
          points: row.total_points,
          maxPoints: row.max_points,
          percentage: row.percentage,
          letterGrade: row.letter_grade
        });
      }
    });

    // Calculate statistics for each student
    const bulkExportData: BulkGradeExport[] = Array.from(studentsMap.values()).map(student => {
      const grades = studentGradesMap.get(student.studentId) || [];
      
      // Calculate best grade
      let bestGrade = 0;
      let bestPercentage = 0;
      let bestLetterGrade = 'F';
      
      if (grades.length > 0) {
        const percentages = grades.map(g => g.percentage);
        bestPercentage = Math.max(...percentages);
        bestGrade = bestPercentage;
        
        if (bestPercentage >= 90) bestLetterGrade = 'A';
        else if (bestPercentage >= 80) bestLetterGrade = 'B';
        else if (bestPercentage >= 70) bestLetterGrade = 'C';
        else if (bestPercentage >= 60) bestLetterGrade = 'D';
        else bestLetterGrade = 'F';
      }

      // Calculate average grade
      const averageGrade = grades.length > 0 
        ? Math.round(grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length)
        : 0;

      // Get total exercises count
      const totalExercisesResult = query(`
        SELECT COUNT(*) as total_exercises
        FROM exercises e
        JOIN lessons l ON e.lesson_id = l.id
      `);

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        registrationNumber: student.registrationNumber,
        bestGrade,
        bestPercentage,
        bestLetterGrade,
        totalExercises: 0, // This would need to be calculated properly
        completedExercises: grades.length,
        averageGrade,
        grades
      };
    });

    return NextResponse.json({ 
      success: true,
      data: bulkExportData,
      message: `Exported grades for ${bulkExportData.length} students`
    });
  } catch (error) {
    console.error('Error exporting grades:', error);
    return NextResponse.json(
      { error: 'Failed to export grades' },
      { status: 500 }
    );
  }
}
