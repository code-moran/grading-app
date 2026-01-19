import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { Exercise, Rubric, RubricCriteria, RubricLevel } from '@/lib/types';

// POST /api/lessons/[id]/exercises - Add a new exercise to a lesson
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: lessonId } = params;
    const body = await request.json();
    const { title, description, maxPoints, rubric } = body;

    // Validate required fields
    if (!title || !description || !rubric) {
      return NextResponse.json(
        { error: 'Title, description, and rubric are required' },
        { status: 400 }
      );
    }

    // Check if lesson exists
    const lessonExists = await query(
      'SELECT id FROM lessons WHERE id = $1',
      [lessonId]
    );

    if (lessonExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Start a transaction
    const client = await query('BEGIN');

    try {
      // Create rubric
      const rubricResult = await query(
        `INSERT INTO rubrics (name, description, total_points)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [rubric.name, rubric.description, rubric.totalPoints || maxPoints]
      );

      const rubricId = rubricResult.rows[0].id;

      // Insert rubric criteria
      for (const criteria of rubric.criteria) {
        const criteriaResult = await query(
          `INSERT INTO rubric_criteria (name, description, weight)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [criteria.name, criteria.description, criteria.weight]
        );

        const criteriaId = criteriaResult.rows[0].id;

        // Link criteria to rubric
        await query(
          `INSERT INTO rubric_criteria_mapping (rubric_id, criteria_id)
           VALUES ($1, $2)`,
          [rubricId, criteriaId]
        );
      }

      // Insert rubric levels
      for (const level of rubric.levels) {
        const levelResult = await query(
          `INSERT INTO rubric_levels (name, description, points, color)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [level.name, level.description, level.points, level.color]
        );

        const levelId = levelResult.rows[0].id;

        // Link level to rubric
        await query(
          `INSERT INTO rubric_levels_mapping (rubric_id, level_id)
           VALUES ($1, $2)`,
          [rubricId, levelId]
        );
      }

      // Create exercise
      const exerciseResult = await query(
        `INSERT INTO exercises (lesson_id, title, description, max_points, rubric_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, description, max_points, rubric_id`,
        [lessonId, title, description, maxPoints, rubricId]
      );

      const exerciseRow = exerciseResult.rows[0];

      // Get the complete rubric data
      const completeRubricResult = await query(`
        SELECT id, name, description, total_points
        FROM rubrics
        WHERE id = $1
      `, [rubricId]);

      const rubricRow = completeRubricResult.rows[0];

      // Get rubric criteria
      const criteriaResult = await query(`
        SELECT rc.id, rc.name, rc.description, rc.weight
        FROM rubric_criteria rc
        JOIN rubric_criteria_mapping rcm ON rc.id = rcm.criteria_id
        WHERE rcm.rubric_id = $1
        ORDER BY rc.name
      `, [rubricId]);

      const criteria: RubricCriteria[] = criteriaResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        weight: row.weight
      }));

      // Get rubric levels
      const levelsResult = await query(`
        SELECT rl.id, rl.name, rl.description, rl.points, rl.color
        FROM rubric_levels rl
        JOIN rubric_levels_mapping rlm ON rl.id = rlm.level_id
        WHERE rlm.rubric_id = $1
        ORDER BY rl.points DESC
      `, [rubricId]);

      const levels: RubricLevel[] = levelsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        points: row.points,
        color: row.color
      }));

      const completeRubric: Rubric = {
        id: rubricRow.id,
        name: rubricRow.name,
        description: rubricRow.description,
        criteria,
        levels,
        totalPoints: rubricRow.total_points
      };

      const newExercise: Exercise = {
        id: exerciseRow.id,
        title: exerciseRow.title,
        description: exerciseRow.description,
        maxPoints: exerciseRow.max_points,
        rubric: completeRubric
      };

      // Commit the transaction
      await query('COMMIT');

      return NextResponse.json({ exercise: newExercise }, { status: 201 });
    } catch (error) {
      // Rollback the transaction
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
