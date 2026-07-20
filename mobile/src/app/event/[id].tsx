import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { client } from '../../lib/api';
import StatsWidget from '../../components/StatsWidget';

interface EventDetail {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  status: string;
  maxAttendees?: number;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [id]);

  async function loadEvent() {
    try {
      const [eventData, statsData] = await Promise.all([
        client.events.getById(id!),
        client.checkin.getStats(id!),
      ]);
      setEvent(eventData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{event.status}</Text>
        </View>
      </View>

      {event.description && (
        <Text style={styles.description}>{event.description}</Text>
      )}

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Location</Text>
        <Text style={styles.infoValue}>{event.location || 'Not set'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Start</Text>
        <Text style={styles.infoValue}>{formatDate(event.startDate)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>End</Text>
        <Text style={styles.infoValue}>{formatDate(event.endDate)}</Text>
      </View>

      {event.maxAttendees && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Capacity</Text>
          <Text style={styles.infoValue}>{event.maxAttendees} attendees</Text>
        </View>
      )}

      {stats && (
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Check-in Statistics</Text>
          <StatsWidget
            total={stats.totalAttendees}
            checkedIn={stats.checkedIn}
            pending={stats.pending}
            rate={stats.checkinRate}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    color: '#e94560',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  description: {
    color: '#8899aa',
    fontSize: 14,
    padding: 20,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  infoLabel: {
    color: '#8899aa',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsSection: {
    padding: 20,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  errorText: {
    color: '#e94560',
    fontSize: 16,
  },
});
