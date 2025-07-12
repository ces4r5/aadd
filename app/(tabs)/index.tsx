import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Clock, BookOpen, Target, Timer } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useSubjects } from '@/hooks/useSubjects';
import { usePomodoro } from '@/hooks/usePomodoro';
import { DailyGoalBubble } from '@/components/DailyGoalBubble';
import { PomodoroTimer } from '@/components/PomodoroTimer';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const [showIndependentPomodoro, setShowIndependentPomodoro] = useState(true);
  const { getTodayGoals } = useDailyGoals();
  const { subjects } = useSubjects();
  const { getTotalStudyTime } = usePomodoro();
  
  const todayGoals = getTodayGoals();
  const totalTodayHours = subjects.reduce((sum, subject) => sum + getTotalStudyTime(subject.id), 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StudyHighway</Text>
        <Text style={styles.headerSubtitle}>Acelere seus estudos</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Independent Pomodoro Timer */}
        {showIndependentPomodoro && (
          <View style={styles.independentPomodoroSection}>
            <View style={styles.pomodoroHeader}>
              <Text style={styles.sectionTitle}>Cronômetro Independente</Text>
              <TouchableOpacity 
                style={styles.hideButton}
                onPress={() => setShowIndependentPomodoro(false)}>
                <Text style={styles.hideButtonText}>Ocultar</Text>
              </TouchableOpacity>
            </View>
            <PomodoroTimer />
          </View>
        )}

        {!showIndependentPomodoro && (
          <TouchableOpacity 
            style={styles.showPomodoroButton}
            onPress={() => setShowIndependentPomodoro(true)}>
            <Timer size={20} color="#60a5fa" />
            <Text style={styles.showPomodoroText}>Mostrar Cronômetro</Text>
          </TouchableOpacity>
        )}

        {/* Daily Goals */}
        {todayGoals.length > 0 && (
          <View style={styles.dailyGoalsSection}>
            <Text style={styles.sectionTitle}>Metas de Hoje</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.goalsScroll}>
              {todayGoals.map((goal) => (
                <DailyGoalBubble 
                  key={goal.subjectId} 
                  subjectId={goal.subjectId} 
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Progress Cards */}
        <View style={styles.cardGrid}>
          <GlassCard
            title="Horas Hoje"
            value={`${totalTodayHours.toFixed(1)}h`}
            icon={<Clock size={24} color="#60a5fa" />}
            trend="Hoje"
          />
          <GlassCard
            title="Streak"
            value="12 dias"
            icon={<TrendingUp size={24} color="#34d399" />}
            trend="+1"
          />
        </View>

        <View style={styles.cardGrid}>
          <GlassCard
            title="Matérias"
            value="8"
            icon={<BookOpen size={24} color="#f59e0b" />}
            trend="Ativas"
          />
          <GlassCard
            title="Meta Mensal"
            value="67%"
            icon={<Target size={24} color="#ef4444" />}
            trend="120h/180h"
          />
        </View>

        {/* Weekly Progress */}
        <View style={styles.weeklySection}>
          <Text style={styles.sectionTitle}>Progresso Semanal</Text>
          <BlurView intensity={20} style={styles.weeklyCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.weeklyCardGradient}>
              <View style={styles.weeklyStats}>
                <Text style={styles.weeklyHours}>28h 45m</Text>
                <Text style={styles.weeklyLabel}>Esta semana</Text>
              </View>
              <View style={styles.weeklyProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
                <Text style={styles.progressText}>75% da meta semanal</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <BlurView intensity={20} style={styles.activityCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.activityCardGradient}>
              <ActivityItem
                subject="Direito Constitucional"
                time="2h 15m"
                date="Hoje"
              />
              <ActivityItem
                subject="Português"
                time="1h 30m"
                date="Hoje"
              />
              <ActivityItem
                subject="Matemática"
                time="3h 00m"
                date="Ontem"
              />
            </LinearGradient>
          </BlurView>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function GlassCard({ title, value, icon, trend }: any) {
  return (
    <BlurView intensity={20} style={styles.glassCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.cardGradient}>
        <View style={styles.cardHeader}>
          {icon}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardTrend}>{trend}</Text>
      </LinearGradient>
    </BlurView>
  );
}

function ActivityItem({ subject, time, date }: any) {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityDot} />
      <View style={styles.activityDetails}>
        <Text style={styles.activitySubject}>{subject}</Text>
        <Text style={styles.activityTime}>{time} • {date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  independentPomodoroSection: {
    marginBottom: 24,
  },
  pomodoroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  hideButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  hideButtonText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  showPomodoroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  showPomodoroText: {
    fontSize: 14,
    color: '#60a5fa',
    fontWeight: '500',
  },
  dailyGoalsSection: {
    marginBottom: 24,
  },
  goalsScroll: {
    paddingHorizontal: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  glassCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardTrend: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  weeklySection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  weeklyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weeklyCardGradient: {
    padding: 20,
  },
  weeklyStats: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weeklyHours: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  weeklyLabel: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  weeklyProgress: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityCardGradient: {
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#60a5fa',
  },
  activityDetails: {
    flex: 1,
  },
  activitySubject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: '#9ca3af',
  },
});