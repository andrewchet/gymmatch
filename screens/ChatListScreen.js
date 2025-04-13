import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const ChatListScreen = () => {
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesRef = collection(db, 'matches');
        const matchesQuery = query(matchesRef, where('status', '==', 'matched'));
        const snapshot = await getDocs(matchesQuery);

        const users = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();

          if (!data.users || !data.users.includes(currentUser.uid)) continue;

          const otherUserId = data.users.find(uid => uid !== currentUser.uid);
          if (!otherUserId) continue;

          const otherUserDoc = await getDoc(doc(db, 'profiles', otherUserId));

          users.push({
            id: otherUserId,
            name: otherUserDoc.exists() ? otherUserDoc.data().name : otherUserId,
          });
        }

        setMatchedUsers(users);
      } catch (err) {
        console.error('Error loading matches:', err);
        Alert.alert('Error', 'Could not load matches.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const startChat = (userId) => {
    navigation.navigate('Chat', {
      otherUser: { id: userId }
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (matchedUsers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No matched users yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={matchedUsers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => startChat(item.id)}
        >
          <Text style={styles.username}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  username: {
    fontSize: 18,
  },
});
