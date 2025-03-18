import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  return (
    <>
    <StatusBar style='dark'/>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff6b6b',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen 
        name="Home/home" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, focused }) => {
            console.log('Home Icon - Color:', color, 'Focused:', focused);
            return <Feather name="home" size={24} color={color} />;
          },
        }} 
      />
      <Tabs.Screen 
        name="Chat/chat" 
        options={{ 
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => {
            console.log('Chat Icon - Color:', color, 'Focused:', focused);
            return <Feather name="message-circle" size={24} color={color} />;
          },
        }} 
      />
      <Tabs.Screen 
        name="Profile/profile"  // Mismatch with folder 'profile/'
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => {
            console.log('Profile Icon - Color:', color, 'Focused:', focused);
            return <Feather name="user" size={24} color={color} />;
          },
        }} 
      />
      <Tabs.Screen 
        name="More/more" 
        options={{ 
          title: 'More',
          tabBarIcon: ({ color, focused }) => {
            console.log('More Icon - Color:', color, 'Focused:', focused);
            return <Feather name="more-horizontal" size={24} color={color} />;
          },
        }} 
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
    </>
 );
}