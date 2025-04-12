import React from 'react';
import { View, StyleSheet, FlatList, TextInput, Button, Text } from 'react-native';

const messages = [
  { id: '1', text: 'Hey! Ready to hit the gym tomorrow?' },
  { id: '2', text: 'Absolutely. 6am work?' },
];

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text style={styles.message}>{item.text}</Text>}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <View style={styles.inputArea}>
        <TextInput placeholder="Type a message..." style={styles.input} />
        <Button title="Send" onPress={() => {}} />
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  message: { backgroundColor: '#e6e6e6', padding: 10, borderRadius: 10, marginBottom: 10 },
  inputArea: { flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 0, width: '100%', padding: 10, backgroundColor: '#fff' },
  input: { flex: 1, marginRight: 10, borderBottomWidth: 1 },
});
