import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Menu, Send, Square } from 'lucide-react-native';
import Sidebar from '@/components/Sidebar';
import { Colors } from '@/constants/colors';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const messages = activeConv?.messages || [];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const createNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setSidebarVisible(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    let convId = activeConvId;
    if (!convId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: input.trim().slice(0, 30),
        messages: [userMsg],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      convId = newConv.id;
    } else {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: [...c.messages, userMsg],
            title: c.messages.length === 0 ? userMsg.content.slice(0, 30) : c.title,
          };
        })
      );
    }

    setInput('');
    setIsTyping(true);

    try {
      const convMessages = conversations.find((c) => c.id === convId)?.messages || [];
      const apiMessages = [...convMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.error || 'Sorry, I could not generate a response.',
      };
      setConversations((prev) =>
        prev.map((c) => (c.id !== convId ? c : { ...c, messages: [...c.messages, aiMsg] }))
      );
    } catch {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      };
      setConversations((prev) =>
        prev.map((c) => (c.id !== convId ? c : { ...c, messages: [...c.messages, aiMsg] }))
      );
    } finally {
      setIsTyping(false);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
  };

  const selectConversation = (id: string) => {
    setActiveConvId(id);
    setSidebarVisible(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🐧</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <Menu size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {activeConv?.title || 'Penguine'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🐧</Text>
          <Text style={styles.emptyTitle}>How can I help you today?</Text>
          <Text style={styles.emptySubtitle}>Start a conversation with Penguine AI</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.aiAvatarSmall}>
            <Text style={styles.aiAvatarText}>🐧</Text>
          </View>
          <View style={styles.typingBubble}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Message Penguine..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={4000}
            editable={!isTyping}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendButtonDisabled]}
            disabled={!input.trim() || isTyping}
            activeOpacity={0.7}
          >
            {isTyping ? <Square size={18} color="#fff" /> : <Send size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {sidebarVisible && (
        <View style={styles.sidebarWrapper} pointerEvents="box-none">
          <Sidebar
            visible={sidebarVisible}
            conversations={conversations.map((c) => ({ id: c.id, title: c.title }))}
            activeId={activeConvId}
            onSelect={selectConversation}
            onNew={createNewChat}
            onDelete={deleteConversation}
            onClose={() => setSidebarVisible(false)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  menuButton: { padding: 8, borderRadius: 8 },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: Colors.text, flex: 1, textAlign: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 24, color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontFamily: 'Inter-Regular', fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
  messageList: { flex: 1 },
  messageListContent: { paddingHorizontal: 16, paddingVertical: 16 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
  messageRowUser: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  aiAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: { fontSize: 16 },
  messageBubble: { maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  userBubble: { backgroundColor: Colors.userBubble, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: Colors.aiBubble, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  messageText: { fontFamily: 'Inter-Regular', fontSize: 15, lineHeight: 22, color: Colors.text },
  userMessageText: { color: '#fff' },
  typingContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  typingBubble: {
    backgroundColor: Colors.aiBubble,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
  inputContainer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    maxHeight: 120,
    paddingVertical: 4,
    lineHeight: 22,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: Colors.bgTertiary },
  sidebarWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
});
