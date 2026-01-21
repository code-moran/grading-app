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
  Edit,
  Trash2,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Link as LinkIcon,
  Unlink,
  TrendingUp,
  Award,
  UserPlus,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { calculateBasePrice } from '@/lib/tax';

interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string | null;
  duration: string | null;
  _count: {
    exercises: number;
    quizAttempts: number;
  };
}

interface Subscriber {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  student: {
    id: string;
    name: string;
    email: string | null;
    registrationNumber: string;
  } | null;
  subscribedAt: Date;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isActive: boolean;
  lessons: Lesson[];
  subscriptions: Subscriber[];
  _count: {
    lessons: number;
    subscriptions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CourseAnalytics {
  totalLessons: number;
  totalExercises: number;
  totalSubmissions: number;
  totalQuizAttempts: number;
  activeSubscribers: number;
  averageCompletionRate: number;
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

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [unassignedLessons, setUnassignedLessons] = useState<UnassignedLesson[]>([]);
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddLessons, setShowAddLessons] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [editFormData, setEditFormData] = useState({ title: '', description: '', basePrice: '' });
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showAssignInstructor, setShowAssignInstructor] = useState(false);
  const [assignedInstructors, setAssignedInstructors] = useState<any[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [enrolledCohorts, setEnrolledCohorts] = useState<any[]>([]);
  const [showEnrollCohort, setShowEnrollCohort] = useState(false);
  const [enrollingCohort, setEnrollingCohort] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchUnassignedLessons();
      fetchAnalytics();
      fetchInstructors();
      fetchCohorts();
      fetchEnrolledCohorts();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const data = await response.json();
      setCourse(data.course);
      // Calculate base price from stored price (inclusive of tax)
      const basePrice = data.course.price 
        ? calculateBasePrice(parseFloat(data.course.price.toString())).toFixed(2)
        : '';
      setEditFormData({
        title: data.course.title,
        description: data.course.description || '',
        basePrice: basePrice,
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedLessons = async () => {
    try {
      const response = await fetch('/api/lessons/unassigned');
      if (response.ok) {
        const data = await response.json();
        setUnassignedLessons(data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching unassigned lessons:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/courses', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: courseId,
          title: editFormData.title,
          description: editFormData.description,
          basePrice: editFormData.basePrice || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update course');
      }

      setShowEditForm(false);
      fetchCourse();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Are you sure you want to delete this course? This will unlink all lessons but not delete them.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete course');
      }

      router.push('/admin/courses');
    } catch (error: any) {
      setError(error.message);
      setDeleting(false);
    }
  };

  const handleAssignLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
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
        fetch(`/api/courses/${courseId}/lessons`, {
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

  const fetchInstructors = async () => {
    try {
      // Fetch assigned instructors
      const assignedResponse = await fetch(`/api/courses/${courseId}/instructors`);
      let assignedData: any = null;
      if (assignedResponse.ok) {
        assignedData = await assignedResponse.json();
        setAssignedInstructors(assignedData.instructors || []);
      }

      // Fetch all available instructors
      const availableResponse = await fetch('/api/instructors');
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        const assignedIds = new Set((assignedData?.instructors || []).map((i: any) => i.id));
        setAvailableInstructors(
          (availableData.instructors || []).filter((i: any) => !assignedIds.has(i.id))
        );
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
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

  const handleAssignInstructor = async (instructorId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/instructors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructorId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign instructor');
      }

      fetchInstructors();
      setShowAssignInstructor(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleUnassignInstructor = async (instructorId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/instructors?instructorId=${instructorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unassign instructor');
      }

      fetchInstructors();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleUnassignLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons?lessonId=${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unassign lesson');
      }

      fetchCourse();
      fetchUnassignedLessons();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if ((session?.user as any)?.role !== 'admin') {
    return (
      <ProtectedRoute requiredRole="admin">
        <div>Unauthorized</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin/courses"
              className="flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>

            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading course...</span>
              </div>
            ) : course ? (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{course.title}</h1>
                    {course.isActive ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <XCircle className="h-4 w-4 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                  {course.description && (
                    <p className="text-gray-600 text-lg mb-4">{course.description}</p>
                  )}
                  {course.price !== null && course.price !== undefined && (
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-blue-600">
                        ${parseFloat(course.price.toString()).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">(price inclusive of tax)</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course._count.lessons} lessons
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course._count.subscriptions} subscribers
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowEditForm(!showEditForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteCourse}
                    disabled={deleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Course not found</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {course && (
            <>
              {/* Edit Form */}
              {showEditForm && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Course</h2>
                  <form onSubmit={handleUpdateCourse} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Price (before tax)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editFormData.basePrice}
                          onChange={(e) => setEditFormData({ ...editFormData, basePrice: e.target.value })}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Price will be stored inclusive of tax (10% tax rate)
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditForm(false);
                          const basePrice = course.price 
                            ? calculateBasePrice(parseFloat(course.price.toString())).toFixed(2)
                            : '';
                          setEditFormData({
                            title: course.title,
                            description: course.description || '',
                            basePrice: basePrice,
                          });
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="h-5 w-5 opacity-80" />
                    <TrendingUp className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold">{course._count.lessons}</div>
                  <div className="text-blue-100 text-sm mt-1">Total Lessons</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 opacity-80" />
                    <TrendingUp className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold">{course._count.subscriptions}</div>
                  <div className="text-green-100 text-sm mt-1">Active Subscribers</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-5 w-5 opacity-80" />
                    <TrendingUp className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold">
                    {course.lessons.reduce((sum, lesson) => sum + lesson._count.exercises, 0)}
                  </div>
                  <div className="text-purple-100 text-sm mt-1">Total Exercises</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="h-5 w-5 opacity-80" />
                    <TrendingUp className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold">
                    {analytics?.averageCompletionRate || 0}%
                  </div>
                  <div className="text-orange-100 text-sm mt-1">Completion Rate</div>
                </div>
              </div>

              {/* Additional Analytics */}
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-sm font-medium text-gray-600">Submissions</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</div>
                    <div className="text-xs text-gray-500 mt-1">Total exercise submissions</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center mb-2">
                      <Award className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-gray-600">Quiz Attempts</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics.totalQuizAttempts}</div>
                    <div className="text-xs text-gray-500 mt-1">Total quiz attempts</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-600">Engagement</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {course._count.subscriptions > 0
                        ? Math.round((analytics.totalSubmissions / course._count.subscriptions) * 10) / 10
                        : 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Avg submissions per student</div>
                  </div>
                </div>
              )}

              {/* Lessons Section */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Course Lessons</h2>
                  <button
                    onClick={() => setShowAddLessons(!showAddLessons)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lessons
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

                {course.lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No lessons assigned to this course</p>
                    {unassignedLessons.length > 0 && (
                      <button
                        onClick={() => setShowAddLessons(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add lessons now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              Lesson {lesson.number}: {lesson.title}
                            </div>
                            {lesson.description && (
                              <div className="text-sm text-gray-600 line-clamp-1">
                                {lesson.description}
                              </div>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>{lesson._count.exercises} exercises</span>
                              {lesson.duration && <span>{lesson.duration}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/instructor/lesson/${lesson.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleUnassignLesson(lesson.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructors Section */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Assigned Instructors ({assignedInstructors.length})
                  </h2>
                  <button
                    onClick={() => {
                      setShowAssignInstructor(!showAssignInstructor);
                      if (!showAssignInstructor) {
                        fetchInstructors();
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Instructor
                  </button>
                </div>

                {showAssignInstructor && availableInstructors.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Available Instructors ({availableInstructors.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableInstructors.map((instructor) => (
                        <div
                          key={instructor.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{instructor.name}</div>
                            <div className="text-sm text-gray-600">{instructor.email}</div>
                            {instructor.department && (
                              <div className="text-xs text-gray-500">{instructor.department}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleAssignInstructor(instructor.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center ml-2"
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showAssignInstructor && availableInstructors.length === 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-gray-600">All approved instructors are already assigned</p>
                  </div>
                )}

                {assignedInstructors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No instructors assigned to this course</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedInstructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{instructor.name}</div>
                            <div className="text-sm text-gray-600">{instructor.email}</div>
                            {instructor.department && (
                              <div className="text-xs text-gray-500">{instructor.department}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Assigned {new Date(instructor.assignedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassignInstructor(instructor.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          <Unlink className="h-3 w-3 mr-1" />
                          Unassign
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cohort Enrollment Section */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Enrolled Cohorts ({enrolledCohorts.length})</h2>
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
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Subscribers ({course.subscriptions.length})</h2>
                {course.subscriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No subscribers yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.subscriptions.map((subscription) => {
                      const isUserSubscription = subscription.user !== null;
                      const subscriber = isUserSubscription
                        ? subscription.user
                        : subscription.student;
                      const subscriberRole = isUserSubscription
                        ? subscription.user!.role
                        : 'student';
                      
                      if (!subscriber) return null;

                      return (
                        <div
                          key={subscription.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{subscriber.name}</div>
                              <div className="text-sm text-gray-600">
                                {isUserSubscription
                                  ? subscriber.email
                                  : `${subscriber.email || ''} (Reg: ${(subscriber as any).registrationNumber})`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Subscribed {new Date(subscription.subscribedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              subscriberRole === 'student'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {subscriberRole}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

