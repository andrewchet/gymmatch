// screens/QuestionnaireScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

const QuestionnaireScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [university, setUniversity] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

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
        profilePicture,
        updatedAt: new Date().toISOString(),
      });

      navigation.replace('Home');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Complete Your Profile</Text>

      <Button 
        mode="outlined" 
        onPress={pickImage} 
        style={styles.imageButton}
      >
        {profilePicture ? 'Change Profile Picture' : 'Add Profile Picture'}
      </Button>

      {profilePicture && (
        <Image 
          source={{ uri: profilePicture }} 
          style={styles.profileImage} 
        />
      )}

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
  imageButton: {
    marginBottom: 15,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default QuestionnaireScreen;
