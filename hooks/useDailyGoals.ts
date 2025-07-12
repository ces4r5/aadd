import { DailyGoal } from '@/types';
import { useStorage } from './useStorage';
import { useWeeklyGoals } from './useWeeklyGoals';
import { usePomodoro } from './usePomodoro';

export function useDailyGoals() {
  const [dailyGoals, setDailyGoals, isLoading] = useStorage<DailyGoal[]>('dailyGoals', []);
  const { getActiveGoal } = useWeeklyGoals();
  const { getTotalStudyTime } = usePomodoro();

  const getTodayGoals = () => {
    const today = new Date().toDateString();
    const activeGoal = getActiveGoal();
    
    if (!activeGoal) return [];

    const dayOfWeek = new Date().getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayKey = dayKeys[dayOfWeek] as keyof typeof activeGoal.dailyHours;
    
    if (activeGoal.excludedDays.includes(currentDayKey)) return [];

    const targetHours = activeGoal.dailyHours[currentDayKey];
    if (targetHours <= 0) return [];

    // Distribuir horas entre matérias
    const hoursPerSubject = targetHours / activeGoal.subjects.length;

    return activeGoal.subjects.map(subjectId => {
      const completedHours = getTotalStudyTime(subjectId);
      
      return {
        subjectId,
        targetHours: hoursPerSubject,
        completedHours,
        date: today,
      };
    });
  };

  const getGoalProgress = (subjectId: string) => {
    const goals = getTodayGoals();
    const goal = goals.find(g => g.subjectId === subjectId);
    
    if (!goal) return { completed: 0, target: 0, percentage: 0, remaining: 0 };

    const percentage = goal.targetHours > 0 ? Math.min(100, Math.round((goal.completedHours / goal.targetHours) * 100)) : 0;
    const remaining = Math.max(0, goal.targetHours - goal.completedHours);

    return {
      completed: goal.completedHours,
      target: goal.targetHours,
      percentage,
      remaining,
    };
  };

  return {
    dailyGoals,
    isLoading,
    getTodayGoals,
    getGoalProgress,
  };
}