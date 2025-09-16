import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { navigationRef } from './navigation/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import MainTabs from './navigation/MainTabs';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import { UserProvider } from './context/UserContext';
import ProfileScreen from './screens/ProfileScreen';
import InfluencerDashboard from './screens/InfluencerDashboard';
import MerchantHomeScreen from './screens/MerchantHomeScreen';
import AdminDashboard from './screens/AdminDashboard';
import ExploreCouponsScreen from './screens/ExploreCouponsScreen';
import CouponDetailScreen from './screens/CouponDetailScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import HistoryScreen from './screens/HistoryScreen';
import ScanVoucherScreen from './screens/ScanVoucherScreen';
import SavedSearchesScreen from './screens/SavedSearchesScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import PublishProductScreen from './screens/PublishProductScreen';
import EscrowFlowScreen from './screens/EscrowFlowScreen';
import SocialProfileScreen from './screens/SocialProfileScreen';
import SocialChatScreen from './screens/SocialChatScreen';
import SocialNotificationsScreen from './screens/SocialNotificationsScreen';
import SocialSearchScreen from './screens/SocialSearchScreen';
import SocialHashtagScreen from './screens/SocialHashtagScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import StoriesScreen from './screens/StoriesScreen';
import { initEscrowStore } from './services/escrow';
import EscrowRegistryScreen from './screens/EscrowRegistryScreen';
import TransactionsHistoryScreen from './screens/TransactionsHistoryScreen';
import MyCouponsScreen from './screens/MyCouponsScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import MyMarketScreen from './screens/MyMarketScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import EventCheckoutScreen from './screens/EventCheckoutScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Main: undefined;
  VerifyEmail: { email: string } | undefined;
  Profile: undefined;
  Influencer: undefined;
  Negocio: undefined;
  Admin: undefined;
  Explore: undefined;
  CouponDetail: { id: string };
  Checkout: { id: string; qty?: number };
  History: undefined;
  Scan: undefined;
  ProductDetail: { id: string };
  PublishProduct: undefined;
  EscrowFlow: { id: string };
  SocialProfile: { userId: string };
  SocialChat: { userId: string };
  SocialNotifications: undefined;
  SocialSearch: undefined;
  SocialHashtag: { tag: string };
  PostDetail: { postId: string };
  Stories: { userId?: string };
  EventDetail: { id: string };
  EventCheckout: { id: string; qty?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const navRef = navigationRef;
  useEffect(() => { initEscrowStore(); }, []);
  return (
    <UserProvider>
      <NavigationContainer ref={navRef}>
        <Stack.Navigator>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          {/* Dashboards por rol para navegación directa desde el drawer */}
          <Stack.Screen name="Influencer" component={InfluencerDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="Negocio" component={MerchantHomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Admin" component={AdminDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="Explore" component={ExploreCouponsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CouponDetail" component={CouponDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Scan" component={ScanVoucherScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SavedSearches" component={SavedSearchesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PublishProduct" component={PublishProductScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EscrowFlow" component={EscrowFlowScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EscrowRegistry" component={EscrowRegistryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TransactionsHistory" component={TransactionsHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyCoupons" component={MyCouponsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyEvents" component={MyEventsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyMarket" component={MyMarketScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SocialProfile" component={SocialProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SocialChat" component={SocialChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SocialNotifications" component={SocialNotificationsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SocialSearch" component={SocialSearchScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SocialHashtag" component={SocialHashtagScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Stories" component={StoriesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EventCheckout" component={EventCheckoutScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="VerifyEmail"
            component={VerifyEmailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

// Navegación global mínima: escucha CustomEvent y usa navigationRef
// @ts-ignore
globalThis.addEventListener?.('NAVIGATE', (e: any) => {
  try {
    const detail = e?.detail || {};
    const screen = detail.screen as keyof RootStackParamList;
    const params = detail.params as any;
    // Si piden una pestaña del TabNavigator, enrutar vía 'Main'
    const tabNames = new Set(['Marketplace', 'Explorar', 'Social', 'Home', 'Perfil']);
    if (tabNames.has(screen as any)) {
      navigationRef?.navigate?.('Main' as any, { screen } as any);
      return;
    }
    // Caso general
    navigationRef?.navigate?.(screen as any, params);
  } catch {}
});
