import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Plus, Clock, Target, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Subject, Topic } from '@/types';
import { usePerformance } from '@/hooks/usePerformance';

interface AddPerformanceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
}

export function AddPerformanceModal({ visible, onClose, onSuccess, subjects }: AddPerformanceModalProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [hoursStudied, setHoursStudied] = useState('');
  const [questionsResolved, setQuestionsResolved] = useState('');
  const [questionsCorrect, setQuestionsCorrect] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addPerformance } = usePerformance();

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
  const availableTopics = selectedSubjectData?.topics || [];

  const handleSubmit = async () => {
    if (!selectedTopic) {
      Alert.alert('Erro', 'Por favor, selecione um tópico.');
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
      await addPerformance(selectedTopic, hours, resolved, correct, notes.trim() || undefined);
      
      // Reset form
      setSelectedSubject('');
      setSelectedTopic('');
      setHoursStudied('');
      setQuestionsResolved('');
      setQuestionsCorrect('');
      setNotes('');
      
      onSuccess();
      onClose();
      Alert.alert('Sucesso', 'Desempenho registrado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao registrar desempenho. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSubject('');
    setSelectedTopic('');
    setHoursStudied('');
    setQuestionsResolved('');
    setQuestionsCorrect('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
                <Target size={24} color="#34d399" />
                <Text style={styles.title}>Registrar Desempenho</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Matéria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectButton,
                      selectedSubject === subject.id && styles.subjectButtonSelected
                    ]}
                    onPress={() => {
                      setSelectedSubject(subject.id);
                      setSelectedTopic('');
                    }}>
                    <Text style={[
                      styles.subjectButtonText,
                      selectedSubject === subject.id && styles.subjectButtonTextSelected
                    ]}>
                      {subject.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedSubject && (
                <>
                  <Text style={styles.label}>Tópico</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll}>
                    {availableTopics.map((topic) => (
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
                </>
              )}

              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    <Clock size={16} color="#60a5fa" /> Horas
                  </Text>
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
                  <Text style={styles.inputLabel}>
                    <Target size={16} color="#f59e0b" /> Questões
                  </Text>
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
                <Text style={styles.inputLabel}>
                  <CheckCircle size={16} color="#22c55e" /> Questões Corretas
                </Text>
                <TextInput
                  style={styles.input}
                  value={questionsCorrect}
                  onChangeText={setQuestionsCorrect}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Observações (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Adicione observações sobre o estudo..."
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.submitText}>
                {isLoading ? 'Registrando...' : 'Registrar Desempenho'}
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
    maxHeight: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  notesInput: {
    minHeight: 80,
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