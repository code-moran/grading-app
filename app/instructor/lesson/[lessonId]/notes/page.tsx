'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import MarkdownEditor from '@/components/MarkdownEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Save, Edit, Trash2, Plus, FileText, Eye, Code } from 'lucide-react';
import Link from 'next/link';

interface LessonNote {
  id: string;
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
  title: string;
  content: string;
  section: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string | null;
  courseId: string;
  course: {
    id: string;
    title: string;
  };
}

export default function LessonNotesPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [editingNote, setEditingNote] = useState<LessonNote | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<{ [key: string]: boolean }>({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    section: 'introduction',
  });

  useEffect(() => {
    if (lessonId) {
      loadLessonData();
    }
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);

      // Fetch lesson from API
      const lessonResponse = await fetch(`/api/lessons/${lessonId}`);
      if (!lessonResponse.ok) {
        throw new Error('Failed to fetch lesson');
      }
      const lessonData = await lessonResponse.json();
      setLesson(lessonData.lesson);

      // Load notes for this lesson
      const notesResponse = await fetch(`/api/lesson-notes?lessonId=${lessonId}`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData.notes);
      }
    } catch (error) {
      console.error('Error loading lesson data:', error);
      setError('Failed to load lesson data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!lesson) {
      setError('Lesson not found');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const noteData = {
        ...formData,
        lessonId: lesson.id,
        lessonNumber: lesson.number,
        lessonTitle: lesson.title,
      };

      const response = await fetch('/api/lesson-notes', {
        method: editingNote ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...noteData,
          id: editingNote?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save note');
      }

      const savedNote = await response.json();

      if (editingNote) {
        setNotes(notes.map((note) => (note.id === editingNote.id ? savedNote.note : note)));
      } else {
        setNotes([...notes, savedNote.note]);
      }

      // Reset form
      setFormData({ title: '', content: '', section: 'introduction' });
      setEditingNote(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving note:', error);
      setError(error instanceof Error ? error.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = (note: LessonNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      section: note.section,
    });
    setShowAddForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('note-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lesson-notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete note');
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', content: '', section: 'introduction' });
    setEditingNote(null);
    setShowAddForm(false);
    setError(null);
  };

  const togglePreview = (noteId: string) => {
    setPreviewMode((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
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

  if (error && !lesson) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const sections = [
    { value: 'introduction', label: 'Introduction', icon: '📖' },
    { value: 'objectives', label: 'Learning Objectives', icon: '🎯' },
    { value: 'content', label: 'Main Content', icon: '📚' },
    { value: 'examples', label: 'Examples', icon: '💡' },
    { value: 'exercises', label: 'Exercises', icon: '✏️' },
    { value: 'summary', label: 'Summary', icon: '📝' },
    { value: 'resources', label: 'Additional Resources', icon: '🔗' },
  ];

  const groupedNotes = notes.reduce(
    (acc, note) => {
      if (!acc[note.section]) {
        acc[note.section] = [];
      }
      acc[note.section].push(note);
      return acc;
    },
    {} as { [key: string]: LessonNote[] }
  );

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/instructor/lesson/${lessonId}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lesson
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Lesson {lesson?.number}: {lesson?.title}
                </h1>
                <p className="text-gray-600">Manage lesson notes and content with Markdown</p>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setTimeout(() => {
                    document.getElementById('note-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div id="note-form" className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {sections.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.icon} {section.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter note title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content * (Markdown supported)</label>
                  <MarkdownEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Write your lesson notes in Markdown..."
                    minHeight="500px"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveNote}
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingNote ? 'Update Note' : 'Save Note'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-6">
            {Object.keys(groupedNotes).length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
                <p className="text-gray-600 mb-4">Start by adding notes for this lesson using Markdown.</p>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setTimeout(() => {
                      document.getElementById('note-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add First Note
                </button>
              </div>
            ) : (
              sections.map((section) => {
                const sectionNotes = groupedNotes[section.value] || [];
                if (sectionNotes.length === 0) return null;

                return (
                  <div key={section.value} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">{section.icon}</span>
                      {section.label}
                    </h2>
                    <div className="space-y-4">
                      {sectionNotes.map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => togglePreview(note.id)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                                title={previewMode[note.id] ? 'Show markdown' : 'Show preview'}
                              >
                                {previewMode[note.id] ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleEditNote(note)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit note"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Delete note"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            {previewMode[note.id] ? (
                              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border border-gray-200">
                                {note.content}
                              </div>
                            ) : (
                              <div className="markdown-content">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                >
                                  {note.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                            Last updated: {new Date(note.updatedAt).toLocaleDateString()} at{' '}
                            {new Date(note.updatedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
