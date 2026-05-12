import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

const DeviceListItem = ({ device, onSelect }) => (
  <TouchableOpacity 
    style={styles.deviceItem} 
    onPress={() => onSelect(device)}
  >
    <View style={styles.deviceInfo}>
      <Text style={styles.deviceName}>
        {device.name || 'Unknown Device'}
      </Text>
      <Text style={styles.deviceId}>{device.id}</Text>
      {device.rssi && (
        <Text style={styles.deviceRssi}>RSSI: {device.rssi} dBm</Text>
      )}
    </View>
    <Text style={styles.connectButton}>Connect</Text>
  </TouchableOpacity>
);

export default function DeviceList({ devices, onSelectDevice, isScanning, onStopScan }) {
  const [selectedDevice, setSelectedDevice] = useState(null);

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    onSelectDevice(device);
  };

  if (devices.length === 0 && !isScanning) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No heart rate monitors found</Text>
        <Text style={styles.emptySubtext}>Make sure your device is powered on and in pairing mode</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isScanning && (
        <View style={styles.scanningHeader}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.scanningText}>Scanning for devices...</Text>
          <TouchableOpacity onPress={onStopScan} style={styles.stopButton}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceListItem 
            device={item} 
            onSelect={handleSelectDevice}
          />
        )}
        ListFooterComponent={isScanning ? <ActivityIndicator style={styles.footerLoader} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scanningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderBottomWidth: 1,
    borderBottomColor: '#c8e6c9',
  },
  scanningText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2e7d32',
    flex: 1,
  },
  stopButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f44336',
    borderRadius: 4,
  },
  stopButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  connectButton: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  footerLoader: {
    marginVertical: 16,
  },
});
