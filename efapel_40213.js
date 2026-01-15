// ===== USER EDITABLE DEVICE LIST =====
// Add or remove IEEE addresses for EFAPEL 40213 devices here
const EFAPEL_40213_DEVICES = [
  '0x00124b00aabbccdd', // Living Room Lights
  '0x00124b00aabbccde', // Kitchen Overhead
  '0x00124b00aabbccdf', // Master Bedroom
];
// ===== END USER EDITABLE SECTION =====

const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const ota = require('zigbee-herdsman-converters/lib/ota');
const utils = require('zigbee-herdsman-converters/lib/utils');
const globalStore = require('zigbee-herdsman-converters/lib/store');
const e = exposes.presets;
const ea = exposes.access;

// Custom fromZigbee converter for raw cluster 61440 messages
const fzLocal = {
  efapel_raw_cluster: {
    cluster: 61440, // 0xF000 - proprietary cluster
    type: ['raw'],
    convert: (model, msg, publish, options, meta) => {
      // Handle incoming raw messages from physical switch operations
      const data = msg.data;
      
      // Debug: Log all incoming messages to this cluster
      console.log(`EFAPEL 40213: Received message from endpoint ${msg.endpoint.ID}, data: [${data.join(',')}]`);
      
      // Check if message is from endpoint 21 (circuit_1 endpoint)
      if (msg.endpoint.ID === 21 && data && data.length >= 3) { // Changed from 4 to 3 bytes
        let payload = {};
        
        // Analyze the message patterns (similar to 40215)
        if (data[0] === 39) { // Command identifier
          if (data.length === 4) {
            // 4-byte patterns (like 40215)
            if (data[1] === 2 && (data[2] === 247 || data[2] === 244) && data[3] === 255) {
              payload.state_circuit_1 = 'OFF';
              console.log(`EFAPEL 40213: Circuit 1 turned OFF - pattern [${data.join(',')}]`);
              return payload;
            } else if (data[1] === 0 && data[2] === 0 && data[3] === 0) {
              payload.state_circuit_1 = 'OFF';
              console.log('EFAPEL 40213: Status confirmation - Circuit 1 OFF');
              return payload;
            } else if (data[1] === 1 && data[2] === 0 && data[3] === 255) {
              payload.state_circuit_1 = 'ON';
              console.log('EFAPEL 40213: Circuit 1 turned ON via physical switch');
              return payload;
            } else if (data[1] === 3 && data[2] === 255 && data[3] === 0) {
              payload.state_circuit_1 = 'ON';
              console.log('EFAPEL 40213: Status confirmation - Circuit 1 ON');
              return payload;
            }
          } else if (data.length === 3) {
            // 3-byte patterns (observed in logs)
            if (data[1] === 1 && data[2] === 255) {
              // Light turned on - 3 byte pattern
              payload.state_circuit_1 = 'ON';
              console.log(`EFAPEL 40213: Circuit 1 turned ON - 3-byte pattern [${data.join(',')}]`);
              return payload;
            } else if (data[1] === 0 && data[2] === 255) {
              // Light turned off - 3 byte pattern (corrected from logs)
              payload.state_circuit_1 = 'OFF';
              console.log(`EFAPEL 40213: Circuit 1 turned OFF - 3-byte pattern [${data.join(',')}]`);
              return payload;
            } else {
              console.log(`EFAPEL 40213 Debug: Unknown 3-byte pattern [${data.join(',')}] from endpoint ${msg.endpoint.ID}`);
            }
          }
        } else {
          console.log(`EFAPEL 40213 Debug: Unknown pattern [${data.join(',')}] from endpoint ${msg.endpoint.ID}`);
        }
      }
      
      return {};
    },
  },
};



const definition = {
  fingerprint: EFAPEL_40213_DEVICES.map(ieeeAddr => ({
    endpoint: "8", 
    modelID: '0110', 
    ieeeAddr: new RegExp(`^${ieeeAddr}$`)
  })),
  model: "40213",
  vendor: "EFAPEL-Domus40",
  description: "Circuit Switch Metering D40",
  exposes: [
    e.switch().withEndpoint('circuit_1'),
  ],
  fromZigbee: [
    fz.livolo_switch_state, 
    fz.livolo_switch_state_raw, 
    fz.livolo_new_switch_state_4gang,
    fzLocal.efapel_raw_cluster,
  ],
  toZigbee: [tz.light_onoff_brightness, tz.livolo_socket_switch_on_off],
  // toZigbee: [tz.light_onoff_brightness], //working
  endpoint: (device) => {
      return {cover: 21 ,circuit_1: 21};
  },
  configure: async (device, coordinatorEndpoint, logger) => {
    const endpoint = device.getEndpoint(21);
    const options = {transactionSequenceNumber: 0, srcEndpoint: 8, disableResponse: true, disableRecovery: true};
    await endpoint.command('genOnOff', 'toggle', {}, options);
  }

};


module.exports = definition;

