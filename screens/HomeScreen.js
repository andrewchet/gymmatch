import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';

const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Surface style={styles.header} elevation={2}>
      <Text variant="headlineMedium" style={styles.title}>Welcome to FitMatch</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>Find your perfect workout partner</Text>
    </Surface>
    

    <View style={styles.contentContainer}>
      <Surface style={styles.card} elevation={3}>
        <Text variant="titleMedium" style={styles.cardTitle}>Your Dashboard</Text>
        <Text variant="bodyMedium" style={styles.cardDescription}>
          Welcome to your fitness journey! Use the tabs below to explore profiles, chat with matches, and manage your profile.
        </Text>
      </Surface>
      
      <Surface style={styles.card} elevation={3}>
        <Text variant="titleMedium" style={styles.cardTitle}>Quick Tips</Text>
        <Text variant="bodyMedium" style={styles.cardDescription}>
          • Use the Discover tab to find workout partners with similar interests{'\n'}
          • Check your Messages tab to connect with your matches{'\n'}
          • Keep your profile updated to improve your matching chances
        </Text>
      </Surface>
    </View>
  </View>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardDescription: {
    marginBottom: 20,
    color: '#666',
  },
  button: { 
    paddingVertical: 8,
  },
});