import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GeneralHomeScreen from '../screens/GeneralHomeScreen';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import ExploreCouponsScreen from '../screens/ExploreCouponsScreen';
import SocialProfileScreen from '../screens/SocialProfileScreen';
import SocialTimelineScreen from '../screens/SocialTimelineScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import EventsScreen from '../screens/EventsScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

function Placeholder({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{title}</Text>
    </View>
  );
}

export default function MainTabs() {
  const { role, userId } = useUser();
  const initialRouteName = 'Inicio';
  const { colors, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '700' },
      }}
      initialRouteName={initialRouteName}
    >
      <Tab.Screen name="Inicio" component={GeneralHomeScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"dashboard" as any} size={size ?? 22} color={color} />), title: 'Inicio' }} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"storefront" as any} size={size ?? 22} color={color} />), title: 'Marketplace' }} />
      <Tab.Screen name="Explorar" component={ExploreCouponsScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"search" as any} size={size ?? 22} color={color} />), title: 'Explorar' }} />
      <Tab.Screen name="Eventos" component={EventsScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"event" as any} size={size ?? 22} color={color} />), title: 'Eventos' }} />
      <Tab.Screen name="Social" component={SocialTimelineScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"groups" as any} size={size ?? 22} color={color} />), title: 'Social Network' }} />
    </Tab.Navigator>
  );
}


