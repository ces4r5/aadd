import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Plus, Calendar, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useWeeklyGoals } from '@/hooks/useWeeklyGoals';
import { useSubjects } from '@/hooks/useSubjects';
import { usePerformance } from '@/hooks/usePerformance';
import { CreateGoalModal } from '@/components/CreateGoalModal';

export default function Metas() {
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const { weeklyGoals, getActiveGoal } = useWeeklyGoals();
  const { subjects } = useSubjects();
  const { performances } = usePerformance();

  const activeGoal = getActiveGoal();
  
  // Calculate current week progress
  const getCurrentWeekProgress = () => {
    if (!activeGoal) return { completed: 0, total: 0, percentage: 0 };
    
    const weekStart = new Date(activeGoal.weekStart);
    const weekEnd = new Date(activeGoal.weekEnd);
    
    const weekPerformances = performances.filter(p => {
      const perfDate = new Date(p.date);
      return perfDate >= weekStart && perfDate <= weekEnd && 
             activeGoal.subjects.includes(p.subjectId);
    });
    
    const completed = weekPerformances.reduce((sum, p) => sum + p.hoursStudied, 0);
    const total = activeGoal.totalHours;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const weekProgress = getCurrentWeekProgress();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateGoal(true)}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeGoal ? (
          <View style={styles.summarySection}>
            <BlurView intensity={20} style={styles.summaryCard}>
              <LinearGradient
                colors={['rgba(96, 165, 250, 0.2)', 'rgba(96, 165, 250, 0.1)']}
                style={styles.summaryGradient}>
                <View style={styles.summaryHeader}>
                  <Target size={32} color="#60a5fa" />
                  <Text style={styles.summaryTitle}>{activeGoal.name}</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {weekProgress.completed.toFixed(1)} / {weekProgress.total} horas
                </Text>
                <Text style={styles.summaryPercentage}>{weekProgress.percentage}% concluído</Text>
                <View style={styles.summaryProgress}>
                  <View style={styles.summaryProgressBar}>
                    <View style={[styles.summaryProgressFill, { width: `${weekProgress.percentage}%` }]} />
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        ) : (
          <View style={styles.summarySection}>
            <BlurView intensity={20} style={styles.emptyGoalCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.emptyGoalGradient}>
                <Target size={48} color="#6b7280" />
                <Text style={styles.emptyGoalTitle}>Nenhuma meta ativa</Text>
                <Text style={styles.emptyGoalDescription}>
                  Crie sua primeira meta semanal para começar a acompanhar seu progresso
                </Text>
                <TouchableOpacity 
                  style={styles.emptyGoalButton}
                  onPress={() => setShowCreateGoal(true)}>
                  <Plus size={16} color="#60a5fa" />
                  <Text style={styles.emptyGoalButtonText}>Criar Meta</Text>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
          </View>
        )}

        {weeklyGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico de Metas</Text>
            
            {weeklyGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                subjects={subjects}
                performances={performances}
              />
            ))}
          </View>
        )}

        {activeGoal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribuição Semanal</Text>
            <WeeklyDistribution goal={activeGoal} performances={performances} />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <CreateGoalModal
        visible={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
        onSuccess={() => {}}
        subjects={subjects}
      />
    </View>
  );
}

