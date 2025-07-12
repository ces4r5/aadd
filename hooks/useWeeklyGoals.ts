import { WeeklyGoal } from '@/types';
import { useStorage } from './useStorage';

export function useWeeklyGoals() {
  const [weeklyGoals, setWeeklyGoals, isLoading] = useStorage<WeeklyGoal[]>('weeklyGoals', []);

  const createWeeklyGoal = async (
    name: string,
    subjects: string[],
    totalHours: number,
    distribution: 'uniform' | 'custom',
    customDailyHours?: Partial<WeeklyGoal['dailyHours']>,
    excludedDays: string[] = []
  ) => {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(weekStart);

    let dailyHours: WeeklyGoal['dailyHours'];

    if (distribution === 'uniform') {
      const activeDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        .filter(day => !excludedDays.includes(day));
      
      const hoursPerDay = activeDays.length > 0 ? totalHours / activeDays.length : 0;
      
      dailyHours = {
        monday: excludedDays.includes('monday') ? 0 : hoursPerDay,
        tuesday: excludedDays.includes('tuesday') ? 0 : hoursPerDay,
        wednesday: excludedDays.includes('wednesday') ? 0 : hoursPerDay,
        thursday: excludedDays.includes('thursday') ? 0 : hoursPerDay,
        friday: excludedDays.includes('friday') ? 0 : hoursPerDay,
        saturday: excludedDays.includes('saturday') ? 0 : hoursPerDay,
        sunday: excludedDays.includes('sunday') ? 0 : hoursPerDay,
      };
    } else {
      dailyHours = {
        monday: customDailyHours?.monday || 0,
        tuesday: customDailyHours?.tuesday || 0,
        wednesday: customDailyHours?.wednesday || 0,
        thursday: customDailyHours?.thursday || 0,
        friday: customDailyHours?.friday || 0,
        saturday: customDailyHours?.saturday || 0,
        sunday: customDailyHours?.sunday || 0,
      };
    }

    const goal: WeeklyGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      subjects,
      totalHours,
      weekStart,
      weekEnd,
      distribution,
      dailyHours,
      excludedDays,
      isActive: true,
      createdAt: new Date()
    };

    // Desativar outras metas ativas
    await setWeeklyGoals(prev => 
      prev.map(g => ({ ...g, isActive: false }))
    );

    // Adicionar nova meta
    await setWeeklyGoals(prev => [...prev, goal]);

    return goal;
  };

  const updateWeeklyGoal = async (goalId: string, updates: Partial<WeeklyGoal>) => {
    await setWeeklyGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates }
          : goal
      )
    );
  };

  const deleteWeeklyGoal = async (goalId: string) => {
    await setWeeklyGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getActiveGoal = () => {
    return weeklyGoals.find(goal => goal.isActive);
  };

  const getCurrentWeekGoals = () => {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(weekStart);
    
    return weeklyGoals.filter(goal => 
      goal.weekStart <= weekEnd && goal.weekEnd >= weekStart
    );
  };

  const setActiveGoal = async (goalId: string) => {
    await setWeeklyGoals(prev => 
      prev.map(goal => ({
        ...goal,
        isActive: goal.id === goalId
      }))
    );
  };

  return {
    weeklyGoals,
    isLoading,
    createWeeklyGoal,
    updateWeeklyGoal,
    deleteWeeklyGoal,
    getActiveGoal,
    getCurrentWeekGoals,
    setActiveGoal
  };
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para segunda-feira
  return new Date(d.setDate(diff));
}

function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}