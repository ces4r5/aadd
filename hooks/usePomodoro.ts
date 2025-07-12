import { useState, useEffect, useRef } from 'react';
import { PomodoroSession, PomodoroSettings } from '@/types';
import { useStorage } from './useStorage';
import { usePerformance } from './usePerformance';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
};

export function usePomodoro() {
  const [sessions, setSessions, isLoading] = useStorage<PomodoroSession[]>('pomodoroSessions', []);
  const [settings, setSettings] = useStorage<PomodoroSettings>('pomodoroSettings', DEFAULT_SETTINGS);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [currentType, setCurrentType] = useState<'work' | 'break' | 'longBreak'>('work');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addPerformance } = usePerformance();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const startSession = (type: 'work' | 'break' | 'longBreak', subjectId?: string, topicId?: string) => {
    const duration = type === 'work' 
      ? settings.workDuration 
      : type === 'longBreak' 
        ? settings.longBreakDuration 
        : settings.shortBreakDuration;

    const session: PomodoroSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subjectId,
      topicId,
      startTime: new Date(),
      duration,
      isCompleted: false,
      type,
    };

    setCurrentSession(session);
    setCurrentType(type);
    setTimeLeft(duration * 60);
    setIsRunning(true);
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resumeSession = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const stopSession = async () => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        isCompleted: false,
      };

      await setSessions(prev => [...prev, completedSession]);
    }

    resetSession();
  };

  const handleSessionComplete = async () => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        isCompleted: true,
      };

      await setSessions(prev => [...prev, completedSession]);

      // Se foi uma sessão de trabalho, registrar no desempenho
      if (currentType === 'work' && currentSession.subjectId && currentSession.topicId) {
        const hoursStudied = settings.workDuration / 60;
        await addPerformance(currentSession.topicId, hoursStudied, 0, 0, 'Sessão Pomodoro');
      }

      if (currentType === 'work') {
        setSessionCount(prev => prev + 1);
        
        // Determinar próximo tipo de sessão
        const nextType = (sessionCount + 1) % settings.sessionsUntilLongBreak === 0 
          ? 'longBreak' 
          : 'break';
        
        if (settings.autoStartBreaks) {
          startSession(nextType);
        } else {
          setCurrentType(nextType);
          resetSession();
        }
      } else {
        if (settings.autoStartWork) {
          startSession('work');
        } else {
          setCurrentType('work');
          resetSession();
        }
      }
    }
  };

  const resetSession = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setCurrentSession(null);
  };

  const updateSettings = async (newSettings: Partial<PomodoroSettings>) => {
    await setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return sessions.filter(session => 
      new Date(session.startTime).toDateString() === today
    );
  };

  const getTotalStudyTime = (subjectId?: string) => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(session => 
      new Date(session.startTime).toDateString() === today &&
      session.isCompleted &&
      session.type === 'work' &&
      (!subjectId || session.subjectId === subjectId)
    );

    return todaySessions.reduce((total, session) => total + session.duration, 0) / 60; // em horas
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    sessions,
    settings,
    isRunning,
    timeLeft,
    currentSession,
    currentType,
    sessionCount,
    isLoading,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    resetSession,
    updateSettings,
    getTodaySessions,
    getTotalStudyTime,
    formatTime,
  };
}