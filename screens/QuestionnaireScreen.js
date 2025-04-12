import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TextInput, Button, Text, Avatar } from 'react-native-paper';

const QuestionnaireScreen = ({ navigation }) => {
  const [photo, setPhoto] = useState(null);
  const [form, setForm] = useState({ name: '', age: '', goals: '', hobbies: '' });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 4], quality: 1 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge">Create Your Profile</Text>
      <Avatar.Image size={100} source={photo ? { uri: photo } : require('../assets/avatar-placeholder.png')} style={styles.avatar} />
      <Button onPress={pickImage}>Upload Photo</Button>
      <TextInput label="Name" value={form.name} onChangeText={text => setForm({ ...form, name: text })} style={styles.input} />
      <TextInput label="Age" value={form.age} keyboardType="numeric" onChangeText={text => setForm({ ...form, age: text })} style={styles.input} />
      <TextInput label="Fitness Goals" value={form.goals} onChangeText={text => setForm({ ...form, goals: text })} style={styles.input} />
      <TextInput label="Hobbies" value={form.hobbies} onChangeText={text => setForm({ ...form, hobbies: text })} style={styles.input} />
      <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.button}>Continue</Button>
    </ScrollView>
  );
};

export default QuestionnaireScreen;

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20 },
  input: { marginVertical: 10, width: '100%' },
  button: { marginTop: 20 },
  avatar: { marginVertical: 10 },
});
