import './global.css';
import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';

import App from './app/App';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause some issues with preventAutoHideAsync */
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
