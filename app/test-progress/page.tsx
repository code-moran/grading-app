'use client';

import { useState, useEffect } from 'react';
import { lessons } from '@/lib/lessons';
import { QuizAttempt } from '@/lib/types';

export default function TestProgressPage() {
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = 'cmfsdqbww00019xeztpecx5fy'; // Real student ID from database

  useEffect(() => {
    const loadQuizAttempts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quiz-attempts?studentId=${studentId}`);
        if (response.ok) {
          const data = await response.json();
          setQuizAttempts(data.attempts);
          console.log('Quiz attempts:', data.attempts);
        } else {
          setError(`Failed to load quiz attempts: ${response.status}`);
        }
      } catch (error) {
        console.error('Error loading quiz attempts:', error);
        setError('Failed to load quiz attempts');
      } finally {
        setLoading(false);
      }
    };

    loadQuizAttempts();
  }, []);

  const createTestQuizAttempt = async (lessonId: string) => {
    try {
      const quizAttempt: QuizAttempt = {
        id: `test-${Date.now()}`,
        studentId,
        lessonId,
        questions: [
          {
            questionId: 'q1',
            selectedAnswer: 0,
            correctAnswer: 0,
            isCorrect: true
          }
        ],
        score: 100,
        passed: true,
        completedAt: new Date(),
        timeSpent: 300
      };

      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizAttempt),
      });

      if (response.ok) {
        const data = await response.json();
        setQuizAttempts([...quizAttempts, data.attempt]);
        console.log('Test quiz attempt created:', data.attempt);
      } else {
        const errorData = await response.json();
        console.error('Failed to create test quiz attempt:', errorData);
      }
    } catch (error) {
      console.error('Error creating test quiz attempt:', error);
    }
  };

  const hasPassedQuiz = (lessonId: string) => {
    return quizAttempts.some(attempt => attempt.lessonId === lessonId && attempt.passed);
  };

  const isLessonUnlocked = (lessonIndex: number) => {
    if (lessonIndex === 0) return true;
    
    for (let i = 0; i < lessonIndex; i++) {
      if (!hasPassedQuiz(lessons[i].id)) {
        return false;
      }
    }
    return true;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Progress Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Quiz Attempts ({quizAttempts.length})</h2>
        <div className="bg-gray-100 p-4 rounded">
          {quizAttempts.length === 0 ? (
            <p>No quiz attempts found</p>
          ) : (
            <ul>
              {quizAttempts.map(attempt => (
                <li key={attempt.id} className="mb-2">
                  Lesson {attempt.lessonId}: {attempt.passed ? 'PASSED' : 'FAILED'} ({attempt.score}%)
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
        <div className="space-x-2">
          <button
            onClick={() => createTestQuizAttempt('lesson-01')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Pass Lesson 1 Quiz
          </button>
          <button
            onClick={() => createTestQuizAttempt('lesson-02')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Pass Lesson 2 Quiz
          </button>
          <button
            onClick={() => createTestQuizAttempt('lesson-03')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Pass Lesson 3 Quiz
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Lesson Status</h2>
        <div className="space-y-2">
          {lessons.slice(0, 10).map((lesson, index) => {
            const isUnlocked = isLessonUnlocked(index);
            const hasPassed = hasPassedQuiz(lesson.id);
            
            return (
              <div
                key={lesson.id}
                className={`p-3 border rounded ${
                  isUnlocked
                    ? hasPassed
                      ? 'bg-green-100 border-green-300'
                      : 'bg-blue-100 border-blue-300'
                    : 'bg-gray-100 border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>
                    Lesson {lesson.number}: {lesson.title}
                  </span>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      isUnlocked
                        ? hasPassed
                          ? 'bg-green-200 text-green-800'
                          : 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {isUnlocked ? (hasPassed ? 'UNLOCKED & PASSED' : 'UNLOCKED') : 'LOCKED'}
                    </span>
                    {isUnlocked && !hasPassed && (
                      <button
                        onClick={() => createTestQuizAttempt(lesson.id)}
                        className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
                      >
                        Pass Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
