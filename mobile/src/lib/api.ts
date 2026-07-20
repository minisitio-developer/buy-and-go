import { EventOSClient } from '@eventos-ai/sdk';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const client = new EventOSClient({
  baseURL: API_BASE_URL,
});

export function createAuthenticatedClient(token: string): EventOSClient {
  const c = new EventOSClient({
    baseURL: API_BASE_URL,
    token,
  });
  return c;
}
