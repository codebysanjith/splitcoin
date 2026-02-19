import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { CreateGroupScreen } from '../screens/CreateGroupScreen';
import { SettleUpScreen } from '../screens/SettleUpScreen';
import { MemberSettingsScreen } from '../screens/MemberSettingsScreen';
import { NotFoundScreen } from '../screens/NotFoundScreen';
import { Colors } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={tabStyles.iconContainer}>
      <Text style={[tabStyles.emoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
      <Text style={[tabStyles.label, { color: focused ? Colors.primary : Colors.light }]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Activity" emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Friends" emoji="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Groups" emoji="📁" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" emoji="📋" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroupScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="SettleUp" component={SettleUpScreen} />
        <Stack.Screen name="MemberSettings" component={MemberSettingsScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: { alignItems: 'center', gap: 3 },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, fontWeight: '500' },
});
