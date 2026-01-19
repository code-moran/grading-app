'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [quizAttempts, setQuizAttempts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnections = async () => {
      try {
        setLoading(true);
        
        // Test database connection
        const dbResponse = await fetch('/api/test-db');
        const dbData = await dbResponse.json();
        setDbStatus(dbData);
        
        // Test quiz attempts
        const quizResponse = await fetch('/api/test-quiz');
        const quizData = await quizResponse.json();
        setQuizAttempts(quizData);
        
      } catch (error) {
        console.error('Error testing connections:', error);
      } finally {
        setLoading(false);
      }
    };

    testConnections();
  }, []);

  const createTestAttempt = async () => {
    try {
      const response = await fetch('/api/test-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'cmfsdqbww00019xeztpecx5fy',
          lessonId: 'lesson-01'
        }),
      });
      
      const data = await response.json();
      console.log('Test attempt created:', data);
      
      // Refresh the quiz attempts
      const quizResponse = await fetch('/api/test-quiz');
      const quizData = await quizResponse.json();
      setQuizAttempts(quizData);
      
    } catch (error) {
      console.error('Error creating test attempt:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading debug information...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Database Status</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre>{JSON.stringify(dbStatus, null, 2)}</pre>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Quiz Attempts</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre>{JSON.stringify(quizAttempts, null, 2)}</pre>
          </div>
        </div>
        
        <div>
          <button
            onClick={createTestAttempt}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Test Quiz Attempt
          </button>
        </div>
      </div>
    </div>
  );
}
