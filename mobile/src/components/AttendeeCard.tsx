import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AttendeeCardProps {
  name: string;
  ticketCode: string;
  timestamp: string;
  method: string;
}

export default function AttendeeCard({ name, ticketCode, timestamp, method }: AttendeeCardProps) {
  function formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }

  function getMethodIcon(m: string): keyof typeof Ionicons.glyphMap {
    switch (m) {
      case 'qr_code':
        return 'qr-code';
      case 'manual':
        return 'create';
      case 'face_recognition':
        return 'camera';
      case 'nfc':
        return 'phone-portrait';
      default:
        return 'checkmark-circle';
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.ticketCode}>#{ticketCode.slice(-8).toUpperCase()}</Text>
        <View style={styles.meta}>
          <Ionicons name={getMethodIcon(method)} size={12} color="#8899aa" />
          <Text style={styles.metaText}>{formatDate(timestamp)} at {formatTime(timestamp)}</Text>
        </View>
      </View>

      <View style={styles.badge}>
        <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketCode: {
    color: '#8899aa',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaText: {
    color: '#8899aa',
    fontSize: 11,
  },
  badge: {
    marginLeft: 8,
  },
});
