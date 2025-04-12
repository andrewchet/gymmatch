import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Avatar, Menu, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const fitnessGoalsList = [
  'Lose Weight', 'Build Muscle', 'Increase Flexibility', 'Improve Endurance',
  'Get Toned', 'Train for a Race', 'Gain Strength', 'Improve Posture',
  'Boost Energy', 'Stay Consistent'
];

const hobbiesList = [
  'Running', 'Yoga', 'Cycling', 'Swimming', 'Weightlifting',
  'Hiking', 'Dancing', 'Pilates', 'Boxing', 'Rock Climbing'
];

const QuestionnaireScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    bio: '',
    fitnessGoal: '',
    hobby: '',
  });
  const [photos, setPhotos] = useState([]);
  const [fitnessGoalMenuVisible, setFitnessGoalMenuVisible] = useState(false);
  const [hobbyMenuVisible, setHobbyMenuVisible] = useState(false);

  const pickImage = async () => {
    if (photos.length >= 4) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleSubmit = () => {
    // Save data or move to next screen
    navigation.navigate('Browse');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge">Create Your Profile</Text>

      <View style={styles.photoContainer}>
        {photos.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.photo} />
        ))}
        {photos.length < 4 && (
          <TouchableOpacity onPress={pickImage} style={styles.addPhoto}>
            <Text>+ Add Photo</Text>
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
        label="Bio"
        multiline
        numberOfLines={3}
        value={form.bio}
        onChangeText={text => setForm({ ...form, bio: text })}
        style={styles.input}
      />

      {/* Fitness Goal Dropdown */}
      <Menu
        visible={fitnessGoalMenuVisible}
        onDismiss={() => setFitnessGoalMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setFitnessGoalMenuVisible(true)} style={styles.input}>
            {form.fitnessGoal || 'Select Fitness Goal'}
          </Button>
        }
      >
        {fitnessGoalsList.map((goal, i) => (
          <Menu.Item
            key={i}
            title={goal}
            onPress={() => {
              setForm({ ...form, fitnessGoal: goal });
              setFitnessGoalMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      {/* Hobby Dropdown */}
      <Menu
        visible={hobbyMenuVisible}
        onDismiss={() => setHobbyMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setHobbyMenuVisible(true)} style={styles.input}>
            {form.hobby || 'Select Hobby'}
          </Button>
        }
      >
        {hobbiesList.map((hobby, i) => (
          <Menu.Item
            key={i}
            title={hobby}
            onPress={() => {
              setForm({ ...form, hobby });
              setHobbyMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <Button mode="contained" onPress={handleSubmit} style={styles.submitBtn}>
        Save & Continue
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginVertical: 10 },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  addPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: 20,
  },
});

export default QuestionnaireScreen;
