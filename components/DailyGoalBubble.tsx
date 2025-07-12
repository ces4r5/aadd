import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, X, Clock, Target } from 'lucide-react-native';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useSubjects } from '@/hooks/useSubjects';
import { usePerformance } from '@/hooks/usePerformance';
import { PomodoroTimer } from './PomodoroTimer';

interface DailyGoalBubbleProps {
  subjectId: string;
}

export function DailyGoalBubble({ subjectId }: DailyGoalBubbleProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const { getGoalProgress } = useDailyGoals();
  const { subjects } = useSubjects();
  const { addPerformance } = usePerformance();

  const subject = subjects.find(s => s.id === subjectId);
  const progress = getGoalProgress(subjectId);

  if (!subject || progress.target === 0) return null;

  const getProgressColor = () => {
    if (progress.percentage >= 100) return '#22c55e';
    if (progress.percentage >= 75) return '#34d399';
    if (progress.percentage >= 50) return '#60a5fa';
    if (progress.percentage >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const formatTime = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    if (h > 0) {
      return `${h}h${m > 0 ? ` ${m}m` : ''}`;
    }
    return `${m}m`;
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.bubble}
        onPress={() => setShowPomodoro(true)}>
        <BlurView intensity={20} style={styles.bubbleBlur}>
          <LinearGradient
            colors={[`${getProgressColor()}30`, `${getProgressColor()}20`]}
            style={styles.bubbleGradient}>
            
            <View style={styles.bubbleHeader}>
              <Text style={styles.subjectName} numberOfLines={1}>
                {subject.name}
              </Text>
              <TouchableOpacity 
                style={styles.quickAddButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setShowQuickAdd(true);
                }}>
                <Plus size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(100, progress.percentage)}%`,
                      backgroundColor: getProgressColor()
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {formatTime(progress.completed)} / {formatTime(progress.target)}
              </Text>
            </View>

            <Text style={styles.remainingText}>
              Faltam {formatTime(progress.remaining)}
            </Text>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>

      <QuickAddModal
        visible={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        subject={subject}
        onSuccess={() => setShowQuickAdd(false)}
      />

      <PomodoroModal
        visible={showPomodoro}
        onClose={() => setShowPomodoro(false)}
        subject={subject}
      />
    </>
  );
}

function QuickAddModal({ visible, onClose, subject, onSuccess }: any) {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [hoursStudied, setHoursStudied] = useState('');
  const [questionsResolved, setQuestionsResolved] = useState('');
  const [questionsCorrect, setQuestionsCorrect] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addPerformance } = usePerformance();

  const handleSubmit = async () => {
    if (!selectedTopic) {
      Alert.alert('Erro', 'Selecione um tópico.');
      return;
    }

    const hours = parseFloat(hoursStudied) || 0;
    const resolved = parseInt(questionsResolved) || 0;
    const correct = parseInt(questionsCorrect) || 0;

    if (hours <= 0 && resolved <= 0) {
      Alert.alert('Erro', 'Informe pelo menos as horas estudadas ou questões resolvidas.');
      return;
    }

    if (correct > resolved) {
      Alert.alert('Erro', 'Questões corretas não pode ser maior que questões resolvidas.');
      return;
    }

    setIsLoading(true);
    try {
      await addPerformance(selectedTopic, hours, resolved, correct, 'Registro rápido');
      
      setSelectedTopic('');
      setHoursStudied('');
      setQuestionsResolved('');
      setQuestionsCorrect('');
      
      onSuccess();
      Alert.alert('Sucesso', 'Desempenho registrado!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao registrar desempenho.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registro Rápido - {subject.name}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tópico</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll}>
                {subject.topics.map((topic: any) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.topicButton,
                      selectedTopic === topic.id && styles.topicButtonSelected
                    ]}
                    onPress={() => setSelectedTopic(topic.id)}>
                    <Text style={[
                      styles.topicButtonText,
                      selectedTopic === topic.id && styles.topicButtonTextSelected
                    ]}>
                      {topic.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Horas (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={hoursStudied}
                    onChangeText={setHoursStudied}
                    placeholder="0.0"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Questões</Text>
                  <TextInput
                    style={styles.input}
                    value={questionsResolved}
                    onChangeText={setQuestionsResolved}
                    placeholder="0"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Questões Corretas</Text>
                <TextInput
                  style={styles.input}
                  value={questionsCorrect}
                  onChangeText={setQuestionsCorrect}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.submitText}>
                {isLoading ? 'Registrando...' : 'Registrar'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </View>
    </Modal>
  );
}

function PomodoroModal({ visible, onClose, subject }: any) {
  const [selectedTopic, setSelectedTopic] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pomodoro - {subject.name}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Selecione o Tópico</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll}>
              {subject.topics.map((topic: any) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicButton,
                    selectedTopic === topic.id && styles.topicButtonSelected
                  ]}
                  onPress={() => setSelectedTopic(topic.id)}>
                  <Text style={[
                    styles.topicButtonText,
                    selectedTopic === topic.id && styles.topicButtonTextSelected
                  ]}>
                    {topic.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedTopic && (
              <PomodoroTimer 
                subjectId={subject.id} 
                topicId={selectedTopic}
              />
            )}
          </LinearGradient>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: 160,
    height: 120,
    marginRight: 12,
  },
  bubbleBlur: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bubbleGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  quickAddButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: 300,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 12,
  },
  topicScroll: {
    marginBottom: 20,
  },
  topicButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  topicButtonSelected: {
    backgroundColor: 'rgba(34, 211, 153, 0.2)',
    borderColor: '#34d399',
  },
  topicButtonText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  topicButtonTextSelected: {
    color: '#34d399',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#34d399',
    padding: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});