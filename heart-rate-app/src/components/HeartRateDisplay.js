import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HeartRateDisplay({ heartRate, isConnected, onDisconnect }) {
  // Calculate heart rate zone based on BPM
  const getHeartRateZone = (bpm) => {
    if (!bpm || bpm === 0) return { zone: '--', color: '#999' };
    if (bpm < 50) return { zone: 'Resting', color: '#4CAF50' };
    if (bpm < 100) return { zone: 'Fat Burn', color: '#8BC34A' };
    if (bpm < 140) return { zone: 'Cardio', color: '#FFC107' };
    if (bpm < 170) return { zone: 'Peak', color: '#FF9800' };
    return { zone: 'Maximum', color: '#F44336' };
  };

  const zoneInfo = getHeartRateZone(heartRate);
  const isValidReading = heartRate && heartRate > 0;

  return (
    <View style={styles.container}>
      <View style={styles.heartContainer}>
        <View style={[
          styles.heartIcon, 
          isValidReading && styles.heartBeat
        ]}>
          <Text style={styles.heartSymbol}>❤️</Text>
        </View>
        
        {isValidReading ? (
          <Text style={styles.heartRate}>{heartRate}</Text>
        ) : (
          <Text style={[styles.heartRate, styles.noData]}>--</Text>
        )}
        
        <Text style={styles.unit}>BPM</Text>
      </View>

      <View style={styles.zoneContainer}>
        <Text style={styles.zoneLabel}>Zone:</Text>
        <Text style={[styles.zoneValue, { color: zoneInfo.color }]}>
          {zoneInfo.zone}
        </Text>
      </View>

      {isConnected && (
        <TouchableOpacity 
          style={styles.disconnectButton}
          onPress={onDisconnect}
        >
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      )}

      {!isConnected && !isValidReading && (
        <Text style={styles.statusMessage}>
          Connect to a heart rate monitor to start tracking
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  heartContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heartIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heartBeat: {
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  heartSymbol: {
    fontSize: 40,
  },
  heartRate: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
  },
  noData: {
    color: '#999',
  },
  unit: {
    fontSize: 24,
    color: '#666',
    marginTop: 8,
  },
  zoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  zoneLabel: {
    fontSize: 18,
    color: '#666',
    marginRight: 8,
  },
  zoneValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
  },
});
