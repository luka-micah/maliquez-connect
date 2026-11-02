import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  const override = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (override) return override;

  // When the app runs on a physical device connected to the Expo dev server,
  // derive the backend host from the dev server's host (same machine, port 4000).
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:4000/api/v1`;
    }
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api/v1'
    : 'http://localhost:4000/api/v1';
}

export const API_URL = resolveApiUrl();

export const APP_NAME = 'Maliquez Connect';
