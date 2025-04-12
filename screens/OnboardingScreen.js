import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

const OnboardingScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text variant="headlineMedium">Welcome to FitMatch</Text>
    <Text style={styles.subtext}>Find gym partners that match your vibe</Text>
    <Button mode="contained" onPress={() => navigation.navigate('Questionnaire')} style={styles.button}>
      Get Started
    </Button>
  </View>
);

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  subtext: { marginVertical: 20, textAlign: 'center' },
  button: { marginTop: 20, width: '80%' },
});