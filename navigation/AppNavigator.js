import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import OnboardingScreen from '../screens/OnboardingScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const handleLogout = async (navigation) => {
    try {
      await signOut(auth);
      // Reset navigation state and navigate to Onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#333333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Questionnaire" 
        component={QuestionnaireScreen}
        options={{ 
          title: 'Complete Profile',
          headerLeft: null, // Disable back button for questionnaire
        }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={({ navigation }) => ({ 
          title: 'FitMatch',
          headerLeft: null, // Disable back button for home
          headerRight: () => (
            <IconButton
              icon="logout"
              size={24}
              onPress={() => handleLogout(navigation)}
            />
          ),
        })}
      />
      <Stack.Screen 
        name="Browse" 
        component={BrowseScreen}
        options={{ 
          title: 'Explore Profiles',
        }}
      />
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ 
          title: 'Messages',
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={({ route }) => ({ 
          title: route.params?.otherUser?.name || 'Chat',
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
