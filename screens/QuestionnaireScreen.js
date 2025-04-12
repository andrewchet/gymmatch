import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

const QuestionnaireScreen = ({ navigation }) => {
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Tell us about you</Text>
      <TextInput label="Fitness Goal" value={goal} onChangeText={setGoal} style={styles.input} />
      <TextInput label="Experience Level" value={experience} onChangeText={setExperience} style={styles.input} />
      <TextInput label="Location (City/Zip)" value={location} onChangeText={setLocation} style={styles.input} />
      <Button mode="contained" onPress={() => navigation.navigate('Home')}>
        Finish
      </Button>
    </View>
  );
};

export default QuestionnaireScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 15 },
});
