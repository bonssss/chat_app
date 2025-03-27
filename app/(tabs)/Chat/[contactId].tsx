import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

type Message = {
  id: string;
  text: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
};

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function ChatScreen() {
  const { contactId } = useLocalSearchParams();
  console.log('Chat screen received contactId:', contactId);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [contactProfile, setContactProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const validatedContactId =
      typeof contactId === 'string' &&
      contactId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
        ? contactId
        : null;

    if (!validatedContactId) {
      console.error('Invalid contactId received:', contactId);
      Alert.alert('Error', 'Invalid chat contact');
      router.back();
      return;
    }

    const setupChat = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'Please log in to use chat');
        return;
      }
      setUserId(user.id);

      console.log('Fetching profile for contactId:', validatedContactId);
      const { data: profileData, error: profileError, status } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', validatedContactId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching contact profile:', profileError.message, 'Status:', status);
        setContactProfile({ id: validatedContactId, username: 'Unknown', full_name: null, avatar_url: null });
      } else if (!profileData) {
        console.log('No profile found for contactId:', validatedContactId);
        setContactProfile({ id: validatedContactId, username: 'Unknown', full_name: null, avatar_url: null });
      } else {
        console.log('Fetched contact profile:', profileData);
        setContactProfile(profileData);
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${validatedContactId}),and(sender_id.eq.${validatedContactId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError.message);
        Alert.alert('Error', 'Failed to load messages');
      } else {
        console.log('Fetched messages:', messagesData);
        setMessages(messagesData || []);
      }
    };

    setupChat();

    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        console.log('New message received:', newMessage);
        if (
          (newMessage.sender_id === userId && newMessage.recipient_id === validatedContactId) ||
          (newMessage.sender_id === validatedContactId && newMessage.recipient_id === userId)
        ) {
          setMessages((current) => [newMessage, ...current]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [contactId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !contactId) {
      Alert.alert('Error', 'Cannot send message');
      return;
    }

    const messageToSend = {
      text: newMessage.trim(),
      sender_id: userId,
      recipient_id: contactId as string,
    };
    console.log('Sending message:', messageToSend);

    try {
      const { error } = await supabase.from('messages').insert(messageToSend);
      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error.message);
      Alert.alert('Error', 'Failed to send message');
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
    <>
      <Stack.Screen options={{ title: contactProfile?.full_name || 'Message' }} />
      <LinearGradient colors={['#ff6b6b', '#ff8787', '#ffb6b6']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#ff6b6b" />
            </TouchableOpacity>
            <View style={styles.profileHeader}>
              {contactProfile?.avatar_url ? (
                <Image
                  source={{ uri: contactProfile.avatar_url }}
                  style={styles.avatar}
                  onError={(e) => console.log('Failed to load avatar:', e.nativeEvent.error)}
                />
              ) : (
                <Feather name="user" size={30} color="#ff6b6b" style={styles.profileIcon} />
              )}
              <Text style={styles.title}>
                {contactProfile?.full_name || contactProfile?.username || 'Chat'} 💬
              </Text>
            </View>
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
              placeholder="Type a message..."
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
    </>
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
    paddingHorizontal: 15,
    flexDirection: 'row',
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
  backButton: {
    marginRight: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileIcon: {
    marginRight: 10,
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