import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AdityaPic from '../assets/adityauser1.jpg'; // Make sure this exists in your assets folder!

// Profiles can now support both local and remote images
const fakeProfiles = [
  {
    id: '1',
    name: 'Aditya, 27',
    image: AdityaPic,
    prompts: [
      'Passionate about tech and fitness.',
      'Looking for meaningful connections.',
      'Always down for a hike or a hackathon.',
    ],
  },
  {
    id: '2',
    name: 'Taylor, 24',
    image: 'https://placebear.com/400/400',
    prompts: [
      'Love a good leg day.',
      'Looking for someone to push me.',
      'I’ve never missed a Monday.',
    ],
  },
];

const likedUsersGlobal = [];

const BrowseScreen = () => {
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();

  const handleLike = () => {
    likedUsersGlobal.push(fakeProfiles[index]);
    handleNext();
  };

  const handleNext = () => {
    if (index < fakeProfiles.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.navigate('ChatList', { likedUsers: likedUsersGlobal });
    }
  };

  const profile = fakeProfiles[index];

  // Helper to handle both local and remote images
  const getImageSource = (img) => {
    return typeof img === 'string' ? { uri: img } : img;
  };

  return (
    <View style={styles.container}>
      {profile ? (
        <Card style={styles.card}>
          <Image source={getImageSource(profile.image)} style={styles.image} />
          <Card.Content>
            <Text variant="titleLarge">{profile.name}</Text>
            {profile.prompts.map((p, i) => (
              <Text key={i} style={styles.prompt}>“{p}”</Text>
            ))}
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button icon="close" textColor="red" onPress={handleNext}>Pass</Button>
            <Button icon="heart" textColor="green" onPress={handleLike}>Like</Button>
          </Card.Actions>
        </Card>
      ) : (
        <Text>No more profiles.</Text>
      )}
    </View>
  );
};

export default BrowseScreen;

export { likedUsersGlobal };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  card: {
    borderRadius: 15,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    height: 350,
    width: '100%',
  },
  prompt: {
    marginVertical: 5,
    fontSize: 16,
  },
  actions: {
    justifyContent: 'space-around',
    marginVertical: 15,
  },
});
