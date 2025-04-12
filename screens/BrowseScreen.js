import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

const fakeProfiles = [
  { id: '1', name: 'Jordan, 28', image: 'https://placekitten.com/400/400', prompts: ['A great gym day includes deadlifts.', 'My dream partner is consistent.', 'I’m most proud of my 300lb squat.'] },
  { id: '2', name: 'Taylor, 24', image: 'https://placebear.com/400/400', prompts: ['Love a good leg day.', 'Looking for someone to push me.', 'I’ve never missed a Monday.'] },
];

const likedUsersGlobal = [];

const BrowseScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);

  const handleLike = () => {
    likedUsersGlobal.push(fakeProfiles[index]);
    handleNext();
  };

  const handleNext = () => {
    if (index < fakeProfiles.length - 1) setIndex(index + 1);
    else navigation.navigate('ChatList', { likedUsers: likedUsersGlobal });
  };

  const profile = fakeProfiles[index];

  return (
    <View style={styles.container}>
      {profile ? (
        <Card style={styles.card}>
          <Image source={{ uri: profile.image }} style={styles.image} />
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
  container: { flex: 1, justifyContent: 'center', padding: 15 },
  card: { borderRadius: 15 },
  image: { height: 350, width: '100%' },
  prompt: { marginVertical: 5 },
  actions: { justifyContent: 'space-around', marginVertical: 15 },
});