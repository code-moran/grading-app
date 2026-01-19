'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

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
}

export default function CohortsPage() {
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

  // API functions
  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cohorts');
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

  // Load cohorts on component mount
  useEffect(() => {
    fetchCohorts();
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cohort Management</h1>
            <p className="text-gray-600">Create and manage student cohorts</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search cohorts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
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
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCohort ? 'Edit Cohort' : 'Create New Cohort'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cohort Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Cohort 2024, Spring 2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description for this cohort"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCohorts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No cohorts found</h3>
              <p className="text-gray-600 mb-4">
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
                  className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all hover:shadow-lg ${
                    cohort.isActive ? 'border-blue-200' : 'border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{cohort.name}</h3>
                      {cohort.description && (
                        <p className="text-sm text-gray-600 mb-2">{cohort.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {cohort.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Users className="h-3 w-3 mr-1" />
                          {cohort._count?.students || 0} students
                        </span>
                      </div>
                    </div>
                  </div>

                  {(cohort.startDate || cohort.endDate) && (
                    <div className="mb-4 space-y-1 text-sm text-gray-600">
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

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => startEdit(cohort)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCohort(cohort.id)}
                      className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                      disabled={cohort._count && cohort._count.students > 0}
                      title={
                        cohort._count && cohort._count.students > 0
                          ? 'Cannot delete cohort with students'
                          : 'Delete cohort'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

