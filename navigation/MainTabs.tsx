import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import ExploreCouponsScreen from '../screens/ExploreCouponsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Tab = createBottomTabNavigator();

function Placeholder({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{title}</Text>
    </View>
  );
}

export default function MainTabs() {
  const { role } = useUser();
  const initialRouteName = 'Home';
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"home" as any} size={size ?? 22} color={color} />), title: 'Home' }} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"storefront" as any} size={size ?? 22} color={color} />), title: 'Marketplace' }} />
      <Tab.Screen name="Explorar" component={ExploreCouponsScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"search" as any} size={size ?? 22} color={color} />), title: 'Explorar' }} />
      <Tab.Screen name="Social" component={FavoritesScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"groups" as any} size={size ?? 22} color={color} />), title: 'Social Network' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => (<MaterialIcons name={"person" as any} size={size ?? 22} color={color} />), title: 'Perfil' }} />
    </Tab.Navigator>
  );
}


