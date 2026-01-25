'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  Trophy,
  Award,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  BarChart3,
  ArrowLeft,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface GradeCriteria {
  criteriaId: string;
  levelId: string;
  points: number;
  comments: string;
  criteriaName?: string;
  levelName?: string;
}

interface Grade {
  id: string;
  studentId: string;
  lessonId: string;
  exerciseId: string;
  criteriaGrades: GradeCriteria[];
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  letterGrade: string;
  feedback: string | null;
  gradedBy: string;
  gradedAt: string;
  lesson?: {
    id: string;
    number: number;
    title: string;
    courseId: string;
    course?: {
      id: string;
      title: string;
    };
  };
  exercise?: {
    id: string;
    title: string;
  };
}

interface StudentProfile {
  id: string;
  name: string;
  email: string | null;
  registrationNumber: string;
}

interface GradeGroup {
  courseId: string;
  courseTitle: string;
  lessons: {
    lessonId: string;
    lessonNumber: number;
    lessonTitle: string;
    grades: Grade[];
  }[];
}

export default function StudentGradesPage() {
  const { data: session } = useSession();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [groupedGrades, setGroupedGrades] = useState<GradeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  // Fetch student profile
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/students?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.students && data.students.length > 0) {
            const student = data.students[0];
            setStudentProfile({
              id: student.id,
              name: student.name,
              email: student.email,
              registrationNumber: student.registrationNumber,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
      }
    };

    fetchStudentProfile();
  }, [session?.user?.id]);

  // Fetch grades
  useEffect(() => {
    const loadGrades = async () => {
      if (!studentProfile) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/grades?studentId=${studentProfile.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch grades');
        }

        const data = await response.json();
        const gradesData = data.grades || [];

        // Fetch course information to map course IDs to course titles
        const coursesResponse = await fetch('/api/student/courses');
        let coursesMap: { [id: string]: { id: string; title: string } } = {};
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          coursesData.courses.forEach((course: { id: string; title: string }) => {
            coursesMap[course.id] = course;
          });
        }

        const gradesWithDetails = gradesData.map((grade: any) => {
          // Format the grade with lesson and exercise info from API
          const formattedGrade: Grade = {
            id: grade.id,
            studentId: grade.studentId,
            lessonId: grade.lessonId,
            exerciseId: grade.exerciseId,
            criteriaGrades: (grade.criteriaGrades || []).map((cg: any) => ({
              criteriaId: cg.criteriaId,
              levelId: cg.levelId,
              points: cg.points,
              comments: cg.comments || '',
              criteriaName: cg.criteriaName,
              levelName: cg.levelName,
            })),
            totalPoints: grade.totalPoints,
            maxPossiblePoints: grade.maxPossiblePoints,
            percentage: grade.percentage,
            letterGrade: grade.letterGrade,
            feedback: grade.feedback,
            gradedBy: grade.gradedBy,
            gradedAt: grade.gradedAt,
            lesson: grade.lesson
              ? {
                  id: grade.lesson.id,
                  number: grade.lesson.number,
                  title: grade.lesson.title,
                  courseId: grade.lesson.courseId || '',
                  course: grade.lesson.courseId
                    ? coursesMap[grade.lesson.courseId] || {
                        id: grade.lesson.courseId,
                        title: 'Unknown Course',
                      }
                    : undefined,
                }
              : undefined,
            exercise: grade.exercise
              ? {
                  id: grade.exercise.id,
                  title: grade.exercise.title,
                }
              : undefined,
          };
          return formattedGrade;
        });

        setGrades(gradesWithDetails);

        // Group grades by course and lesson
        const grouped: { [courseId: string]: GradeGroup } = {};
        gradesWithDetails.forEach((grade: Grade) => {
          if (!grade.lesson?.courseId || !grade.lesson?.course) return;

          const courseId = grade.lesson.courseId;
          const courseTitle = grade.lesson.course.title;

          if (!grouped[courseId]) {
            grouped[courseId] = {
              courseId,
              courseTitle,
              lessons: [],
            };
          }

          const lessonId = grade.lessonId;
          let lessonGroup = grouped[courseId].lessons.find((l) => l.lessonId === lessonId);

          if (!lessonGroup) {
            lessonGroup = {
              lessonId,
              lessonNumber: grade.lesson.number,
              lessonTitle: grade.lesson.title,
              grades: [],
            };
            grouped[courseId].lessons.push(lessonGroup);
          }

          lessonGroup.grades.push(grade);
        });

        // Sort lessons by number and convert to array
        const groupedArray = Object.values(grouped).map((group) => ({
          ...group,
          lessons: group.lessons.sort((a, b) => a.lessonNumber - b.lessonNumber),
        }));

        setGroupedGrades(groupedArray);
      } catch (error) {
        console.error('Error loading grades:', error);
        setError('Failed to load grades');
      } finally {
        setLoading(false);
      }
    };

    if (studentProfile) {
      loadGrades();
    }
  }, [studentProfile]);

  // Calculate statistics
  const calculateStats = () => {
    if (grades.length === 0) {
      return {
        totalGrades: 0,
        averagePercentage: 0,
        totalPoints: 0,
        maxPossiblePoints: 0,
        averageLetterGrade: 'N/A',
      };
    }

    const totalPoints = grades.reduce((sum, grade) => sum + grade.totalPoints, 0);
    const maxPossiblePoints = grades.reduce((sum, grade) => sum + grade.maxPossiblePoints, 0);
    const averagePercentage = Math.round(
      grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length
    );

    // Calculate average letter grade
    const letterGradeMap: { [key: string]: number } = {
      A: 4,
      'A-': 3.7,
      'B+': 3.3,
      B: 3,
      'B-': 2.7,
      'C+': 2.3,
      C: 2,
      'C-': 1.7,
      'D+': 1.3,
      D: 1,
      'D-': 0.7,
      F: 0,
    };

    const averageGPA =
      grades.reduce((sum, grade) => sum + (letterGradeMap[grade.letterGrade] || 0), 0) /
      grades.length;

    const gpaToLetter: { [key: number]: string } = {
      4: 'A',
      3.7: 'A-',
      3.3: 'B+',
      3: 'B',
      2.7: 'B-',
      2.3: 'C+',
      2: 'C',
      1.7: 'C-',
      1.3: 'D+',
      1: 'D',
      0.7: 'D-',
      0: 'F',
    };

    const averageLetterGrade =
      Object.entries(gpaToLetter)
        .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
        .find(([gpa]) => averageGPA >= parseFloat(gpa))?.[1] || 'N/A';

    return {
      totalGrades: grades.length,
      averagePercentage,
      totalPoints,
      maxPossiblePoints,
      averageLetterGrade,
    };
  };

  const stats = calculateStats();

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading grades...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 inline mr-2" />
              {error}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/student"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Grades</h1>
            <p className="text-gray-600">View all your exercise grades and performance statistics</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.averagePercentage}%</div>
                  <div className="text-sm text-gray-600">Average Grade</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.averageLetterGrade}</div>
                  <div className="text-sm text-gray-600">Average Letter</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalGrades}</div>
                  <div className="text-sm text-gray-600">Total Grades</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalPoints} / {stats.maxPossiblePoints}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grades List */}
          {groupedGrades.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 border border-gray-100 text-center">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No grades yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't received any grades yet. Submit exercises to get graded!
              </p>
              <Link
                href="/student"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedGrades.map((courseGroup) => (
                <div key={courseGroup.courseId} className="bg-white rounded-xl shadow-md border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{courseGroup.courseTitle}</h2>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {courseGroup.lessons.map((lessonGroup) => (
                      <div key={lessonGroup.lessonId} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Lesson {lessonGroup.lessonNumber}: {lessonGroup.lessonTitle}
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {lessonGroup.grades.map((grade) => (
                            <div
                              key={grade.id}
                              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                              onClick={() => setSelectedGrade(grade)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <BookOpen className="h-5 w-5 text-gray-400" />
                                    <h4 className="font-semibold text-gray-900">
                                      {grade.exercise?.title || 'Exercise'}
                                    </h4>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(grade.gradedAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      {grade.gradedBy}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Score</div>
                                    <div className="text-lg font-semibold text-gray-900">
                                      {grade.totalPoints} / {grade.maxPossiblePoints}
                                    </div>
                                  </div>
                                  <div
                                    className={`px-4 py-2 rounded-lg font-bold text-lg ${getGradeColor(
                                      grade.percentage
                                    )}`}
                                  >
                                    {grade.percentage}%
                                  </div>
                                  <div
                                    className={`px-4 py-2 rounded-lg font-bold text-lg ${getGradeColor(
                                      grade.percentage
                                    )}`}
                                  >
                                    {grade.letterGrade}
                                  </div>
                                </div>
                              </div>
                              {grade.feedback && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-700 line-clamp-2">{grade.feedback}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grade Detail Modal */}
        {selectedGrade && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedGrade(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Grade Details</h2>
                <button
                  onClick={() => setSelectedGrade(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedGrade.exercise?.title || 'Exercise'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lesson {selectedGrade.lesson?.number}: {selectedGrade.lesson?.title}
                  </p>
                  <p className="text-sm text-gray-600">{selectedGrade.lesson?.course?.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Points</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedGrade.totalPoints} / {selectedGrade.maxPossiblePoints}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Percentage</div>
                    <div
                      className={`text-2xl font-bold ${getGradeColor(selectedGrade.percentage).split(' ')[0]}`}
                    >
                      {selectedGrade.percentage}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Letter Grade</div>
                    <div
                      className={`text-2xl font-bold ${getGradeColor(selectedGrade.percentage).split(' ')[0]}`}
                    >
                      {selectedGrade.letterGrade}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Graded By</div>
                    <div className="text-lg font-semibold text-gray-900">{selectedGrade.gradedBy}</div>
                  </div>
                </div>

                {selectedGrade.criteriaGrades && selectedGrade.criteriaGrades.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Criteria Breakdown</h4>
                    <div className="space-y-3">
                      {selectedGrade.criteriaGrades.map((criteria, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {criteria.criteriaName || `Criteria ${index + 1}`}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">{criteria.points} points</span>
                          </div>
                          {criteria.levelName && (
                            <div className="text-sm text-gray-600 mb-2">
                              Level: {criteria.levelName}
                            </div>
                          )}
                          {criteria.comments && (
                            <div className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                              {criteria.comments}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGrade.feedback && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Instructor Feedback</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedGrade.feedback}</p>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Graded on {new Date(selectedGrade.gradedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

