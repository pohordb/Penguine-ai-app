import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LogOut, User, Shield, Circle as HelpCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <User size={20} color={Colors.textSecondary} />
              <Text style={styles.rowTitle}>Profile</Text>
            </View>
            <View style={styles.row}>
              <Shield size={20} color={Colors.textSecondary} />
              <Text style={styles.rowTitle}>Privacy</Text>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <HelpCircle size={20} color={Colors.textSecondary} />
              <Text style={styles.rowTitle}>Help & Support</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 24, color: Colors.text },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Inter-Bold', fontSize: 24, color: Colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Inter-Bold', fontSize: 18, color: Colors.text, marginBottom: 4 },
  profileEmail: { fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.textSecondary },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowTitle: { fontFamily: 'Inter-Regular', fontSize: 16, color: Colors.text },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.errorMuted,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 'auto',
    marginBottom: 32,
  },
  signOutText: { fontFamily: 'Inter-Bold', fontSize: 16, color: Colors.error },
});
