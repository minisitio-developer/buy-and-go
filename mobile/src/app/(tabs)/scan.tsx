import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { client } from '../../lib/api';
import CheckinResult from '../../components/CheckinResult';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<{ success: boolean; attendeeName?: string; message: string } | null>(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScanned(true);
    Vibration.vibrate(100);

    try {
      const payload = JSON.parse(data);
      const eventId = payload.eventId || payload.event_id;
      const ticketCode = payload.ticketCode || payload.ticket_code || payload.code || data;

      if (!eventId) {
        setResult({ success: false, message: 'Invalid QR code: missing event ID' });
        return;
      }

      const checkin = await client.checkin.checkin({
        eventId,
        ticketCode,
        method: 'qr_code',
      });

      setResult({
        success: true,
        attendeeName: checkin.metadata?.attendeeName as string,
        message: 'Check-in successful!',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check-in failed';
      setResult({ success: false, message });
    } finally {
      scanningRef.current = false;
    }
  }

  function handleResultDismiss() {
    setResult(null);
    setScanned(false);
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required to scan QR codes.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {result ? (
        <CheckinResult
          success={result.success}
          attendeeName={result.attendeeName}
          message={result.message}
          onDismiss={handleResultDismiss}
        />
      ) : (
        <>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          >
            <View style={styles.overlay}>
              <View style={styles.scanArea} />
              <Text style={styles.hint}>Align QR code within the frame</Text>
            </View>
          </CameraView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#e94560',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: {
    color: '#fff',
    fontSize: 14,
    marginTop: 24,
    opacity: 0.8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 24,
  },
});
