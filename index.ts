import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Navegación global mínima para accesos desde UI sin hook
// @ts-ignore
(global as any).NAVIGATE = (name: string, params?: any) => {
  try {
    // Delega en un CustomEvent capturable por App si se necesita
    // o usa react-navigation ref si estuviera disponible
    // Aquí emitimos un evento para evitar import circular
    // @ts-ignore
    globalThis.dispatchEvent?.(new CustomEvent('NAVIGATE', { detail: { screen: name, params } }));
  } catch {}
};
