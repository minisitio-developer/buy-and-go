import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth';

function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="index" options={{ title: 'Login' }} />
        ) : (
          <Stack.Screen name="(tabs)" options={{ title: 'Home' }} />
        )}
        <Stack.Screen name="event/[id]" options={{ title: 'Event', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
