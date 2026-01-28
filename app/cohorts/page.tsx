'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  X,
  Save,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  BookOpen,
  BarChart3,
  TrendingUp,
  Award,
  Mail,
  User,
  Download,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { CardSkeleton } from '@/components/Skeleton';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Cohort {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
  };
  enrolledCourses?: Array<{
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
  }>;
  students?: Array<{
    id: string;
    name: string;
    email: string | null;
    registrationNumber: string;
  }>;
}

interface CohortDetails {
  cohort: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  statistics: {
    totalStudents: number;
    enrolledStudentsCount: number;
    enrolledCoursesCount: number;
    averageGrade: number | null;
    totalGrades: number;
  };
  enrolledCourses: Array<{
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
    lessonCount: number;
    subscriberCount: number;
  }>;
  students: Array<{
    id: string;
    name: string;
    email: string | null;
    registrationNumber: string;
    createdAt: Date;
    averageGrade: number | null;
    enrolledCoursesCount: number;
    recentGrades: Array<{
      id: string;
      percentage: number;
      exercise: {
        id: string;
        title: string;
        lesson: {
          id: string;
          number: number;
          title: string;
          course: {
            id: string;
            title: string;
          };
        };
      };
    }>;
  }>;
}

export default function CohortsPage() {
  const { data: session } = useSession();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Cohort details modal
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [cohortDetails, setCohortDetails] = useState<CohortDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'courses'>('overview');

  // API functions
  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const userRole = (session?.user as any)?.role;
      
      // If instructor, fetch only cohorts related to their courses
      const endpoint = userRole === 'instructor' 
        ? '/api/instructor/cohorts' 
        : '/api/cohorts';
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch cohorts');
      }
      const data = await response.json();
      setCohorts(data.cohorts);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      setError('Failed to load cohorts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCohortDetails = async (cohortId: string) => {
    try {
      setLoadingDetails(true);
      setError(null);
      const userRole = (session?.user as any)?.role;
      
      // If instructor, use instructor-specific endpoint
      const endpoint = userRole === 'instructor'
        ? `/api/instructor/cohorts/${cohortId}`
        : `/api/cohorts/${cohortId}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cohort details');
      }
      const data = await response.json();
      setCohortDetails(data);
    } catch (error) {
      console.error('Error fetching cohort details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load cohort details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const downloadCohortGradesCSV = async () => {
    if (!selectedCohortId) return;

    try {
      setError(null);
      const userRole = (session?.user as any)?.role;
      
      // If instructor, use instructor-specific endpoint
      const endpoint = userRole === 'instructor'
        ? `/api/instructor/cohorts/${selectedCohortId}/export`
        : `/api/cohorts/${selectedCohortId}/export`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export grades');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cohortName = cohortDetails?.cohort.name || 'cohort';
      a.download = `cohort-${cohortName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-all-courses-grades.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Grades exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error downloading grades:', error);
      setError(error.message || 'Failed to download grades');
    }
  };

  const createCohort = async (cohortData: typeof formData) => {
    const response = await fetch('/api/cohorts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cohortData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create cohort');
    }

    const data = await response.json();
    return data.cohort;
  };

  const updateCohort = async (id: string, cohortData: Partial<typeof formData>) => {
    const response = await fetch(`/api/cohorts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cohortData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update cohort');
    }

    const data = await response.json();
    return data.cohort;
  };

  const deleteCohort = async (id: string) => {
    const response = await fetch(`/api/cohorts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete cohort');
    }

    return true;
  };

  // Load cohorts on component mount and when session changes
  useEffect(() => {
    if (session) {
      fetchCohorts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Load cohort details when selected
  useEffect(() => {
    if (selectedCohortId && session) {
      fetchCohortDetails(selectedCohortId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCohortId, session]);

  const filteredCohorts = cohorts.filter((cohort) => {
    const matchesSearch =
      cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cohort.description && cohort.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && cohort.isActive) ||
      (filterActive === 'inactive' && !cohort.isActive);

    return matchesSearch && matchesFilter;
  });

  const handleAddCohort = async () => {
    if (!formData.name.trim()) {
      setError('Cohort name is required');
      return;
    }

    try {
      setError(null);
      const createdCohort = await createCohort(formData);
      setCohorts([...cohorts, createdCohort]);
      resetForm();
      setShowAddForm(false);
      setSuccess('Cohort created successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create cohort');
    }
  };

  const handleUpdateCohort = async () => {
    if (!editingCohort) return;
    if (!formData.name.trim()) {
      setError('Cohort name is required');
      return;
    }

    try {
      setError(null);
      const updatedCohort = await updateCohort(editingCohort.id, formData);
      setCohorts(cohorts.map((c) => (c.id === editingCohort.id ? updatedCohort : c)));
      resetForm();
      setEditingCohort(null);
      setSuccess('Cohort updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update cohort');
    }
  };

  const handleDeleteCohort = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cohort? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await deleteCohort(id);
      setCohorts(cohorts.filter((cohort) => cohort.id !== id));
      setSuccess('Cohort deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete cohort');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setShowAddForm(false);
    setEditingCohort(null);
  };

  const startEdit = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      description: cohort.description || '',
      startDate: cohort.startDate ? new Date(cohort.startDate).toISOString().split('T')[0] : '',
      endDate: cohort.endDate ? new Date(cohort.endDate).toISOString().split('T')[0] : '',
      isActive: cohort.isActive,
    });
  };

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Cohort Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Create and manage student cohorts</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Actions Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search cohorts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[150px]"
                  >
                    <option value="all">All Cohorts</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full md:w-auto justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Cohort
              </button>
            </div>
          </div>

          {/* Add/Edit Form Modal */}
          {(showAddForm || editingCohort) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingCohort ? 'Edit Cohort' : 'Create New Cohort'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cohort Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Cohort 2024, Spring 2024"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description for this cohort"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active (cohort is currently in use)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={editingCohort ? handleUpdateCohort : handleAddCohort}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {editingCohort ? 'Update Cohort' : 'Create Cohort'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cohorts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCohorts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No cohorts found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchTerm || filterActive !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first cohort'}
              </p>
              {!searchTerm && filterActive === 'all' && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Cohort
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-2 transition-all hover:shadow-lg dark:hover:shadow-xl ${
                    cohort.isActive ? 'border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600' : 'border-gray-200 dark:border-gray-700 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{cohort.name}</h3>
                      {cohort.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{cohort.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {cohort.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            Inactive
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                          <Users className="h-3 w-3 mr-1" />
                          {cohort._count?.students || 0} students
                        </span>
                      </div>
                    </div>
                  </div>

                  {(cohort.startDate || cohort.endDate) && (
                    <div className="mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {cohort.startDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Start: {new Date(cohort.startDate).toLocaleDateString()}
                        </div>
                      )}
                      {cohort.endDate && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          End: {new Date(cohort.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setSelectedCohortId(cohort.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    {(session?.user as any)?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => startEdit(cohort)}
                          className="flex items-center justify-center px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCohort(cohort.id)}
                          className="flex items-center justify-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                          disabled={cohort._count && cohort._count.students > 0}
                          title={
                            cohort._count && cohort._count.students > 0
                              ? 'Cannot delete cohort with students'
                              : 'Delete cohort'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cohort Details Modal */}
          {selectedCohortId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cohortDetails ? cohortDetails.cohort.name : 'Cohort Details'}
                  </h2>
                  <div className="flex items-center gap-3">
                    {cohortDetails && !loadingDetails && (
                      <button
                        onClick={downloadCohortGradesCSV}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                        title="Download grades for all enrolled courses"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Grades CSV
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCohortId(null);
                        setCohortDetails(null);
                        setActiveTab('overview');
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {loadingDetails ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : cohortDetails ? (
                  <div className="flex-1 overflow-y-auto">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                      <div className="flex space-x-4">
                        {['overview', 'students', 'courses'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                              activeTab === tab
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Overview Tab */}
                      {activeTab === 'overview' && (
                        <div className="space-y-6">
                          {/* Cohort Info */}
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cohort Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                                <p className="text-base font-medium text-gray-900 dark:text-white">{cohortDetails.cohort.name}</p>
                              </div>
                              {cohortDetails.cohort.description && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                                  <p className="text-base text-gray-900 dark:text-white">{cohortDetails.cohort.description}</p>
                                </div>
                              )}
                              {cohortDetails.cohort.startDate && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                                  <p className="text-base text-gray-900 dark:text-white">
                                    {new Date(cohortDetails.cohort.startDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {cohortDetails.cohort.endDate && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                                  <p className="text-base text-gray-900 dark:text-white">
                                    {new Date(cohortDetails.cohort.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    cohortDetails.cohort.isActive
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                  }`}
                                >
                                  {cohortDetails.cohort.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Statistics */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {cohortDetails.statistics.totalStudents}
                                    </p>
                                  </div>
                                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {cohortDetails.statistics.enrolledCoursesCount}
                                    </p>
                                  </div>
                                  <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Grade</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {cohortDetails.statistics.averageGrade !== null
                                        ? `${cohortDetails.statistics.averageGrade.toFixed(1)}%`
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                              </div>
                              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Grades</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {cohortDetails.statistics.totalGrades}
                                    </p>
                                  </div>
                                  <Award className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Students Tab */}
                      {activeTab === 'students' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Students ({cohortDetails.students.length})
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Registration
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Email
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Avg Grade
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Courses
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {cohortDetails.students.map((student) => (
                                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {student.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {student.registrationNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {student.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      {student.averageGrade !== null ? (
                                        <span
                                          className={`font-medium ${
                                            student.averageGrade >= 70
                                              ? 'text-green-600 dark:text-green-400'
                                              : student.averageGrade >= 50
                                              ? 'text-yellow-600 dark:text-yellow-400'
                                              : 'text-red-600 dark:text-red-400'
                                          }`}
                                        >
                                          {student.averageGrade.toFixed(1)}%
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 dark:text-gray-500">N/A</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {student.enrolledCoursesCount}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Courses Tab */}
                      {activeTab === 'courses' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Enrolled Courses ({cohortDetails.enrolledCourses.length})
                          </h3>
                          {cohortDetails.enrolledCourses.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                              <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-300">No courses enrolled</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {cohortDetails.enrolledCourses.map((course) => (
                                <Link
                                  key={course.id}
                                  href={`/instructor/courses/${course.id}`}
                                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {course.title}
                                    </h4>
                                    {course.isActive ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                        Active
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                  {course.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                      {course.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center">
                                      <BookOpen className="h-4 w-4 mr-1" />
                                      {course.lessonCount} lessons
                                    </span>
                                    <span className="flex items-center">
                                      <Users className="h-4 w-4 mr-1" />
                                      {course.subscriberCount} students
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <p className="text-gray-600 dark:text-gray-300">Failed to load cohort details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

