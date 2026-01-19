'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { CheckCircle, XCircle, Clock, User, Mail, Building, GraduationCap } from 'lucide-react';

interface PendingInstructor {
  id: string;
  name: string;
  email: string;
  department: string | null;
  title: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
}

export default function AdminInstructorsPage() {
  const { data: session } = useSession();
  const [instructors, setInstructors] = useState<PendingInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user && (session.user as any).role === 'admin') {
      fetchPendingInstructors();
    }
  }, [session]);

  const fetchPendingInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/approve-instructor');
      if (!response.ok) {
        throw new Error('Failed to fetch pending instructors');
      }
      const data = await response.json();
      setInstructors(data.instructors || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (instructorId: string) => {
    try {
      setApproving(instructorId);
      const response = await fetch('/api/auth/approve-instructor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructorId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve instructor');
      }

      // Remove from list
      setInstructors(instructors.filter((inst) => inst.id !== instructorId));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setApproving(null);
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
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Instructor Approvals
            </h1>
            <p className="text-gray-600">Review and approve pending instructor accounts</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : instructors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No pending instructor approvals</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {instructor.email}
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </div>
                  </div>

                  {(instructor.department || instructor.title) && (
                    <div className="mb-4 space-y-2">
                      {instructor.department && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2" />
                          {instructor.department}
                        </div>
                      )}
                      {instructor.title && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          {instructor.title}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    Registered: {new Date(instructor.createdAt).toLocaleDateString()}
                  </div>

                  <button
                    onClick={() => handleApprove(instructor.id)}
                    disabled={approving === instructor.id}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {approving === instructor.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Instructor
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

