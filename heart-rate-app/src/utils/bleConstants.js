/**
 * Heart Rate Service UUID and Characteristics
 * Based on Bluetooth Heart Rate Profile specification
 */

// Heart Rate Service UUID
export const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';

// Heart Rate Measurement Characteristic UUID
export const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

// Body Sensor Location Characteristic UUID
export const BODY_SENSOR_LOCATION_UUID = '00002a38-0000-1000-8000-00805f9b34fb';

// Heart Rate Control Point Characteristic UUID
export const HEART_RATE_CONTROL_POINT_UUID = '00002a39-0000-1000-8000-00805f9b34fb';

/**
 * Parse heart rate measurement data
 * @param {DataView} dataView - The data from the characteristic
 * @returns {Object} Parsed heart rate data
 */
export function parseHeartRate(dataView) {
  let flags = dataView.getUint8(0);
  let rate16Bits = flags & 0x1;
  let result = {};
  
  // Heart rate value format (bit 0)
  if (rate16Bits) {
    result.heartRate = dataView.getUint16(1, true);
  } else {
    result.heartRate = dataView.getUint8(1);
  }
  
  // Contact Status bit (bit 1 and 2)
  let contactStatusBit = flags & 0x6;
  if (contactStatusBit !== 0) {
    result.contactStatus = contactStatusBit === 0x2 ? 'not detected' : 'detected';
  }
  
  // Energy Expended status bit (bit 3)
  let energyExpendedStatusBit = flags & 0x8;
  if (energyExpendedStatusBit !== 0) {
    result.energyExpended = dataView.getUint16(rate16Bits ? 3 : 2, true);
  }
  
  // RR-Interval present bit (bit 4)
  let rrIntervalPresentBit = flags & 0x10;
  if (rrIntervalPresentBit !== 0) {
    let rrIntervals = [];
    let offset = rate16Bits ? 3 : 2;
    if (energyExpendedStatusBit !== 0) {
      offset += 2;
    }
    
    while (offset < dataView.byteLength) {
      let rrInterval = dataView.getUint16(offset, true);
      rrIntervals.push(rrInterval / 1024); // Convert to seconds
      offset += 2;
    }
    result.rrIntervals = rrIntervals;
  }
  
  return result;
}

/**
 * Check if a device is a heart rate monitor
 * @param {Object} device - BLE device object
 * @returns {boolean}
 */
export function isHeartRateMonitor(device) {
  if (!device.serviceUUIDs) {
    return false;
  }
  
  return device.serviceUUIDs.some(uuid => 
    uuid.toLowerCase().includes(HEART_RATE_SERVICE_UUID.toLowerCase())
  );
}
