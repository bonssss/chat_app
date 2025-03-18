import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

type Message = {
  id: string;
  text: string;
  sender_id: string; // User ID from Supabase auth
  created_at: string; // ISO timestamp from Supabase
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user and initial messages
  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to last 50 messages

      if (error) {
        console.error('Error fetching messages:', error);
        Alert.alert('Error', 'Failed to load messages');
      } else {
        setMessages(data || []);
      }
    };

    fetchUserAndMessages();

    // Real-time subscription
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((current) => [payload.new as Message, ...current]);
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        text: newMessage.trim(),
        sender_id: userId,
      });

    if (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } else {
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender_id === userId ? styles.myMessage : styles.partnerMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={['#ff6b6b', '#ff8787', '#ffb6b6']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Our Chat 💬</Text>
        </View>

        {/* Message List */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          inverted // New messages at bottom
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a sweet message..."
            placeholderTextColor="#999"
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Feather name="send" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
  },
  messageList: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: '#ff8787',
    alignSelf: 'flex-end',
  },
  partnerMessage: {
    backgroundColor: '#ffffffee',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
  },
});