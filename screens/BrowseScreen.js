import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Card, Text, IconButton, Menu, Button, Chip, Divider } from 'react-native-paper';
import { collection, getDocs, query, where, doc, setDoc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

const BrowseScreen = () => {
  const [index, setIndex] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBySimilarity, setSortBySimilarity] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Calculate similarity score between two profiles
  const calculateProfileSimilarity = (currentUserProfile, otherProfile) => {
    let similarityScore = 0;
    
    // Compare age (closer ages get higher scores)
    if (currentUserProfile.age && otherProfile.age) {
      const ageDiff = Math.abs(currentUserProfile.age - otherProfile.age);
      if (ageDiff <= 1) similarityScore += 5;  // Same year or 1 year difference
      else if (ageDiff <= 2) similarityScore += 3;  // 2 years difference
      else if (ageDiff <= 4) similarityScore += 1;  // 3-4 years difference (still in college range)
      // No points for age difference > 4 years (unlikely in college setting)
    }
    
    // Compare major (exact match gets points)
    if (currentUserProfile.major && otherProfile.major && 
        currentUserProfile.major.toLowerCase() === otherProfile.major.toLowerCase()) {
      similarityScore += 5;
    }
    
    // Compare sports (each matching sport gets points)
    if (currentUserProfile.sports && Array.isArray(currentUserProfile.sports) && 
        otherProfile.sports && Array.isArray(otherProfile.sports)) {
      const currentUserSports = currentUserProfile.sports.map(sport => sport.toLowerCase());
      const otherSports = otherProfile.sports.map(sport => sport.toLowerCase());
      
      const matchingSports = currentUserSports.filter(sport => otherSports.includes(sport));
      similarityScore += matchingSports.length * 3;
    }
    
    // Compare availability (each matching time slot gets points)
    if (currentUserProfile.availability && Array.isArray(currentUserProfile.availability) && 
        otherProfile.availability && Array.isArray(otherProfile.availability)) {
      const currentUserAvailability = currentUserProfile.availability.map(time => time.toLowerCase());
      const otherAvailability = otherProfile.availability.map(time => time.toLowerCase());
      
      const matchingAvailability = currentUserAvailability.filter(time => otherAvailability.includes(time));
      similarityScore += matchingAvailability.length * 2;
    }
    
    // Compare lifting expertise (each matching level gets points)
    if (currentUserProfile.liftingExpertise && Array.isArray(currentUserProfile.liftingExpertise) && 
        otherProfile.liftingExpertise && Array.isArray(otherProfile.liftingExpertise)) {
      const currentUserExpertise = currentUserProfile.liftingExpertise.map(level => level.toLowerCase());
      const otherExpertise = otherProfile.liftingExpertise.map(level => level.toLowerCase());
      
      const matchingExpertise = currentUserExpertise.filter(level => otherExpertise.includes(level));
      similarityScore += matchingExpertise.length * 2;
    }
    
    // Compare goals (simple text similarity)
    if (currentUserProfile.goals && otherProfile.goals) {
      const currentUserGoals = currentUserProfile.goals.toLowerCase();
      const otherGoals = otherProfile.goals.toLowerCase();
      
      // Check for common keywords in goals
      const commonKeywords = ['weight', 'strength', 'muscle', 'fitness', 'health', 'cardio', 'endurance', 'flexibility'];
      const matchingKeywords = commonKeywords.filter(keyword => 
        currentUserGoals.includes(keyword) && otherGoals.includes(keyword)
      );
      
      similarityScore += matchingKeywords.length;
    }
    
    return similarityScore;
  };

  // Fetch profiles
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
      const currentUserProfileDoc = await getDoc(currentUserProfileRef);
      
      if (!currentUserProfileDoc.exists()) {
        console.error('Current user profile not found');
        Alert.alert('Error', 'Your profile not found. Please complete your profile first.');
        setLoading(false);
        return;
      }
      
      const currentUserProfileData = currentUserProfileDoc.data();
      setCurrentUserProfile(currentUserProfileData);
      console.log('Current user profile:', currentUserProfileData);
      
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
      
      let finalProfiles;
      
      if (sortBySimilarity) {
        // Calculate similarity scores and sort profiles
        const profilesWithScores = profilesList.map(profile => ({
          ...profile,
          similarityScore: calculateProfileSimilarity(currentUserProfileData, profile)
        }));
        
        // Sort profiles by similarity score (highest first)
        finalProfiles = profilesWithScores.sort((a, b) => b.similarityScore - a.similarityScore);
      } else {
        // Random sorting
        finalProfiles = [...profilesList].sort(() => Math.random() - 0.5);
      }
      
      console.log('Sorted profiles:', finalProfiles);
      
      if (finalProfiles.length === 0) {
        console.log('No other profiles found');
        Alert.alert('Info', 'No other profiles available yet. Check back later!');
      }
      
      setProfiles(finalProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      Alert.alert('Error', 'Failed to fetch profiles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load profiles when component mounts or when sort preference changes
  useEffect(() => {
    fetchProfiles();
  }, [sortBySimilarity]);

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

  // Get matching fields between current user and profile
  const getMatchingFields = (profile) => {
    if (!currentUserProfile) return [];
    
    const matches = [];
    
    // Check age match
    if (currentUserProfile.age && profile.age) {
      const ageDiff = Math.abs(currentUserProfile.age - profile.age);
      if (ageDiff <= 5) {
        matches.push({ field: 'Age', value: `${ageDiff} years difference` });
      }
    }
    
    // Check major match
    if (currentUserProfile.major && profile.major && 
        currentUserProfile.major.toLowerCase() === profile.major.toLowerCase()) {
      matches.push({ field: 'Major', value: profile.major });
    }
    
    // Check sports match
    if (currentUserProfile.sports && Array.isArray(currentUserProfile.sports) && 
        profile.sports && Array.isArray(profile.sports)) {
      const currentUserSports = currentUserProfile.sports.map(sport => sport.toLowerCase());
      const otherSports = profile.sports.map(sport => sport.toLowerCase());
      
      const matchingSports = currentUserSports.filter(sport => otherSports.includes(sport));
      if (matchingSports.length > 0) {
        matches.push({ 
          field: 'Sports', 
          value: matchingSports.map(sport => sport.charAt(0).toUpperCase() + sport.slice(1)).join(', ') 
        });
      }
    }
    
    // Check availability match
    if (currentUserProfile.availability && Array.isArray(currentUserProfile.availability) && 
        profile.availability && Array.isArray(profile.availability)) {
      const currentUserAvailability = currentUserProfile.availability.map(time => time.toLowerCase());
      const otherAvailability = profile.availability.map(time => time.toLowerCase());
      
      const matchingAvailability = currentUserAvailability.filter(time => otherAvailability.includes(time));
      if (matchingAvailability.length > 0) {
        matches.push({ 
          field: 'Availability', 
          value: matchingAvailability.map(time => time.charAt(0).toUpperCase() + time.slice(1)).join(', ') 
        });
      }
    }
    
    // Check lifting expertise match
    if (currentUserProfile.liftingExpertise && Array.isArray(currentUserProfile.liftingExpertise) && 
        profile.liftingExpertise && Array.isArray(profile.liftingExpertise)) {
      const currentUserExpertise = currentUserProfile.liftingExpertise.map(level => level.toLowerCase());
      const otherExpertise = profile.liftingExpertise.map(level => level.toLowerCase());
      
      const matchingExpertise = currentUserExpertise.filter(level => otherExpertise.includes(level));
      if (matchingExpertise.length > 0) {
        matches.push({ 
          field: 'Lifting Expertise', 
          value: matchingExpertise.map(level => level.charAt(0).toUpperCase() + level.slice(1)).join(', ') 
        });
      }
    }
    
    return matches;
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
        <Text style={styles.sortLabel}>
          {sortBySimilarity ? 'Showing Similar Profiles' : 'Showing Random Profiles'}
        </Text>
        <Button 
          onPress={() => setSortBySimilarity(!sortBySimilarity)}
          style={styles.sortButton}
        >
          Switch to {sortBySimilarity ? 'Random' : 'Similar'}
        </Button>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.nameRow}>
            <Text variant="titleLarge" style={styles.name}>{profile.name}, {profile.age}</Text>
            <View style={styles.similarityContainer}>
              <Text style={styles.similarityText}>Match Score: {profile.similarityScore}</Text>
            </View>
          </View>
          <Text style={styles.major}>{profile.major}</Text>
        </Card.Content>
        <ScrollView horizontal pagingEnabled>
          {profile.images?.map((uri, i) => (
            <View key={i} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
            </View>
          ))}
        </ScrollView>
        <Card.Content>
          {sortBySimilarity && profile.similarityScore > 0 && (
            <View style={styles.matchesContainer}>
              <Text style={styles.sectionTitle}>Similarities</Text>
              {getMatchingFields(profile).map((match, index) => (
                <View key={index} style={styles.matchItem}>
                  <Text style={styles.matchField}>{match.field}:</Text>
                  <Text style={styles.matchValue}>{match.value}</Text>
                </View>
              ))}
              <Divider style={styles.divider} />
            </View>
          )}
          
          <Text style={styles.sectionTitle}>Sports</Text>
          <View style={styles.chipContainer}>
            {profile.sports && Array.isArray(profile.sports) ? 
              profile.sports.map((sport, i) => (
                <Chip key={i} style={styles.chip}>{sport}</Chip>
              )) : 
              <Text>No sports listed</Text>
            }
          </View>
          
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.chipContainer}>
            {profile.availability && Array.isArray(profile.availability) ? 
              profile.availability.map((time, i) => (
                <Chip key={i} style={styles.chip}>{time}</Chip>
              )) : 
              <Text>No availability listed</Text>
            }
          </View>
          
          <Text style={styles.sectionTitle}>Lifting Expertise</Text>
          <View style={styles.chipContainer}>
            {profile.liftingExpertise && Array.isArray(profile.liftingExpertise) ? 
              profile.liftingExpertise.map((level, i) => (
                <Chip key={i} style={styles.chip}>{level}</Chip>
              )) : 
              <Text>No lifting expertise listed</Text>
            }
          </View>
          
          <Text style={styles.sectionTitle}>Goals</Text>
          <Text style={styles.text}>{profile.goals || 'No goals listed'}</Text>
          
          <Text style={styles.sectionTitle}>Fun Fact</Text>
          <Text style={styles.text}>{profile.funFact || 'No fun fact listed'}</Text>
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  similarityContainer: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  similarityText: {
    fontSize: 12,
    color: '#006064',
    fontWeight: 'bold',
  },
  name: { marginBottom: 5 },
  major: { 
    fontSize: 16, 
    color: '#666',
    marginBottom: 10,
  },
  imageContainer: { position: 'relative' },
  image: { width: 350, height: 350, borderRadius: 10 },
  promptRow: { marginVertical: 5 },
  prompt: { fontSize: 16 },
  filterRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15 
  },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    margin: 3,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  sortButton: {
    backgroundColor: '#f0f0f0',
  },
  matchesContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  matchItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  matchField: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  matchValue: {
    flex: 1,
  },
  divider: {
    marginTop: 10,
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
});
