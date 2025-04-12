import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Browse" component={BrowseScreen} />
    <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
