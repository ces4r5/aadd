import { useMemo } from 'react';
import { SubjectPerformanceStats } from '@/types';
import { useSubjects } from './useSubjects';
import { usePerformance } from './usePerformance';

export function usePerformanceStats() {
  const { subjects } = useSubjects();
  const { performances } = usePerformance();

  const subjectStats = useMemo(() => {
    return subjects.map(subject => {
      const subjectPerformances = performances.filter(p => p.subjectId === subject.id);
      
      // Calcular estatísticas básicas
      const totalHours = subject.totalHours;
      const totalQuestions = subject.totalQuestions;
      const totalCorrect = subject.totalCorrect;
      const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      
      // Encontrar melhor e pior tópico
      let bestTopic = '';
      let worstTopic = '';
      let bestAccuracy = -1;
      let worstAccuracy = 101;
      
      subject.topics.forEach(topic => {
        if (topic.questionsResolved > 0) {
          const accuracy = Math.round((topic.questionsCorrect / topic.questionsResolved) * 100);
          
          if (accuracy > bestAccuracy) {
            bestAccuracy = accuracy;
            bestTopic = topic.name;
          }
          
          if (accuracy < worstAccuracy) {
            worstAccuracy = accuracy;
            worstTopic = topic.name;
          }
        }
      });
      
      // Progresso semanal (últimos 7 dias)
      const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayPerformances = subjectPerformances.filter(p => 
          new Date(p.date).toDateString() === date.toDateString()
        );
        return dayPerformances.reduce((sum, p) => sum + p.hoursStudied, 0);
      });
      
      // Progresso mensal (últimos 30 dias)
      const monthlyProgress = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dayPerformances = subjectPerformances.filter(p => 
          new Date(p.date).toDateString() === date.toDateString()
        );
        return dayPerformances.reduce((sum, p) => sum + p.hoursStudied, 0);
      });

      return {
        subjectId: subject.id,
        totalHours,
        totalQuestions,
        totalCorrect,
        averageAccuracy,
        topicsCount: subject.topics.length,
        bestTopic: bestTopic || 'N/A',
        worstTopic: worstTopic || 'N/A',
        weeklyProgress,
        monthlyProgress,
      } as SubjectPerformanceStats;
    });
  }, [subjects, performances]);

  const getComparisonData = () => {
    return {
      totalStudyTime: subjectStats.reduce((sum, stat) => sum + stat.totalHours, 0),
      totalQuestions: subjectStats.reduce((sum, stat) => sum + stat.totalQuestions, 0),
      overallAccuracy: subjectStats.length > 0 
        ? Math.round(subjectStats.reduce((sum, stat) => sum + stat.averageAccuracy, 0) / subjectStats.length)
        : 0,
      bestSubject: subjectStats.reduce((best, current) => 
        current.averageAccuracy > best.averageAccuracy ? current : best, 
        subjectStats[0] || { averageAccuracy: 0, subjectId: '' }
      ),
      worstSubject: subjectStats.reduce((worst, current) => 
        current.averageAccuracy < worst.averageAccuracy ? current : worst,
        subjectStats[0] || { averageAccuracy: 100, subjectId: '' }
      ),
      mostStudiedSubject: subjectStats.reduce((most, current) => 
        current.totalHours > most.totalHours ? current : most,
        subjectStats[0] || { totalHours: 0, subjectId: '' }
      ),
    };
  };

  const getWeeklyComparison = () => {
    return subjectStats.map(stat => ({
      subjectId: stat.subjectId,
      weeklyTotal: stat.weeklyProgress.reduce((sum, hours) => sum + hours, 0),
      dailyAverage: stat.weeklyProgress.reduce((sum, hours) => sum + hours, 0) / 7,
      progress: stat.weeklyProgress,
    }));
  };

  const getTopicRanking = () => {
    const allTopics: any[] = [];
    
    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        if (topic.questionsResolved > 0) {
          const accuracy = Math.round((topic.questionsCorrect / topic.questionsResolved) * 100);
          allTopics.push({
            ...topic,
            subjectName: subject.name,
            accuracy,
          });
        }
      });
    });
    
    return allTopics.sort((a, b) => b.accuracy - a.accuracy);
  };

  return {
    subjectStats,
    getComparisonData,
    getWeeklyComparison,
    getTopicRanking,
  };
}