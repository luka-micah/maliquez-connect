import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from './config';

export const TOKEN_KEY = 'mc_access_token';

const isWeb = Platform.OS === 'web';
let memoryToken: string | null = null;

function storageGet(): Promise<string | null> {
  if (isWeb && typeof localStorage !== 'undefined') {
    return Promise.resolve(localStorage.getItem(TOKEN_KEY));
  }
  return SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
}

function storageSet(token: string): Promise<void> {
  if (isWeb && typeof localStorage !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => undefined);
}

function storageClear(): Promise<void> {
  if (isWeb && typeof localStorage !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    return Promise.resolve();
  }
  return SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
}

export const tokenStore = {
  hydrate(token: string | null) {
    memoryToken = token;
  },
  async get(): Promise<string | null> {
    if (memoryToken) return memoryToken;
    return storageGet();
  },
  async set(token: string): Promise<void> {
    memoryToken = token;
    return storageSet(token);
  },
  async clear(): Promise<void> {
    memoryToken = null;
    return storageClear();
  },
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || 'Network request failed';
    return Promise.reject(new Error(message));
  },
);
