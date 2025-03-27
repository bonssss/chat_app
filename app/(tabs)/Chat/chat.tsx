import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

type Message = {
  id: string;
  text: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        Alert.alert('Error', 'Please log in to use chat');
        return;
      }
      setUserId(user.id);

      const userAId = 'd4f52b48-14c6-4717-b26a-11030e051403'; // User A
      const userBId = '66226eb9-b619-4c55-b62f-63837eca2c44'; // User B
      const newRecipientId = user.id === userAId ? userBId : userAId;
      console.log('User ID:', user.id, 'Recipient ID set to:', newRecipientId);
      setRecipientId(newRecipientId);
    };

    const fetchMessages = async () => {
      if (!userId || !recipientId) {
        console.log('Skipping fetch: userId or recipientId not set');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        console.log('Fetched messages:', data);
        setMessages(data || []);
      } catch (error: any) {
        console.error('Error fetching messages:', error.message);
        Alert.alert('Error', 'Failed to load messages: ' + error.message);
      }
    };

    fetchUser();
    if (userId && recipientId) fetchMessages();

    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        console.log('New message received:', newMessage);
        if (
          (newMessage.sender_id === userId && newMessage.recipient_id === recipientId) ||
          (newMessage.sender_id === recipientId && newMessage.recipient_id === userId)
        ) {
          setMessages((current) => [newMessage, ...current]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, recipientId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !recipientId) {
      Alert.alert('Error', 'Cannot send message: User or recipient not set');
      return;
    }

    const messageToSend = {
      text: newMessage.trim(),
      sender_id: userId,
      recipient_id: recipientId,
    };
    console.log('Sending message:', messageToSend);

    try {
      const { error } = await supabase
        .from('messages')
        .insert(messageToSend);

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error.message);
      Alert.alert('Error', 'Failed to send message: ' + error.message);
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
        <View style={styles.header}>
          <Text style={styles.title}>Chat with {recipientId || 'Loading...'} 💬</Text>
        </View>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          inverted
        />
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