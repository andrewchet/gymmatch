import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform, Dimensions } from 'react-native';

// Import screens
import BrowseScreen from '../screens/BrowseScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const theme = useTheme();
  const { height } = Dimensions.get('window');
  
  // Calculate responsive dimensions based on screen height
  const tabBarHeight = Platform.OS === 'ios' ? height * 0.08 : height * 0.07;
  const iconSize = tabBarHeight * 0.5;
  const labelSize = tabBarHeight * 0.2;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: tabBarHeight * 0.15,
          paddingTop: tabBarHeight * 0.15,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
        tabBarLabelStyle: {
          fontSize: labelSize,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: -tabBarHeight * 0.05,
        },
        headerShown: false, // Hide the header since we're using the stack navigator's header
      }}
    >
      <Tab.Screen
        name="BrowseTab"
        component={BrowseScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color }) => (
            <Icon name="compass" size={iconSize} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatListTab"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => (
            <Icon name="message" size={iconSize} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Icon name="account" size={iconSize} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator; 