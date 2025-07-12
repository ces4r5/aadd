import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Award, Clock, Target, ChartBar as BarChart3, Filter } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { usePerformanceStats } from '@/hooks/usePerformanceStats';
import { useSubjects } from '@/hooks/useSubjects';
import { usePerformanceFilters } from '@/hooks/usePerformanceFilters';
import { PerformanceFiltersModal } from '@/components/PerformanceFiltersModal';

const { width } = Dimensions.get('window');

export default function Analises() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'comparison' | 'ranking'>('overview');
  
  const { subjectStats, getComparisonData, getWeeklyComparison, getTopicRanking } = usePerformanceStats();
  const { subjects } = useSubjects();
  const { getSubjectAverageAccuracy, getTopicPerformanceColor } = usePerformanceFilters();
  
  const comparisonData = getComparisonData();
  const weeklyComparison = getWeeklyComparison();
  const topicRanking = getTopicRanking();

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Visão Geral</Text>
      
      <View style={styles.statsGrid}>
        <StatsCard
          title="Tempo Total"
          value={`${comparisonData.totalStudyTime.toFixed(1)}h`}
          icon={<Clock size={24} color="#60a5fa" />}
          subtitle="Estudado"
        />
        <StatsCard
          title="Questões"
          value={comparisonData.totalQuestions.toString()}
          icon={<Target size={24} color="#34d399" />}
          subtitle="Resolvidas"
        />
      </View>

      <View style={styles.statsGrid}>
        <StatsCard
          title="Precisão Geral"
          value={`${comparisonData.overallAccuracy}%`}
          icon={<Award size={24} color="#f59e0b" />}
          subtitle="Média"
        />
        <StatsCard
          title="Matérias"
          value={subjects.length.toString()}
          icon={<BarChart3 size={24} color="#8b5cf6" />}
          subtitle="Cadastradas"
        />
      </View>

      <Text style={styles.sectionTitle}>Desempenho por Matéria</Text>
      {subjectStats.map((stat) => {
        const subject = subjects.find(s => s.id === stat.subjectId);
        if (!subject) return null;

        const color = getTopicPerformanceColor(stat.averageAccuracy);
        
        return (
          <SubjectPerformanceCard
            key={stat.subjectId}
            subject={subject}
            stats={stat}
            color={color}
          />
        );
      })}
    </View>
  );

  const renderComparison = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Comparação Semanal</Text>
      
      {weeklyComparison.map((comparison) => {
        const subject = subjects.find(s => s.id === comparison.subjectId);
        if (!subject) return null;

        return (
          <WeeklyComparisonCard
            key={comparison.subjectId}
            subject={subject}
            comparison={comparison}
          />
        );
      })}

      <Text style={styles.sectionTitle}>Melhores vs Piores</Text>
      
      <View style={styles.comparisonGrid}>
        <ComparisonCard
          title="Melhor Matéria"
          value={subjects.find(s => s.id === comparisonData.bestSubject.subjectId)?.name || 'N/A'}
          subtitle={`${comparisonData.bestSubject.averageAccuracy}% de acertos`}
          color="#22c55e"
        />
        <ComparisonCard
          title="Precisa Melhorar"
          value={subjects.find(s => s.id === comparisonData.worstSubject.subjectId)?.name || 'N/A'}
          subtitle={`${comparisonData.worstSubject.averageAccuracy}% de acertos`}
          color="#ef4444"
        />
      </View>

      <ComparisonCard
        title="Mais Estudada"
        value={subjects.find(s => s.id === comparisonData.mostStudiedSubject.subjectId)?.name || 'N/A'}
        subtitle={`${comparisonData.mostStudiedSubject.totalHours.toFixed(1)} horas`}
        color="#60a5fa"
        fullWidth
      />
    </View>
  );

  const renderRanking = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ranking de Tópicos</Text>
      
      {topicRanking.slice(0, 20).map((topic, index) => {
        const color = getTopicPerformanceColor(topic.accuracy);
        
        return (
          <TopicRankingCard
            key={topic.id}
            topic={topic}
            position={index + 1}
            color={color}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Análises</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}>
          <Filter size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TabButton
          title="Visão Geral"
          isActive={selectedView === 'overview'}
          onPress={() => setSelectedView('overview')}
        />
        <TabButton
          title="Comparação"
          isActive={selectedView === 'comparison'}
          onPress={() => setSelectedView('comparison')}
        />
        <TabButton
          title="Ranking"
          isActive={selectedView === 'ranking'}
          onPress={() => setSelectedView('ranking')}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'comparison' && renderComparison()}
        {selectedView === 'ranking' && renderRanking()}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      <PerformanceFiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

function TabButton({ title, isActive, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}>
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function StatsCard({ title, value, icon, subtitle }: any) {
  return (
    <BlurView intensity={20} style={styles.statsCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.statsGradient}>
        <View style={styles.statsHeader}>
          {icon}
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </BlurView>
  );
}

function SubjectPerformanceCard({ subject, stats, color }: any) {
  return (
    <BlurView intensity={20} style={styles.performanceCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.performanceGradient}>
        <View style={styles.performanceHeader}>
          <View style={[styles.performanceIndicator, { backgroundColor: color }]} />
          <View style={styles.performanceInfo}>
            <Text style={styles.performanceName}>{subject.name}</Text>
            <Text style={styles.performanceStats}>
              {stats.totalHours.toFixed(1)}h • {stats.topicsCount} tópicos • {stats.averageAccuracy}% acertos
            </Text>
          </View>
        </View>
        
        <View style={styles.performanceDetails}>
          <Text style={styles.performanceDetail}>
            Melhor: {stats.bestTopic}
          </Text>
          <Text style={styles.performanceDetail}>
            Precisa melhorar: {stats.worstTopic}
          </Text>
        </View>
      </LinearGradient>
    </BlurView>
  );
}

function WeeklyComparisonCard({ subject, comparison }: any) {
  return (
    <BlurView intensity={20} style={styles.comparisonCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.comparisonGradient}>
        <Text style={styles.comparisonTitle}>{subject.name}</Text>
        <Text style={styles.comparisonValue}>
          {comparison.weeklyTotal.toFixed(1)}h esta semana
        </Text>
        <Text style={styles.comparisonAverage}>
          Média diária: {comparison.dailyAverage.toFixed(1)}h
        </Text>
        
        <View style={styles.progressChart}>
          {comparison.progress.map((hours: number, index: number) => (
            <View key={index} style={styles.chartBar}>
              <View 
                style={[
                  styles.chartBarFill, 
                  { 
                    height: `${Math.min(100, (hours / Math.max(...comparison.progress)) * 100)}%`,
                    backgroundColor: hours > 0 ? '#60a5fa' : '#374151'
                  }
                ]} 
              />
            </View>
          ))}
        </View>
      </LinearGradient>
    </BlurView>
  );
}

function ComparisonCard({ title, value, subtitle, color, fullWidth = false }: any) {
  return (
    <BlurView intensity={20} style={[styles.comparisonItem, fullWidth && styles.comparisonItemFull]}>
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.comparisonItemGradient}>
        <Text style={styles.comparisonItemTitle}>{title}</Text>
        <Text style={[styles.comparisonItemValue, { color }]}>{value}</Text>
        <Text style={styles.comparisonItemSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </BlurView>
  );
}

function TopicRankingCard({ topic, position, color }: any) {
  return (
    <BlurView intensity={20} style={styles.rankingCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.rankingGradient}>
        <View style={styles.rankingPosition}>
          <Text style={styles.rankingNumber}>{position}</Text>
        </View>
        
        <View style={styles.rankingInfo}>
          <Text style={styles.rankingTopic}>{topic.name}</Text>
          <Text style={styles.rankingSubject}>{topic.subjectName}</Text>
        </View>
        
        <View style={styles.rankingStats}>
          <Text style={[styles.rankingAccuracy, { color }]}>
            {topic.accuracy}%
          </Text>
          <Text style={styles.rankingQuestions}>
            {topic.questionsCorrect}/{topic.questionsResolved}
          </Text>
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  tabButtonTextActive: {
    color: '#60a5fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsGradient: {
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  performanceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  performanceGradient: {
    padding: 16,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  performanceIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  performanceStats: {
    fontSize: 14,
    color: '#9ca3af',
  },
  performanceDetails: {
    gap: 4,
  },
  performanceDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  comparisonCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  comparisonGradient: {
    padding: 16,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#60a5fa',
    marginBottom: 4,
  },
  comparisonAverage: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  progressChart: {
    flexDirection: 'row',
    height: 40,
    gap: 4,
    alignItems: 'flex-end',
  },
  chartBar: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 2,
    minHeight: 2,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  comparisonItem: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  comparisonItemFull: {
    flex: 'none',
    width: '100%',
  },
  comparisonItemGradient: {
    padding: 16,
    alignItems: 'center',
  },
  comparisonItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: 8,
  },
  comparisonItemValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  comparisonItemSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  rankingCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  rankingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  rankingPosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60a5fa',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingTopic: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  rankingSubject: {
    fontSize: 12,
    color: '#9ca3af',
  },
  rankingStats: {
    alignItems: 'flex-end',
  },
  rankingAccuracy: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  rankingQuestions: {
    fontSize: 12,
    color: '#9ca3af',
  },
});