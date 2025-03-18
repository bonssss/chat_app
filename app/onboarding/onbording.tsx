import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image source={require('../../assets/images/onboard.png')} style={styles.image} />
      <Text style={styles.title}>Welcome to Couples Chat! 💑</Text>
      <Text style={styles.description}>
        Connect, share, and strengthen your bond with your loved one.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/Auth/login')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: { width: 250, height: 250, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20, marginBottom: 20 },
  button: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});