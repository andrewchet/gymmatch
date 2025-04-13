import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import OnboardingScreen from '../screens/OnboardingScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import ChatScreen from '../screens/ChatScreen';
import BottomTabNavigator from './BottomTabNavigator';

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
        options={({ route, navigation }) => ({ 
          title: route.params?.editMode ? 'Edit Profile' : 'Complete Profile',
          headerLeft: null, // Disable back button for questionnaire
          headerRight: route.params?.editMode ? () => (
            <IconButton
              icon="check"
              size={24}
              onPress={() => {
                // Find the QuestionnaireScreen component and call its handleSubmit method
                const questionnaireScreen = navigation.getState().routes.find(
                  route => route.name === 'Questionnaire'
                );
                if (questionnaireScreen && questionnaireScreen.params?.handleSubmit) {
                  questionnaireScreen.params.handleSubmit();
                }
              }}
            />
          ) : null,
        })}
      />
      <Stack.Screen 
        name="MainApp" 
        component={BottomTabNavigator}
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
        initialParams={{ screen: 'BrowseTab' }}
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
