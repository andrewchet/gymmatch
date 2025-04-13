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
          Alert.alert('Error', 'You must be logged in to view matches');
          setLoading(false);
          return;
        }

        console.log('Fetching matches for user:', currentUser.uid);

        // Query for matches where the current user is involved
        const matchesCollection = collection(db, 'matches');
        
        // First, try to get all matches and filter in memory
        // This is a fallback approach if the security rules are causing issues
        const matchesSnapshot = await getDocs(matchesCollection);
        console.log('Total matches found:', matchesSnapshot.size);
        
        // Filter matches that involve the current user and have status 'matched'
        const userMatches = matchesSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.users && 
                   data.users.includes(currentUser.uid) && 
                   data.status === 'matched';
          })
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        
        console.log('User matches after filtering:', userMatches.length);
        
        // Fetch profiles for each match
        const matchPromises = userMatches.map(async (matchData) => {
          // Get the other user's ID (the one that's not the current user)
          const otherUserId = matchData.users.find(id => id !== currentUser.uid);
          console.log('Other user ID:', otherUserId);
          
          if (!otherUserId) {
            console.error('Could not find other user ID in match:', matchData);
            return null;
          }
          
          // Fetch the other user's profile
          try {
            const profileDoc = await getDoc(doc(db, 'profiles', otherUserId));
            if (!profileDoc.exists()) {
              console.error('Profile not found for user:', otherUserId);
              return null;
            }
            
            const profileData = profileDoc.data();
            console.log('Profile data for user:', otherUserId);
            
            return {
              id: matchData.id,
              matchTimestamp: matchData.timestamp,
              lastUpdated: matchData.lastUpdated,
              ...profileData
            };
          } catch (profileError) {
            console.error('Error fetching profile for user:', otherUserId, profileError);
            return null;
          }
        });

        const matchesWithProfiles = (await Promise.all(matchPromises)).filter(match => match !== null);
        console.log('Final matches with profiles:', matchesWithProfiles.length);
        
        if (matchesWithProfiles.length === 0) {
          console.log('No matches found for user');
        }
        
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
            onPress={() => navigation.navigate('Chat', { otherUser: item })}
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