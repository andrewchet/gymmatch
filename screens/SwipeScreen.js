import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const SwipeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swipe Profiles</Text>
      {/* Placeholder for profile card */}
      <View style={styles.card}><Text>Partner Profile</Text></View>
      <View style={styles.swipeButtons}>
        <Button title="❌" onPress={() => {}} />
        <Button title="❤️" onPress={() => {}} />
      </View>
    </View>
  );
};

export default SwipeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  card: { width: 300, height: 400, backgroundColor: '#eee', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  swipeButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '60%', marginTop: 20 }
});