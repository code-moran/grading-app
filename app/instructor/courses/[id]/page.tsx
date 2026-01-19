'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  BookOpen,
  Users,
  ArrowLeft,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Link as LinkIcon,
  FileText,
  GraduationCap,
  Unlink,
} from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string | null;
  duration: string | null;
  exerciseCount: number;
  quizAttemptCount: number;
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  role: string;
  subscribedAt: Date;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  lessons: Lesson[];
  subscribers: Subscriber[];
  stats: {
    lessonCount: number;
    subscriberCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UnassignedLesson {
  id: string;
  number: number;
  title: string;
  description: string | null;
  _count: {
    exercises: number;
  };
}

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [unassignedLessons, setUnassignedLessons] = useState<UnassignedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddLessons, setShowAddLessons] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [enrolledCohorts, setEnrolledCohorts] = useState<any[]>([]);
  const [showEnrollCohort, setShowEnrollCohort] = useState(false);
  const [enrollingCohort, setEnrollingCohort] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchUnassignedLessons();
      fetchCohorts();
      fetchEnrolledCohorts();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/courses/${courseId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch course');
      }
      const data = await response.json();
      setCourse(data.course);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedLessons = async () => {
    try {
      const response = await fetch(`/api/lessons/unassigned?excludeCourseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setUnassignedLessons(data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching available lessons:', error);
    }
  };

  const handleAssignLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign lesson');
      }

      fetchCourse();
      fetchUnassignedLessons();
      setSelectedLessons(new Set());
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleBulkAssignLessons = async () => {
    if (selectedLessons.size === 0) {
      setError('Please select at least one lesson');
      return;
    }

    try {
      setAssigning(true);
      const promises = Array.from(selectedLessons).map((lessonId) =>
        fetch(`/api/instructor/courses/${courseId}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lessonId }),
        })
      );

      await Promise.all(promises);
      setSelectedLessons(new Set());
      fetchCourse();
      fetchUnassignedLessons();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setAssigning(false);
    }
  };

  const toggleLessonSelection = (lessonId: string) => {
    const newSelected = new Set(selectedLessons);
    if (newSelected.has(lessonId)) {
      newSelected.delete(lessonId);
    } else {
      newSelected.add(lessonId);
    }
    setSelectedLessons(newSelected);
  };

  const fetchCohorts = async () => {
    try {
      const response = await fetch('/api/cohorts');
      if (response.ok) {
        const data = await response.json();
        setCohorts(data.cohorts || []);
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    }
  };

  const fetchEnrolledCohorts = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/cohorts`);
      if (response.ok) {
        const data = await response.json();
        setEnrolledCohorts(data.cohorts || []);
      }
    } catch (error) {
      console.error('Error fetching enrolled cohorts:', error);
    }
  };

  const handleEnrollCohort = async (cohortId: string) => {
    try {
      setEnrollingCohort(cohortId);
      setError('');
      const response = await fetch(`/api/courses/${courseId}/enroll-cohort`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cohortId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to enroll cohort');
      }

      const data = await response.json();
      alert(`Successfully enrolled ${data.enrolled} students from cohort. ${data.alreadyEnrolled > 0 ? `${data.alreadyEnrolled} were already enrolled.` : ''}`);
      fetchEnrolledCohorts();
      fetchCourse(); // Refresh to update subscriber count
      setShowEnrollCohort(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setEnrollingCohort(null);
    }
  };

  const handleUnenrollCohort = async (cohortId: string) => {
    if (!confirm('Are you sure you want to unenroll this cohort from the course? This will cancel subscriptions for all students in the cohort.')) {
      return;
    }

    try {
      setEnrollingCohort(cohortId);
      setError('');
      const response = await fetch(`/api/courses/${courseId}/enroll-cohort?cohortId=${cohortId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unenroll cohort');
      }

      const data = await response.json();
      alert(`Successfully unenrolled ${data.unenrolled} students from cohort.`);
      fetchEnrolledCohorts();
      fetchCourse(); // Refresh to update subscriber count
    } catch (error: any) {
      setError(error.message);
    } finally {
      setEnrollingCohort(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error || 'Course not found'}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/instructor/courses"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="text-gray-600">{course.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {course.isActive ? (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </div>
                ) : (
                  <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    Inactive
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">{course.stats.lessonCount}</div>
              <div className="text-blue-100 text-sm mt-1">Total Lessons</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">{course.stats.subscriberCount}</div>
              <div className="text-green-100 text-sm mt-1">Active Subscribers</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">
                {course.lessons.reduce((sum, lesson) => sum + lesson.exerciseCount, 0)}
              </div>
              <div className="text-purple-100 text-sm mt-1">Total Exercises</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">
                {course.lessons.reduce((sum, lesson) => sum + lesson.quizAttemptCount, 0)}
              </div>
              <div className="text-orange-100 text-sm mt-1">Quiz Attempts</div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lessons</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Manage lessons assigned to this course
                </p>
              </div>
              <button
                onClick={() => setShowAddLessons(!showAddLessons)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showAddLessons ? 'Hide' : 'Add'} Lessons
              </button>
            </div>

            {showAddLessons && unassignedLessons.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Available Lessons ({unassignedLessons.length})
                  </h3>
                  {selectedLessons.size > 0 && (
                    <button
                      onClick={handleBulkAssignLessons}
                      disabled={assigning}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {assigning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Assign Selected ({selectedLessons.size})
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unassignedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 transition-all ${
                        selectedLessons.has(lesson.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedLessons.has(lesson.id)}
                          onChange={() => toggleLessonSelection(lesson.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            Lesson {lesson.number}: {lesson.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lesson._count.exercises} exercises
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignLesson(lesson.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center ml-2"
                      >
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAddLessons && unassignedLessons.length === 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-600">No unassigned lessons available</p>
              </div>
            )}

            {course.lessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Assigned</h3>
                <p className="text-gray-600">Add lessons to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {course.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Lesson {lesson.number}: {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{lesson.exerciseCount} exercises</span>
                              {lesson.duration && <span>{lesson.duration}</span>}
                              <span>{lesson.quizAttemptCount} quiz attempts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/instructor/lesson/${lesson.id}`}
                        className="ml-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cohort Enrollment Section */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Enrolled Cohorts ({enrolledCohorts.length})</h2>
              <button
                onClick={() => setShowEnrollCohort(!showEnrollCohort)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enroll Cohort
              </button>
            </div>

            {showEnrollCohort && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-3">Available Cohorts</h3>
                {cohorts.length === 0 ? (
                  <p className="text-gray-600 text-sm">No cohorts available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cohorts
                      .filter((cohort) => !enrolledCohorts.find((ec) => ec.id === cohort.id))
                      .map((cohort) => (
                        <div
                          key={cohort.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-200"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{cohort.name}</div>
                            <div className="text-sm text-gray-500">
                              {cohort._count?.students || 0} students
                            </div>
                          </div>
                          <button
                            onClick={() => handleEnrollCohort(cohort.id)}
                            disabled={enrollingCohort === cohort.id}
                            className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
                          >
                            {enrollingCohort === cohort.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Enrolling...
                              </>
                            ) : (
                              <>
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Enroll
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {enrolledCohorts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No cohorts enrolled in this course</p>
                {cohorts.length > 0 && (
                  <button
                    onClick={() => setShowEnrollCohort(true)}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Enroll cohorts now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {enrolledCohorts.map((cohort) => (
                  <div
                    key={cohort.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{cohort.name}</div>
                        <div className="text-sm text-gray-600">
                          {cohort.enrolledStudents} of {cohort.totalStudents} students enrolled
                        </div>
                        {cohort.description && (
                          <div className="text-xs text-gray-500 mt-1">{cohort.description}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnenrollCohort(cohort.id)}
                      disabled={enrollingCohort === cohort.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center disabled:opacity-50"
                    >
                      {enrollingCohort === cohort.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                          Unenrolling...
                        </>
                      ) : (
                        <>
                          <Unlink className="h-3 w-3 mr-1" />
                          Unenroll
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscribers Section */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscribers</h2>
            {course.subscribers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscribers</h3>
                <p className="text-gray-600">No students have subscribed to this course yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.subscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{subscriber.name}</h3>
                        <p className="text-sm text-gray-600">{subscriber.email}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          Subscribed {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

