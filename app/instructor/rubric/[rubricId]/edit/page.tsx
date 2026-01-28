'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Edit,
  GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CardSkeleton } from '@/components/Skeleton';
import { ButtonSpinner } from '@/components/LoadingSpinner';

interface RubricLevel {
  id: string;
  name: string;
  description: string | null;
  points: number;
  color: string | null;
}

interface RubricCriteria {
  id: string;
  name: string;
  description: string | null;
  weight: number;
}

interface Rubric {
  id: string;
  name: string;
  description: string | null;
  totalPoints: number;
  criteria: RubricCriteria[];
  levels: RubricLevel[];
  exerciseCount: number;
}

export default function EditRubricPage() {
  const params = useParams();
  const router = useRouter();
  const rubricId = params.rubricId as string;

  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [allCriteria, setAllCriteria] = useState<RubricCriteria[]>([]);
  const [allLevels, setAllLevels] = useState<RubricLevel[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<RubricCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalPoints: 16,
    selectedCriteriaIds: [] as string[],
    selectedLevelIds: [] as string[],
  });

  const [editingCriteria, setEditingCriteria] = useState<string | null>(null);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    weight: 25,
  });
  const [showNewCriteriaForm, setShowNewCriteriaForm] = useState(false);
  const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>({});
  const [creatingCriteria, setCreatingCriteria] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (rubricId) {
      fetchRubric();
      fetchCriteriaAndLevels();
    }
  }, [rubricId]);

  const fetchRubric = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rubrics/${rubricId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch rubric');
      }
      const data = await response.json();
      setRubric(data.rubric);
      const criteriaIds = data.rubric.criteria.map((c: RubricCriteria) => c.id);
      const weights: Record<string, number> = {};
      data.rubric.criteria.forEach((c: RubricCriteria) => {
        weights[c.id] = c.weight;
      });
      
      setFormData({
        name: data.rubric.name,
        description: data.rubric.description || '',
        totalPoints: data.rubric.totalPoints,
        selectedCriteriaIds: criteriaIds,
        selectedLevelIds: data.rubric.levels.map((l: RubricLevel) => l.id),
      });
      setCriteriaWeights(weights);
      setSelectedCriteria(data.rubric.criteria);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCriteriaAndLevels = async () => {
    try {
      const response = await fetch('/api/rubrics/criteria-levels');
      if (!response.ok) {
        throw new Error('Failed to fetch criteria and levels');
      }
      const data = await response.json();
      setAllCriteria(data.criteria);
      setAllLevels(data.levels);
      
      // Initialize weights for all criteria
      const weights: Record<string, number> = {};
      data.criteria.forEach((c: RubricCriteria) => {
        weights[c.id] = c.weight;
      });
      setCriteriaWeights((prev) => ({ ...prev, ...weights }));
    } catch (error: any) {
      console.error('Error fetching criteria and levels:', error);
    }
  };

  // Calculate total weight of selected criteria
  const calculateTotalWeight = () => {
    return selectedCriteria.reduce((sum, criteria) => {
      const weight = criteriaWeights[criteria.id] ?? criteria.weight;
      return sum + weight;
    }, 0);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!formData.name.trim()) {
        setError('Rubric name is required');
        return;
      }

      if (formData.selectedCriteriaIds.length === 0) {
        setError('At least one criterion must be selected');
        return;
      }

      if (formData.selectedLevelIds.length === 0) {
        setError('At least one level must be selected');
        return;
      }

      // Validate that criteria weights sum to 100
      const totalWeight = calculateTotalWeight();
      if (totalWeight !== 100) {
        setError(`Criteria weights must sum to exactly 100%. Current total: ${totalWeight}%. Please adjust the weights or use "Auto-adjust to 100%" button.`);
        return;
      }

      // Prepare criteria weights map
      const criteriaWeightsMap: Record<string, number> = {};
      selectedCriteria.forEach((criteria) => {
        const weight = criteriaWeights[criteria.id] ?? criteria.weight;
        criteriaWeightsMap[criteria.id] = weight;
      });

      const response = await fetch(`/api/rubrics/${rubricId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          totalPoints: formData.totalPoints,
          criteriaIds: formData.selectedCriteriaIds,
          levelIds: formData.selectedLevelIds,
          criteriaWeights: criteriaWeightsMap, // Include updated weights
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update rubric');
      }

      setSuccess('Rubric updated successfully');
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleCriterion = (criteriaId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCriteriaIds: prev.selectedCriteriaIds.includes(criteriaId)
        ? prev.selectedCriteriaIds.filter((id) => id !== criteriaId)
        : [...prev.selectedCriteriaIds, criteriaId],
    }));
    
    // Update selected criteria list
    if (formData.selectedCriteriaIds.includes(criteriaId)) {
      // Remove from selected
      setSelectedCriteria((prev) => prev.filter((c) => c.id !== criteriaId));
    } else {
      // Add to selected
      const criteria = allCriteria.find((c) => c.id === criteriaId);
      if (criteria) {
        setSelectedCriteria((prev) => [...prev, criteria]);
      }
    }
  };

  const removeCriterion = (criteriaId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCriteriaIds: prev.selectedCriteriaIds.filter((id) => id !== criteriaId),
    }));
    setSelectedCriteria((prev) => prev.filter((c) => c.id !== criteriaId));
  };

  const addExistingCriterion = (criteriaId: string) => {
    if (formData.selectedCriteriaIds.includes(criteriaId)) {
      return; // Already added
    }
    
    const criteria = allCriteria.find((c) => c.id === criteriaId);
    if (criteria) {
      // Calculate current total weight
      const currentTotal = calculateTotalWeight();
      const newTotal = currentTotal + criteria.weight;
      
      // If adding this criterion would exceed 100%, adjust it
      let adjustedWeight = criteria.weight;
      if (newTotal > 100) {
        adjustedWeight = Math.max(0, 100 - currentTotal);
        if (adjustedWeight === 0) {
          setError('Cannot add more criteria. Total weight would exceed 100%. Please adjust existing criteria weights first.');
          return;
        }
      }
      
      setFormData((prev) => ({
        ...prev,
        selectedCriteriaIds: [...prev.selectedCriteriaIds, criteriaId],
      }));
      setSelectedCriteria((prev) => [...prev, criteria]);
      setCriteriaWeights((prev) => ({
        ...prev,
        [criteriaId]: adjustedWeight,
      }));
      
      // Show feedback about total weight
      const finalTotal = currentTotal + adjustedWeight;
      if (finalTotal === 100) {
        setSuccess(`Criterion added. Total weight: 100%`);
        setTimeout(() => setSuccess(''), 2000);
      } else if (adjustedWeight !== criteria.weight) {
        setSuccess(`Criterion added with adjusted weight (${adjustedWeight}% instead of ${criteria.weight}%) to prevent exceeding 100%. Total: ${finalTotal}%`);
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  const toggleLevel = (levelId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedLevelIds: prev.selectedLevelIds.includes(levelId)
        ? prev.selectedLevelIds.filter((id) => id !== levelId)
        : [...prev.selectedLevelIds, levelId],
    }));
  };

  const handleCreateCriteria = async () => {
    if (creatingCriteria) return; // Prevent double submission
    
    try {
      setCreatingCriteria(true);
      setError('');
      setSuccess('');

      if (!newCriteria.name.trim()) {
        setError('Criterion name is required');
        setCreatingCriteria(false);
        return;
      }

      // Calculate current total weight
      const currentTotal = calculateTotalWeight();
      const newTotal = currentTotal + newCriteria.weight;

      // If adding this criterion would exceed 100%, adjust it
      let adjustedWeight = newCriteria.weight;
      if (newTotal > 100) {
        adjustedWeight = Math.max(0, 100 - currentTotal);
        if (adjustedWeight === 0) {
          setError('Cannot add more criteria. Total weight would exceed 100%. Please adjust existing criteria weights first.');
          setCreatingCriteria(false);
          return;
        }
        setNewCriteria({ ...newCriteria, weight: adjustedWeight });
      }

      const response = await fetch('/api/rubrics/criteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newCriteria, weight: adjustedWeight }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create criterion');
      }

      const data = await response.json();
      const newCriterion = data.criterion;

      // Refresh criteria list
      await fetchCriteriaAndLevels();

      // Add to selected criteria
      setFormData((prev) => ({
        ...prev,
        selectedCriteriaIds: [...prev.selectedCriteriaIds, newCriterion.id],
      }));

      // Add to selected criteria list
      setSelectedCriteria((prev) => [...prev, newCriterion]);

      // Set weight
      setCriteriaWeights((prev) => ({
        ...prev,
        [newCriterion.id]: adjustedWeight,
      }));

      // Reset form
      setNewCriteria({ name: '', description: '', weight: 25 });
      setShowNewCriteriaForm(false);
      setSuccess('Criterion created successfully');
      setTimeout(() => setSuccess(''), 2000);
      
      // Check if total is now 100
      const finalTotal = calculateTotalWeight() + adjustedWeight;
      if (finalTotal === 100) {
        setSuccess('Criterion created and added to rubric. Total weight: 100%');
      } else {
        setSuccess(`Criterion created and added to rubric. Total weight: ${finalTotal}% (should be 100%)`);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCreatingCriteria(false);
    }
  };

  const handleUpdateCriteria = async (criteriaId: string, updates: Partial<RubricCriteria>) => {
    try {
      const response = await fetch(`/api/rubrics/criteria/${criteriaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update criterion');
      }

      const data = await response.json();
      const updatedCriterion = data.criterion;

      // Refresh criteria list to get latest data
      await fetchCriteriaAndLevels();

      // Update in selected criteria list
      setSelectedCriteria((prev) =>
        prev.map((c) => (c.id === criteriaId ? updatedCriterion : c))
      );

      // Update weight if changed
      if (updates.weight !== undefined) {
        setCriteriaWeights((prev) => ({
          ...prev,
          [criteriaId]: updates.weight!,
        }));
      }

      setEditingCriteria(null);
      setSuccess('Criterion updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Drag and drop handlers for reordering criteria
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Reorder criteria
    const newCriteria = [...selectedCriteria];
    const [removed] = newCriteria.splice(draggedIndex, 1);
    newCriteria.splice(dropIndex, 0, removed);

    // Update selected criteria and IDs in the same order
    setSelectedCriteria(newCriteria);
    setFormData((prev) => ({
      ...prev,
      selectedCriteriaIds: newCriteria.map((c) => c.id),
    }));

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Normalize weights to sum to 100
  const normalizeWeights = () => {
    const totalWeight = calculateTotalWeight();
    if (totalWeight === 0 || selectedCriteria.length === 0) return;

    const normalizedWeights: Record<string, number> = {};
    let remaining = 100;

    // Distribute weights proportionally
    selectedCriteria.forEach((criteria, index) => {
      const currentWeight = criteriaWeights[criteria.id] ?? criteria.weight;
      if (index === selectedCriteria.length - 1) {
        // Last criterion gets the remainder to ensure exact 100
        normalizedWeights[criteria.id] = remaining;
      } else {
        const normalized = Math.round((currentWeight / totalWeight) * 100);
        normalizedWeights[criteria.id] = normalized;
        remaining -= normalized;
      }
    });

    // Update all weights
    Object.entries(normalizedWeights).forEach(([id, weight]) => {
      handleUpdateCriteriaWeight(id, weight, false); // false = don't validate total
    });
  };

  const handleUpdateCriteriaWeight = async (criteriaId: string, weight: number, validateTotal: boolean = true) => {
    if (weight < 0 || weight > 100) {
      setError('Weight must be between 0 and 100');
      const currentCriteria = allCriteria.find((c) => c.id === criteriaId);
      if (currentCriteria) {
        setCriteriaWeights((prev) => ({
          ...prev,
          [criteriaId]: currentCriteria.weight,
        }));
      }
      return;
    }

    // Update local state first for immediate UI feedback
    const updatedWeights = {
      ...criteriaWeights,
      [criteriaId]: weight,
    };
    setCriteriaWeights(updatedWeights);

    // Calculate new total
    const newTotal = selectedCriteria.reduce((sum, criteria) => {
      const w = criteria.id === criteriaId ? weight : (updatedWeights[criteria.id] ?? criteria.weight);
      return sum + w;
    }, 0);

    // Validate total if requested
    if (validateTotal && newTotal !== 100) {
      setError(`Criteria weights must sum to 100%. Current total: ${newTotal}%`);
      // Don't update on server yet, let user fix it
      return;
    }

    try {
      const response = await fetch(`/api/rubrics/criteria/${criteriaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weight }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update criterion weight');
      }

      // Update in all criteria list without full refresh
      setAllCriteria((prev) =>
        prev.map((c) => (c.id === criteriaId ? { ...c, weight } : c))
      );

      // Update in selected criteria list
      setSelectedCriteria((prev) =>
        prev.map((c) => (c.id === criteriaId ? { ...c, weight } : c))
      );

      // Clear error if total is now 100
      if (newTotal === 100) {
        setError('');
      }
    } catch (error: any) {
      setError(error.message);
      // Revert the weight change
      const currentCriteria = allCriteria.find((c) => c.id === criteriaId);
      if (currentCriteria) {
        setCriteriaWeights((prev) => ({
          ...prev,
          [criteriaId]: currentCriteria.weight,
        }));
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['instructor', 'admin']}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CardSkeleton />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!rubric) {
    return (
      <ProtectedRoute requiredRole={['instructor', 'admin']}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-red-600 dark:text-red-400">Rubric not found</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Rubric</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Update the rubric details, criteria, and levels
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
                onClick={() => setError('')}
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
            </div>
          )}

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
            {/* Basic Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rubric Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter rubric name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter rubric description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Points *
                  </label>
                  <input
                    type="number"
                    value={formData.totalPoints}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalPoints: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Criteria Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Criteria ({selectedCriteria.length})
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      calculateTotalWeight() === 100 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      Total Weight: {calculateTotalWeight()}%
                    </span>
                    {calculateTotalWeight() !== 100 && selectedCriteria.length > 0 && (
                      <>
                        <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                        <button
                          onClick={normalizeWeights}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                        >
                          Auto-adjust to 100%
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Add Existing Criteria Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addExistingCriterion(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    defaultValue=""
                  >
                    <option value="">Add Existing Criteria...</option>
                    {allCriteria
                      .filter((c) => !formData.selectedCriteriaIds.includes(c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      setShowNewCriteriaForm(!showNewCriteriaForm);
                      setNewCriteria({ name: '', description: '', weight: 25 });
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </button>
                </div>
              </div>

              {/* New Criteria Form */}
              {showNewCriteriaForm && (
                <div className="mb-4 p-4 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Create New Criterion</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={newCriteria.name}
                        onChange={(e) =>
                          setNewCriteria({ ...newCriteria, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter criterion name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newCriteria.description}
                        onChange={(e) =>
                          setNewCriteria({ ...newCriteria, description: e.target.value })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter criterion description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Weight (Marks Allocation) %
                      </label>
                      <input
                        type="number"
                        value={newCriteria.weight}
                        onChange={(e) =>
                          setNewCriteria({
                            ...newCriteria,
                            weight: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCreateCriteria}
                        disabled={creatingCriteria}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingCriteria ? (
                          <>
                            <ButtonSpinner size="sm" />
                            <span className="ml-2">Creating...</span>
                          </>
                        ) : (
                          'Create'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowNewCriteriaForm(false);
                          setNewCriteria({ name: '', description: '', weight: 25 });
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Criteria List - Only show selected criteria */}
              <div className="space-y-3">
                {selectedCriteria.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p>No criteria added yet. Add existing criteria or create a new one.</p>
                  </div>
                ) : (
                  selectedCriteria.map((criteria, index) => {
                    const isEditing = editingCriteria === criteria.id;
                    const weight = criteriaWeights[criteria.id] ?? criteria.weight;
                    const isDragging = draggedIndex === index;

                    return (
                      <div
                        key={criteria.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`border-2 border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-all cursor-move ${
                          isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Drag handle */}
                          <div className="flex-shrink-0 pt-1 cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                            <GripVertical size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isEditing ? (
                                <input
                                  type="text"
                                  defaultValue={criteria.name}
                                  onBlur={(e) => {
                                    if (e.target.value !== criteria.name) {
                                      handleUpdateCriteria(criteria.id, {
                                        name: e.target.value,
                                      });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.currentTarget.blur();
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingCriteria(null);
                                    }
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  autoFocus
                                />
                              ) : (
                                <h3
                                  className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                  onClick={() => setEditingCriteria(criteria.id)}
                                >
                                  {criteria.name}
                                </h3>
                              )}
                              {!isEditing && (
                                <button
                                  onClick={() => setEditingCriteria(criteria.id)}
                                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                  title="Edit criterion"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            {isEditing ? (
                              <textarea
                                defaultValue={criteria.description || ''}
                                onBlur={(e) => {
                                  if (e.target.value !== (criteria.description || '')) {
                                    handleUpdateCriteria(criteria.id, {
                                      description: e.target.value,
                                    });
                                  }
                                }}
                                rows={2}
                                className="w-full mb-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Enter description"
                              />
                            ) : (
                              criteria.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                  {criteria.description}
                                </p>
                              )
                            )}
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Weight (Marks Allocation):
                              </label>
                              <input
                                type="number"
                                value={weight}
                                onChange={(e) => {
                                  const newWeight = parseInt(e.target.value) || 0;
                                  setCriteriaWeights((prev) => ({
                                    ...prev,
                                    [criteria.id]: newWeight,
                                  }));
                                }}
                                onBlur={(e) => {
                                  const newWeight = parseInt(e.target.value) || 0;
                                  if (newWeight !== weight) {
                                    handleUpdateCriteriaWeight(criteria.id, newWeight, true);
                                  }
                                }}
                                min="0"
                                max="100"
                                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeCriterion(criteria.id)}
                            className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                            title="Remove from rubric"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Levels Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Levels ({formData.selectedLevelIds.length} selected)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allLevels.map((level) => {
                  const isSelected = formData.selectedLevelIds.includes(
                    level.id
                  );
                  return (
                    <div
                      key={level.id}
                      onClick={() => toggleLevel(level.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleLevel(level.id)}
                              className="mr-2"
                            />
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {level.name}
                            </h3>
                          </div>
                          {level.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {level.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {level.points} pts
                            </span>
                            {level.color && (
                              <span
                                className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: level.color }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <ButtonSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          {rubric.exerciseCount > 0 && (
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Note
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    This rubric is currently used by {rubric.exerciseCount}{' '}
                    exercise{rubric.exerciseCount !== 1 ? 's' : ''}. Changes
                    will affect all exercises using this rubric.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
