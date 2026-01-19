import { query, testConnection } from './database';
import { readFileSync } from 'fs';
import { join } from 'path';
import { lessons } from './lessons';

// Initialize the database with schema and seed data
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaPath = join(process.cwd(), 'lib', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
        } catch (error) {
          // Log the error but continue with other statements
          console.warn(`⚠️  Warning executing statement: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.warn(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    // Verify that key tables exist
    console.log('🔍 Verifying schema creation...');
    const tables = ['students', 'lessons', 'exercises', 'rubrics', 'grades'];
    for (const table of tables) {
      try {
        await query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Table '${table}' exists`);
      } catch (error) {
        console.error(`❌ Table '${table}' does not exist or is not accessible`);
        throw new Error(`Schema creation failed - table '${table}' is missing`);
      }
    }

    console.log('✅ Database schema created and verified successfully');

    // Seed the database with initial data
    await seedDatabase();

    console.log('🎉 Database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Seed the database with initial data
const seedDatabase = async () => {
  console.log('🌱 Seeding database with initial data...');

  try {
    // Check if lessons already exist
    const existingLessons = await query('SELECT COUNT(*) FROM lessons');
    if (parseInt(existingLessons.rows[0].count) > 0) {
      console.log('📚 Lessons already exist, skipping seed data');
      return;
    }

    // Insert lessons and exercises
    for (const lesson of lessons) {
      console.log(`📖 Inserting lesson: ${lesson.title}`);
      
      // Insert lesson
      const lessonResult = await query(
        `INSERT INTO lessons (id, number, title, description, duration) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (number) DO NOTHING 
         RETURNING id`,
        [lesson.id, lesson.number, lesson.title, lesson.description, lesson.duration]
      );

      let lessonId = lesson.id;
      if (lessonResult.rows.length > 0) {
        lessonId = lessonResult.rows[0].id;
      } else {
        // Get existing lesson ID
        const existingLesson = await query('SELECT id FROM lessons WHERE number = $1', [lesson.number]);
        lessonId = existingLesson.rows[0].id;
      }

      // Insert exercises for this lesson
      for (const exercise of lesson.exercises) {
        console.log(`  📝 Inserting exercise: ${exercise.title}`);
        
        // Insert rubric
        const rubricResult = await query(
          `INSERT INTO rubrics (id, name, description, total_points) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (id) DO NOTHING 
           RETURNING id`,
          [exercise.rubric.id, exercise.rubric.name, exercise.rubric.description, exercise.rubric.totalPoints]
        );

        let rubricId = exercise.rubric.id;
        if (rubricResult.rows.length > 0) {
          rubricId = rubricResult.rows[0].id;
        } else {
          // Get existing rubric ID
          const existingRubric = await query('SELECT id FROM rubrics WHERE id = $1', [exercise.rubric.id]);
          rubricId = existingRubric.rows[0].id;
        }

        // Insert rubric criteria
        for (const criteria of exercise.rubric.criteria) {
          await query(
            `INSERT INTO rubric_criteria (id, name, description, weight) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (id) DO NOTHING`,
            [criteria.id, criteria.name, criteria.description, criteria.weight]
          );

          // Link criteria to rubric
          await query(
            `INSERT INTO rubric_criteria_mapping (rubric_id, criteria_id) 
             VALUES ($1, $2) 
             ON CONFLICT (rubric_id, criteria_id) DO NOTHING`,
            [rubricId, criteria.id]
          );
        }

        // Insert rubric levels
        for (const level of exercise.rubric.levels) {
          await query(
            `INSERT INTO rubric_levels (id, name, description, points, color) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (id) DO NOTHING`,
            [level.id, level.name, level.description, level.points, level.color]
          );

          // Link level to rubric
          await query(
            `INSERT INTO rubric_levels_mapping (rubric_id, level_id) 
             VALUES ($1, $2) 
             ON CONFLICT (rubric_id, level_id) DO NOTHING`,
            [rubricId, level.id]
          );
        }

        // Insert exercise
        await query(
          `INSERT INTO exercises (id, lesson_id, title, description, max_points, rubric_id) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (id) DO NOTHING`,
          [exercise.id, lessonId, exercise.title, exercise.description, exercise.maxPoints, rubricId]
        );
      }
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}
