'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  ArrowLeft,
  Code,
  Github,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  Trophy,
  Award,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface RubricCriteria {
  id: string;
  name: string;
  description: string | null;
  weight: number;
}

interface RubricLevel {
  id: string;
  name: string;
  description: string | null;
  points: number;
  color: string | null;
}

interface Rubric {
  id: string;
  name: string;
  description: string | null;
  totalPoints: number;
  criteria: RubricCriteria[];
  levels: RubricLevel[];
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  courseId: string;
  course: {
    id: string;
    title: string;
  };
}

interface CodingStandards {
  htmlValidation: {
    passed: boolean;
    errors: string[];
    warnings: string[];
  };
  cssValidation: {
    passed: boolean;
    errors: string[];
    warnings: string[];
  };
  accessibility: {
    passed: boolean;
    score: number;
    issues: string[];
  };
  performance: {
    passed: boolean;
    score: number;
    suggestions: string[];
  };
  overallScore: number;
}

interface Submission {
  id: string;
  githubUrl: string;
  codingStandards: CodingStandards;
  status: 'pending' | 'approved' | 'needs_revision' | 'rejected';
  submittedAt: string;
}

interface Grade {
  id: string;
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  letterGrade: string;
  feedback: string | null;
  gradedAt: string;
  criteria: Array<{
    criteriaId: string;
    criteriaName: string;
    levelId: string;
    levelName: string;
    points: number;
  }>;
}

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  maxPoints: number;
  lessonId: string;
  lesson: Lesson;
  rubric: Rubric;
  submission: Submission | null;
  grade: Grade | null;
}

interface StudentProfile {
  id: string;
}

