// In your ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const ChatScreen = ({ route, navigation }) => {
  const otherUser = route?.params?.otherUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = auth.currentUser;

  // Function to fetch messages where the other user is the sender


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
    console.log('Current user ID:', currentUser.uid);
    
    const initializeChat = async () => {
      try {
        // Check for existing messages
        const messagesRef = collection(db, 'messages');
        
        // Query for messages where the current user is the sender and the other user is the receiver
        const sentMessagesQuery = query(
          messagesRef,
          where('senderId', '==', currentUser.uid),
          where('receiverId', '==', otherUser.id)
        );
        
        // Query for messages where the other user is the sender and the current user is the receiver
        const receivedMessagesQuery = query(
          messagesRef,
          where('senderId', '==', otherUser.id),
          where('receiverId', '==', currentUser.uid)
        );
        
        console.log('Setting up real-time listeners for messages...');
        
        // Set up listeners for both sent and received messages
        const unsubscribeSent = onSnapshot(sentMessagesQuery, (snapshot) => {
          console.log('Sent messages snapshot received, document count:', snapshot.size);
          const sentMessages = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Sent message data:', { id: doc.id, ...data });
            sentMessages.push({ id: doc.id, ...data });
          });
          
          // Update messages state with sent messages
          setMessages(prevMessages => {
            // Filter out any existing sent messages
            const filteredMessages = prevMessages.filter(msg => 
              !(msg.senderId === currentUser.uid && msg.receiverId === otherUser.id)
            );
            // Add new sent messages
            return [...filteredMessages, ...sentMessages];
          });
        }, (error) => {
          console.error('Error in sent messages listener:', error);
        });
        
        const unsubscribeReceived = onSnapshot(receivedMessagesQuery, (snapshot) => {
          console.log('Received messages snapshot received, document count:', snapshot.size);
          const receivedMessages = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Received message data:', { id: doc.id, ...data });
            receivedMessages.push({ id: doc.id, ...data });
          });
          
          // Update messages state with received messages
          setMessages(prevMessages => {
            // Filter out any existing received messages
            const filteredMessages = prevMessages.filter(msg => 
              !(msg.senderId === otherUser.id && msg.receiverId === currentUser.uid)
            );
            // Add new received messages
            return [...filteredMessages, ...receivedMessages];
          });
          
          // Set loading to false after receiving messages
          setLoading(false);
        }, (error) => {
          console.error('Error in received messages listener:', error);
          setError('Failed to load messages: ' + error.message);
          setLoading(false);
        });
        
        // Also try to fetch all messages where the other user is the sender

        
        return () => {
          console.log('Cleaning up message listeners');
          unsubscribeSent();
          unsubscribeReceived();
        };
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to initialize chat: ' + error.message);
        setLoading(false);
      }
    };
    
    initializeChat();
  }, [otherUser?.id, currentUser]);

  // Sort messages by timestamp
  useEffect(() => {
    if (messages.length > 0) {
      const sortedMessages = [...messages].sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeA - timeB;
      });
      setMessages(sortedMessages);
    }
  }, [messages.length]);

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