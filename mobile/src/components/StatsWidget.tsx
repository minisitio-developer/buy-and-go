import { View, Text, StyleSheet } from 'react-native';

interface StatsWidgetProps {
  total: number;
  checkedIn: number;
  pending: number;
  rate: number;
}

export default function StatsWidget({ total, checkedIn, pending, rate }: StatsWidgetProps) {
  const percentage = Math.round(rate * 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatBox label="Total" value={total} color="#8899aa" />
        <StatBox label="Checked In" value={checkedIn} color="#22c55e" />
        <StatBox label="Pending" value={pending} color="#e94560" />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressLabel}>
          <Text style={styles.progressText}>Check-in Rate</Text>
          <Text style={styles.progressPercent}>{percentage}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]} />
        </View>
      </View>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#8899aa',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#8899aa',
    fontSize: 14,
  },
  progressPercent: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0f3460',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 4,
  },
});
