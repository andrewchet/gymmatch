import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Avatar, Surface, Divider, IconButton } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'No user logged in');
          return;
        }

        const profileRef = doc(db, 'profiles', user.uid);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        } else {
          Alert.alert('Error', 'Profile not found');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('Questionnaire', { editMode: true });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text>Failed to load profile</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Questionnaire')}>
          Complete Profile
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={80} 
            label={profile.name ? profile.name.substring(0, 2).toUpperCase() : '??'} 
          />
        </View>
        <Text variant="headlineSmall" style={styles.name}>{profile.name}</Text>
        <Text variant="bodyLarge" style={styles.major}>{profile.major}</Text>
        <Text variant="bodyMedium" style={styles.age}>{profile.age} years old</Text>
        
        <Button 
          mode="outlined" 
          onPress={handleEditProfile} 
          style={styles.editButton}
          icon="account-edit"
        >
          Edit Profile
        </Button>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Fitness Goals</Text>
        <Text variant="bodyMedium" style={styles.sectionContent}>{profile.goals}</Text>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Fun Fact</Text>
        <Text variant="bodyMedium" style={styles.sectionContent}>{profile.funFact}</Text>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Sports</Text>
        <View style={styles.chipContainer}>
          {profile.sports && profile.sports.map((sport, index) => (
            <Surface key={index} style={styles.chip} elevation={1}>
              <Text>{sport}</Text>
            </Surface>
          ))}
        </View>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Availability</Text>
        <View style={styles.chipContainer}>
          {profile.availability && profile.availability.map((time, index) => (
            <Surface key={index} style={styles.chip} elevation={1}>
              <Text>{time}</Text>
            </Surface>
          ))}
        </View>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Lifting Expertise</Text>
        <Text variant="bodyMedium" style={styles.sectionContent}>{profile.liftingExpertise}</Text>
      </Surface>
    </ScrollView>
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
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  major: {
    color: '#666',
    marginBottom: 4,
  },
  age: {
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    marginTop: 8,
  },
  section: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionContent: {
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
});

export default ProfileScreen; 