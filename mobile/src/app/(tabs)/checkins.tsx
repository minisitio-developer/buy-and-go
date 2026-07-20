import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { client } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import AttendeeCard from '../../components/AttendeeCard';

interface CheckinItem {
  id: string;
  attendeeName: string;
  ticketCode: string;
  timestamp: string;
  method: string;
}

export default function CheckinsScreen() {
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{ total: number; today: number }>({ total: 0, today: 0 });
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      loadCheckins();
    }, [])
  );

  async function loadCheckins() {
    try {
      const eventsRes = await client.events.list({ limit: 1, status: 'published' });
      if (eventsRes.data.length === 0) {
        setCheckins([]);
        return;
      }

      const eventId = eventsRes.data[0].id;
      const [checkinRes, statsRes] = await Promise.all([
        client.checkin.listCheckins(eventId, { limit: 50 }),
        client.checkin.getStats(eventId),
      ]);

      setCheckins(
        checkinRes.data.map((c: any) => ({
          id: c.id,
          attendeeName: c.metadata?.attendeeName || 'Unknown',
          ticketCode: c.ticketCode,
          timestamp: c.timestamp,
          method: c.method,
        }))
      );

      setStats({
        total: statsRes.checkedIn,
        today: statsRes.byHour.reduce((sum: number, h: any) => {
          const hour = parseInt(h.hour);
          const today = new Date();
          return hour <= today.getHours() ? sum + h.count : sum;
        }, 0),
      });
    } catch (err) {
      console.error('Failed to load checkins:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadCheckins();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.today}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{checkins.length}</Text>
          <Text style={styles.statLabel}>Recent</Text>
        </View>
      </View>

      <FlatList
        data={checkins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AttendeeCard
            name={item.attendeeName}
            ticketCode={item.ticketCode}
            timestamp={item.timestamp}
            method={item.method}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No check-ins yet</Text>
          </View>
        }
        contentContainerStyle={checkins.length === 0 ? styles.emptyList : undefined}
      />
    </View>
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
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 12,
    color: '#8899aa',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  emptyList: {
    flex: 1,
  },
  emptyText: {
    color: '#8899aa',
    fontSize: 16,
  },
});
