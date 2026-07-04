import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';
import OutfitOfTheDayScreen from '../screens/OutfitOfTheDayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';
import ClosetStack from './ClosetStack';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_ICONS: Record<keyof MainTabsParamList, string> = {
  ClosetTab: '👗',
  OutfitOfTheDay: '☀️',
  Profile: '🙋',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface },
        tabBarIcon: () => <Text>{TAB_ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="ClosetTab" component={ClosetStack} options={{ title: 'Closet' }} />
      <Tab.Screen
        name="OutfitOfTheDay"
        component={OutfitOfTheDayScreen}
        options={{ title: 'Outfit' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
