import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import heartRateService from '../services/heartRateService';
import DeviceList from '../components/DeviceList';
import HeartRateDisplay from '../components/HeartRateDisplay';

export default function HomeScreen() {
  const [view, setView] = useState('scan'); // 'scan' or 'monitor'
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [heartRate, setHeartRate] = useState(null);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [error, setError] = useState(null);

  // Request Android permissions
  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'Bluetooth and location permissions are required to scan for devices.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Initialize service callbacks
  useEffect(() => {
    heartRateService.setScanResultCallback((device) => {
      setDevices(prev => {
        // Avoid duplicates
        const exists = prev.some(d => d.id === device.id);
        if (exists) return prev;
        return [...prev, device];
      });
    });

    heartRateService.setScanCompleteCallback(() => {
      setIsScanning(false);
    });

    heartRateService.setDeviceConnectedCallback((device) => {
      setIsConnected(true);
      setCurrentDevice(device);
      setView('monitor');
    });

    heartRateService.setHeartRateCallback((data) => {
      if (data.heartRate) {
        setHeartRate(data.heartRate);
      }
    });

    heartRateService.setErrorCallback((err) => {
      console.error('BLE Error:', err);
      setError(err.message);
      Alert.alert('Error', err.message);
    });

    // Check Bluetooth state on mount
    checkBluetoothState();

    return () => {
      heartRateService.destroy();
    };
  }, []);

  const checkBluetoothState = async () => {
    const isPoweredOn = await heartRateService.checkBluetoothState();
    if (!isPoweredOn) {
      Alert.alert(
        'Bluetooth Off',
        'Please enable Bluetooth to use this app.',
        [{ text: 'OK' }]
      );
    }
  };

  const startScanning = async () => {
    setError(null);
    setDevices([]);
    
    const hasPermission = await requestAndroidPermissions();
    if (!hasPermission) {
      return;
    }

    const isBtEnabled = await heartRateService.checkBluetoothState();
    if (!isBtEnabled) {
      Alert.alert('Bluetooth Off', 'Please enable Bluetooth.');
      return;
    }

    setIsScanning(true);
    heartRateService.startScan();
  };

  const stopScanning = () => {
    heartRateService.stopScan();
    setIsScanning(false);
  };

  const handleSelectDevice = async (device) => {
    stopScanning();
    try {
      await heartRateService.connectToDevice(device.id);
    } catch (err) {
      console.error('Connection failed:', err);
      Alert.alert('Connection Failed', 'Could not connect to the device.');
      setView('scan');
    }
  };

  const handleDisconnect = async () => {
    try {
      await heartRateService.disconnect();
      setIsConnected(false);
      setCurrentDevice(null);
      setHeartRate(null);
      setView('scan');
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>❤️ Heart Rate Monitor</Text>
      {currentDevice && (
        <Text style={styles.connectedDevice}>
          Connected: {currentDevice.name || 'Unknown'}
        </Text>
      )}
    </View>
  );

  const renderScanView = () => (
    <View style={styles.content}>
      {!isScanning && devices.length === 0 && (
        <View style={styles.scanPrompt}>
          <Text style={styles.promptTitle}>Find Your Heart Rate Monitor</Text>
          <Text style={styles.promptText}>
            Make sure your heart rate monitor is powered on and in pairing mode.
          </Text>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={startScanning}
          >
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <DeviceList 
        devices={devices}
        onSelectDevice={handleSelectDevice}
        isScanning={isScanning}
        onStopScan={stopScanning}
      />
    </View>
  );

  const renderMonitorView = () => (
    <HeartRateDisplay 
      heartRate={heartRate}
      isConnected={isConnected}
      onDisconnect={handleDisconnect}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {view === 'scan' ? renderScanView() : renderMonitorView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#F44336',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  connectedDevice: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scanPrompt: {
    padding: 32,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});
