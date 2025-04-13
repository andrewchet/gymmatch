import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const ChatListScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error('No user logged in');
          return;
        }

        console.log('Fetching matches for user:', currentUser.uid);

        // Query for matches where the current user is involved and status is 'matched'
        const matchesCollection = collection(db, 'matches');
        const matchesQuery = query(
          matchesCollection,
          where('status', '==', 'matched')
        );

        const matchesSnapshot = await getDocs(matchesQuery);
        console.log('Found matches count:', matchesSnapshot.size);

        const matchPromises = matchesSnapshot.docs.map(async (matchDoc) => {
          const matchData = matchDoc.data();
          console.log('Processing match:', matchData);
          
          // Check if this match involves the current user
          if (!matchData.users.includes(currentUser.uid)) {
            console.log('Match does not involve current user, skipping');
            return null;
          }
          
          // Get the other user's ID (the one that's not the current user)
          const otherUserId = matchData.users.find(id => id !== currentUser.uid);
          console.log('Other user ID:', otherUserId);
          
          // Fetch the other user's profile
          const profileDoc = await getDoc(doc(db, 'profiles', otherUserId));
          if (!profileDoc.exists()) {
            console.error('Profile not found for user:', otherUserId);
            return null;
          }
          
          const profileData = profileDoc.data();
          console.log('Profile data:', profileData);
          
          return {
            id: matchDoc.id,
            matchTimestamp: matchData.timestamp,
            lastUpdated: matchData.lastUpdated,
            ...profileData
          };
        });

        const matchesWithProfiles = (await Promise.all(matchPromises)).filter(match => match !== null);
        console.log('Final matches with profiles:', matchesWithProfiles);
        
        // Sort matches by last updated time (most recent first)
        const sortedMatches = matchesWithProfiles.sort((a, b) => {
          const timeA = a.lastUpdated?.toDate?.() || new Date(0);
          const timeB = b.lastUpdated?.toDate?.() || new Date(0);
          return timeB - timeA;
        });
        
        setMatches(sortedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        Alert.alert('Error', 'Failed to fetch matches: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.matchItem}
            onPress={() => navigation.navigate('Chat', { user: item })}
          >
            <Avatar.Image 
              size={50} 
              source={{ uri: item.images?.[0] || 'https://via.placeholder.com/50' }} 
              style={styles.avatar}
            />
            <View style={styles.matchInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.matchDate}>
                Matched on {new Date(item.matchTimestamp?.toDate()).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matches yet. Go like someone!</Text>
          </View>
        }
      />
    </View>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatar: {
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  matchDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});