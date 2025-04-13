import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Card, Text, IconButton, Menu, Button } from 'react-native-paper';
import { collection, getDocs, query, where, doc, setDoc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

const BrowseScreen = () => {
  const [index, setIndex] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ageMenuVisible, setAgeMenuVisible] = useState(false);
  const [goalMenuVisible, setGoalMenuVisible] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const currentUser = auth.currentUser;
        console.log('Current user:', currentUser?.uid);
        
        if (!currentUser) {
          console.error('No user logged in');
          Alert.alert('Error', 'You must be logged in to browse profiles');
          setLoading(false);
          return;
        }
        
        // First, check if current user's profile exists
        const currentUserProfileRef = doc(db, 'profiles', currentUser.uid);
        const currentUserProfile = await getDoc(currentUserProfileRef);
        
        if (!currentUserProfile.exists()) {
          console.error('Current user profile not found');
          Alert.alert('Error', 'Your profile not found. Please complete your profile first.');
          setLoading(false);
          return;
        }
        
        console.log('Current user profile:', currentUserProfile.data());
        
        // Then fetch all other profiles
        const profilesCollection = collection(db, 'profiles');
        
        // Get all profiles first
        const profilesSnapshot = await getDocs(profilesCollection);
        console.log('Total profiles found:', profilesSnapshot.size);
        
        // Filter out the current user's profile
        const profilesList = profilesSnapshot.docs
          .filter(doc => doc.id !== currentUser.uid)
          .map(doc => ({
            id: doc.id,
            uid: doc.id, // Set uid to the document ID
            ...doc.data()
          }));
        
        console.log('Fetched profiles count:', profilesList.length);
        console.log('Fetched profiles:', profilesList);
        
        if (profilesList.length === 0) {
          console.log('No other profiles found');
          Alert.alert('Info', 'No other profiles available yet. Check back later!');
        }
        
        setProfiles(profilesList);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        Alert.alert('Error', 'Failed to fetch profiles: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleLike = async () => {
    try {
      const currentUser = auth.currentUser;
      const likedProfile = profiles[index];
      
      console.log('=== LIKE DEBUGGING ===');
      console.log('Current user:', currentUser?.uid);
      console.log('Current index:', index);
      console.log('Total profiles:', profiles.length);
      console.log('Liked profile:', likedProfile);
      
      if (!currentUser) {
        console.error('No current user found');
        Alert.alert('Error', 'You must be logged in to like profiles');
        return;
      }
      
      if (!likedProfile) {
        console.error('No profile found at index:', index);
        Alert.alert('Error', 'No profile to like');
        return;
      }
      
      // Use the document ID as the user ID
      const likedUserId = likedProfile.id;
      
      // Create a unique match ID that's the same regardless of who liked whom
      const matchId = [currentUser.uid, likedUserId].sort().join('_');
      console.log('Match ID:', matchId);
      
      // Check if match already exists
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (matchDoc.exists()) {
        // Match exists, update it
        const matchData = matchDoc.data();
        console.log('Existing match data:', matchData);
        
        // If the current user is not in the likedBy array, add them
        if (!matchData.likedBy || !matchData.likedBy.includes(currentUser.uid)) {
          const updatedLikedBy = matchData.likedBy ? [...matchData.likedBy, currentUser.uid] : [currentUser.uid];
          
          // Check if this creates a mutual match
          const isMutualMatch = updatedLikedBy.includes(currentUser.uid) && updatedLikedBy.includes(likedUserId);
          
          await updateDoc(matchRef, {
            likedBy: updatedLikedBy,
            status: isMutualMatch ? 'matched' : 'pending',
            lastUpdated: new Date()
          });
          
          console.log('Updated match with new like');
          
          if (isMutualMatch) {
            Alert.alert('It\'s a Match!', `You and ${likedProfile.name} have liked each other!`);
          }
        } else {
          console.log('User already liked this profile');
        }
      } else {
        // Create new match
        const matchData = {
          users: [currentUser.uid, likedUserId],
          likedBy: [currentUser.uid],
          timestamp: new Date(),
          lastUpdated: new Date(),
          status: 'pending'
        };
        
        console.log('Creating new match with data:', matchData);
        await setDoc(matchRef, matchData);
        console.log('Match document created with ID:', matchId);
      }
      
      // Move to next profile
      console.log('Moving to next profile');
      setIndex(prev => Math.min(prev + 1, profiles.length - 1));
    } catch (error) {
      console.error('Error in handleLike:', error);
      Alert.alert('Error', 'Failed to like profile: ' + error.message);
    }
  };

  const handleDislike = () => {
    // Simply move to next profile
    setIndex(prev => Math.min(prev + 1, profiles.length - 1));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No profiles available</Text>
      </View>
    );
  }

  const profile = profiles[index];

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Menu
          visible={ageMenuVisible}
          onDismiss={() => setAgeMenuVisible(false)}
          anchor={<Button onPress={() => setAgeMenuVisible(true)}>Age</Button>}
        >
          <Menu.Item title="18-25" />
          <Menu.Item title="26-35" />
          <Menu.Item title="36+" />
        </Menu>
        <Menu
          visible={goalMenuVisible}
          onDismiss={() => setGoalMenuVisible(false)}
          anchor={<Button onPress={() => setGoalMenuVisible(true)}>Goal</Button>}
        >
          <Menu.Item title="Build Muscle" />
          <Menu.Item title="Lose Weight" />
          <Menu.Item title="Improve Endurance" />
        </Menu>
        <Menu
          visible={locationMenuVisible}
          onDismiss={() => setLocationMenuVisible(false)}
          anchor={<Button onPress={() => setLocationMenuVisible(true)}>Location</Button>}
        >
          <Menu.Item title="NYC" />
          <Menu.Item title="LA" />
          <Menu.Item title="Remote" />
        </Menu>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.name}>{profile.name}</Text>
        </Card.Content>
        <ScrollView horizontal pagingEnabled>
          {profile.images?.map((uri, i) => (
            <View key={i} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
            </View>
          ))}
        </ScrollView>
        <Card.Content>
          {profile.prompts?.map((p, i) => (
            <View key={i} style={styles.promptRow}>
              <Text style={styles.prompt}>"{p}"</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.actionButtons}>
        <IconButton
          icon="close"
          iconColor="red"
          size={40}
          style={styles.actionButton}
          onPress={handleDislike}
        />
        <IconButton
          icon="heart"
          iconColor="green"
          size={40}
          style={styles.actionButton}
          onPress={handleLike}
        />
      </View>
    </View>
  );
};

export default BrowseScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 15,
  },
  card: { 
    borderRadius: 15, 
    overflow: 'hidden',
    marginBottom: 15,
    flex: 1,
  },
  name: { marginBottom: 10 },
  imageContainer: { position: 'relative' },
  image: { width: 350, height: 350, borderRadius: 10 },
  promptRow: { marginVertical: 5 },
  prompt: { fontSize: 16 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 20,
  },
  actionButton: {
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
