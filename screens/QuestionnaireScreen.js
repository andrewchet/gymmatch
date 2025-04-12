// screens/QuestionnaireScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const fitnessGoals = [
  'Build muscle', 'Lose weight', 'Gain endurance', 'Get toned',
  'Improve flexibility', 'Train for competition', 'Feel healthier',
  'Boost energy', 'Fix posture', 'Workout with friends'
];

const hobbiesList = [
  'Hiking', 'Biking', 'Swimming', 'Running', 'Climbing',
  'Dancing', 'Weightlifting', 'Yoga', 'Boxing', 'Rowing'
];

const QuestionnaireScreen = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({
    name: '',
    age: '',
    goals: '',
    hobbies: '',
    location: '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 4));
    }
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      await setDoc(doc(db, "profiles", user.uid), {
        ...form,
        photos,
        uid: user.uid,
        timestamp: new Date().toISOString(),
      });

      Alert.alert("Success", "Profile saved!");
      navigation.navigate('Browse');
    } catch (error) {
      console.error("Error saving profile: ", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge">Create Your Profile</Text>
      
      <View style={styles.photoContainer}>
        {photos.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.photo} />
        ))}
        {photos.length < 4 && (
          <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
            <Text>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        label="Name"
        value={form.name}
        onChangeText={text => setForm({ ...form, name: text })}
        style={styles.input}
      />
      <TextInput
        label="Age"
        value={form.age}
        keyboardType="numeric"
        onChangeText={text => setForm({ ...form, age: text })}
        style={styles.input}
      />
      <TextInput
        label="Location"
        value={form.location}
        onChangeText={text => setForm({ ...form, location: text })}
        style={styles.input}
      />
      <TextInput
        label="Fitness Goal"
        value={form.goals}
        onFocus={() =>
          setForm({ ...form, goals: fitnessGoals[Math.floor(Math.random() * fitnessGoals.length)] })
        }
        style={styles.input}
      />
      <TextInput
        label="Hobby"
        value={form.hobbies}
        onFocus={() =>
          setForm({ ...form, hobbies: hobbiesList[Math.floor(Math.random() * hobbiesList.length)] })
        }
        style={styles.input}
      />

      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Save Profile
      </Button>
    </ScrollView>
  );
};

export default QuestionnaireScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  input: {
    marginBottom: 15,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  photo: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 10,
  },
  uploadBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
  },
});
