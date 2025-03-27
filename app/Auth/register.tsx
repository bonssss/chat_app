import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

// Define navigation prop types if needed, though Expo Router uses useRouter instead
export type RootStackParamList = {
  Register: undefined;
  Login: undefined;
};

export default function RegisterScreen() {
  const router = useRouter(); // Use Expo Router's hook instead of navigation prop
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validation functions (unchanged)
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
  };

  const handleValidation = () => {
    let newErrors = { email: '', password: '', confirmPassword: '' };
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
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.length) {
        newErrors.password = 'Password must be at least 8 characters';
        isValid = false;
      } else if (!passwordValidation.uppercase || !passwordValidation.number || !passwordValidation.special) {
        newErrors.password = 'Password must contain an uppercase letter, number, and special character';
        isValid = false;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!handleValidation()) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Please check your email to verify your account!',
          [
            {
              text: 'OK',
              onPress: () => router.push('/Auth/login'), // Navigate using Expo Router
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during registration');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#ff6b6b', '#ff8787', '#ffb6b6']}
      style={styles.gradient}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Our Beginning</Text>
          <Text style={styles.subtitle}>Create our love story</Text>
        </View>

        <View style={styles.inputContainer}>
          {/* Input fields remain unchanged */}
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

          {/* Password and Confirm Password fields remain unchanged */}
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

          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#ff6b6b" style={styles.icon} />
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Confirm Our Secret"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
              disabled={loading}
            >
              <Feather
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#ff6b6b"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={['#ff8787', '#ff6b6b']}
              style={styles.registerButtonGradient}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Starting...' : 'Start Our Journey'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/Auth/login')} // Navigate using Expo Router
            style={styles.loginButton}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              Already together?{' '}
              <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// Styles remain unchanged
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
  registerButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  registerButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginText: {
    color: '#ffffffdd',
    fontSize: 14,
  },
  loginLink: {
    color: '#fff',
    fontWeight: '700',
  },
});