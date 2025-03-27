import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Image, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const defaultContactId = '66226eb9-b619-4c55-b62f-63837eca2c44'; // User B for User A

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'Please log in to view profile');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message);
        Alert.alert('Error', 'Failed to load profile');
        return;
      }

      if (data) {
        setProfile(data);
        setUsername(data.username);
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || null);
        setBio(data.bio || '');
      } else {
        setProfile({ id: user.id, username: user.email || '', full_name: null, avatar_url: null, bio: null });
        setUsername(user.email || '');
      }
    };
    fetchProfile();
  }, []);

  // Handle image picking and uploading
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, formData, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading image:', error.message);
        Alert.alert('Error', 'Failed to upload image');
        return;
      }

      const { data: publicData } = supabase.storage.from('profile-images').getPublicUrl(fileName);
      console.log('Public URL:', publicData.publicUrl);
      setAvatarUrl(`${publicData.publicUrl}?t=${Date.now()}`);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profile?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          username: username.trim(),
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl || null,
          bio: bio.trim() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;

      setProfile({
        id: profile.id,
        username: username.trim(),
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl || null,
        bio: bio.trim() || null,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error.message);
      Alert.alert('Error', error.message || 'Failed to save profile');
    }
  };

  // Navigate to chat screen
  const handleChatNow = () => {
    if (!profile?.id) {
      Alert.alert('Error', 'Please log in to start a chat');
      return;
    }
    router.push(`/Chat/${defaultContactId}`);
  };

  return (
    <LinearGradient colors={['#ff6b6b', '#ff8787', '#ffb6b6']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>
        {profile ? (
          <View style={styles.profileCard}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.avatar}
                      onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <Feather name="camera" size={30} color="#ff6b6b" />
                      <Text style={styles.placeholderText}>Upload Image</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username (required)"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Bio"
                  placeholderTextColor="#999"
                  multiline
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {profile.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatar}
                    onError={(e) => console.log('Failed to load avatar:', e.nativeEvent.error)}
                  />
                ) : (
                  <Feather name="user" size={60} color="#ff6b6b" style={styles.profileIcon} />
                )}
                <Text style={styles.fullName}>{profile.full_name || 'No name set'}</Text>
                <Text style={styles.username}>@{profile.username}</Text>
                <Text style={styles.bio}>{profile.bio || 'No bio available'}</Text>
                <Text style={styles.userId}>ID: {profile.id}</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <Feather name="edit" size={20} color="#ff6b6b" />
                  <Text style={styles.editText}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.loading}>Loading profile...</Text>
        )}
        {!isEditing && (
          <TouchableOpacity style={styles.actionButton} onPress={handleChatNow}>
            <Feather name="message-circle" size={30} color="#ff6b6b" />
            <Text style={styles.actionText}>Chat Now</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    overflow: 'visible', // Ensure contents are not clipped
  },
  placeholder: {
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Prevent background overlap
  },
  placeholderText: {
    fontSize: 14,
    color: '#ff6b6b', // Visible contrast against #f5f5f5
    marginTop: 5,
    textAlign: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileIcon: {
    marginBottom: 15,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  username: {
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  userId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  editText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginLeft: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginLeft: 10,
  },
  loading: {
    fontSize: 18,
    color: '#fff',
    marginTop: 30,
  },
});