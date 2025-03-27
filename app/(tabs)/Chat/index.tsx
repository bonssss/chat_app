import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { router } from 'expo-router';
import { Platform } from 'react-native';

type Message = {
  id: string;
  text: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
};

type Conversation = {
  contactId: string;
  lastMessage: string;
  lastMessageTime: string;
};

export default function ChatListScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        Alert.alert('Error', 'Please log in to use chat');
        return;
      }
      setUserId(user.id);
    };

    const fetchConversations = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('sender_id, recipient_id, text, created_at')
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const conversationMap = new Map<string, Conversation>();
        data.forEach((msg: Message) => {
          const contactId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
          if (!conversationMap.has(contactId)) {
            conversationMap.set(contactId, {
              contactId,
              lastMessage: msg.text,
              lastMessageTime: msg.created_at,
            });
          }
        });
        setConversations(Array.from(conversationMap.values()));
      } catch (error: any) {
        console.error('Error fetching conversations:', error.message);
        Alert.alert('Error', 'Failed to load conversations');
      }
    };

    fetchUser();
    if (userId) fetchConversations();

    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        if (newMessage.sender_id === userId || newMessage.recipient_id === userId) {
          const contactId = newMessage.sender_id === userId ? newMessage.recipient_id : newMessage.sender_id;
          setConversations((current) => {
            const updated = current.filter((conv) => conv.contactId !== contactId);
            return [
              { contactId, lastMessage: newMessage.text, lastMessageTime: newMessage.created_at },
              ...updated,
            ];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/Chat/${item.contactId}`)}
    >
      <Feather name="user" size={24} color="#ff6b6b" style={styles.conversationIcon} />
      <View style={styles.conversationContent}>
        <Text style={styles.conversationName}>{item.contactId}</Text>
        <Text style={styles.conversationPreview} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text style={styles.conversationTime}>
        {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#ff6b6b', '#ff8787', '#ffb6b6']} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chats 💬</Text>
        </View>
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.contactId}
          contentContainerStyle={styles.conversationList}
        />
      </View>
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
  conversationList: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conversationIcon: {
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  conversationPreview: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  conversationTime: {
    fontSize: 12,
    color: '#ff6b6b',
  },
});