function GoalCard({ goal, subjects, performances }) {
  const goalSubjects = subjects.filter((s) => goal.subjects.includes(s.id));
  const weekStart = new Date(goal.weekStart);
  const weekEnd = new Date(goal.weekEnd);
  
  const weekPerformances = performances.filter((p) => {
    const perfDate = new Date(p.date);
    return perfDate >= weekStart && perfDate <= weekEnd && 
           goal.subjects.includes(p.subjectId);
  });
  
  const completed = weekPerformances.reduce((sum, p) => sum + p.hoursStudied, 0);
  const percentage = goal.totalHours > 0 ? Math.round((completed / goal.totalHours) * 100) : 0;
  
  return (
    <TouchableOpacity style={styles.goalCard}>
      <BlurView intensity={20} style={styles.goalBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.goalGradient}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIcon}>
              <Target size={20} color={goal.isActive ? "#60a5fa" : "#6b7280"} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{goal.name}</Text>
              <Text style={styles.goalDescription}>
                {goalSubjects.map((s) => s.name).join(', ')}
              </Text>
              <Text style={styles.goalPeriod}>
                {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
              </Text>
            </View>
            {goal.isActive && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>Ativa</Text>
              </View>
            )}
          </View>
          
          <View style={styles.goalProgress}>
            <View style={styles.goalStats}>
              <Text style={styles.goalCurrent}>{completed.toFixed(1)}h</Text>
              <Text style={styles.goalTarget}>de {goal.totalHours}h</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${percentage}%`, backgroundColor: goal.isActive ? "#60a5fa" : "#6b7280" }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{percentage}%</Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
}

function WeeklyDistribution({ goal, performances }) {
  const DAYS = [
    { key: 'monday', label: 'Seg' },
    { key: 'tuesday', label: 'Ter' },
    { key: 'wednesday', label: 'Qua' },
    { key: 'thursday', label: 'Qui' },
    { key: 'friday', label: 'Sex' },
    { key: 'saturday', label: 'Sáb' },
    { key: 'sunday', label: 'Dom' },
  ];

  const getDateForDay = (dayKey) => {
    const weekStart = new Date(goal.weekStart);
    const dayIndex = DAYS.findIndex(d => d.key === dayKey);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    return date;
  };

  const getDayProgress = (dayKey) => {
    const date = getDateForDay(dayKey);
    const dayPerformances = performances.filter((p) => {
      const perfDate = new Date(p.date);
      return perfDate.toDateString() === date.toDateString() && 
             goal.subjects.includes(p.subjectId);
    });
    
    const completed = dayPerformances.reduce((sum, p) => sum + p.hoursStudied, 0);
    const target = (goal.dailyHours)[dayKey] || 0;
    const percentage = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
    
    return { completed, target, percentage };
  };

  return (
    <BlurView intensity={20} style={styles.distributionCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.distributionGradient}>
        <View style={styles.distributionGrid}>
          {DAYS.map((day) => {
            const progress = getDayProgress(day.key);
            const isExcluded = goal.excludedDays.includes(day.key);
            
            return (
              <View key={day.key} style={styles.dayCard}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                {isExcluded ? (
                  <Text style={styles.dayExcluded}>-</Text>
                ) : (
                  <>
                    <View style={styles.dayProgressBar}>
                      <View 
                        style={[
                          styles.dayProgressFill, 
                          { width: `${progress.percentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.dayHours}>
                      {progress.completed.toFixed(1)}/{progress.target}h
                    </Text>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summarySection: {
    marginBottom: 32,
  },
  summaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryGradient: {
    padding: 24,
    alignItems: 'center',
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  summaryPercentage: {
    fontSize: 16,
    color: '#60a5fa',
    fontWeight: '500',
    marginBottom: 16,
  },
  summaryProgress: {
    width: '100%',
  },
  summaryProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: 4,
  },
  emptyGoalCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyGoalGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyGoalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyGoalDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  emptyGoalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#60a5fa',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalGradient: {
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 4,
  },
  goalPeriod: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22c55e',
  },
  goalProgress: {
    gap: 8,
  },
  goalStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  goalCurrent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  goalTarget: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
    minWidth: 35,
    textAlign: 'right',
  },
  distributionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  distributionGradient: {
    padding: 16,
  },
  distributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCard: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: 8,
  },
  dayProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  dayProgressFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: 2,
  },
  dayHours: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  dayExcluded: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  completedCard: {
    marginBottom: 12,
  },
  completedBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  completedGradient: {
    padding: 16,
  },
  completedHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  completedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  completedDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
});