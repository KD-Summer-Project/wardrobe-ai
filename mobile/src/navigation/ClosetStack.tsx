import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AddItemScreen from '../screens/AddItemScreen';
import ClosetScreen from '../screens/ClosetScreen';
import { colors } from '../theme';
import { ClosetStackParamList } from './types';

const Stack = createNativeStackNavigator<ClosetStackParamList>();

export default function ClosetStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="ClosetList" component={ClosetScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add Item' }} />
    </Stack.Navigator>
  );
}
