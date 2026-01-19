'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  HelpCircle,
  X,
  Save,
  Filter,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface QuizQuestion {
  id: string;
  lessonId: string;
  lesson: {
    id: string;
    number: number;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  order: number;
  stats: {
    attemptCount: number;
    correctCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  course: {
    id: string;
    title: string;
  };
}

export default function QuizzesPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [lessonFilter, setLessonFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', ''],
    correctAnswer: 0,
    explanation: '',
    lessonId: '',
    order: 0,
  });

  useEffect(() => {
    fetchQuestions();
    fetchLessons();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quizzes');
      if (!response.ok) {
        throw new Error('Failed to fetch quiz questions');
      }
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setError('Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question || !newQuestion.lessonId || newQuestion.options.length < 2) {
      setError('Question, lesson, and at least 2 options are required');
      return;
    }

    if (newQuestion.options.some((opt) => !opt.trim())) {
      setError('All options must be filled');
      return;
    }

    if (newQuestion.correctAnswer < 0 || newQuestion.correctAnswer >= newQuestion.options.length) {
      setError('Please select a valid correct answer');
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: newQuestion.lessonId,
          question: newQuestion.question,
          options: newQuestion.options.filter((opt) => opt.trim()),
          correctAnswer: newQuestion.correctAnswer,
          explanation: newQuestion.explanation || null,
          order: newQuestion.order,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create quiz question');
      }

      const data = await response.json();
      setQuestions([...questions, data.question]);
      setNewQuestion({
        question: '',
        options: ['', ''],
        correctAnswer: 0,
        explanation: '',
        lessonId: '',
        order: 0,
      });
      setShowAddForm(false);
      setSuccess('Quiz question added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create quiz question');
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    if (!editingQuestion.question || !editingQuestion.lessonId || editingQuestion.options.length < 2) {
      setError('Question, lesson, and at least 2 options are required');
      return;
    }

    if (editingQuestion.options.some((opt) => !opt.trim())) {
      setError('All options must be filled');
      return;
    }

    if (editingQuestion.correctAnswer < 0 || editingQuestion.correctAnswer >= editingQuestion.options.length) {
      setError('Please select a valid correct answer');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/quizzes/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: editingQuestion.question,
          options: editingQuestion.options.filter((opt) => opt.trim()),
          correctAnswer: editingQuestion.correctAnswer,
          explanation: editingQuestion.explanation || null,
          order: editingQuestion.order,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update quiz question');
      }

      const data = await response.json();
      setQuestions(questions.map((q) => (q.id === editingQuestion.id ? data.question : q)));
      setEditingQuestion(null);
      setSuccess('Quiz question updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update quiz question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz question? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/quizzes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete quiz question');
      }

      setQuestions(questions.filter((question) => question.id !== id));
      setSuccess('Quiz question deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete quiz question');
    }
  };

  const addOption = () => {
    if (editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        options: [...editingQuestion.options, ''],
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, ''],
      });
    }
  };

  const removeOption = (index: number) => {
    const currentQuestion = editingQuestion || newQuestion;
    if (currentQuestion.options.length <= 2) {
      setError('At least 2 options are required');
      return;
    }

    if (editingQuestion) {
      const newOptions = editingQuestion.options.filter((_, i) => i !== index);
      setEditingQuestion({
        ...editingQuestion,
        options: newOptions,
        correctAnswer: editingQuestion.correctAnswer >= newOptions.length ? 0 : editingQuestion.correctAnswer,
      });
    } else {
      const newOptions = newQuestion.options.filter((_, i) => i !== index);
      setNewQuestion({
        ...newQuestion,
        options: newOptions,
        correctAnswer: newQuestion.correctAnswer >= newOptions.length ? 0 : newQuestion.correctAnswer,
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (editingQuestion) {
      const newOptions = [...editingQuestion.options];
      newOptions[index] = value;
      setEditingQuestion({ ...editingQuestion, options: newOptions });
    } else {
      const newOptions = [...newQuestion.options];
      newOptions[index] = value;
      setNewQuestion({ ...newQuestion, options: newOptions });
    }
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.lesson.course.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLesson = !lessonFilter || question.lessonId === lessonFilter;

    return matchesSearch && matchesLesson;
  });

  const resetForm = () => {
    setNewQuestion({
      question: '',
      options: ['', ''],
      correctAnswer: 0,
      explanation: '',
      lessonId: '',
      order: 0,
    });
    setShowAddForm(false);
    setEditingQuestion(null);
  };

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/instructor"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quiz Management</h1>
            <p className="text-gray-600">Create and manage quiz questions for lessons</p>
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
                    placeholder="Search quiz questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {lessons.length > 0 && (
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={lessonFilter}
                      onChange={(e) => setLessonFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
                    >
                      <option value="">All Lessons</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          Lesson {lesson.number}: {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Question
              </button>
            </div>
          </div>

          {/* Add/Edit Form Modal */}
          {(showAddForm || editingQuestion) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingQuestion ? 'Edit Quiz Question' : 'Add New Quiz Question'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingQuestion?.lessonId || newQuestion.lessonId}
                      onChange={(e) =>
                        editingQuestion
                          ? setEditingQuestion({ ...editingQuestion, lessonId: e.target.value })
                          : setNewQuestion({ ...newQuestion, lessonId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Lesson</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          Lesson {lesson.number}: {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editingQuestion?.question || newQuestion.question}
                      onChange={(e) =>
                        editingQuestion
                          ? setEditingQuestion({ ...editingQuestion, question: e.target.value })
                          : setNewQuestion({ ...newQuestion, question: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editingQuestion?.options || newQuestion.options).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={
                              (editingQuestion?.correctAnswer ?? newQuestion.correctAnswer) === index
                            }
                            onChange={() =>
                              editingQuestion
                                ? setEditingQuestion({ ...editingQuestion, correctAnswer: index })
                                : setNewQuestion({ ...newQuestion, correctAnswer: index })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {(editingQuestion?.options || newQuestion.options).length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Select the radio button next to the correct answer
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={editingQuestion?.explanation || newQuestion.explanation}
                      onChange={(e) =>
                        editingQuestion
                          ? setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                          : setNewQuestion({ ...newQuestion, explanation: e.target.value })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order (Optional)
                    </label>
                    <input
                      type="number"
                      value={editingQuestion?.order ?? newQuestion.order}
                      onChange={(e) =>
                        editingQuestion
                          ? setEditingQuestion({ ...editingQuestion, order: parseInt(e.target.value) || 0 })
                          : setNewQuestion({ ...newQuestion, order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first. Leave as 0 for auto-ordering.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {editingQuestion ? 'Update Question' : 'Add Question'}
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

          {/* Questions List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No quiz questions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || lessonFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first quiz question'}
              </p>
              {!searchTerm && !lessonFilter && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Question
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <HelpCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/instructor/lesson/${question.lessonId}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Lesson {question.lesson.number}: {question.lesson.title}
                            </Link>
                            <span className="text-xs text-gray-500">• Order: {question.order}</span>
                          </div>
                          <div className="text-xs text-gray-500">{question.lesson.course.title}</div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{question.question}</h3>
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              index === question.correctAnswer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                index === question.correctAnswer
                                  ? 'border-green-600 bg-green-600'
                                  : 'border-gray-400'
                              }`}
                            >
                              {index === question.correctAnswer && (
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <span className="text-sm text-gray-700">{option}</span>
                            {index === question.correctAnswer && (
                              <span className="ml-auto text-xs font-medium text-green-700">Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-900">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          <strong>{question.stats.attemptCount}</strong> attempts
                        </span>
                        <span>
                          <strong>{question.stats.correctCount}</strong> correct (
                          {question.stats.attemptCount > 0
                            ? Math.round((question.stats.correctCount / question.stats.attemptCount) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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


