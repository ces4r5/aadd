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
import { X, Plus, BookOpen } from 'lucide-react-native';
import { Priority } from '@/types';
import { useSubjects } from '@/hooks/useSubjects';

interface AddSubjectsModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSubjectsModal({ visible, onClose, onSuccess }: AddSubjectsModalProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [isLoading, setIsLoading] = useState(false);
  const { addSubjectsFromText, parseSubjectsText } = useSubjects();

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Erro', 'Por favor, insira o texto das matérias e tópicos.');
      return;
    }

    setIsLoading(true);
    try {
      const parsed = parseSubjectsText(text);
      if (parsed.length === 0) {
        Alert.alert('Erro', 'Formato inválido. Use: Matéria:tópico,tópico;Matéria:tópico;');
        return;
      }

      await addSubjectsFromText(text, priority);
      setText('');
      onSuccess();
      onClose();
      Alert.alert('Sucesso', `${parsed.length} matéria(s) adicionada(s) com sucesso!`);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao adicionar matérias. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baixa': return '#22c55e';
    }
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
                <BookOpen size={24} color="#60a5fa" />
                <Text style={styles.title}>Adicionar Matérias</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Formato do Texto</Text>
              <View style={styles.formatExample}>
                <Text style={styles.formatText}>
                  Matéria:tópico,tópico...;Matéria:tópico,tópico...;
                </Text>
              </View>
              
              <Text style={styles.exampleTitle}>Exemplo:</Text>
              <View style={styles.formatExample}>
                <Text style={styles.formatText}>
                  Direito Constitucional:Princípios,Direitos Fundamentais;Português:Gramática,Interpretação;
                </Text>
              </View>

              <Text style={styles.label}>Cole o Texto Aqui</Text>
              <TextInput
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                placeholder="Cole o texto das matérias e tópicos..."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Prioridade</Text>
              <View style={styles.priorityContainer}>
                {(['alta', 'media', 'baixa'] as Priority[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && { borderColor: getPriorityColor(p) }
                    ]}
                    onPress={() => setPriority(p)}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(p) }]} />
                    <Text style={[
                      styles.priorityText,
                      priority === p && { color: getPriorityColor(p) }
                    ]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.submitText}>
                {isLoading ? 'Adicionando...' : 'Adicionar Matérias'}
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
    marginBottom: 8,
  },
  formatExample: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  formatText: {
    fontSize: 14,
    color: '#60a5fa',
    fontFamily: 'monospace',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
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