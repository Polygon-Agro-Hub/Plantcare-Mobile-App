const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.join(" ");
  if (
    message.includes("Androids permission requirements") ||
    message.includes("Android's permission requirements") ||
    message.includes("media library") ||
    message.includes("InteractionManager has been deprecated")
  ) {
    return;
  }
  originalWarn(...args);
};

const originalLog = console.log;
console.log = (...args: any[]) => {
  const message = args.join(" ");
  if (
    message.includes("Androids permission requirements") ||
    message.includes("Android's permission requirements") ||
    message.includes("media library") ||
    message.includes("i18next is made possible") ||
    message.includes("Locize")
  ) {
    return;
  }
  originalLog(...args);
};

const originalError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(" ");
  if (
    message.includes("Androids permission requirements") ||
    message.includes("Android's permission requirements") ||
    message.includes("media library")
  ) {
    return;
  }
  originalError(...args);
};

const originalInfo = console.info;
console.info = (...args: any[]) => {
  const message = args.join(" ");
  if (
    message.includes("i18next is made possible") ||
    message.includes("Locize")
  ) {
    return;
  }
  originalInfo(...args);
};

import './global.css';
import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';

import App from './app/App';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync().catch(() => {
//   /* reloading the app might cause some issues with preventAutoHideAsync */
// });

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
