// OnboardingScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { testFirestore } from '../firebaseTest';

const OnboardingScreen = ({ navigation }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firestoreWorking, setFirestoreWorking] = useState(null);

  useEffect(() => {
    // Test Firestore connection when component mounts
    const checkFirestore = async () => {
      const result = await testFirestore();
      setFirestoreWorking(result);
      console.log('Firestore test result:', result);
    };
    
    checkFirestore();
  }, []);

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        console.log('Starting signup process...');
        
        // Create the authentication account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User created with UID:', user.uid);

        try {
          // Create initial empty profile
          console.log('Attempting to create profile document...');
          const profileRef = doc(db, 'profiles', user.uid);
          console.log('Profile reference created:', profileRef.path);
          
          const profileData = {
            email: email,
            createdAt: new Date().toISOString(),
          };
          console.log('Profile data to be set:', profileData);
          
          await setDoc(profileRef, profileData);
          console.log('Profile document created successfully');
          
          // Verify the document was created
          const verifyRef = doc(db, 'profiles', user.uid);
          const verifySnap = await getDoc(verifyRef);
          console.log('Verification result:', verifySnap.exists() ? 'Document exists' : 'Document does not exist');
          
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          console.error('Error details:', JSON.stringify(profileError));
          // If profile creation fails, we should delete the auth user
          await user.delete();
          throw new Error('Failed to create profile. Please try again.');
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigation.replace('Questionnaire');
    } catch (error) {
      console.error('Auth Error:', error.code, error.message);
      let errorMessage = 'Authentication Error';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
      
      {firestoreWorking === false && (
        <Text style={styles.errorText}>Warning: Database connection issue detected</Text>
      )}
      
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default OnboardingScreen;
