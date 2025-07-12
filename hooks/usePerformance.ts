import { Performance, Topic } from '@/types';
import { useStorage } from './useStorage';
import { useSubjects } from './useSubjects';

export function usePerformance() {
  const [performances, setPerformances, isLoading] = useStorage<Performance[]>('performances', []);
  const { subjects, setSubjects, updateSubjectStats } = useSubjects();

  const addPerformance = async (
    topicId: string,
    hoursStudied: number,
    questionsResolved: number,
    questionsCorrect: number,
    notes?: string
  ) => {
    // Encontrar o tópico e matéria
    const subject = subjects.find(s => s.topics.some(t => t.id === topicId));
    if (!subject) {
      throw new Error('Tópico não encontrado');
    }

    const topic = subject.topics.find(t => t.id === topicId);
    if (!topic) {
      throw new Error('Tópico não encontrado');
    }

    // Criar registro de performance
    const performance: Performance = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topicId,
      subjectId: subject.id,
      hoursStudied,
      questionsResolved,
      questionsCorrect,
      date: new Date(),
      notes
    };

    // Adicionar performance
    await setPerformances(prev => [...prev, performance]);

    // Atualizar estatísticas do tópico
    await setSubjects(prev => 
      prev.map(s => {
        if (s.id === subject.id) {
          return {
            ...s,
            topics: s.topics.map(t => {
              if (t.id === topicId) {
                return {
                  ...t,
                  hoursStudied: t.hoursStudied + hoursStudied,
                  questionsResolved: t.questionsResolved + questionsResolved,
                  questionsCorrect: t.questionsCorrect + questionsCorrect,
                  updatedAt: new Date()
                };
              }
              return t;
            }),
            updatedAt: new Date()
          };
        }
        return s;
      })
    );

    // Atualizar estatísticas da matéria
    await updateSubjectStats(subject.id);

    return performance;
  };

  const getPerformancesByTopic = (topicId: string) => {
    return performances.filter(p => p.topicId === topicId);
  };

  const getPerformancesBySubject = (subjectId: string) => {
    return performances.filter(p => p.subjectId === subjectId);
  };

  const getPerformancesByDate = (date: Date) => {
    const dateStr = date.toDateString();
    return performances.filter(p => p.date.toDateString() === dateStr);
  };

  const getTodayPerformances = () => {
    return getPerformancesByDate(new Date());
  };

  const deletePerformance = async (performanceId: string) => {
    const performance = performances.find(p => p.id === performanceId);
    if (!performance) return;

    // Remover performance
    await setPerformances(prev => prev.filter(p => p.id !== performanceId));

    // Atualizar estatísticas do tópico (subtrair valores)
    await setSubjects(prev => 
      prev.map(s => {
        if (s.id === performance.subjectId) {
          return {
            ...s,
            topics: s.topics.map(t => {
              if (t.id === performance.topicId) {
                return {
                  ...t,
                  hoursStudied: Math.max(0, t.hoursStudied - performance.hoursStudied),
                  questionsResolved: Math.max(0, t.questionsResolved - performance.questionsResolved),
                  questionsCorrect: Math.max(0, t.questionsCorrect - performance.questionsCorrect),
                  updatedAt: new Date()
                };
              }
              return t;
            }),
            updatedAt: new Date()
          };
        }
        return s;
      })
    );

    // Atualizar estatísticas da matéria
    await updateSubjectStats(performance.subjectId);
  };

  return {
    performances,
    isLoading,
    addPerformance,
    getPerformancesByTopic,
    getPerformancesBySubject,
    getPerformancesByDate,
    getTodayPerformances,
    deletePerformance
  };
}