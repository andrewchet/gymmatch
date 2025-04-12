// OnboardingScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const OnboardingScreen = ({ navigation }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigation.replace('Questionnaire');
    } catch (error) {
      Alert.alert('Authentication Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleAuth} style={styles.button}>
        {isSignUp ? 'Sign Up' : 'Log In'}
      </Button>
      <Button onPress={() => setIsSignUp(!isSignUp)} style={styles.link}>
        {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
      </Button>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 10,
  },
  link: {
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
});
