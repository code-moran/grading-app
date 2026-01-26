'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number; // Only available after submission
  explanation: string | null;
  order: number;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  course: {
    id: string;
    title: string;
  };
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [questionId: string]: number;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [studentProfile, setStudentProfile] = useState<{ id: string } | null>(null);

  // Fetch student profile ID
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/students?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.students && data.students.length > 0) {
            setStudentProfile({ id: data.students[0].id });
          }
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
      }
    };

    fetchStudentProfile();
  }, [session?.user?.id]);

  // Fetch quiz questions
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/lessons/${lessonId}/quiz`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }

        const data = await response.json();
        setLesson(data.lesson);
        setQuestions(data.questions);
      } catch (error) {
        console.error('Error loading quiz data:', error);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      loadQuizData();
    }
  }, [lessonId]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !showResults && !loading) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showResults && !loading) {
      handleSubmitQuiz();
    }
  }, [timeRemaining, showResults, loading]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (!studentProfile || !lesson || questions.length === 0) {
      setError('Unable to submit quiz. Please refresh and try again.');
      return;
    }

    setSubmitting(true);

    try {
      // First, get the correct answers by fetching the full lesson data
      const lessonResponse = await fetch(`/api/lessons/${lessonId}`);
      if (!lessonResponse.ok) {
        throw new Error('Failed to fetch correct answers');
      }

      const lessonData = await lessonResponse.json();
      const questionsWithCorrectAnswers = lessonData.lesson.quizQuestions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: q.order,
      }));

      setQuestionsWithAnswers(questionsWithCorrectAnswers);

      // Calculate score
      let correctAnswers = 0;
      const results: QuizResult[] = questionsWithCorrectAnswers.map((q: QuizQuestion) => {
        const selected = selectedAnswers[q.id] ?? -1;
        const isCorrect = selected === q.correctAnswer;
        if (isCorrect) correctAnswers++;

        return {
          questionId: q.id,
          selectedAnswer: selected,
          correctAnswer: q.correctAnswer!,
          isCorrect,
        };
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = score >= 70; // 70% passing grade

      setQuizScore(score);
      setQuizPassed(passed);
      setShowResults(true);

      // Save quiz attempt
      const quizAttempt = {
        studentId: studentProfile.id,
        lessonId: lessonId,
        questions: results,
        score,
        passed,
        timeSpent: timeSpent || (600 - timeRemaining),
      };

      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizAttempt),
      });

      if (!response.ok) {
        console.error('Failed to save quiz attempt:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [studentProfile, lesson, lessonId, questions, selectedAnswers, timeSpent, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navigation />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading quiz...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !lesson) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 inline mr-2" />
              {error}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/student"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!lesson || questions.length === 0) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-center">
              <HelpCircle className="h-5 w-5 inline mr-2" />
              No quiz questions available for this lesson.
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/student/lesson/${lessonId}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
              >
                Back to Lesson
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentQuestion = showResults
    ? questionsWithAnswers[currentQuestionIndex] || questions[currentQuestionIndex]
    : questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswer = selectedAnswers[currentQuestion?.id] ?? -1;
  const correctAnswer = showResults ? currentQuestion?.correctAnswer : undefined;
  const isCorrect = showResults && selectedAnswer === correctAnswer;

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/student/lesson/${lessonId}`}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lesson
                </Link>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Quiz: Lesson {lesson.number}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{lesson.course.title}</p>
                </div>
              </div>
              {!showResults && (
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center px-3 py-1.5 rounded-lg ${
                      timeRemaining < 60
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : timeRemaining < 300
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700'
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showResults ? (
            <div className="space-y-6">
              {/* Results Summary */}
              <div
                className={`rounded-xl shadow-lg p-8 text-center ${
                  quizPassed
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                    : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                }`}
              >
                <div className="mb-4">
                  {quizPassed ? (
                    <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                  ) : (
                    <XCircle className="h-16 w-16 mx-auto mb-4" />
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {quizPassed ? 'Congratulations!' : 'Try Again'}
                </h2>
                <div className="text-4xl font-bold mb-2">{quizScore}%</div>
                <p className="text-lg opacity-90">
                  {quizPassed
                    ? 'You passed the quiz! You can now access all lesson content.'
                    : `You need 70% to pass. You got ${quizScore}%.`}
                </p>
                <div className="mt-4 text-sm opacity-75">
                  Time spent: {formatTime(timeSpent || 600 - timeRemaining)}
                </div>
              </div>

              {/* Question Review */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {currentQuestion.question}
                </h4>

                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOption = index === correctAnswer;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          isCorrectOption
                            ? 'border-green-500 bg-green-50'
                            : isSelected && !isCorrectOption
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center">
                          {isCorrectOption && (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                          )}
                          {isSelected && !isCorrectOption && (
                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                          )}
                          <span className="text-gray-900 dark:text-white">{option}</span>
                          {isCorrectOption && (
                            <span className="ml-auto text-sm font-medium text-green-700 dark:text-green-400">
                              Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrectOption && (
                            <span className="ml-auto text-sm font-medium text-red-700 dark:text-red-400">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {currentQuestion.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-blue-900 mb-2">Explanation:</div>
                    <div className="text-blue-800">{currentQuestion.explanation}</div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {currentQuestionIndex + 1} of {questions.length}
                </div>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <Link
                    href={`/student/lesson/${lessonId}`}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Back to Lesson
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={index}
                        checked={selectedAnswer === index}
                        onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedAnswer === index
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-800"></div>
                        )}
                      </div>
                      <span className="text-gray-900 dark:text-white flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {currentQuestionIndex + 1} of {questions.length}
                </div>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Quiz
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
