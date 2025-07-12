import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Trophy, ChartBar as BarChart3, Bell, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function Perfil() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <BlurView intensity={20} style={styles.profileCard}>
          <LinearGradient
            colors={['rgba(96, 165, 250, 0.2)', 'rgba(96, 165, 250, 0.1)']}
            style={styles.profileGradient}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={40} color="#60a5fa" />
              </View>
            </View>
            <Text style={styles.userName}>João Silva</Text>
            <Text style={styles.userTitle}>Concurseiro</Text>
            <Text style={styles.userGoal}>Meta: Aprovação TRT 2025</Text>
          </LinearGradient>
        </BlurView>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatsCard
            icon={<BarChart3 size={24} color="#60a5fa" />}
            value="247h"
            label="Total Estudado"
            color="rgba(96, 165, 250, 0.2)"
          />
          <StatsCard
            icon={<Trophy size={24} color="#f59e0b" />}
            value="15"
            label="Conquistas"
            color="rgba(245, 158, 11, 0.2)"
          />
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <MenuOption
            icon={<BarChart3 size={20} color="#60a5fa" />}
            title="Estatísticas"
            subtitle="Veja seu progresso detalhado"
          />
          <MenuOption
            icon={<Trophy size={20} color="#f59e0b" />}
            title="Conquistas"
            subtitle="Seus marcos e prêmios"
          />
          <MenuOption
            icon={<Bell size={20} color="#34d399" />}
            title="Notificações"
            subtitle="Configure seus lembretes"
          />
          <MenuOption
            icon={<Settings size={20} color="#9ca3af" />}
            title="Configurações"
            subtitle="Preferências do aplicativo"
          />
          <MenuOption
            icon={<HelpCircle size={20} color="#8b5cf6" />}
            title="Ajuda e Suporte"
            subtitle="Dúvidas e feedback"
          />
        </View>

        {/* Achievements Preview */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Conquistas Recentes</Text>
          
          <BlurView intensity={20} style={styles.achievementCard}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
              style={styles.achievementGradient}>
              <View style={styles.achievementHeader}>
                <View style={styles.achievementIcon}>
                  <Trophy size={24} color="#22c55e" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>Streak de 15 dias!</Text>
                  <Text style={styles.achievementDescription}>
                    Você estudou por 15 dias consecutivos
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>

          <BlurView intensity={20} style={styles.achievementCard}>
            <LinearGradient
              colors={['rgba(96, 165, 250, 0.2)', 'rgba(96, 165, 250, 0.1)']}
              style={styles.achievementGradient}>
              <View style={styles.achievementHeader}>
                <View style={styles.achievementIcon}>
                  <BarChart3 size={24} color="#60a5fa" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>100 horas completadas</Text>
                  <Text style={styles.achievementDescription}>
                    Primeira centena de horas de estudo
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatsCard({ icon, value, label, color }: any) {
  return (
    <BlurView intensity={20} style={styles.statsCard}>
      <LinearGradient
        colors={[color, 'rgba(255, 255, 255, 0.05)']}
        style={styles.statsGradient}>
        {icon}
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsLabel}>{label}</Text>
      </LinearGradient>
    </BlurView>
  );
}

function MenuOption({ icon, title, subtitle }: any) {
  return (
    <TouchableOpacity style={styles.menuOption}>
      <BlurView intensity={20} style={styles.menuBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.menuGradient}>
          <View style={styles.menuIcon}>
            {icon}
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuSubtitle}>{subtitle}</Text>
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 16,
    color: '#60a5fa',
    fontWeight: '500',
    marginBottom: 8,
  },
  userGoal: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  statsLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  menuSection: {
    gap: 12,
    marginBottom: 32,
  },
  menuOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  achievementsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  achievementCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  achievementGradient: {
    padding: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});