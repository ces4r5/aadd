import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Clock, Plus, ChevronRight, Filter, CreditCard as Edit3 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { usePerformance } from '@/hooks/usePerformance';
import { usePerformanceFilters } from '@/hooks/usePerformanceFilters';
import { AddSubjectsModal } from '@/components/AddSubjectsModal';
import { AddPerformanceModal } from '@/components/AddPerformanceModal';
import { PerformanceFiltersModal } from '@/components/PerformanceFiltersModal';
import { Priority } from '@/types';

export default function Estudos() {
  const [showAddSubjects, setShowAddSubjects] = useState(false);
  const [showAddPerformance, setShowAddPerformance] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const { subjects, isLoading: subjectsLoading, getSubjectsByPriority, deleteSubject } = useSubjects();
  const { getTodayPerformances } = usePerformance();
  const { 
    getFilteredSubjects, 
    getSubjectAverageAccuracy, 
    getTopicPerformanceColor,
    settings: filterSettings 
  } = usePerformanceFilters();

  const filteredSubjects = priorityFilter === 'all' 
    ? getFilteredSubjects(subjects)
    : getFilteredSubjects(getSubjectsByPriority(priorityFilter));

  const todayPerformances = getTodayPerformances();
  const todayHours = todayPerformances.reduce((sum, p) => sum + p.hoursStudied, 0);
  const todayQuestions = todayPerformances.reduce((sum, p) => sum + p.questionsResolved, 0);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baixa': return '#22c55e';
    }
  };

  const getAccuracyPercentage = (correct: number, total: number) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estudos</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowFilters(true)}>
            <Filter size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddPerformance(true)}>
            <Clock size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddSubjects(true)}>
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <BlurView intensity={20} style={styles.statCard}>
            <LinearGradient
              colors={['rgba(96, 165, 250, 0.2)', 'rgba(96, 165, 250, 0.1)']}
              style={styles.statGradient}>
              <Clock size={24} color="#60a5fa" />
              <Text style={styles.statValue}>{todayHours.toFixed(1)}h</Text>
              <Text style={styles.statLabel}>Hoje</Text>
            </LinearGradient>
          </BlurView>

          <BlurView intensity={20} style={styles.statCard}>
            <LinearGradient
              colors={['rgba(52, 211, 153, 0.2)', 'rgba(52, 211, 153, 0.1)']}
              style={styles.statGradient}>
              <BookOpen size={24} color="#34d399" />
              <Text style={styles.statValue}>{subjects.length}</Text>
              <Text style={styles.statLabel}>Matérias</Text>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Priority Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filtrar por Prioridade</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                priorityFilter === 'all' && styles.filterButtonSelected
              ]}
              onPress={() => setPriorityFilter('all')}>
              <Text style={[
                styles.filterText,
                priorityFilter === 'all' && styles.filterTextSelected
              ]}>
                Todas
              </Text>
            </TouchableOpacity>
            {(['alta', 'media', 'baixa'] as Priority[]).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterButton,
                  priorityFilter === priority && styles.filterButtonSelected
                ]}
                onPress={() => setPriorityFilter(priority)}>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
                <Text style={[
                  styles.filterText,
                  priorityFilter === priority && styles.filterTextSelected
                ]}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matérias</Text>
          
          {filteredSubjects.length === 0 ? (
            <BlurView intensity={20} style={styles.emptyCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.emptyGradient}>
                <BookOpen size={48} color="#6b7280" />
                <Text style={styles.emptyTitle}>Nenhuma matéria encontrada</Text>
                <Text style={styles.emptyDescription}>
                  {priorityFilter === 'all' 
                    ? 'Adicione suas primeiras matérias e tópicos'
                    : `Nenhuma matéria com prioridade ${priorityFilter}`
                  }
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setShowAddSubjects(true)}>
                  <Plus size={16} color="#60a5fa" />
                  <Text style={styles.emptyButtonText}>Adicionar Matérias</Text>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
          ) : (
            filteredSubjects.map((subject) => {
              const todaySubjectPerf = todayPerformances.filter(p => p.subjectId === subject.id);
              const todaySubjectHours = todaySubjectPerf.reduce((sum, p) => sum + p.hoursStudied, 0);
              const accuracy = getSubjectAverageAccuracy(subject.topics);
              const performanceColor = getTopicPerformanceColor(accuracy);
              
              return (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  name={subject.name}
                  totalHours={subject.totalHours}
                  todayHours={todaySubjectHours}
                  accuracy={accuracy}
                  topicsCount={subject.topics.length}
                  color={performanceColor}
                  priority={subject.priority}
                  onDelete={() => handleDeleteSubject(subject.id)}
                />
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AddSubjectsModal
        visible={showAddSubjects}
        onClose={() => setShowAddSubjects(false)}
        onSuccess={() => {}}
      />

      <AddPerformanceModal
        visible={showAddPerformance}
        onClose={() => setShowAddPerformance(false)}
        onSuccess={() => {}}
        subjects={subjects}
      />

      <PerformanceFiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );

  const handleDeleteSubject = (subjectId: string) => {
    Alert.alert(
      'Excluir Matéria',
      'Tem certeza que deseja excluir esta matéria? Todos os dados relacionados serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteSubject(subjectId) },
      ]
    );
  };
}

function SubjectCard({ subject, name, totalHours, todayHours, accuracy, topicsCount, color, priority, onDelete }: any) {
  return (
    <TouchableOpacity style={styles.subjectCard}>
      <BlurView intensity={20} style={styles.subjectBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.subjectGradient}>
          <View style={styles.subjectActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onDelete}>
              <Edit3 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <View style={styles.subjectHeader}>
            <View style={[styles.subjectColor, { backgroundColor: color }]} />
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{name}</Text>
              <View style={styles.subjectMeta}>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
                <Text style={styles.subjectPriority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </View>
              <Text style={styles.subjectTime}>
                Hoje: {todayHours.toFixed(1)}h • Total: {totalHours.toFixed(1)}h
              </Text>
              <Text style={styles.subjectStats}>
                {topicsCount} tópicos • {accuracy}% acertos
              </Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  filterScroll: {
    paddingHorizontal: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterButtonSelected: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderColor: '#60a5fa',
  },
  filterText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  filterTextSelected: {
    color: '#60a5fa',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  subjectCard: {
    marginBottom: 12,
  },
  subjectBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subjectGradient: {
    padding: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  subjectColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  subjectTime: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 2,
  },
  subjectStats: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
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
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#60a5fa',
  },
});