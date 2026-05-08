import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { MessageSquare, Plus, X, Trash2, LogOut } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';

interface Conversation {
  id: string;
  title: string;
}

interface SidebarProps {
  visible: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function Sidebar({ visible, conversations, activeId, onSelect, onNew, onDelete, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();

  if (!visible) return null;

  const sidebarWidth = Math.min(320, Dimensions.get('window').width * 0.85);

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={[styles.sidebar, { width: sidebarWidth }]} onPress={(e) => e.stopPropagation()}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoEmoji}>🐧</Text>
            <Text style={styles.brandName}>Penguine</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.newChatButton} onPress={onNew}>
          <Plus size={18} color={Colors.text} />
          <Text style={styles.newChatText}>New Chat</Text>
        </TouchableOpacity>

        <ScrollView style={styles.conversationList} showsVerticalScrollIndicator={false}>
          {conversations.length === 0 && (
            <Text style={styles.emptyText}>No conversations yet</Text>
          )}
          {conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              style={[styles.conversationItem, activeId === conv.id && styles.conversationItemActive]}
              onPress={() => onSelect(conv.id)}
              activeOpacity={0.7}
            >
              <MessageSquare size={16} color={Colors.textSecondary} />
              <Text style={styles.conversationTitle} numberOfLines={1}>{conv.title}</Text>
              {activeId === conv.id && (
                <TouchableOpacity onPress={() => onDelete(conv.id)} style={styles.deleteButton}>
                  <Trash2 size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
            <LogOut size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    zIndex: 100,
  },
  sidebar: {
    backgroundColor: Colors.sidebarBg,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoEmoji: { fontSize: 24 },
  brandName: { fontFamily: 'Inter-Bold', fontSize: 20, color: Colors.text },
  closeButton: { padding: 4 },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgTertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newChatText: { fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.text },
  conversationList: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  emptyText: { fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 32 },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  conversationItemActive: { backgroundColor: Colors.bgTertiary },
  conversationTitle: { fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.text, flex: 1 },
  deleteButton: { padding: 4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Inter-Bold', fontSize: 14, color: Colors.primary },
  userName: { fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.text, flex: 1 },
  signOutButton: { padding: 4 },
});
