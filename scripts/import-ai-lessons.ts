import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const LESSON_DIR = 'C:\\Users\\admin\\projects\\artificial-intelligene-lesson-plans';
const COURSE_ID = 'cmjfu6gc8000jn226yi69v4g5';

interface RubricLevel {
  name: string;
  description: string;
  points: number;
  color: string;
}

interface RubricCriteria {
  name: string;
  description: string;
  weight: number;
}

interface ParsedLesson {
  number: number;
  title: string;
  duration: string;
  description: string;
  objectives: string[];
  keyConcepts: string;
  exercises: Array<{
    title: string;
    description: string;
    maxPoints: number;
    assessmentRubric?: string;
  }>;
  quizQuestions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string | null;
  }>;
  references: string;
}

// Common rubric levels
const commonLevels: RubricLevel[] = [
  {
    name: "Excellent (4)",
    description: "Exceeds expectations with exceptional quality and understanding",
    points: 4,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  {
    name: "Good (3)",
    description: "Meets expectations with good quality and understanding",
    points: 3,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    name: "Satisfactory (2)",
    description: "Meets basic expectations with adequate quality",
    points: 2,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  {
    name: "Needs Improvement (1)",
    description: "Below expectations, requires significant improvement",
    points: 1,
    color: "bg-red-100 text-red-800 border-red-200"
  }
];

// Function to parse rubric criteria from assessment rubric text
function parseRubricCriteria(assessmentRubric: string): RubricCriteria[] {
  const criteria: RubricCriteria[] = [];
  
  if (!assessmentRubric || !assessmentRubric.trim()) {
    return criteria;
  }
  
  // Try multiple patterns to extract rubric criteria
  // Pattern 1: - **Criteria Name (X%):** Description
  // Pattern 2: - **Criteria Name:** Description (X%)
  // Pattern 3: **Criteria Name (X%):** Description
  // Pattern 4: **Criteria Name:** Description (X%)
  
  const patterns = [
    // Pattern 1: - **Criteria Name (X%):** Description
    /- \*\*([^(]+?)\s*\((\d+)%\):\*\*\s*([\s\S]+?)(?=\n- \*\*|\n\n|$)/g,
    // Pattern 2: - **Criteria Name:** Description (X%)
    /- \*\*([^:]+?):\*\*\s*([\s\S]+?)\s*\((\d+)%\)(?=\n- \*\*|\n\n|$)/g,
    // Pattern 3: **Criteria Name (X%):** Description (without leading dash)
    /\*\*([^(]+?)\s*\((\d+)%\):\*\*\s*([\s\S]+?)(?=\n\*\*|\n\n|$)/g,
    // Pattern 4: **Criteria Name:** Description (X%) (without leading dash)
    /\*\*([^:]+?):\*\*\s*([\s\S]+?)\s*\((\d+)%\)(?=\n\*\*|\n\n|$)/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    const tempCriteria: RubricCriteria[] = [];
    
    while ((match = pattern.exec(assessmentRubric)) !== null) {
      let name: string;
      let weight: number;
      let description: string;
      
      if (match.length === 4) {
        // Pattern 1 or 3: name (weight%): description
        name = match[1].trim();
        weight = parseInt(match[2], 10);
        description = match[3].trim();
      } else if (match.length === 4 && match[3]) {
        // Pattern 2 or 4: name: description (weight%)
        name = match[1].trim();
        description = match[2].trim();
        weight = parseInt(match[3], 10);
      } else {
        continue;
      }
      
      // Clean up description (remove markdown formatting, extra whitespace)
      description = description
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      
      if (name && weight > 0 && weight <= 100 && description) {
        tempCriteria.push({
          name: name.length > 100 ? name.substring(0, 97) + '...' : name,
          description: description.length > 500 ? description.substring(0, 497) + '...' : description,
          weight
        });
      }
    }
    
    if (tempCriteria.length > 0) {
      // Normalize weights to sum to 100
      const totalWeight = tempCriteria.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight > 0) {
        tempCriteria.forEach(c => {
          c.weight = Math.round((c.weight / totalWeight) * 100);
        });
        // Adjust last criterion to ensure sum is exactly 100
        const actualTotal = tempCriteria.reduce((sum, c) => sum + c.weight, 0);
        if (actualTotal !== 100 && tempCriteria.length > 0) {
          tempCriteria[tempCriteria.length - 1].weight += (100 - actualTotal);
        }
      }
      
      return tempCriteria;
    }
  }
  
  return criteria;
}

// Function to generate rubric criteria from learning objectives or assessment rubric
function generateCriteriaFromObjectives(objectives: string[], assessmentRubric?: string): RubricCriteria[] {
  const criteria: RubricCriteria[] = [];
  
  // First, try to parse rubric criteria from the assessment rubric section
  if (assessmentRubric) {
    const parsedCriteria = parseRubricCriteria(assessmentRubric);
    
    // If we found criteria from the rubric, return them
    if (parsedCriteria.length > 0) {
      return parsedCriteria;
    }
  }
  
  // Otherwise, generate criteria from learning objectives
  if (objectives.length === 0) {
    // Fallback to common criteria if no objectives
    return [
      {
        name: "Content",
        description: "Accuracy and depth of content",
        weight: 40
      },
      {
        name: "Presentation",
        description: "Clarity and organization",
        weight: 30
      },
      {
        name: "Analysis",
        description: "Understanding and critical thinking",
        weight: 20
      },
      {
        name: "Engagement",
        description: "Participation and effort",
        weight: 10
      }
    ];
  }
  
  // Extract key action verbs and concepts from objectives
  const actionVerbs = [
    { verb: 'define', category: 'Definition' },
    { verb: 'explain', category: 'Explanation' },
    { verb: 'understand', category: 'Understanding' },
    { verb: 'identify', category: 'Identification' },
    { verb: 'analyze', category: 'Analysis' },
    { verb: 'evaluate', category: 'Evaluation' },
    { verb: 'create', category: 'Creation' },
    { verb: 'apply', category: 'Application' },
    { verb: 'demonstrate', category: 'Demonstration' },
    { verb: 'compare', category: 'Comparison' },
    { verb: 'contrast', category: 'Comparison' },
    { verb: 'describe', category: 'Description' },
    { verb: 'trace', category: 'Tracing' },
    { verb: 'recognize', category: 'Recognition' },
    { verb: 'differentiate', category: 'Differentiation' },
    { verb: 'relate', category: 'Relationship' },
    { verb: 'implement', category: 'Implementation' },
    { verb: 'design', category: 'Design' },
    { verb: 'develop', category: 'Development' }
  ];
  
  // Group objectives by key verbs/concepts
  const objectiveGroups: { [key: string]: string[] } = {};
  
  objectives.forEach(obj => {
    const lowerObj = obj.toLowerCase();
    let matched = false;
    
    // Try to match with action verbs
    for (const { verb, category } of actionVerbs) {
      if (lowerObj.includes(verb)) {
        if (!objectiveGroups[category]) {
          objectiveGroups[category] = [];
        }
        objectiveGroups[category].push(obj);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // Extract first meaningful words (skip articles and common words)
      const words = obj.split(' ').filter(w => {
        const lower = w.toLowerCase();
        return !['the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by'].includes(lower);
      });
      const key = words.slice(0, 2).join(' ') || 'Objective';
      if (!objectiveGroups[key]) {
        objectiveGroups[key] = [];
      }
      objectiveGroups[key].push(obj);
    }
  });
  
  // Create criteria from objective groups
  const totalWeight = 100;
  const numGroups = Object.keys(objectiveGroups).length;
  
  if (numGroups === 0) {
    // Fallback: create one criterion per objective
    const weightPerObjective = Math.floor(totalWeight / objectives.length);
    const remainder = totalWeight % objectives.length;
    
    objectives.forEach((obj, index) => {
      const weight = weightPerObjective + (index < remainder ? 1 : 0);
      const shortName = obj.split(' ').slice(0, 3).join(' ') || `Objective ${index + 1}`;
      criteria.push({
        name: shortName.length > 50 ? shortName.substring(0, 47) + '...' : shortName,
        description: obj,
        weight
      });
    });
  } else {
    const baseWeight = Math.floor(totalWeight / numGroups);
    const remainder = totalWeight % numGroups;
    
    let index = 0;
    for (const [key, groupObjectives] of Object.entries(objectiveGroups)) {
      const weight = baseWeight + (index < remainder ? 1 : 0);
      const description = groupObjectives.length === 1 
        ? groupObjectives[0]
        : `Demonstrates achievement of: ${groupObjectives.slice(0, 2).join('; ')}`;
      
      criteria.push({
        name: key.length > 50 ? key.substring(0, 47) + '...' : key,
        description: description.length > 200 ? description.substring(0, 197) + '...' : description,
        weight
      });
      index++;
    }
  }
  
  // Ensure we have at least 1 criterion and max 5
  if (criteria.length === 0) {
    criteria.push({
      name: "Learning Objective Achievement",
      description: "Demonstrates achievement of lesson learning objectives",
      weight: 100
    });
  } else if (criteria.length > 5) {
    // Combine smaller criteria - keep top 4 by weight, combine rest
    const sorted = [...criteria].sort((a, b) => b.weight - a.weight);
    const combined = sorted.slice(0, 4);
    const remaining = sorted.slice(4);
    if (remaining.length > 0) {
      const remainingWeight = remaining.reduce((sum, c) => sum + c.weight, 0);
      combined.push({
        name: "Additional Objectives",
        description: remaining.map(c => c.name).join(', '),
        weight: remainingWeight
      });
    }
    return combined;
  }
  
  return criteria;
}

async function getOrCreateRubricLevel(level: RubricLevel) {
  let rubricLevel = await prisma.rubricLevel.findFirst({
    where: {
      name: level.name,
      points: level.points,
    },
  });

  if (!rubricLevel) {
    rubricLevel = await prisma.rubricLevel.create({
      data: {
        name: level.name,
        description: level.description,
        points: level.points,
        color: level.color,
      },
    });
  }

  return rubricLevel;
}

async function getOrCreateRubricCriteria(criteria: RubricCriteria) {
  let rubricCriteria = await prisma.rubricCriteria.findFirst({
    where: {
      name: criteria.name,
      weight: criteria.weight,
    },
  });

  if (!rubricCriteria) {
    rubricCriteria = await prisma.rubricCriteria.create({
      data: {
        name: criteria.name,
        description: criteria.description,
        weight: criteria.weight,
      },
    });
  }

  return rubricCriteria;
}

async function createRubricWithMappings(
  rubricData: {
    name: string;
    description: string;
    totalPoints: number;
    criteria: RubricCriteria[];
    levels: RubricLevel[];
  }
) {
  const rubric = await prisma.rubric.create({
    data: {
      name: rubricData.name,
      description: rubricData.description,
      totalPoints: rubricData.totalPoints,
    },
  });

  for (const levelData of rubricData.levels) {
    const level = await getOrCreateRubricLevel(levelData);
    await prisma.rubricLevelMapping.upsert({
      where: {
        rubricId_levelId: {
          rubricId: rubric.id,
          levelId: level.id,
        },
      },
      create: {
        rubricId: rubric.id,
        levelId: level.id,
      },
      update: {},
    });
  }

  for (const criteriaData of rubricData.criteria) {
    const criteria = await getOrCreateRubricCriteria(criteriaData);
    await prisma.rubricCriteriaMapping.upsert({
      where: {
        rubricId_criteriaId: {
          rubricId: rubric.id,
          criteriaId: criteria.id,
        },
      },
      create: {
        rubricId: rubric.id,
        criteriaId: criteria.id,
      },
      update: {},
    });
  }

  return rubric;
}

function parseMarkdownFile(filePath: string): ParsedLesson | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract lesson number from filename (e.g., lesson_01_... -> 1)
    const filename = path.basename(filePath);
    const numberMatch = filename.match(/lesson_(\d+)/i);
    if (!numberMatch) {
      console.warn(`⚠️  Could not extract lesson number from ${filename}`);
      return null;
    }
    const number = parseInt(numberMatch[1], 10);

    // Extract title
    const titleMatch = content.match(/### Lesson Title:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Lesson ${number}`;

    // Extract duration
    const durationMatch = content.match(/### Duration:\s*(.+)/i);
    const duration = durationMatch ? durationMatch[1].trim() : '2 Hours';

    // Extract learning objectives - improved extraction
    const objectivesMatch = content.match(/### Learning Objectives[:\s]*\n([\s\S]*?)(?=###|$)/i);
    const objectives: string[] = [];
    if (objectivesMatch) {
      const objectivesText = objectivesMatch[1];
      // Extract objectives from various formats:
      // - Bullet points: - Objective or * Objective
      // - Numbered: 1. Objective or 1) Objective
      // - Plain text lines (if no bullets)
      const objectiveLines = objectivesText.split('\n')
        .map(line => line.trim())
        .filter(line => {
          // Skip empty lines and section headers
          if (!line || line.length < 3) return false;
          // Match bullet points, numbered lists, or lines that look like objectives
          return line.match(/^[-*•]\s+/) || 
                 line.match(/^\d+[.)]\s+/) ||
                 (line.length > 10 && !line.startsWith('#') && !line.startsWith('###'));
        });
      
      objectives.push(...objectiveLines.map(line => {
        // Remove bullet points, numbering, and clean up
        return line
          .replace(/^[-*•]\s+/, '')
          .replace(/^\d+[.)]\s+/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
      }).filter(obj => obj.length > 0));
    }

    // Extract key concepts - improved extraction to align with objectives
    let keyConcepts = '';
    
    // Try multiple patterns to find key concepts
    const keyConceptsPatterns = [
      /### Key Concepts[\s\S]*?#### Comprehensive Notes[\s\S]*?([\s\S]*?)(?=###|#### Part|$)/i,
      /### Key Concepts[:\s]*\n([\s\S]*?)(?=###|####|$)/i,
      /#### Key Concepts[:\s]*\n([\s\S]*?)(?=###|####|$)/i,
    ];
    
    for (const pattern of keyConceptsPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        keyConcepts = match[1].trim();
        break;
      }
    }
    
    // If no key concepts found but we have objectives, create a summary
    if (!keyConcepts && objectives.length > 0) {
      keyConcepts = `This lesson covers the following key concepts:\n\n${objectives.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n\n')}`;
    }

    // Extract practical activities as exercises
    const exercises: Array<{ title: string; description: string; maxPoints: number; assessmentRubric?: string }> = [];
    const practicalSectionMatch = content.match(/#### Part 2: Practical\/Hands-on Activity[\s\S]*?(?=#### Part 3:|###|$)/i);
    if (practicalSectionMatch) {
      const practicalSection = practicalSectionMatch[0];
      
      // Extract activity title
      const titleMatch = practicalSection.match(/- \*\*Activity Title:\*\*\s*(.+?)(?:\n|$)/i);
      const activityTitle = titleMatch ? titleMatch[1].trim() : `Practical Activity - Lesson ${number}`;
      
      // Extract objective
      const objectiveMatch = practicalSection.match(/- \*\*Objective:\*\*\s*(.+?)(?:\n|$)/i);
      const objective = objectiveMatch ? objectiveMatch[1].trim() : '';
      
      // Extract procedure
      const procedureMatch = practicalSection.match(/- \*\*Procedure:\*\*([\s\S]*?)(?=- \*\*Expected Outcome:|####|###|$)/i);
      const procedure = procedureMatch ? procedureMatch[1].trim() : '';
      
      // Extract expected outcome
      const outcomeMatch = practicalSection.match(/- \*\*Expected Outcome:\*\*([\s\S]*?)(?=- \*\*Assessment Rubric:|####|###|$)/i);
      const expectedOutcome = outcomeMatch ? outcomeMatch[1].trim() : '';
      
      // Extract assessment rubric
      const rubricMatch = practicalSection.match(/- \*\*Assessment Rubric:\*\*([\s\S]*?)(?=- \*\*Sample|####|###|$)/i);
      const rubricInfo = rubricMatch ? rubricMatch[1].trim() : '';
      
      // Calculate maxPoints from rubric if available, otherwise default to 16
      let maxPoints = 16;
      if (rubricInfo) {
        const parsedCriteria = parseRubricCriteria(rubricInfo);
        if (parsedCriteria.length > 0) {
          // Use 4 points per criterion as base, or calculate from weights
          // Assuming Excellent (4 points) * number of criteria
          maxPoints = parsedCriteria.length * 4;
        }
      }
      
      // Build student-facing description (remove instructor language, make it instructional)
      let description = '';
      
      // Add objective in student-friendly way, linking to lesson objectives
      if (objective) {
        // Make objective more student-friendly
        let studentObjective = objective.trim();
        // If objective doesn't start with "You will" or similar, make it more direct
        if (!studentObjective.toLowerCase().match(/^(you|students|participants|learners|in this)/)) {
          studentObjective = `In this activity, ${studentObjective.toLowerCase()}`;
        }
        description += `## Objective\n\n${studentObjective}\n\n`;
      }
      
      // Add procedure/instructions in student-friendly way
      if (procedure) {
        // Clean up procedure text - remove instructor notes, make it direct and student-focused
        let studentProcedure = procedure
          .replace(/instructor note[s]?:/gi, '')
          .replace(/note[s]?:/gi, '')
          .replace(/tip[s]?:/gi, '')
          .replace(/instructor[s]? should/gi, 'you should')
          .replace(/students should/gi, 'you should')
          .replace(/participants should/gi, 'you should')
          .replace(/learners should/gi, 'you should')
          .trim();
        
        // Ensure procedure is written in second person
        studentProcedure = studentProcedure
          .replace(/\b(students|participants|learners)\b/gi, 'you')
          .replace(/\b(student|participant|learner)\b/gi, 'you');
        
        // If procedure doesn't start with "You will" or similar, add context
        if (!studentProcedure.toLowerCase().match(/^(you|in this|for this|to complete)/)) {
          studentProcedure = `To complete this activity:\n\n${studentProcedure}`;
        }
        
        description += `## Instructions\n\n${studentProcedure}\n\n`;
      }
      
      // Add expected outcome in student-friendly way
      if (expectedOutcome) {
        // Make expected outcome student-focused
        let studentOutcome = expectedOutcome.trim();
        if (!studentOutcome.toLowerCase().match(/^(you|students|participants|learners|at the end)/)) {
          studentOutcome = `By completing this activity, ${studentOutcome.toLowerCase()}`;
        }
        description += `## Expected Outcome\n\n${studentOutcome}\n\n`;
      }
      
      // Add a note about the rubric (student-friendly)
      description += `> **Assessment:** Your work will be assessed according to the rubric provided. Please review the rubric before submitting your work to understand how you will be evaluated.\n`;
      
      exercises.push({
        title: activityTitle,
        description: description.trim(),
        maxPoints: maxPoints,
        assessmentRubric: rubricInfo // Store rubric info for criteria generation
      });
    }

    // Extract quiz questions
    const quizQuestions: Array<{ question: string; options: string[]; correctAnswer: number; explanation: string | null }> = [];
    const quizSectionMatch = content.match(/#### Part 3: Quiz\/Assessment[\s\S]*?- \*\*Quiz:\*\*([\s\S]*?)(?=####|###|$)/i);
    if (quizSectionMatch) {
      const quizContent = quizSectionMatch[1];
      
      // Match questions (they start with "- **Question X:**")
      const questionRegex = /- \*\*Question \d+:\*\*\s*([\s\S]*?)(?=- \*\*Question \d+:|###|$)/gi;
      let questionMatch;
      
      while ((questionMatch = questionRegex.exec(quizContent)) !== null) {
        const questionBlock = questionMatch[1].trim();
        
        // Extract question text (first line, before options)
        const lines = questionBlock.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) continue;
        
        const qText = lines[0];
        
        // Extract options (lines starting with - **A.**, - **B.**, etc.)
        const options: string[] = [];
        const optionRegex = /- \*\*([A-D])\.\*\*\s*(.+?)(?=\n|$)/g;
        let optionMatch;
        
        while ((optionMatch = optionRegex.exec(questionBlock)) !== null) {
          const optionText = optionMatch[2].trim();
          options.push(optionText);
        }
        
        // Skip open-ended questions (no options)
        if (options.length < 2) {
          continue;
        }
        
        // Extract correct answer
        const correctAnswerMatch = questionBlock.match(/- \*\*Correct Answer:\*\*\s*([A-D])/i);
        const correctAnswer = correctAnswerMatch 
          ? correctAnswerMatch[1].charCodeAt(0) - 'A'.charCodeAt(0)
          : 0;
        
        // Extract explanation
        const explanationMatch = questionBlock.match(/- \*\*Explanation:\*\*\s*([\s\S]+?)(?=\n- \*\*Question|###|$)/i);
        const explanation = explanationMatch ? explanationMatch[1].trim() : null;
        
        if (qText && options.length >= 2) {
          quizQuestions.push({
            question: qText,
            options,
            correctAnswer,
            explanation
          });
        }
      }
    }

    // Extract references
    const referencesMatch = content.match(/### References[\s\S]*?([\s\S]*?)(?=###|$)/i);
    const references = referencesMatch ? referencesMatch[1].trim() : '';

    // Build description - keep it simple since objectives, key concepts, and references are stored as notes
    const description = `Lesson ${number}: ${title}`;

    return {
      number,
      title,
      duration,
      description: description.trim(),
      objectives,
      keyConcepts,
      exercises,
      quizQuestions,
      references
    };
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}:`, error);
    return null;
  }
}

async function importLessons() {
  try {
    console.log('🚀 Starting AI lesson import...\n');

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: COURSE_ID },
    });

    if (!course) {
      throw new Error(`Course with ID ${COURSE_ID} not found`);
    }

    console.log(`✅ Using course: ${course.title} (ID: ${COURSE_ID})\n`);

    // Read all lesson files
    const files = fs.readdirSync(LESSON_DIR)
      .filter(file => file.startsWith('lesson_') && file.endsWith('.md'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/lesson_(\d+)/i)?.[1] || '0', 10);
        const numB = parseInt(b.match(/lesson_(\d+)/i)?.[1] || '0', 10);
        return numA - numB;
      });

    console.log(`📚 Found ${files.length} lesson files\n`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let totalExercises = 0;
    let totalQuizQuestions = 0;

    // Process each lesson file
    for (const file of files) {
      const filePath = path.join(LESSON_DIR, file);
      const parsedLesson = parseMarkdownFile(filePath);

      if (!parsedLesson) {
        console.warn(`⚠️  Skipping ${file} - could not parse`);
        skippedCount++;
        continue;
      }

      console.log(`📖 Processing Lesson ${parsedLesson.number}: ${parsedLesson.title}`);

      // Check if lesson already exists FOR THIS COURSE (not globally)
      const existingLesson = await prisma.lesson.findFirst({
        where: { 
          number: parsedLesson.number,
          courseId: COURSE_ID
        },
        include: { exercises: true, quizQuestions: true },
      });

      let lesson;
      let exercisesCreated = 0;

      if (existingLesson) {
        // Update existing lesson in this course
        lesson = await prisma.lesson.update({
          where: { id: existingLesson.id },
          data: {
            title: parsedLesson.title,
            description: parsedLesson.description || null,
            duration: parsedLesson.duration || null,
            courseId: COURSE_ID, // Ensure it's tied to this course
          },
        });
        updatedCount++;
        console.log(`   📝 Updated lesson ${parsedLesson.number} for this course`);
      } else {
        // Create new lesson for this course
        // With composite unique constraint (number + courseId), we can have the same lesson number in different courses
        lesson = await prisma.lesson.create({
          data: {
            number: parsedLesson.number,
            title: parsedLesson.title,
            description: parsedLesson.description || null,
            duration: parsedLesson.duration || null,
            courseId: COURSE_ID,
          },
        });
        createdCount++;
        console.log(`   ✅ Created lesson ${parsedLesson.number}`);
      }

      // Process exercises - always create/update for this lesson in this course
      if (parsedLesson.exercises.length > 0) {
        // Delete existing exercises for this lesson to avoid duplicates
        if (existingLesson && existingLesson.exercises.length > 0) {
          await prisma.exercise.deleteMany({
            where: { lessonId: lesson.id },
          });
        }
        for (const exerciseData of parsedLesson.exercises) {
          // Generate criteria from assessment rubric first, then fall back to objectives
          const criteria = generateCriteriaFromObjectives(
            parsedLesson.objectives,
            exerciseData.assessmentRubric
          );
          
          // Ensure we have valid criteria
          if (criteria.length === 0) {
            console.warn(`   ⚠️  No criteria found for exercise "${exerciseData.title}", using fallback criteria`);
            criteria.push({
              name: "Completion",
              description: "Successfully completes the activity",
              weight: 50
            }, {
              name: "Quality",
              description: "Demonstrates understanding and quality of work",
              weight: 50
            });
          }
          
          // Create rubric description based on what was used
          let rubricDescription = '';
          if (exerciseData.assessmentRubric && parseRubricCriteria(exerciseData.assessmentRubric).length > 0) {
            rubricDescription = `Assessment rubric for: ${exerciseData.title}`;
          } else {
            rubricDescription = `Rubric based on learning objectives: ${parsedLesson.objectives.slice(0, 2).join('; ')}`;
          }
          
          // Create rubric with mappings using criteria from assessment rubric or objectives
          const rubric = await createRubricWithMappings({
            name: `${parsedLesson.title} - ${exerciseData.title} Rubric`,
            description: rubricDescription,
            totalPoints: exerciseData.maxPoints,
            criteria: criteria,
            levels: commonLevels,
          });

          // Create exercise
          await prisma.exercise.create({
            data: {
              title: exerciseData.title,
              description: exerciseData.description || null,
              maxPoints: exerciseData.maxPoints,
              lessonId: lesson.id,
              rubricId: rubric.id,
            },
          });
          exercisesCreated++;
          totalExercises++;
        }
        if (exercisesCreated > 0) {
          console.log(`   └─ Created ${exercisesCreated} exercise(s)`);
        }
      }

      // Process quiz questions - always create/update for this lesson in this course
      if (parsedLesson.quizQuestions.length > 0) {
        // Delete existing quiz questions for this lesson to avoid duplicates
        if (existingLesson && existingLesson.quizQuestions.length > 0) {
          await prisma.quizQuestion.deleteMany({
            where: { lessonId: lesson.id },
          });
        }

        let quizQuestionsCreated = 0;
        for (let i = 0; i < parsedLesson.quizQuestions.length; i++) {
          const quizQuestion = parsedLesson.quizQuestions[i];

          // Create quiz question
          await prisma.quizQuestion.create({
            data: {
              lessonId: lesson.id,
              question: quizQuestion.question,
              options: quizQuestion.options as any,
              correctAnswer: quizQuestion.correctAnswer,
              explanation: quizQuestion.explanation || null,
              order: i,
            },
          });
          quizQuestionsCreated++;
          totalQuizQuestions++;
        }
        if (quizQuestionsCreated > 0) {
          console.log(`   └─ Created ${quizQuestionsCreated} quiz question(s)`);
        }
      }

      // Process lesson notes - create notes for learning objectives, key concepts, and comprehensive notes
      // Delete existing notes for this lesson first
      await prisma.lessonNote.deleteMany({
        where: { lessonId: lesson.id },
      });

      let notesCreated = 0;

      // Create note for learning objectives
      if (parsedLesson.objectives.length > 0) {
        await prisma.lessonNote.create({
          data: {
            lessonId: lesson.id,
            lessonNumber: parsedLesson.number,
            lessonTitle: parsedLesson.title,
            title: 'Learning Objectives',
            content: parsedLesson.objectives.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n\n'),
            section: 'objectives',
          },
        });
        notesCreated++;
      }

      // Create note for key concepts
      if (parsedLesson.keyConcepts) {
        await prisma.lessonNote.create({
          data: {
            lessonId: lesson.id,
            lessonNumber: parsedLesson.number,
            lessonTitle: parsedLesson.title,
            title: 'Key Concepts',
            content: parsedLesson.keyConcepts,
            section: 'content',
          },
        });
        notesCreated++;
      }

      // Create note for references
      if (parsedLesson.references) {
        await prisma.lessonNote.create({
          data: {
            lessonId: lesson.id,
            lessonNumber: parsedLesson.number,
            lessonTitle: parsedLesson.title,
            title: 'References',
            content: parsedLesson.references,
            section: 'resources',
          },
        });
        notesCreated++;
      }

      if (notesCreated > 0) {
        console.log(`   └─ Created ${notesCreated} lesson note(s)`);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Created: ${createdCount} lessons`);
    console.log(`   📝 Updated: ${updatedCount} lessons`);
    console.log(`   ⏭️  Skipped: ${skippedCount} lessons`);
    console.log(`   📚 Total exercises: ${totalExercises}`);
    console.log(`   ❓ Total quiz questions: ${totalQuizQuestions}`);
    console.log(`\n🎉 Lesson import completed successfully!`);

  } catch (error) {
    console.error('❌ Error importing lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importLessons()
  .then(() => {
    console.log('\n✅ Import process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import process failed:', error);
    process.exit(1);
  });
