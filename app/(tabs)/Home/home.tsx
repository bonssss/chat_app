import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
    <Stack.Screen options={{headerShown: false}} />
    
    <LinearGradient
      colors={['#ff6b6b', '#ff8787', '#ffb6b6']}
      style={styles.gradient}
    >

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back, Lovebirds! 💕</Text>
          <Text style={styles.subtitle}>Your space to connect and cherish every moment</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/Chat/chat')}
          >
            <Feather name="message-circle" size={30} color="#ff6b6b" />
            <Text style={styles.actionText}>Chat Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/Profile/profile')}
          >
            <Feather name="heart" size={30} color="#ff6b6b" />
            <Text style={styles.actionText}>Our Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Placeholder */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Moments</Text>
          <View style={styles.activityCard}>
            <Feather name="camera" size={24} color="#ff6b6b" style={styles.activityIcon} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Last Photo Shared</Text>
              <Text style={styles.activitySubtext}>Yesterday at 8:45 PM</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerText}>Made with ❤️ for us</Text>
      </ScrollView>
    </LinearGradient>
  
    </>);
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    justifyContent:'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffffdd',
    textAlign: 'center',
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#ffffffee',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginTop: 10,
    fontWeight: '600',
  },
  activityContainer: {
    width: '100%',
    backgroundColor: '#ffffffee',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 15,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activitySubtext: {
    fontSize: 12,
    color: '#999',
  },
  viewAllButton: {
    alignSelf: 'flex-end',
  },
  viewAllText: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#ffffffaa',
    marginTop: 30,
    textAlign: 'center',
  },
});