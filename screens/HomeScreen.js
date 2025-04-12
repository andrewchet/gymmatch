import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text variant="headlineSmall">Welcome to FitMatch</Text>
    <Button mode="contained" onPress={() => navigation.navigate('Browse')} style={styles.button}>Browse Profiles</Button>
    <Button mode="outlined" onPress={() => navigation.navigate('ChatList')} style={styles.button}>Messages</Button>
  </View>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  button: { marginVertical: 10, width: '80%' },
});