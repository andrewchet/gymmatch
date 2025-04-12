import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { likedUsersGlobal } from './BrowseScreen';

const ChatListScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={likedUsersGlobal}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Chat', { user: item })}>
            <Text style={styles.item}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No matches yet. Go like someone!</Text>}
      />
    </View>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { fontSize: 18, marginBottom: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10 },
});