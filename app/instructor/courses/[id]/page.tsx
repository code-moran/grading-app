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
  Search,
  Eye,
  TrendingUp,
  Trophy,
  Award,
  Code,
  HelpCircle,
  Target,
  Calendar,
  Mail,
  User,
  Download,
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
  userId?: string | null;
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

interface StudentDetails {
  student: {
    id: string;
    name: string;
    email: string | null;
    registrationNumber: string;
    cohort: { id: string; name: string } | null;
    subscribedAt: Date | null;
  };
  course: {
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      number: number;
      title: string;
      description: string | null;
      duration: string | null;
    }>;
  };
  stats: {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    averageGrade: number;
    totalGrades: number;
    totalQuizAttempts: number;
    totalSubmissions: number;
    totalPoints: number;
    maxPossiblePoints: number;
  };
  grades: Array<{
    id: string;
    lessonId: string;
    exerciseId: string;
    totalPoints: number;
    maxPossiblePoints: number;
    percentage: number;
    letterGrade: string;
    feedback: string | null;
    gradedAt: string;
    lesson: { id: string; number: number; title: string };
    exercise: { id: string; title: string; maxPoints: number };
  }>;
  quizAttempts: Array<{
    id: string;
    lessonId: string;
    score: number;
    passed: boolean;
    createdAt: string;
    lesson: { id: string; number: number; title: string };
  }>;
  exerciseSubmissions: Array<{
    id: string;
    exerciseId: string;
    status: string;
    submittedAt: string;
    exercise: {
      id: string;
      title: string;
      lesson: { id: string; number: number; title: string };
    };
  }>;
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
  const [searchSubscribers, setSearchSubscribers] = useState('');
  const [searchLessons, setSearchLessons] = useState('');
  const [activeTab, setActiveTab] = useState<'lessons' | 'subscribers' | 'cohorts'>('lessons');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<'overview' | 'grades' | 'quizzes' | 'submissions'>('overview');
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [cohortDetails, setCohortDetails] = useState<any | null>(null);
  const [loadingCohortDetails, setLoadingCohortDetails] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    number: '',
    title: '',
    description: '',
    duration: '',
  });

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
      fetchCourse();
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
      fetchCourse();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setEnrollingCohort(null);
    }
  };

  // Fetch student details
  const fetchStudentDetails = async (studentId: string) => {
    try {
      setLoadingStudentDetails(true);
      setError('');
      const response = await fetch(`/api/instructor/courses/${courseId}/students/${studentId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch student details');
      }
      const data = await response.json();
      setStudentDetails(data);
      setSelectedStudentId(studentId);
    } catch (error: any) {
      setError(error.message);
      setSelectedStudentId(null);
    } finally {
      setLoadingStudentDetails(false);
    }
  };

  // Fetch cohort details
  const fetchCohortDetails = async (cohortId: string) => {
    try {
      setLoadingCohortDetails(true);
      setError('');
      const response = await fetch(`/api/instructor/courses/${courseId}/cohorts/${cohortId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch cohort details');
      }
      const data = await response.json();
      setCohortDetails(data);
      setSelectedCohortId(cohortId);
    } catch (error: any) {
      setError(error.message);
      setSelectedCohortId(null);
    } finally {
      setLoadingCohortDetails(false);
    }
  };

  // Download grades CSV for cohort
  const downloadCohortGradesCSV = async () => {
    if (!selectedCohortId || !courseId) return;

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/cohorts/${selectedCohortId}/export`);
      if (!response.ok) {
        throw new Error('Failed to export grades');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cohort-${cohortDetails?.cohort.name || 'grades'}-grades.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setError(error.message || 'Failed to download grades');
    }
  };

  // Create new lesson
  const handleCreateLesson = async () => {
    if (!newLesson.number || !newLesson.title) {
      setError('Lesson number and title are required');
      return;
    }

    try {
      setCreatingLesson(true);
      setError('');

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: parseInt(newLesson.number),
          title: newLesson.title,
          description: newLesson.description || null,
          duration: newLesson.duration || null,
          courseId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create lesson');
      }

      // Reset form
      setNewLesson({
        number: '',
        title: '',
        description: '',
        duration: '',
      });
      setShowCreateLesson(false);

      // Refresh course data
      fetchCourse();
      fetchUnassignedLessons();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCreatingLesson(false);
    }
  };

  // Calculate next available lesson number
  const getNextLessonNumber = () => {
    if (!course || course.lessons.length === 0) return '1';
    const maxNumber = Math.max(...course.lessons.map(l => l.number));
    return (maxNumber + 1).toString();
  };

  // Filter subscribers
  const filteredSubscribers = course?.subscribers.filter((sub) =>
    sub.name.toLowerCase().includes(searchSubscribers.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchSubscribers.toLowerCase())
  ) || [];

  // Filter lessons
  const filteredLessons = course?.lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchLessons.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchLessons.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error || 'Course not found'}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const totalExercises = course.lessons.reduce((sum, lesson) => sum + lesson.exerciseCount, 0);
  const totalQuizAttempts = course.lessons.reduce((sum, lesson) => sum + lesson.quizAttemptCount, 0);

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/instructor/courses"
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-lg">{course.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {course.isActive ? (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-sm">
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Active
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-sm">
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Inactive
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between animate-in slide-in-from-top-2">
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-700 dark:text-red-400 hover:text-red-900 p-1 rounded hover:bg-red-100 dark:bg-red-900/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow group">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-5 w-5 opacity-80 group-hover:scale-110 transition-transform" />
                <TrendingUp className="h-4 w-4 opacity-60" />
              </div>
              <div className="text-3xl font-bold">{course.stats.lessonCount}</div>
              <div className="text-blue-100 text-sm mt-1 font-medium">Total Lessons</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow group">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 opacity-80 group-hover:scale-110 transition-transform" />
                <TrendingUp className="h-4 w-4 opacity-60" />
              </div>
              <div className="text-3xl font-bold">{course.stats.subscriberCount}</div>
              <div className="text-green-100 text-sm mt-1 font-medium">Active Subscribers</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow group">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-5 w-5 opacity-80 group-hover:scale-110 transition-transform" />
                <TrendingUp className="h-4 w-4 opacity-60" />
              </div>
              <div className="text-3xl font-bold">{totalExercises}</div>
              <div className="text-purple-100 text-sm mt-1 font-medium">Total Exercises</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow group">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 opacity-80 group-hover:scale-110 transition-transform" />
                <TrendingUp className="h-4 w-4 opacity-60" />
              </div>
              <div className="text-3xl font-bold">{totalQuizAttempts}</div>
              <div className="text-orange-100 text-sm mt-1 font-medium">Quiz Attempts</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'lessons'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Lessons ({course.lessons.length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('subscribers')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'subscribers'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Subscribers ({course.subscribers.length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('cohorts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'cohorts'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Cohorts ({enrolledCohorts.length})
                  </span>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Lessons Tab */}
              {activeTab === 'lessons' && (
                <div className="space-y-6">
                  {/* Add Lessons Section */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowAddLessons(!showAddLessons)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <Plus className="h-4 w-4" />
                        {showAddLessons ? 'Hide' : 'Add'} Lessons
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateLesson(true);
                          setNewLesson({
                            number: getNextLessonNumber(),
                            title: '',
                            description: '',
                            duration: '',
                          });
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <Plus className="h-4 w-4" />
                        Create New Lesson
                      </button>
                    </div>
                    {course.lessons.length > 0 && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search lessons..."
                          value={searchLessons}
                          onChange={(e) => setSearchLessons(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                    )}
                  </div>

                  {showAddLessons && unassignedLessons.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Available Lessons ({unassignedLessons.length})
                        </h3>
                        {selectedLessons.size > 0 && (
                          <button
                            onClick={handleBulkAssignLessons}
                            disabled={assigning}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 shadow-sm"
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
                            className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
                              selectedLessons.has(lesson.id)
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedLessons.has(lesson.id)}
                                onChange={() => toggleLessonSelection(lesson.id)}
                                className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  Lesson {lesson.number}: {lesson.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                  {lesson._count.exercises} exercises
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAssignLesson(lesson.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center ml-2 shadow-sm"
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
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                      <p className="text-gray-600 dark:text-gray-300">No unassigned lessons available</p>
                    </div>
                  )}

                  {/* Lessons List */}
                  {filteredLessons.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Lessons Assigned</h3>
                      <p className="text-gray-600 dark:text-gray-300">Add lessons to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Lesson {lesson.number}: {lesson.title}
                                  </h3>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">{lesson.description}</p>
                                  )}
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      {lesson.exerciseCount} exercises
                                    </span>
                                    {lesson.duration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {lesson.duration}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <BarChart3 className="h-3 w-3" />
                                      {lesson.quizAttemptCount} attempts
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Link
                              href={`/instructor/lesson/${lesson.id}`}
                              className="ml-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subscribers Tab */}
              {activeTab === 'subscribers' && (
                <div className="space-y-4">
                  {course.subscribers.length > 0 && (
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search subscribers by name or email..."
                        value={searchSubscribers}
                        onChange={(e) => setSearchSubscribers(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  )}

                  {filteredSubscribers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {searchSubscribers ? 'No subscribers found' : 'No Subscribers'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {searchSubscribers
                          ? 'Try adjusting your search terms'
                          : 'No students have subscribed to this course yet'}
                      </p>
                      {searchSubscribers && (
                        <button
                          onClick={() => setSearchSubscribers('')}
                          className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium text-sm"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSubscribers.map((subscriber) => (
                        <button
                          key={subscriber.id}
                          onClick={() => fetchStudentDetails(subscriber.id)}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all text-left w-full group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:text-blue-400 transition-colors">
                                {subscriber.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{subscriber.email}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Subscribed {new Date(subscriber.subscribedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cohorts Tab */}
              {activeTab === 'cohorts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowEnrollCohort(!showEnrollCohort)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      {showEnrollCohort ? 'Hide' : 'Enroll'} Cohorts
                    </button>
                  </div>

                  {showEnrollCohort && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Cohorts</h3>
                      {cohorts.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">No cohorts available.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {cohorts
                            .filter((cohort) => !enrolledCohorts.find((ec) => ec.id === cohort.id))
                            .map((cohort) => (
                              <div
                                key={cohort.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 transition-colors"
                              >
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{cohort.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                    {cohort._count?.students || 0} students
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleEnrollCohort(cohort.id)}
                                  disabled={enrollingCohort === cohort.id}
                                  className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 shadow-sm"
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
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                      <p>No cohorts enrolled in this course</p>
                      {cohorts.length > 0 && (
                        <button
                          onClick={() => setShowEnrollCohort(true)}
                          className="mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium"
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
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
                        >
                          <button
                            onClick={() => fetchCohortDetails(cohort.id)}
                            className="flex items-center space-x-4 flex-1 text-left group"
                          >
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:text-purple-400 transition-colors">
                                {cohort.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {cohort.enrolledStudents} of {cohort.totalStudents} students enrolled
                              </div>
                              {cohort.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{cohort.description}</div>
                              )}
                            </div>
                            <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:text-purple-400 transition-colors opacity-0 group-hover:opacity-100" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnenrollCohort(cohort.id);
                            }}
                            disabled={enrollingCohort === cohort.id}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium flex items-center disabled:opacity-50 transition-colors ml-4"
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
              )}
            </div>
          </div>
        </main>

        {/* Create Lesson Modal */}
        {showCreateLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Lesson</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{course?.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateLesson(false);
                    setNewLesson({
                      number: '',
                      title: '',
                      description: '',
                      duration: '',
                    });
                    setError('');
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="lesson-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lesson Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="lesson-number"
                      value={newLesson.number}
                      onChange={(e) => setNewLesson({ ...newLesson, number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter lesson number"
                      min="1"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                      Suggested: {getNextLessonNumber()} (based on existing lessons)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lesson Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lesson-title"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter lesson title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lesson-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      id="lesson-description"
                      value={newLesson.description}
                      onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter lesson description (optional)"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label htmlFor="lesson-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      id="lesson-duration"
                      value={newLesson.duration}
                      onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="e.g., 1 hour, 2 hours, 45 minutes"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowCreateLesson(false);
                    setNewLesson({
                      number: '',
                      title: '',
                      description: '',
                      duration: '',
                    });
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLesson}
                  disabled={creatingLesson || !newLesson.number || !newLesson.title}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingLesson ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Lesson
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {selectedStudentId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loadingStudentDetails ? 'Loading...' : studentDetails?.student.name || 'Student Details'}
                    </h2>
                    {studentDetails && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{studentDetails.course.title}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudentId(null);
                    setStudentDetails(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col h-full">
                {loadingStudentDetails ? (
                  <div className="flex-1 flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : studentDetails ? (
                  <>
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                      <nav className="flex space-x-6" aria-label="Tabs">
                        <button
                          onClick={() => setModalActiveTab('overview')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            modalActiveTab === 'overview'
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Overview
                          </span>
                        </button>
                        <button
                          onClick={() => setModalActiveTab('grades')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            modalActiveTab === 'grades'
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Grades ({studentDetails.grades.length})
                          </span>
                        </button>
                        <button
                          onClick={() => setModalActiveTab('quizzes')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            modalActiveTab === 'quizzes'
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Quizzes ({studentDetails.quizAttempts.length})
                          </span>
                        </button>
                        <button
                          onClick={() => setModalActiveTab('submissions')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            modalActiveTab === 'submissions'
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Submissions ({studentDetails.exerciseSubmissions.length})
                          </span>
                        </button>
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {modalActiveTab === 'overview' && (
                        <div className="space-y-6">
                          {/* Student Info */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Student Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{studentDetails.student.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  Reg: {studentDetails.student.registrationNumber}
                                </span>
                              </div>
                              {studentDetails.student.cohort && (
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Cohort: {studentDetails.student.cohort.name}
                                  </span>
                                </div>
                              )}
                              {studentDetails.student.subscribedAt && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Enrolled: {new Date(studentDetails.student.subscribedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center justify-between mb-2">
                                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="text-2xl font-bold text-blue-900">
                                {studentDetails.stats.completionPercentage}%
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Course Progress</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="text-2xl font-bold text-green-900">
                                {studentDetails.stats.averageGrade}%
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400 font-medium">Average Grade</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="text-2xl font-bold text-purple-900">
                                {studentDetails.stats.completedLessons}/{studentDetails.stats.totalLessons}
                              </div>
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Lessons Completed</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                              <div className="flex items-center justify-between mb-2">
                                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="text-2xl font-bold text-orange-900">
                                {studentDetails.stats.totalGrades}
                              </div>
                              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Total Grades</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Progress</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {studentDetails.stats.completedLessons} of {studentDetails.stats.totalLessons} lessons
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${studentDetails.stats.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {modalActiveTab === 'grades' && (
                        <div>
                          {studentDetails.grades.length > 0 ? (
                            <div className="space-y-2">
                              {studentDetails.grades.map((grade) => (
                                <Link
                                  key={grade.id}
                                  href={`/instructor/exercise/${grade.exerciseId}/grade?studentId=${studentDetails.student.id}`}
                                  className="block border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:text-blue-400 transition-colors">
                                        Lesson {grade.lesson.number}: {grade.lesson.title}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {grade.exercise.title}
                                      </div>
                                      {grade.feedback && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 italic line-clamp-1">
                                          "{grade.feedback}"
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                          {grade.percentage}%
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{grade.letterGrade}</div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                          {new Date(grade.gradedAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500">
                              <Award className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                              <p>No grades recorded yet</p>
                            </div>
                          )}
                        </div>
                      )}

                      {modalActiveTab === 'quizzes' && (
                        <div>
                          {studentDetails.quizAttempts.length > 0 ? (
                            <div className="space-y-2">
                              {studentDetails.quizAttempts.map((attempt) => (
                                <div
                                  key={attempt.id}
                                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-300 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        Lesson {attempt.lesson.number}: {attempt.lesson.title}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                                        {new Date(attempt.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        attempt.passed
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                      }`}>
                                        {attempt.score}%
                                      </div>
                                      {attempt.passed ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                      ) : (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500">
                              <HelpCircle className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                              <p>No quiz attempts recorded yet</p>
                            </div>
                          )}
                        </div>
                      )}

                      {modalActiveTab === 'submissions' && (
                        <div>
                          {studentDetails.exerciseSubmissions.length > 0 ? (
                            <div className="space-y-2">
                              {studentDetails.exerciseSubmissions.map((submission) => (
                                <Link
                                  key={submission.id}
                                  href={`/instructor/exercise/${submission.exercise.id}/grade?studentId=${studentDetails.student.id}`}
                                  className="block border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:text-blue-400 transition-colors">
                                        Lesson {submission.exercise.lesson.number}: {submission.exercise.lesson.title}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {submission.exercise.title}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                                        {new Date(submission.submittedAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        submission.status === 'submitted'
                                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700'
                                          : submission.status === 'graded'
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                      }`}>
                                        {submission.status}
                                      </div>
                                      <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500">
                              <Code className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                              <p>No exercise submissions recorded yet</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    <p>Failed to load student details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cohort Details Modal */}
        {selectedCohortId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loadingCohortDetails ? 'Loading...' : cohortDetails?.cohort.name || 'Cohort Details'}
                    </h2>
                    {cohortDetails && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{cohortDetails.course.title}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cohortDetails && (
                    <button
                      onClick={downloadCohortGradesCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Grades CSV
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCohortId(null);
                      setCohortDetails(null);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingCohortDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : cohortDetails ? (
                  <div className="space-y-6">
                    {/* Cohort Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Cohort Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Name:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{cohortDetails.cohort.name}</p>
                        </div>
                        {cohortDetails.cohort.description && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Description:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{cohortDetails.cohort.description}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {cohortDetails.cohort.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {cohortDetails.stats.totalStudents}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Students</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {cohortDetails.stats.averageGrade}%
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">Average Grade</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {cohortDetails.stats.studentsWithGrades}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Students Graded</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-orange-900">
                          {cohortDetails.stats.totalGrades}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Total Grades</div>
                      </div>
                    </div>

                    {/* Students Table */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Students ({cohortDetails.students.length})
                      </h3>
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                  Registration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                  Email
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                  Grades
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                  Avg Grade
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                  Lessons
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                              {cohortDetails.students.map((student: any) => (
                                <tr key={student.studentId} className="hover:bg-gray-50 dark:bg-gray-800">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{student.registrationNumber}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{student.email || '-'}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{student.totalGrades}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className={`text-sm font-bold ${
                                      student.averageGrade >= 70
                                        ? 'text-green-600 dark:text-green-400'
                                        : student.averageGrade >= 50
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-red-600'
                                    }`}>
                                      {student.averageGrade > 0 ? `${student.averageGrade}%` : '-'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                      {student.completedLessons}/{cohortDetails.stats.totalLessons}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Recent Grades */}
                    {cohortDetails.grades.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          Recent Grades ({cohortDetails.grades.length})
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {cohortDetails.grades.slice(0, 10).map((grade: any) => (
                            <div
                              key={grade.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {grade.studentName} ({grade.studentRegistration})
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Lesson {grade.lessonNumber}: {grade.lessonTitle}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                                    {grade.exerciseTitle}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {grade.percentage}%
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{grade.letterGrade}</div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {new Date(grade.gradedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    <p>Failed to load cohort details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