export default function StudentExercisePage() {
  const params = useParams();
  const { data: session } = useSession();
  const exerciseId = params.exerciseId as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standardsCheck, setStandardsCheck] = useState<CodingStandards | null>(null);

  // Fetch student profile
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

  // Fetch exercise data
  useEffect(() => {
    const loadExerciseData = async () => {
      if (!studentProfile) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/student/exercises/${exerciseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch exercise');
        }

        const data = await response.json();
        setExercise(data.exercise);

        if (data.exercise.submission) {
          setGithubUrl(data.exercise.submission.githubUrl);
          setStandardsCheck(data.exercise.submission.codingStandards);
        }
      } catch (error) {
        console.error('Error loading exercise data:', error);
        setError('Failed to load exercise data');
      } finally {
        setLoading(false);
      }
    };

    if (studentProfile) {
    loadExerciseData();
    }
  }, [exerciseId, studentProfile]);

  const validateGithubUrl = (url: string): boolean => {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/;
    return githubRegex.test(url);
  };

  const checkCodingStandards = async (url: string): Promise<CodingStandards> => {
    // Mock coding standards check - in a real app, this would analyze the actual code
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          htmlValidation: {
            passed: true,
            errors: [],
            warnings: ['Consider adding alt attributes to images'],
          },
          cssValidation: {
            passed: true,
            errors: [],
            warnings: ['Consider using CSS Grid for better layout'],
          },
          accessibility: {
            passed: true,
            score: 85,
            issues: ['Add more descriptive link text'],
          },
          performance: {
            passed: true,
            score: 90,
            suggestions: ['Optimize image sizes'],
          },
          overallScore: 88,
        });
      }, 2000);
    });
  };

  const handleSubmit = async () => {
    if (!studentProfile) {
      setError('Student profile not found');
      return;
    }

    if (!validateGithubUrl(githubUrl)) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Check coding standards
      const standards = await checkCodingStandards(githubUrl);
      setStandardsCheck(standards);

      // Create submission
      const response = await fetch('/api/exercise-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentProfile.id,
          exerciseId,
          githubUrl,
          codingStandards: standards,
          status: standards.overallScore >= 70 ? 'approved' : 'needs_revision',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit exercise');
      }

      const submissionData = await response.json();

      // Reload exercise data to get updated submission
      const exerciseResponse = await fetch(`/api/student/exercises/${exerciseId}`);
      if (exerciseResponse.ok) {
        const exerciseData = await exerciseResponse.json();
        setExercise(exerciseData.exercise);
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit exercise');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navigation />
          <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading exercise...</span>
      </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !exercise) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  if (!exercise) {
    return null;
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
                <Link
                  href={`/student/lesson/${exercise.lesson.id}`}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:text-blue-400 transition-colors"
                >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lesson
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{exercise.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Lesson {exercise.lesson.number}: {exercise.lesson.title} • {exercise.lesson.course.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                {exercise.submission && (
                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      exercise.submission.status === 'approved'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800'
                        : exercise.submission.status === 'needs_revision'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800'
                        : exercise.submission.status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800'
                    }`}
                  >
                    {exercise.submission.status === 'approved' && (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    {exercise.submission.status === 'needs_revision' && (
                      <AlertCircle className="h-4 w-4 mr-1" />
                    )}
                    {exercise.submission.status === 'rejected' && (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    {exercise.submission.status.charAt(0).toUpperCase() +
                      exercise.submission.status.slice(1).replace('_', ' ')}
                  </div>
                )}
                {exercise.grade && (
                  <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800">
                    <Trophy className="h-4 w-4 mr-1" />
                    {exercise.grade.percentage}% ({exercise.grade.letterGrade})
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exercise Description */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Exercise Description</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {exercise.description || 'No description provided for this exercise.'}
                </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Requirements:</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Follow HTML5 semantic structure</li>
                  <li>Use CSS3 for styling and layout</li>
                  <li>Ensure responsive design</li>
                  <li>Include proper accessibility features</li>
                  <li>Validate HTML and CSS code</li>
                  <li>Submit via GitHub repository</li>
                </ul>
              </div>
            </div>

              {/* Grade Display */}
              {exercise.grade && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Award className="h-6 w-6 mr-2 text-yellow-600 dark:text-yellow-400" />
                    Your Grade
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Score</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {exercise.grade.totalPoints} / {exercise.grade.maxPossiblePoints} points
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Percentage</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {exercise.grade.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Letter Grade</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {exercise.grade.letterGrade}
                      </span>
                    </div>
                    {exercise.grade.feedback && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructor Feedback</h4>
                        <p className="text-gray-700 dark:text-gray-300">{exercise.grade.feedback}</p>
                      </div>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Graded on {new Date(exercise.grade.gradedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

            {/* Submission Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submit Your Work</h3>
              
              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub Repository URL
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-800">
                      <Github className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="url"
                      id="github-url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submitting || !!exercise.submission}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                    Make sure your repository is public and contains all the required files.
                  </p>
                </div>
                
                <button
                  onClick={handleSubmit}
                    disabled={submitting || !githubUrl || !!exercise.submission}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking Standards...
                    </>
                    ) : exercise.submission ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Already Submitted
                      </>
                  ) : (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      Submit Exercise
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Coding Standards Results */}
            {standardsCheck && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Coding Standards Check</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        {standardsCheck.htmlValidation.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className="font-medium">HTML Validation</span>
                      </div>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                        standardsCheck.htmlValidation.passed
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800'
                          }`}
                        >
                        {standardsCheck.htmlValidation.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        {standardsCheck.cssValidation.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className="font-medium">CSS Validation</span>
                      </div>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                        standardsCheck.cssValidation.passed
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800'
                          }`}
                        >
                        {standardsCheck.cssValidation.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Accessibility Score</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {standardsCheck.accessibility.score}/100
                          </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${standardsCheck.accessibility.score}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Performance Score</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {standardsCheck.performance.score}/100
                          </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${standardsCheck.performance.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${
                    standardsCheck.overallScore >= 70
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800'
                      }`}
                    >
                    Overall Score: {standardsCheck.overallScore}/100
                    {standardsCheck.overallScore >= 70 ? (
                      <CheckCircle className="h-5 w-5 ml-2" />
                    ) : (
                      <XCircle className="h-5 w-5 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rubric */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assessment Rubric</h3>
              <div className="space-y-3">
                  {exercise.rubric.criteria.map((criteria) => (
                  <div key={criteria.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{criteria.name}</h4>
                      {criteria.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{criteria.description}</p>
                      )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2">Weight: {criteria.weight}%</div>
                  </div>
                ))}
              </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Points</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {exercise.rubric.totalPoints}
                    </span>
                  </div>
                </div>
            </div>

            {/* Resources */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
              <div className="space-y-3">
                <a
                  href="https://validator.w3.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                >
                  <ExternalLink className="h-4 w-4 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">HTML Validator</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Validate your HTML</div>
                  </div>
                </a>
                
                <a
                  href="https://jigsaw.w3.org/css-validator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                >
                  <ExternalLink className="h-4 w-4 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">CSS Validator</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Validate your CSS</div>
                  </div>
                </a>
                
                <a
                  href="https://webaim.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                >
                  <ExternalLink className="h-4 w-4 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">WebAIM</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Accessibility guidelines</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Submission History */}
              {exercise.submission && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submission Details</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(exercise.submission.submittedAt).toLocaleDateString()}
                      </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Repository:</div>
                    <a
                        href={exercise.submission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 break-all"
                    >
                        {exercise.submission.githubUrl}
                    </a>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</div>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          exercise.submission.status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800'
                            : exercise.submission.status === 'needs_revision'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800'
                            : exercise.submission.status === 'rejected'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800'
                        }`}
                      >
                        {exercise.submission.status.charAt(0).toUpperCase() +
                          exercise.submission.status.slice(1).replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
