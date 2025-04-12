import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome to Gym Match Maker 💪</Text>
      <Text style={{ marginVertical: 20 }}>Find gym partners who match your goals.</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Questionnaire')}>
        Get Started
      </Button>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});
