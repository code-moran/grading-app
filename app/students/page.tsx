'use client';

import { useState, useRef, useEffect } from 'react';
import { Student, BulkStudentUpload } from '@/lib/types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Upload,
  Download,
  FileText,
  X,
  Save,
  Users,
  Filter,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { parseCSV, convertStudentsToCSV, downloadCSV } from '@/lib/utils';

interface CohortOption {
  id: string;
  name: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [cohortFilter, setCohortFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    registrationNumber: '',
    cohortId: undefined,
  });

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadData, setBulkUploadData] = useState<BulkStudentUpload[]>([]);
  const [bulkUploadText, setBulkUploadText] = useState('');
  const [bulkCohortId, setBulkCohortId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API functions
  const fetchCohorts = async () => {
    try {
      const response = await fetch('/api/cohorts');
      if (response.ok) {
        const data = await response.json();
        setCohorts(data.cohorts.filter((c: any) => c.isActive).map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData: Omit<Student, 'id'>) => {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({
        name: studentData.name,
        email: studentData.email,
        registrationNumber: studentData.registrationNumber,
        cohortId: studentData.cohortId || undefined,
      }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create student');
      }

      const data = await response.json();
      return data.student;
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({
        name: studentData.name,
        email: studentData.email,
        registrationNumber: studentData.registrationNumber,
        cohortId: studentData.cohortId || undefined,
      }),
      });

      if (!response.ok) {
        const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update student');
      }

      const data = await response.json();
    return data.student;
  };

  const deleteStudent = async (id: string) => {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete student');
      }

      return true;
  };

  const bulkCreateStudents = async (studentsData: BulkStudentUpload[], cohortId?: string) => {
    // Convert cohort names to IDs
    const studentsWithCohortIds = await Promise.all(
      studentsData.map(async (s) => {
        let finalCohortId = cohortId || s.cohortId;
        
        // If cohortName is provided, look it up
        if (s.cohortName && !finalCohortId) {
          const cohort = cohorts.find((c) => c.name.toLowerCase() === s.cohortName?.toLowerCase());
          if (cohort) {
            finalCohortId = cohort.id;
          }
        }

        return {
          registrationNumber: s.registrationNumber,
          name: s.name,
          cohortId: finalCohortId || undefined,
        };
      })
    );

    const response = await fetch('/api/students/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        students: studentsWithCohortIds,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to bulk create students');
    }

    const data = await response.json();
    return data;
  };

  // Load students and cohorts on component mount
  useEffect(() => {
    fetchCohorts();
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.cohort && student.cohort.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCohort = !cohortFilter || student.cohortId === cohortFilter;

    return matchesSearch && matchesCohort;
  });

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.registrationNumber) {
      setError('Name and registration number are required');
      return;
    }

    try {
      setError(null);
        const createdStudent = await createStudent(newStudent);
        setStudents([...students, createdStudent]);
      setNewStudent({
        name: '',
        email: '',
        registrationNumber: '',
        cohortId: undefined,
      });
        setShowAddForm(false);
      setSuccess('Student added successfully');
      setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to create student');
      }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    if (!editingStudent.name || !editingStudent.registrationNumber) {
      setError('Name and registration number are required');
      return;
    }

    try {
      setError(null);
      const updatedStudent = await updateStudent(editingStudent.id, editingStudent);
      setStudents(students.map((s) => (s.id === editingStudent.id ? updatedStudent : s)));
      setEditingStudent(null);
      setSuccess('Student updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await deleteStudent(id);
      setStudents(students.filter((student) => student.id !== id));
      setSuccess('Student deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete student');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        setBulkUploadText(csvText);
        const parsedData = parseCSV(csvText);
        setBulkUploadData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  const handleBulkUpload = async () => {
    if (bulkUploadData.length === 0) {
      setError('Please upload a CSV file or enter data');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const result = await bulkCreateStudents(bulkUploadData, bulkCohortId);
      if (result.success) {
        await fetchStudents(); // Refresh the list
        setBulkUploadData([]);
        setBulkUploadText('');
        setBulkCohortId('');
        setShowBulkUpload(false);
        setSuccess(
          `Successfully uploaded ${result.students.length} students${result.errors?.length ? ` (${result.errors.length} errors)` : ''}`
        );
        setTimeout(() => setSuccess(null), 5000);
        
        if (result.errors && result.errors.length > 0) {
          console.warn('Upload errors:', result.errors);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to bulk upload students');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadStudents = () => {
    const csvContent = convertStudentsToCSV(filteredStudents);
    downloadCSV(csvContent, 'students.csv');
    setSuccess('Students exported successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const resetForm = () => {
    setNewStudent({
      name: '',
      email: '',
      registrationNumber: '',
      cohortId: undefined,
    });
    setShowAddForm(false);
    setEditingStudent(null);
  };

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Student Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage students with cohort assignment and bulk upload</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
          </div>
        )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
          </div>
        )}

          {/* Actions Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
                {cohorts.length > 0 && (
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={cohortFilter}
                      onChange={(e) => setCohortFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[150px]"
                    >
                      <option value="">All Cohorts</option>
                      {cohorts.map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Student
                </button>
            <button
              onClick={() => setShowBulkUpload(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
                  <Upload className="h-5 w-5 mr-2" />
              Bulk Upload
            </button>
            <button
              onClick={handleDownloadStudents}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Add/Edit Form Modal */}
          {(showAddForm || editingStudent) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingStudent?.name || newStudent.name}
                      onChange={(e) =>
                        editingStudent
                          ? setEditingStudent({ ...editingStudent, name: e.target.value })
                          : setNewStudent({ ...newStudent, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingStudent?.registrationNumber || newStudent.registrationNumber}
                      onChange={(e) =>
                        editingStudent
                          ? setEditingStudent({ ...editingStudent, registrationNumber: e.target.value })
                          : setNewStudent({ ...newStudent, registrationNumber: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cohort</label>
                    <select
                      value={editingStudent?.cohortId || newStudent.cohortId || ''}
                      onChange={(e) =>
                        editingStudent
                          ? setEditingStudent({ ...editingStudent, cohortId: e.target.value || undefined })
                          : setNewStudent({ ...newStudent, cohortId: e.target.value || undefined })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Cohort</option>
                      {cohorts.map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </option>
                      ))}
                    </select>
                    {cohorts.length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        No cohorts available. <Link href="/cohorts" className="text-blue-600 dark:text-blue-400 hover:underline">Create one first</Link>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editingStudent?.email || newStudent.email}
                      onChange={(e) =>
                        editingStudent
                          ? setEditingStudent({ ...editingStudent, email: e.target.value })
                          : setNewStudent({ ...newStudent, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {editingStudent ? 'Update Student' : 'Add Student'}
            </button>
            <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors"
            >
                      Cancel
            </button>
          </div>
        </div>
              </div>
            </div>
          )}

          {/* Bulk Upload Modal */}
        {showBulkUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Upload Students</h2>
                  <button
                    onClick={() => {
                      setShowBulkUpload(false);
                      setBulkUploadData([]);
                      setBulkUploadText('');
                      setBulkCohortId('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>CSV Format:</strong> Registration Number, Name, Cohort (optional)
                      <br />
                      Example: <code>REG001, John Doe, Cohort 2024</code>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Cohort (applied to all rows without cohort)
                    </label>
                    <select
                      value={bulkCohortId}
                      onChange={(e) => setBulkCohortId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Default Cohort</option>
                      {cohorts.map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </option>
                      ))}
                    </select>
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CSV File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {bulkUploadData.length > 0 && (
                <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                    Preview ({bulkUploadData.length} students)
                        </label>
                      </div>
                      <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Registration
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Name
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Cohort
                              </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {bulkUploadData.slice(0, 10).map((student, index) => (
                          <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {student.registrationNumber}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{student.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {student.cohortName || (bulkCohortId && cohorts.find(c => c.id === bulkCohortId)?.name) || '—'}
                                </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                        {bulkUploadData.length > 10 && (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-800">
                            ... and {bulkUploadData.length - 10} more
                          </div>
                        )}
                  </div>
                </div>
              )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleBulkUpload}
                      disabled={bulkUploadData.length === 0 || uploading}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      {uploading ? 'Uploading...' : `Upload ${bulkUploadData.length} Students`}
                    </button>
              <button
                onClick={() => {
                  setShowBulkUpload(false);
                  setBulkUploadData([]);
                  setBulkUploadText('');
                        setBulkCohortId('');
                }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
              </div>
            </div>
          )}

          {/* Students Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No students found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchTerm || cohortFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first student'}
              </p>
              {!searchTerm && !cohortFilter && (
              <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                Add Student
              </button>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Registration #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cohort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{student.registrationNumber}</div>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        {student.cohort ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800">
                            {student.cohort.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{student.email || '—'}</div>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingStudent(student)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
          </div>
        </div>
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  );
}
