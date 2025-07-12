import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Filter, RotateCcw } from 'lucide-react-native';
import { usePerformanceFilters } from '@/hooks/usePerformanceFilters';

interface PerformanceFiltersModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PerformanceFiltersModal({ visible, onClose }: PerformanceFiltersModalProps) {
  const {
    settings,
    updateFilter,
    toggleFilterActive,
    updateShowOnlyFiltered,
    resetToDefaults,
  } = usePerformanceFilters();

  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ min: string; max: string }>({ min: '', max: '' });

  const handleEditFilter = (filterId: string) => {
    const filter = settings.filters.find(f => f.id === filterId);
    if (filter) {
      setTempValues({
        min: filter.minPercentage.toString(),
        max: filter.maxPercentage.toString(),
      });
      setEditingFilter(filterId);
    }
  };

  const handleSaveFilter = async () => {
    if (!editingFilter) return;

    const min = parseInt(tempValues.min);
    const max = parseInt(tempValues.max);

    if (isNaN(min) || isNaN(max) || min < 0 || max > 100 || min > max) {
      Alert.alert('Erro', 'Valores inválidos. Min deve ser menor que Max e entre 0-100.');
      return;
    }

    await updateFilter(editingFilter, {
      minPercentage: min,
      maxPercentage: max,
    });

    setEditingFilter(null);
    setTempValues({ min: '', max: '' });
  };

  const handleReset = () => {
    Alert.alert(
      'Resetar Filtros',
      'Tem certeza que deseja resetar todos os filtros para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetar', style: 'destructive', onPress: resetToDefaults },
      ]
    );
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
                <Filter size={24} color="#60a5fa" />
                <Text style={styles.title}>Filtros de Desempenho</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Mostrar apenas filtrados</Text>
                <Switch
                  value={settings.showOnlyFiltered}
                  onValueChange={updateShowOnlyFiltered}
                  trackColor={{ false: '#374151', true: '#60a5fa' }}
                  thumbColor={settings.showOnlyFiltered ? '#ffffff' : '#9ca3af'}
                />
              </View>

              <Text style={styles.sectionTitle}>Configurar Filtros</Text>

              {settings.filters.map((filter) => (
                <View key={filter.id} style={styles.filterItem}>
                  <View style={styles.filterHeader}>
                    <View style={styles.filterInfo}>
                      <View style={[styles.colorDot, { backgroundColor: filter.color }]} />
                      <Text style={styles.filterName}>{filter.name}</Text>
                    </View>
                    <Switch
                      value={filter.isActive}
                      onValueChange={() => toggleFilterActive(filter.id)}
                      trackColor={{ false: '#374151', true: filter.color }}
                      thumbColor={filter.isActive ? '#ffffff' : '#9ca3af'}
                    />
                  </View>

                  {editingFilter === filter.id ? (
                    <View style={styles.editContainer}>
                      <View style={styles.rangeInputs}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Min %</Text>
                          <TextInput
                            style={styles.rangeInput}
                            value={tempValues.min}
                            onChangeText={(text) => setTempValues(prev => ({ ...prev, min: text }))}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#6b7280"
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Max %</Text>
                          <TextInput
                            style={styles.rangeInput}
                            value={tempValues.max}
                            onChangeText={(text) => setTempValues(prev => ({ ...prev, max: text }))}
                            keyboardType="numeric"
                            placeholder="100"
                            placeholderTextColor="#6b7280"
                          />
                        </View>
                      </View>
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => setEditingFilter(null)}>
                          <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={handleSaveFilter}>
                          <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.rangeDisplay}
                      onPress={() => handleEditFilter(filter.id)}>
                      <Text style={styles.rangeText}>
                        {filter.minPercentage}% - {filter.maxPercentage}%
                      </Text>
                      <Text style={styles.editHint}>Toque para editar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <RotateCcw size={20} color="#ef4444" />
              <Text style={styles.resetButtonText}>Resetar para Padrão</Text>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  filterItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  filterName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  editContainer: {
    gap: 12,
  },
  rangeInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: 4,
  },
  rangeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  saveButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22c55e',
  },
  rangeDisplay: {
    alignItems: 'center',
    gap: 4,
  },
  rangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
  },
  editHint: {
    fontSize: 12,
    color: '#9ca3af',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 16,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
});