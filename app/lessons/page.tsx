'use client';

import { useState } from 'react';
import { lessons } from '@/lib/lessons';
import { Lesson, Exercise, Rubric, RubricCriteria, RubricLevel } from '@/lib/types';
import { Plus, Edit, Trash2, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { generateId } from '@/lib/utils';

export default function LessonsPage() {
  const [lessonsData, setLessonsData] = useState<Lesson[]>(lessons);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id'>>({
    title: '',
    description: '',
    maxPoints: 16,
    rubric: {
      id: '',
      name: '',
      description: '',
      criteria: [],
      levels: [
        {
          id: '',
          name: "Excellent (4)",
          description: "Exceeds expectations with exceptional quality and understanding",
          points: 4,
          color: "bg-green-100 text-green-800 border-green-200"
        },
        {
          id: '',
          name: "Good (3)",
          description: "Meets expectations with good quality and understanding",
          points: 3,
          color: "bg-blue-100 text-blue-800 border-blue-200"
        },
        {
          id: '',
          name: "Satisfactory (2)",
          description: "Meets basic expectations with adequate quality",
          points: 2,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200"
        },
        {
          id: '',
          name: "Needs Improvement (1)",
          description: "Below expectations, requires significant improvement",
          points: 1,
          color: "bg-red-100 text-red-800 border-red-200"
        }
      ],
      totalPoints: 16
    }
  });

  const handleAddExercise = () => {
    if (selectedLesson && newExercise.title && newExercise.description) {
      const exercise: Exercise = {
        ...newExercise,
        id: generateId(),
        rubric: {
          ...newExercise.rubric,
          id: generateId(),
          criteria: newExercise.rubric.criteria.map((c, index) => ({
            ...c,
            id: `${generateId()}-criteria-${index}`
          })),
          levels: newExercise.rubric.levels.map((l, index) => ({
            ...l,
            id: `${generateId()}-level-${index}`
          }))
        }
      };

      const updatedLessons = lessonsData.map(lesson => {
        if (lesson.id === selectedLesson.id) {
          return {
            ...lesson,
            exercises: [...lesson.exercises, exercise]
          };
        }
        return lesson;
      });

      setLessonsData(updatedLessons);
      setNewExercise({
        title: '',
        description: '',
        maxPoints: 16,
        rubric: {
          id: '',
          name: '',
          description: '',
          criteria: [],
          levels: [
            {
              id: '',
              name: "Excellent (4)",
              description: "Exceeds expectations with exceptional quality and understanding",
              points: 4,
              color: "bg-green-100 text-green-800 border-green-200"
            },
            {
              id: '',
              name: "Good (3)",
              description: "Meets expectations with good quality and understanding",
              points: 3,
              color: "bg-blue-100 text-blue-800 border-blue-200"
            },
            {
              id: '',
              name: "Satisfactory (2)",
              description: "Meets basic expectations with adequate quality",
              points: 2,
              color: "bg-yellow-100 text-yellow-800 border-yellow-200"
            },
            {
              id: '',
              name: "Needs Improvement (1)",
              description: "Below expectations, requires significant improvement",
              points: 1,
              color: "bg-red-100 text-red-800 border-red-200"
            }
          ],
          totalPoints: 16
        }
      });
      setShowAddExercise(false);
    }
  };

  const addCriteria = () => {
    setNewExercise(prev => ({
      ...prev,
      rubric: {
        ...prev.rubric,
        criteria: [
          ...prev.rubric.criteria,
          {
            id: '',
            name: '',
            description: '',
            weight: 25
          }
        ]
      }
    }));
  };

  const updateCriteria = (index: number, field: keyof RubricCriteria, value: string | number) => {
    setNewExercise(prev => ({
      ...prev,
      rubric: {
        ...prev.rubric,
        criteria: prev.rubric.criteria.map((c, i) => 
          i === index ? { ...c, [field]: value } : c
        )
      }
    }));
  };

  const removeCriteria = (index: number) => {
    setNewExercise(prev => ({
      ...prev,
      rubric: {
        ...prev.rubric,
        criteria: prev.rubric.criteria.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lesson Management</h1>
              <p className="text-sm text-gray-600">Manage lessons and exercises</p>
            </div>
            <Link href="/" className="text-gray-600 hover:text-blue-600">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lessons</h3>
              <div className="space-y-2">
                {lessonsData.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3 rounded-md border transition-colors duration-200 ${
                      selectedLesson?.id === lesson.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">Lesson {lesson.number}: {lesson.title}</div>
                    <div className="text-sm text-gray-600">{lesson.exercises.length} exercises</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Details and Exercises */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="space-y-6">
                {/* Lesson Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Lesson {selectedLesson.number}: {selectedLesson.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{selectedLesson.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Duration: {selectedLesson.duration}</span>
                    <button
                      onClick={() => setShowAddExercise(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </button>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercises</h3>
                  <div className="space-y-4">
                    {selectedLesson.exercises.map((exercise) => (
                      <div key={exercise.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{exercise.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                Max Points: {exercise.maxPoints}
                              </span>
                              <span className="text-sm text-gray-500">
                                Criteria: {exercise.rubric.criteria.length}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/grade/${selectedLesson.id}?exercise=${exercise.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FileText className="h-4 w-4" />
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Lesson</h3>
                <p className="text-gray-600">Choose a lesson from the sidebar to view and manage its exercises.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Exercise Modal */}
        {showAddExercise && selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Exercise</h3>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Title *</label>
                      <input
                        type="text"
                        value={newExercise.title}
                        onChange={(e) => setNewExercise({ ...newExercise, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter exercise title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Points *</label>
                      <input
                        type="number"
                        value={newExercise.maxPoints}
                        onChange={(e) => setNewExercise({ ...newExercise, maxPoints: parseInt(e.target.value) || 16 })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={newExercise.description}
                      onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Enter exercise description"
                    />
                  </div>

                  {/* Rubric Criteria */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Assessment Criteria</h4>
                      <button
                        onClick={addCriteria}
                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-1 inline" />
                        Add Criteria
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {newExercise.rubric.criteria.map((criteria, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Criteria Name *</label>
                              <input
                                type="text"
                                value={criteria.name}
                                onChange={(e) => updateCriteria(index, 'name', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Code Quality"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%) *</label>
                              <input
                                type="number"
                                value={criteria.weight}
                                onChange={(e) => updateCriteria(index, 'weight', parseInt(e.target.value) || 25)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max="100"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => removeCriteria(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                            <textarea
                              value={criteria.description}
                              onChange={(e) => updateCriteria(index, 'description', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={2}
                              placeholder="Describe what this criteria evaluates"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddExercise(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExercise}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Exercise
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
