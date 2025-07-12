export type Priority = 'alta' | 'media' | 'baixa';

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  hoursStudied: number;
  questionsResolved: number;
  questionsCorrect: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  priority: Priority;
  topics: Topic[];
  totalHours: number;
  totalQuestions: number;
  totalCorrect: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Performance {
  id: string;
  topicId: string;
  subjectId: string;
  hoursStudied: number;
  questionsResolved: number;
  questionsCorrect: number;
  date: Date;
  notes?: string;
}

export interface WeeklyGoal {
  id: string;
  name: string;
  subjects: string[]; // Subject IDs
  totalHours: number;
  weekStart: Date;
  weekEnd: Date;
  distribution: 'uniform' | 'custom';
  dailyHours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  excludedDays: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface DailyProgress {
  date: string;
  subjectId: string;
  topicId: string;
  hoursStudied: number;
  questionsResolved: number;
  questionsCorrect: number;
}

export interface PomodoroSession {
  id: string;
  subjectId?: string;
  topicId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // em minutos
  isCompleted: boolean;
  type: 'work' | 'break' | 'longBreak';
}

export interface PomodoroSettings {
  workDuration: number; // em minutos
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export interface DailyGoal {
  subjectId: string;
  targetHours: number;
  completedHours: number;
  date: string;
}

export interface PerformanceFilter {
  id: string;
  name: string;
  minPercentage: number;
  maxPercentage: number;
  color: string;
  isActive: boolean;
}

export interface PerformanceSettings {
  filters: PerformanceFilter[];
  showOnlyFiltered: boolean;
}

export interface SubjectPerformanceStats {
  subjectId: string;
  totalHours: number;
  totalQuestions: number;
  totalCorrect: number;
  averageAccuracy: number;
  topicsCount: number;
  bestTopic: string;
  worstTopic: string;
  weeklyProgress: number[];
  monthlyProgress: number[];
}