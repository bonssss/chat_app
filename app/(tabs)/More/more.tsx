import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function MoreScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'Please log in to view more options');
        router.replace('./login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error.message);
        Alert.alert('Error', 'Failed to load profile');
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        setProfile({ id: user.id, username: user.email || 'Unknown', full_name: null, avatar_url: null });
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      Alert.alert('Error', 'Failed to log out');
    } else {
      // Alert.alert('Success', 'Logged out successfully');
      router.replace('/Auth/login');
    }
  };

  const menuItems = [
    { icon: 'settings', label: 'Settings', onPress: () => router.push('/settings') },
    { icon: 'info', label: 'About', onPress: () => router.push('/about') },
    { icon: 'log-out', label: 'Logout', onPress: handleLogout },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'More', headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#ff6b6b', '#ff8787', '#ffb6b6']} style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>More Options</Text>
            </View>
            {profile ? (
              <View style={styles.profileCard}>
                <Text style={styles.username}>@{profile.username}</Text>
                <Text style={styles.fullName}>{profile.full_name || 'No name set'}</Text>
              </View>
            ) : (
              <Text style={styles.loading}>Loading...</Text>
            )}
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                  {/* <Feather name={item.icon} size={24} color="#ff6b6b" /> */}
                  <Text style={styles.menuText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    width: '100%',
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
  profileCard: {
    backgroundColor: '#ffffffee',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  username: {
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 5,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuContainer: {
    width: '90%',
    marginTop: 20,
    paddingBottom: 20, // Extra padding to ensure content isn’t cut off at bottom
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginLeft: 15,
  },
  loading: {
    fontSize: 18,
    color: '#fff',
    marginTop: 30,
  },
});