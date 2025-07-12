import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Target, Calendar } from 'lucide-react-native';
import { Subject, WeeklyGoal } from '@/types';
import { useWeeklyGoals } from '@/hooks/useWeeklyGoals';

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
}

const DAYS = [
  { key: 'monday', label: 'Seg' },
  { key: 'tuesday', label: 'Ter' },
  { key: 'wednesday', label: 'Qua' },
  { key: 'thursday', label: 'Qui' },
  { key: 'friday', label: 'Sex' },
  { key: 'saturday', label: 'Sáb' },
  { key: 'sunday', label: 'Dom' },
];

export function CreateGoalModal({ visible, onClose, onSuccess, subjects }: CreateGoalModalProps) {
  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [totalHours, setTotalHours] = useState('');
  const [distribution, setDistribution] = useState<'uniform' | 'custom'>('uniform');
  const [excludedDays, setExcludedDays] = useState<string[]>([]);
  const [customHours, setCustomHours] = useState<Record<string, string>>({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { createWeeklyGoal } = useWeeklyGoals();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a meta.');
      return;
    }

    if (selectedSubjects.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos uma matéria.');
      return;
    }

    const hours = parseFloat(totalHours);
    if (!hours || hours <= 0) {
      Alert.alert('Erro', 'Insira uma carga horária válida.');
      return;
    }

    if (distribution === 'custom') {
      const customTotal = Object.entries(customHours)
        .filter(([day]) => !excludedDays.includes(day))
        .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);
      
      if (Math.abs(customTotal - hours) > 0.1) {
        Alert.alert('Erro', `A soma das horas customizadas (${customTotal}h) deve ser igual ao total (${hours}h).`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const customDailyHours = distribution === 'custom' 
        ? Object.fromEntries(
            Object.entries(customHours).map(([day, value]) => [day, parseFloat(value) || 0])
          )
        : undefined;

      await createWeeklyGoal(
        name.trim(),
        selectedSubjects,
        hours,
        distribution,
        customDailyHours,
        excludedDays
      );

      // Reset form
      setName('');
      setSelectedSubjects([]);
      setTotalHours('');
      setDistribution('uniform');
      setExcludedDays([]);
      setCustomHours({
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
      });

      onSuccess();
      onClose();
      Alert.alert('Sucesso', 'Meta semanal criada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar meta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleDay = (day: string) => {
    setExcludedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const calculateUniformHours = () => {
    const activeDays = DAYS.filter(day => !excludedDays.includes(day.key)).length;
    const hours = parseFloat(totalHours) || 0;
    return activeDays > 0 ? (hours / activeDays).toFixed(1) : '0';
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.modalContent}>
            
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Target size={24} color="#60a5fa" />
                <Text style={styles.title}>Nova Meta Semanal</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome da Meta</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Meta de Janeiro"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Carga Horária Total (horas)</Text>
                <TextInput
                  style={styles.input}
                  value={totalHours}
                  onChangeText={setTotalHours}
                  placeholder="40"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.label}>Matérias</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectButton,
                      selectedSubjects.includes(subject.id) && styles.subjectButtonSelected
                    ]}
                    onPress={() => toggleSubject(subject.id)}>
                    <Text style={[
                      styles.subjectButtonText,
                      selectedSubjects.includes(subject.id) && styles.subjectButtonTextSelected
                    ]}>
                      {subject.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Distribuição</Text>
              <View style={styles.distributionContainer}>
                <TouchableOpacity
                  style={[
                    styles.distributionButton,
                    distribution === 'uniform' && styles.distributionButtonSelected
                  ]}
                  onPress={() => setDistribution('uniform')}>
                  <Text style={[
                    styles.distributionText,
                    distribution === 'uniform' && styles.distributionTextSelected
                  ]}>
                    Uniforme
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.distributionButton,
                    distribution === 'custom' && styles.distributionButtonSelected
                  ]}
                  onPress={() => setDistribution('custom')}>
                  <Text style={[
                    styles.distributionText,
                    distribution === 'custom' && styles.distributionTextSelected
                  ]}>
                    Personalizada
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Dias da Semana</Text>
              <View style={styles.daysContainer}>
                {DAYS.map((day) => (
                  <View key={day.key} style={styles.dayItem}>
                    <TouchableOpacity
                      style={[
                        styles.dayButton,
                        !excludedDays.includes(day.key) && styles.dayButtonActive
                      ]}
                      onPress={() => toggleDay(day.key)}>
                      <Text style={[
                        styles.dayText,
                        !excludedDays.includes(day.key) && styles.dayTextActive
                      ]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                    
                    {distribution === 'custom' && !excludedDays.includes(day.key) && (
                      <TextInput
                        style={styles.dayInput}
                        value={customHours[day.key]}
                        onChangeText={(value) => setCustomHours(prev => ({ ...prev, [day.key]: value }))}
                        placeholder="0"
                        placeholderTextColor="#6b7280"
                        keyboardType="numeric"
                      />
                    )}
                    
                    {distribution === 'uniform' && !excludedDays.includes(day.key) && (
                      <Text style={styles.uniformHours}>{calculateUniformHours()}h</Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              <Calendar size={20} color="#ffffff" />
              <Text style={styles.submitText}>
                {isLoading ? 'Criando...' : 'Criar Meta'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxHeight: 500,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
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
  subjectScroll: {
    marginBottom: 20,
  },
  subjectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  subjectButtonSelected: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderColor: '#60a5fa',
  },
  subjectButtonText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  subjectButtonTextSelected: {
    color: '#60a5fa',
  },
  distributionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  distributionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  distributionButtonSelected: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderColor: '#60a5fa',
  },
  distributionText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  distributionTextSelected: {
    color: '#60a5fa',
  },
  daysContainer: {
    gap: 8,
    marginBottom: 24,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayButton: {
    width: 60,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: 'rgba(34, 211, 153, 0.2)',
    borderColor: '#34d399',
  },
  dayText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#34d399',
  },
  dayInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    padding: 8,
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  uniformHours: {
    flex: 1,
    fontSize: 14,
    color: '#34d399',
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#60a5fa',
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