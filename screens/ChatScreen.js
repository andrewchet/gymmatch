// In your ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const ChatScreen = ({ route, navigation }) => {
  const otherUser = route?.params?.otherUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setError('You must be logged in to chat');
      setLoading(false);
      return;
    }

    if (!otherUser || !otherUser.id) {
      setError('Chat partner information is missing');
      setLoading(false);
      return;
    }

    console.log('Chat with user:', otherUser.id);
    
    // Create a unique chat ID for the two users
    const uniqueChatId = [currentUser.uid, otherUser.id].sort().join('_');
    setChatId(uniqueChatId);
    console.log('Chat ID:', uniqueChatId);
    
    const initializeChat = async () => {
      try {
        // Check for existing messages
        const messagesRef = collection(db, 'messages');
        const messagesQuery = query(
          messagesRef,
          where('chatId', '==', uniqueChatId),
          orderBy('timestamp', 'asc')
        );
        
        console.log('Setting up real-time listener for messages...');
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          console.log('Snapshot received, document count:', snapshot.size);
          const messageList = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Message data:', { 
              id: doc.id, 
              ...data,
              isFromCurrentUser: data.senderId === currentUser.uid
            });
            messageList.push({ id: doc.id, ...data });
          });
          
          console.log('Setting messages state with count:', messageList.length);
          setMessages(messageList);
          setLoading(false);
        }, (error) => {
          console.error('Error in real-time listener:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          setError('Failed to load messages: ' + error.message);
          setLoading(false);
        });
        
        // If no messages exist, create an initial system message
        const initialQuery = query(
          messagesRef,
          where('chatId', '==', uniqueChatId)
        );
        const initialSnapshot = await getDocs(initialQuery);
        
        if (initialSnapshot.empty) {
          console.log('No existing messages found, creating initial message');
          await addDoc(messagesRef, {
            chatId: uniqueChatId,
            senderId: 'system',
            content: 'Chat started',
            timestamp: serverTimestamp(),
            isSystemMessage: true
          });
        }
        
        return () => {
          console.log('Cleaning up message listener');
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to initialize chat: ' + error.message);
        setLoading(false);
      }
    };
    
    initializeChat();
  }, [otherUser?.id, currentUser]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    if (!otherUser || !otherUser.id) {
      Alert.alert('Error', 'Cannot send message: Chat partner information is missing');
      return;
    }
    
    try {
      console.log('Sending message to user:', otherUser.id);
      
      const messagesRef = collection(db, 'messages');
      const messageData = {
        chatId,
        senderId: currentUser.uid,
        receiverId: otherUser.id,
        content: newMessage,
        timestamp: serverTimestamp()
      };
      
      const messageRef = await addDoc(messagesRef, messageData);
      console.log('Message sent successfully with ID:', messageRef.id);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>{error}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ 
            padding: 10, 
            backgroundColor: item.isSystemMessage ? '#f0f0f0' : 
                            (item.senderId === currentUser.uid ? '#e6f7ff' : '#f0f0f0'),
            marginVertical: 5,
            borderRadius: 10,
            alignSelf: item.isSystemMessage ? 'center' : 
                      (item.senderId === currentUser.uid ? 'flex-end' : 'flex-start'),
            maxWidth: '70%'
          }}>
            <Text style={{ 
              fontStyle: item.isSystemMessage ? 'italic' : 'normal',
              color: item.isSystemMessage ? '#666' : '#000'
            }}>
              {item.content}
            </Text>
          </View>
        )}
      />
      
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10 }}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;