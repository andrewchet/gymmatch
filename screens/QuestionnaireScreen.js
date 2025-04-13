// screens/QuestionnaireScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const QuestionnaireScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [university, setUniversity] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'No user logged in');
          return;
        }

        const profileRef = doc(db, 'profiles', user.uid);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          // Check if the profile has the required fields
          if (profileData.name && profileData.age && profileData.university && profileData.bio) {
            console.log('Existing profile found, skipping questionnaire');
            navigation.replace('Home');
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking profile:', error);
        setLoading(false);
      }
    };

    checkExistingProfile();
  }, [navigation]);

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user logged in');
        return;
      }

      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        name,
        age: parseInt(age),
        university,
        bio,
        updatedAt: new Date().toISOString(),
      });

      navigation.replace('Home');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Complete Your Profile</Text>

      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="University"
        value={university}
        onChangeText={setUniversity}
        style={styles.input}
      />

      <TextInput
        label="Bio"
        value={bio}
        onChangeText={setBio}
        style={styles.input}
        multiline
        numberOfLines={4}
      />

      <Button 
        mode="contained" 
        onPress={handleSubmit} 
        style={styles.button}
      >
        Complete Profile
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuestionnaireScreen;
