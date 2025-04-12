import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Your Dashboard</Text>
      <Button mode="outlined" onPress={() => navigation.navigate('Swipe')} style={styles.button}>
        Start Swiping
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('Chat')} style={styles.button}>
        Go to Messages
      </Button>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { marginTop: 20, width: 200 },
});
