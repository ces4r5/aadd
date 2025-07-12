import { useState } from 'react';
import { Subject, Topic, Priority } from '@/types';
import { useStorage } from './useStorage';

export function useSubjects() {
  const [subjects, setSubjects, isLoading] = useStorage<Subject[]>('subjects', []);

  const parseSubjectsText = (text: string): { name: string; topics: string[]; priority: Priority }[] => {
    const result: { name: string; topics: string[]; priority: Priority }[] = [];
    
    // Remove espaços extras e quebras de linha
    const cleanText = text.trim().replace(/\n/g, '');
    
    // Divide por ponto e vírgula para separar matérias
    const subjectParts = cleanText.split(';').filter(part => part.trim());
    
    subjectParts.forEach(part => {
      const trimmedPart = part.trim();
      if (trimmedPart) {
        // Divide por dois pontos para separar matéria dos tópicos
        const [subjectName, topicsString] = trimmedPart.split(':');
        
        if (subjectName && topicsString) {
          const topics = topicsString.split(',')
            .map(topic => topic.trim())
            .filter(topic => topic);
          
          result.push({
            name: subjectName.trim(),
            topics,
            priority: 'media' // Prioridade padrão
          });
        }
      }
    });
    
    return result;
  };

  const addSubjectsFromText = async (text: string, defaultPriority: Priority = 'media') => {
    const parsedSubjects = parseSubjectsText(text);
    
    const newSubjects: Subject[] = parsedSubjects.map(parsed => {
      const subjectId = `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const topics: Topic[] = parsed.topics.map(topicName => ({
        id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: topicName,
        subjectId,
        hoursStudied: 0,
        questionsResolved: 0,
        questionsCorrect: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      return {
        id: subjectId,
        name: parsed.name,
        priority: defaultPriority,
        topics,
        totalHours: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    await setSubjects(prev => [...prev, ...newSubjects]);
    return newSubjects;
  };

  const updateSubjectPriority = async (subjectId: string, priority: Priority) => {
    await setSubjects(prev => 
      prev.map(subject => 
        subject.id === subjectId 
          ? { ...subject, priority, updatedAt: new Date() }
          : subject
      )
    );
  };

  const deleteSubject = async (subjectId: string) => {
    await setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
  };

  const getSubjectsByPriority = (priority?: Priority) => {
    if (!priority) return subjects;
    return subjects.filter(subject => subject.priority === priority);
  };

  const updateSubjectStats = async (subjectId: string) => {
    await setSubjects(prev => 
      prev.map(subject => {
        if (subject.id === subjectId) {
          const totalHours = subject.topics.reduce((sum, topic) => sum + topic.hoursStudied, 0);
          const totalQuestions = subject.topics.reduce((sum, topic) => sum + topic.questionsResolved, 0);
          const totalCorrect = subject.topics.reduce((sum, topic) => sum + topic.questionsCorrect, 0);
          
          return {
            ...subject,
            totalHours,
            totalQuestions,
            totalCorrect,
            updatedAt: new Date()
          };
        }
        return subject;
      })
    );
  };

  return {
    subjects,
    isLoading,
    addSubjectsFromText,
    updateSubjectPriority,
    deleteSubject,
    getSubjectsByPriority,
    updateSubjectStats,
    parseSubjectsText
  };
}