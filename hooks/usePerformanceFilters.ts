import { useState } from 'react';
import { PerformanceFilter, PerformanceSettings } from '@/types';
import { useStorage } from './useStorage';

const DEFAULT_FILTERS: PerformanceFilter[] = [
  {
    id: 'excellent',
    name: 'Excelente',
    minPercentage: 80,
    maxPercentage: 100,
    color: '#22c55e',
    isActive: true,
  },
  {
    id: 'good',
    name: 'Bom',
    minPercentage: 60,
    maxPercentage: 79,
    color: '#f59e0b',
    isActive: true,
  },
  {
    id: 'needs_improvement',
    name: 'Precisa Melhorar',
    minPercentage: 0,
    maxPercentage: 59,
    color: '#ef4444',
    isActive: true,
  },
];

export function usePerformanceFilters() {
  const [settings, setSettings, isLoading] = useStorage<PerformanceSettings>('performanceSettings', {
    filters: DEFAULT_FILTERS,
    showOnlyFiltered: false,
  });

  const getTopicPerformanceColor = (accuracy: number) => {
    const activeFilter = settings.filters.find(filter => 
      filter.isActive && 
      accuracy >= filter.minPercentage && 
      accuracy <= filter.maxPercentage
    );
    
    return activeFilter?.color || '#6b7280';
  };

  const getSubjectAverageAccuracy = (topics: any[]) => {
    if (topics.length === 0) return 0;
    
    const totalQuestions = topics.reduce((sum, topic) => sum + topic.questionsResolved, 0);
    const totalCorrect = topics.reduce((sum, topic) => sum + topic.questionsCorrect, 0);
    
    return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  };

  const updateFilter = async (filterId: string, updates: Partial<PerformanceFilter>) => {
    await setSettings(prev => ({
      ...prev,
      filters: prev.filters.map(filter =>
        filter.id === filterId ? { ...filter, ...updates } : filter
      ),
    }));
  };

  const toggleFilterActive = async (filterId: string) => {
    await setSettings(prev => ({
      ...prev,
      filters: prev.filters.map(filter =>
        filter.id === filterId ? { ...filter, isActive: !filter.isActive } : filter
      ),
    }));
  };

  const updateShowOnlyFiltered = async (show: boolean) => {
    await setSettings(prev => ({ ...prev, showOnlyFiltered: show }));
  };

  const resetToDefaults = async () => {
    await setSettings({
      filters: DEFAULT_FILTERS,
      showOnlyFiltered: false,
    });
  };

  const getFilteredTopics = (topics: any[]) => {
    if (!settings.showOnlyFiltered) return topics;
    
    return topics.filter(topic => {
      const accuracy = topic.questionsResolved > 0 
        ? Math.round((topic.questionsCorrect / topic.questionsResolved) * 100)
        : 0;
      
      return settings.filters.some(filter =>
        filter.isActive &&
        accuracy >= filter.minPercentage &&
        accuracy <= filter.maxPercentage
      );
    });
  };

  const getFilteredSubjects = (subjects: any[]) => {
    if (!settings.showOnlyFiltered) return subjects;
    
    return subjects.filter(subject => {
      const accuracy = getSubjectAverageAccuracy(subject.topics);
      
      return settings.filters.some(filter =>
        filter.isActive &&
        accuracy >= filter.minPercentage &&
        accuracy <= filter.maxPercentage
      );
    });
  };

  return {
    settings,
    isLoading,
    getTopicPerformanceColor,
    getSubjectAverageAccuracy,
    updateFilter,
    toggleFilterActive,
    updateShowOnlyFiltered,
    resetToDefaults,
    getFilteredTopics,
    getFilteredSubjects,
  };
}