import { BleManager } from 'react-native-ble-plx';
import { 
  HEART_RATE_SERVICE_UUID, 
  HEART_RATE_MEASUREMENT_UUID,
  isHeartRateMonitor,
  parseHeartRate 
} from '../utils/bleConstants';

class HeartRateService {
  constructor() {
    this.bleManager = new BleManager();
    this.connectedDevice = null;
    this.isScanning = false;
    this.onHeartRateUpdate = null;
    this.onDeviceConnected = null;
    this.onScanResult = null;
    this.onScanComplete = null;
    this.onError = null;
  }

  /**
   * Request Bluetooth permissions (Android specific)
   */
  async requestPermissions() {
    try {
      const result = await this.bleManager.requestPermission();
      return result;
    } catch (error) {
      console.error('Permission error:', error);
      throw error;
    }
  }

  /**
   * Check if Bluetooth is supported and enabled
   */
  async checkBluetoothState() {
    try {
      const state = await this.bleManager.state();
      return state === 'PoweredOn';
    } catch (error) {
      console.error('Bluetooth state error:', error);
      return false;
    }
  }

  /**
   * Start scanning for heart rate monitors
   */
  startScan() {
    if (this.isScanning) {
      return;
    }

    this.isScanning = true;
    
    this.bleManager.startDeviceScan(
      [HEART_RATE_SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          if (this.onError) {
            this.onError(error);
          }
          return;
        }

        if (device && isHeartRateMonitor(device)) {
          if (this.onScanResult) {
            this.onScanResult(device);
          }
        }
      }
    );

    // Stop scanning after 30 seconds
    setTimeout(() => {
      this.stopScan();
    }, 30000);
  }

  /**
   * Stop scanning
   */
  stopScan() {
    if (!this.isScanning) {
      return;
    }

    this.bleManager.stopDeviceScan();
    this.isScanning = false;

    if (this.onScanComplete) {
      this.onScanComplete();
    }
  }

  /**
   * Connect to a heart rate monitor device
   */
  async connectToDevice(deviceId) {
    try {
      // First, stop scanning if it's running
      this.stopScan();

      // Discover the device
      const discoveredDevice = await this.bleManager.discoverDeviceById(deviceId);
      
      if (!discoveredDevice) {
        throw new Error('Device not found');
      }

      // Connect to the device
      const connectedDevice = await discoveredDevice.connect();
      
      // Discover services
      await connectedDevice.discoverAllServicesAndCharacteristics();

      this.connectedDevice = connectedDevice;

      if (this.onDeviceConnected) {
        this.onDeviceConnected(connectedDevice);
      }

      // Subscribe to heart rate measurements
      await this.subscribeToHeartRate();

      return connectedDevice;
    } catch (error) {
      console.error('Connection error:', error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Subscribe to heart rate measurement notifications
   */
  async subscribeToHeartRate() {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const service = await this.connectedDevice.services();
      const heartRateService = service.find(s => s.uuid.toLowerCase().includes(HEART_RATE_SERVICE_UUID.toLowerCase()));

      if (!heartRateService) {
        throw new Error('Heart Rate Service not found');
      }

      const characteristic = await heartRateService.characteristics();
      const hrCharacteristic = characteristic.find(c => 
        c.uuid.toLowerCase().includes(HEART_RATE_MEASUREMENT_UUID.toLowerCase())
      );

      if (!hrCharacteristic) {
        throw new Error('Heart Rate Measurement characteristic not found');
      }

      // Subscribe to notifications
      await hrCharacteristic.monitor((error, characteristic) => {
        if (error) {
          console.error('Monitor error:', error);
          if (this.onError) {
            this.onError(error);
          }
          return;
        }

        if (characteristic && characteristic.value) {
          const dataView = new DataView(
            characteristic.value.buffer,
            characteristic.value.offset,
            characteristic.value.length
          );
          
          const heartRateData = parseHeartRate(dataView);
          
          if (this.onHeartRateUpdate) {
            this.onHeartRateUpdate(heartRateData);
          }
        }
      });

    } catch (error) {
      console.error('Subscribe error:', error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Disconnect from the current device
   */
  async disconnect() {
    try {
      if (this.connectedDevice) {
        await this.connectedDevice.cancelConnection();
        this.connectedDevice = null;
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopScan();
    this.disconnect();
    this.bleManager.destroy();
  }

  // Callback setters
  setHeartRateCallback(callback) {
    this.onHeartRateUpdate = callback;
  }

  setDeviceConnectedCallback(callback) {
    this.onDeviceConnected = callback;
  }

  setScanResultCallback(callback) {
    this.onScanResult = callback;
  }

  setScanCompleteCallback(callback) {
    this.onScanComplete = callback;
  }

  setErrorCallback(callback) {
    this.onError = callback;
  }
}

// Export singleton instance
export default new HeartRateService();
