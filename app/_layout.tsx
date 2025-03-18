import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Default Entry Point */}
        <Stack.Screen name="index" />
        
        {/* Onboarding */}
        <Stack.Screen name="onboarding" />
        
        {/* Authentication */}
        <Stack.Screen name="Auth/login" />
        <Stack.Screen name="Auth/register" />
        
        {/* Tabs */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}