// screens/QuestionnaireScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Chip, Checkbox } from 'react-native-paper';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const QuestionnaireScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [major, setMajor] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Multiple choice fields (select all that apply)
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  // Single choice field
  const [selectedLiftingExpertise, setSelectedLiftingExpertise] = useState('');
  
  // Open-ended fields
  const [goals, setGoals] = useState('');
  const [funFact, setFunFact] = useState('');
  
  // Options for multiple choice fields
  const sportsOptions = ['Basketball', 'Swimming', 'Cycling', 'Running', 'Soccer', 'Tennis', 'Yoga', 'CrossFit', 'Football', 'Baseball', 'Other'];
  const availabilityOptions = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays', 'Mornings', 'Afternoons', 'Evenings'];
  const liftingExpertiseOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'No user logged in');
          return;
        }

        const profileRef = doc(db, 'profiles', user.uid);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          // Check if the profile has the required fields
          if (profileData.name && profileData.age && profileData.major && profileData.sports && profileData.availability && 
              profileData.liftingExpertise && profileData.goals && profileData.funFact) {
            console.log('Existing profile found, skipping questionnaire');
            navigation.replace('Home');
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking profile:', error);
        setLoading(false);
      }
    };

    checkExistingProfile();
  }, [navigation]);

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user logged in');
        return;
      }

      // Validate required fields
      if (!name || !age || !major || selectedSports.length === 0 || selectedAvailability.length === 0 || 
          !selectedLiftingExpertise || !goals || !funFact) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        name,
        age: parseInt(age),
        major,
        sports: selectedSports,
        availability: selectedAvailability,
        liftingExpertise: selectedLiftingExpertise,
        goals,
        funFact,
        updatedAt: new Date().toISOString(),
      });

      navigation.replace('Home');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // Toggle selection for multiple choice fields
  const toggleSelection = (item, selectedItems, setSelectedItems) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // Handle single selection for lifting expertise
  const selectLiftingExpertise = (level) => {
    setSelectedLiftingExpertise(level);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="titleLarge" style={styles.title}>Complete Your Profile</Text>

        <View style={styles.section}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            label="Age"
            value={age}
            onChangeText={setAge}
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            label="Major"
            value={major}
            onChangeText={setMajor}
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports (Select all that apply)</Text>
          <View style={styles.chipContainer}>
            {sportsOptions.map((sport) => (
              <Chip
                key={sport}
                selected={selectedSports.includes(sport)}
                onPress={() => toggleSelection(sport, selectedSports, setSelectedSports)}
                style={styles.chip}
              >
                {sport}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability (Select all that apply)</Text>
          <View style={styles.chipContainer}>
            {availabilityOptions.map((time) => (
              <Chip
                key={time}
                selected={selectedAvailability.includes(time)}
                onPress={() => toggleSelection(time, selectedAvailability, setSelectedAvailability)}
                style={styles.chip}
              >
                {time}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifting Expertise (Select one)</Text>
          <View style={styles.chipContainer}>
            {liftingExpertiseOptions.map((level) => (
              <Chip
                key={level}
                selected={selectedLiftingExpertise === level}
                onPress={() => selectLiftingExpertise(level)}
                style={styles.chip}
              >
                {level}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TextInput
            label="Fitness Goals"
            value={goals}
            onChangeText={setGoals}
            style={styles.input}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <TextInput
            label="Fun Fact About You"
            value={funFact}
            onChangeText={setFunFact}
            style={styles.input}
            multiline
            numberOfLines={3}
          />
        </View>

        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          style={styles.button}
        >
          Complete Profile
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Add extra padding at the bottom
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  section: {
    marginBottom: 25,
    width: '100%',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 20,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  chip: {
    margin: 5,
  },
});

export default QuestionnaireScreen;
