import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter, usePathname } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({
    email: '',
    password: '',
  });
  const router = useRouter();
  const pathname = usePathname();

  console.log('Pathname in LoginScreen:', pathname); // Should log '/Auth/login'
  console.log('Router in LoginScreen:', router); // Should log router object

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleValidation = () => {
    let newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!handleValidation()) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        console.log('Login successful, navigating to /(tabs)/Home');
        if (!router) {
          console.error('Router is undefined, cannot navigate');
          Alert.alert('Navigation Error', 'Router is not available');
          return;
        }
        router.push('/(tabs)/Home/home'); // Adjusted to match tab route
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!router) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: Router is not available</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#ff6b6b', '#ff8787', '#ffb6b6']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Our Journey</Text>
          <Text style={styles.subtitle}>Login to share our moments</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Feather name="heart" size={20} color="#ff6b6b" style={styles.icon} />
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Your Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#ff6b6b" style={styles.icon} />
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Our Secret"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              disabled={loading}
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#ff6b6b"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={['#ff8787', '#ff6b6b']}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Logging in...' : 'Begin Our Adventure'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/Auth/register')}
            style={styles.registerButton}
            disabled={loading}
          >
            <Text style={styles.registerText}>
              New to our love story?{' '}
              <Text style={styles.registerLink}>Join Together</Text>
            </Text>
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
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffffdd',
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffee',
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 55,
    color: '#333',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
    marginLeft: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  loginButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  registerText: {
    color: '#ffffffdd',
    fontSize: 14,
  },
  registerLink: {
    color: '#fff',
    fontWeight: '700',
  },
});