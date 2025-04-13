import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Button as PaperButton } from 'react-native-paper';

const ChatScreen = ({ route, navigation }) => {
  const otherUser = route?.params?.otherUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = auth.currentUser;
  const flatListRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

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

    const initializeChat = async () => {
      try {
        const messagesRef = collection(db, 'messages');
        
        const sentMessagesQuery = query(
          messagesRef,
          where('senderId', '==', currentUser.uid),
          where('receiverId', '==', otherUser.id)
        );
        
        const receivedMessagesQuery = query(
          messagesRef,
          where('senderId', '==', otherUser.id),
          where('receiverId', '==', currentUser.uid)
        );
        
        const unsubscribeSent = onSnapshot(sentMessagesQuery, (snapshot) => {
          const sentMessages = [];
          snapshot.forEach((doc) => {
            sentMessages.push({ id: doc.id, ...doc.data() });
          });
          
          setMessages(prevMessages => {
            // Filter out any pending messages that are now confirmed
            const filteredMessages = prevMessages.filter(msg => 
              !(msg.senderId === currentUser.uid && msg.receiverId === otherUser.id && !msg.isPending)
            );
            const updatedMessages = [...filteredMessages, ...sentMessages];
            return updatedMessages.sort((a, b) => {
              const timeA = a.timestamp?.toDate?.() || new Date(0);
              const timeB = b.timestamp?.toDate?.() || new Date(0);
              return timeA - timeB;
            });
          });
        });
        
        const unsubscribeReceived = onSnapshot(receivedMessagesQuery, (snapshot) => {
          const receivedMessages = [];
          snapshot.forEach((doc) => {
            receivedMessages.push({ id: doc.id, ...doc.data() });
          });
          
          setMessages(prevMessages => {
            const filteredMessages = prevMessages.filter(msg => 
              !(msg.senderId === otherUser.id && msg.receiverId === currentUser.uid)
            );
            const updatedMessages = [...filteredMessages, ...receivedMessages];
            return updatedMessages.sort((a, b) => {
              const timeA = a.timestamp?.toDate?.() || new Date(0);
              const timeB = b.timestamp?.toDate?.() || new Date(0);
              return timeA - timeB;
            });
          });
          
          setLoading(false);
        });
        
        return () => {
          unsubscribeSent();
          unsubscribeReceived();
        };
      } catch (error) {
        setError('Failed to initialize chat: ' + error.message);
        setLoading(false);
      }
    };
    
    initializeChat();
  }, [otherUser?.id, currentUser]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || isSending) return;
    
    if (!otherUser || !otherUser.id) {
      Alert.alert('Error', 'Cannot send message: Chat partner information is missing');
      return;
    }
    
    try {
      setIsSending(true);
      const messagesRef = collection(db, 'messages');
      
      // Create the message data for Firebase
      const messageData = {
        senderId: currentUser.uid,
        receiverId: otherUser.id,
        content: newMessage,
        timestamp: serverTimestamp()
      };
      
      // Add the message to Firestore
      await addDoc(messagesRef, messageData);
      
      // Clear the input field immediately for better UX
      setNewMessage('');
      
      // Scroll to bottom after the message is added
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <PaperButton 
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </PaperButton>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.senderId === currentUser.uid ? styles.sentMessage : styles.receivedMessage,
            item.isPending && styles.pendingMessage
          ]}>
            <Text style={styles.messageText}>{item.content}</Text>
            {item.isPending && (
              <Text style={styles.pendingText}>Sending...</Text>
            )}
          </View>
        )}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={500}
          editable={!isSending}
        />
        <PaperButton 
          mode="contained"
          onPress={sendMessage}
          style={styles.sendButton}
          disabled={!newMessage.trim() || isSending}
          loading={isSending}
        >
          Send
        </PaperButton>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: 'red',
  },
  backButton: {
    marginTop: 10,
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  sentMessage: {
    backgroundColor: '#e6f7ff',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  pendingMessage: {
    opacity: 0.7,
  },
  pendingText: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
  },
});

export default ChatScreen;