'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Shield,
  Clock,
  User,
  Info,
  X,
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeleton';
import { ButtonSpinner } from '@/components/LoadingSpinner';

interface BackupMetadata {
  version: string;
  timestamp: string;
  exportedBy: string;
  exportedByEmail: string;
  recordCounts: Record<string, number>;
}

export default function BackupRestorePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backupMetadata, setBackupMetadata] = useState<BackupMetadata | null>(null);
  const [validating, setValidating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreOptions, setRestoreOptions] = useState({
    clearExisting: false,
    skipUsers: false,
    skipGrades: false,
    skipQuizAttempts: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/backup');
      
      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create backup');
        } else {
          const text = await response.text();
          throw new Error(text || 'Failed to create backup');
        }
      }

      // Get the backup data
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'backup.json'
        : 'backup.json';
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Backup created and downloaded successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please select a valid JSON backup file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setBackupMetadata(null);

    // Read and validate file
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // Validate structure
      if (!backupData.metadata || !backupData.data) {
        setError('Invalid backup file structure');
        return;
      }

      setBackupMetadata(backupData.metadata);
    } catch (err: any) {
      setError('Failed to read backup file: ' + err.message);
      setSelectedFile(null);
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) return;

    try {
      setValidating(true);
      setError(null);

      const text = await selectedFile.text();
      const backupData = JSON.parse(text);

      const response = await fetch(
        `/api/admin/restore/validate?backupData=${encodeURIComponent(JSON.stringify(backupData))}`
      );

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Backup validation failed');
      }

      if (!response.ok || !result.valid) {
        throw new Error(result.error || 'Backup validation failed');
      }

      setSuccess('Backup file is valid and ready to restore');
      setBackupMetadata(result.metadata);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setError('Please select a backup file first');
      return;
    }

    if (!backupMetadata) {
      setError('Please validate the backup file first');
      return;
    }

    const totalRecords = Object.values(backupMetadata.recordCounts).reduce((a: number, b: number) => a + b, 0);
    if (!confirm(
      `Are you sure you want to restore this backup?\n\n` +
      `This will ${restoreOptions.clearExisting ? 'clear all existing data and ' : ''}` +
      `restore ${totalRecords} records.\n\n` +
      `This action cannot be undone!`
    )) {
      return;
    }

    try {
      setRestoring(true);
      setError(null);
      setSuccess(null);

      const text = await selectedFile.text();
      const backupData = JSON.parse(text);

      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupData,
          options: restoreOptions,
        }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Failed to restore backup');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to restore backup');
      }

      const totalRestored = Object.values(result.stats as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
      setSuccess(
        `Backup restored successfully! Restored ${totalRestored} records.`
      );
      setSelectedFile(null);
      setBackupMetadata(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => {
        setSuccess(null);
        // Optionally reload the page
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to restore backup');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Backup & Restore
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create backups of your database and restore from previous backups
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Success</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backup Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Backup</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Export all database data</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">What gets backed up:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                        <li>All users, students, and instructors</li>
                        <li>Courses, lessons, and exercises</li>
                        <li>Grades, quiz attempts, and submissions</li>
                        <li>Rubrics, cohorts, and all related data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBackup}
                  disabled={loading}
                  className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  {loading ? (
                    <>
                      <ButtonSpinner size="sm" />
                      <span className="ml-2">Creating Backup...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Create Backup
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Restore Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Restore Backup</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Import data from backup file</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Backup File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {selectedFile.name}
                    </p>
                  )}
                </div>

                {backupMetadata && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Backup Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(backupMetadata.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <User className="h-4 w-4 mr-2" />
                        <span>Exported by: {backupMetadata.exportedBy}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Database className="h-4 w-4 mr-2" />
                        <span>
                          {Object.values(backupMetadata.recordCounts).reduce((a: number, b: number) => a + b, 0)} total records
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={handleValidate}
                    disabled={!selectedFile || validating}
                    className="w-full bg-gray-600 dark:bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
                  >
                    {validating ? (
                      <>
                        <ButtonSpinner size="sm" />
                        <span className="ml-2">Validating...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Validate Backup
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRestore}
                    disabled={!backupMetadata || restoring}
                    className="w-full bg-green-600 dark:bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {restoring ? (
                      <>
                        <ButtonSpinner size="sm" />
                        <span className="ml-2">Restoring...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Restore Backup
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Restore Options */}
          {selectedFile && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Restore Options</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={restoreOptions.clearExisting}
                    onChange={(e) =>
                      setRestoreOptions({ ...restoreOptions, clearExisting: e.target.checked })
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Clear all existing data before restore
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={restoreOptions.skipUsers}
                    onChange={(e) =>
                      setRestoreOptions({ ...restoreOptions, skipUsers: e.target.checked })
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Skip users, students, and instructors
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={restoreOptions.skipGrades}
                    onChange={(e) =>
                      setRestoreOptions({ ...restoreOptions, skipGrades: e.target.checked })
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Skip grades (keep existing grades)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={restoreOptions.skipQuizAttempts}
                    onChange={(e) =>
                      setRestoreOptions({ ...restoreOptions, skipQuizAttempts: e.target.checked })
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Skip quiz attempts (keep existing attempts)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Important Safety Notice</h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 mt-2 space-y-1 list-disc list-inside">
                  <li>Always create a backup before restoring</li>
                  <li>Restore operations cannot be undone</li>
                  <li>Test restores in a development environment first</li>
                  <li>Ensure you have the correct backup file before proceeding</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
