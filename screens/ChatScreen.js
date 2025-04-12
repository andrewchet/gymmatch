import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Button, Text, KeyboardAvoidingView, Platform } from 'react-native';

const messageStore = {};

const ChatScreen = ({ route }) => {
  const { user } = route.params;
  const [messages, setMessages] = useState(messageStore[user.id] || []);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage = { id: Date.now().toString(), text: input };
    const updated = [...messages, newMessage];
    messageStore[user.id] = updated;
    setMessages(updated);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <Text style={styles.header}>{user.name}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.bubble}>{item.text}</Text>}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <View style={styles.inputRow}>
        <TextInput placeholder="Message..." value={input} onChangeText={setInput} style={styles.input} />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  bubble: { backgroundColor: '#eee', padding: 10, marginVertical: 5, borderRadius: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff' },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10 },
});
