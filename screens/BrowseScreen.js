import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, Menu, Button } from 'react-native-paper';
import dummyProfiles from './dummyProfiles';

const BrowseScreen = () => {
  const [index, setIndex] = useState(0);
  const [likedPrompts, setLikedPrompts] = useState([]);
  const [likedPhotos, setLikedPhotos] = useState([]);
  const [ageMenuVisible, setAgeMenuVisible] = useState(false);
  const [goalMenuVisible, setGoalMenuVisible] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);

  const profile = dummyProfiles[index];

  const togglePromptLike = (prompt) => {
    setLikedPrompts((prev) =>
      prev.includes(prompt) ? prev.filter((p) => p !== prompt) : [...prev, prompt]
    );
  };

  const togglePhotoLike = (uri) => {
    setLikedPhotos((prev) =>
      prev.includes(uri) ? prev.filter((u) => u !== uri) : [...prev, uri]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
          {profile.images.map((uri, i) => (
            <View key={i} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <IconButton
                icon={likedPhotos.includes(uri) ? 'heart' : 'heart-outline'}
                iconColor={likedPhotos.includes(uri) ? 'red' : 'gray'}
                size={24}
                style={styles.photoHeart}
                onPress={() => togglePhotoLike(uri)}
              />
            </View>
          ))}
        </ScrollView>
        <Card.Content>
          {profile.prompts.map((p, i) => (
            <View key={i} style={styles.promptRow}>
              <Text style={styles.prompt}>“{p}”</Text>
              <IconButton
                icon={likedPrompts.includes(p) ? 'heart' : 'heart-outline'}
                iconColor={likedPrompts.includes(p) ? 'red' : 'gray'}
                size={20}
                onPress={() => togglePromptLike(p)}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default BrowseScreen;

const styles = StyleSheet.create({
  container: { padding: 15, gap: 10 },
  card: { borderRadius: 15, overflow: 'hidden' },
  name: { marginBottom: 10 },
  imageContainer: { position: 'relative' },
  image: { width: 350, height: 350, borderRadius: 10 },
  photoHeart: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white' },
  promptRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 5 },
  prompt: { flex: 1, marginRight: 10, fontSize: 16 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
});
