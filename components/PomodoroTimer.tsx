import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Square, Settings, X } from 'lucide-react-native';
import { usePomodoro } from '@/hooks/usePomodoro';
import { PomodoroSettings } from '@/types';

interface PomodoroTimerProps {
  subjectId?: string;
  topicId?: string;
  onTimeUpdate?: (minutes: number) => void;
}

export function PomodoroTimer({ subjectId, topicId, onTimeUpdate }: PomodoroTimerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const {
    isRunning,
    timeLeft,
    currentType,
    settings,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    updateSettings,
    formatTime,
  } = usePomodoro();

  const handleStart = () => {
    if (timeLeft === 0) {
      startSession('work', subjectId, topicId);
    } else {
      resumeSession();
    }
  };

  const handlePause = () => {
    pauseSession();
  };

  const handleStop = () => {
    Alert.alert(
      'Parar Sessão',
      'Tem certeza que deseja parar a sessão atual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Parar', style: 'destructive', onPress: stopSession },
      ]
    );
  };

  const getTypeColor = () => {
    switch (currentType) {
      case 'work': return '#60a5fa';
      case 'break': return '#34d399';
      case 'longBreak': return '#f59e0b';
      default: return '#60a5fa';
    }
  };

  const getTypeLabel = () => {
    switch (currentType) {
      case 'work': return 'Trabalho';
      case 'break': return 'Pausa';
      case 'longBreak': return 'Pausa Longa';
      default: return 'Pomodoro';
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.timerCard}>
        <LinearGradient
          colors={[`${getTypeColor()}20`, `${getTypeColor()}10`]}
          style={styles.timerGradient}>
          
          <View style={styles.timerHeader}>
            <Text style={styles.typeLabel}>{getTypeLabel()}</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setShowSettings(true)}>
              <Settings size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.timerDisplay}>
            <Text style={[styles.timeText, { color: getTypeColor() }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          <View style={styles.controls}>
            {!isRunning ? (
              <TouchableOpacity 
                style={[styles.controlButton, styles.playButton]}
                onPress={handleStart}>
                <Play size={24} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.controlButton, styles.pauseButton]}
                onPress={handlePause}>
                <Pause size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
            
            {timeLeft > 0 && (
              <TouchableOpacity 
                style={[styles.controlButton, styles.stopButton]}
                onPress={handleStop}>
                <Square size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </BlurView>

      <PomodoroSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={updateSettings}
      />
    </View>
  );
}

function PomodoroSettingsModal({ visible, onClose, settings, onUpdate }: any) {
  const [workDuration, setWorkDuration] = useState(settings.workDuration.toString());
  const [shortBreak, setShortBreak] = useState(settings.shortBreakDuration.toString());
  const [longBreak, setLongBreak] = useState(settings.longBreakDuration.toString());
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(settings.sessionsUntilLongBreak.toString());

  const handleSave = () => {
    const newSettings: Partial<PomodoroSettings> = {
      workDuration: parseInt(workDuration) || 25,
      shortBreakDuration: parseInt(shortBreak) || 5,
      longBreakDuration: parseInt(longBreak) || 15,
      sessionsUntilLongBreak: parseInt(sessionsUntilLongBreak) || 4,
    };

    onUpdate(newSettings);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurações Pomodoro</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Duração do Trabalho (min)</Text>
              <TextInput
                style={styles.settingInput}
                value={workDuration}
                onChangeText={setWorkDuration}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Pausa Curta (min)</Text>
              <TextInput
                style={styles.settingInput}
                value={shortBreak}
                onChangeText={setShortBreak}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Pausa Longa (min)</Text>
              <TextInput
                style={styles.settingInput}
                value={longBreak}
                onChangeText={setLongBreak}
                keyboardType="numeric"
                placeholder="15"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sessões até Pausa Longa</Text>
              <TextInput
                style={styles.settingInput}
                value={sessionsUntilLongBreak}
                onChangeText={setSessionsUntilLongBreak}
                keyboardType="numeric"
                placeholder="4"
                placeholderTextColor="#6b7280"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  timerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerGradient: {
    padding: 20,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#22c55e',
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
  },
  stopButton: {
    backgroundColor: '#ef4444',
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
    maxWidth: 350,
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
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: 8,
  },
  settingInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#60a5fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});