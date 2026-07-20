import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckinResultProps {
  success: boolean;
  attendeeName?: string;
  message: string;
  onDismiss: () => void;
}

export default function CheckinResult({ success, attendeeName, message, onDismiss }: CheckinResultProps) {
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();

    if (success) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconContainer, success ? styles.successIcon : styles.errorIcon]}>
          <Ionicons
            name={success ? 'checkmark-circle' : 'close-circle'}
            size={64}
            color={success ? '#22c55e' : '#e94560'}
          />
        </View>

        <Text style={styles.title}>{success ? 'Checked In!' : 'Check-in Failed'}</Text>

        {attendeeName && <Text style={styles.name}>{attendeeName}</Text>}

        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity style={styles.button} onPress={onDismiss}>
          <Text style={styles.buttonText}>{success ? 'Continue' : 'Try Again'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
  },
  iconContainer: {
    marginBottom: 16,
  },
  successIcon: {},
  errorIcon: {},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    color: '#e94560',
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#8899aa',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#e94560',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
