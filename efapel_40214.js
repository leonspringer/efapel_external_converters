// ===== USER EDITABLE DEVICE LIST =====
// Add or remove IEEE addresses for EFAPEL 40214 devices here
const EFAPEL_40214_DEVICES = [
  '0x00124b00ddeeff00', // Hallway Lights
  '0x00124b00ddeeff01', // Guest Bedroom
  '0x00124b00ddeeff02', // Bathroom Lights
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
      console.log(`EFAPEL 40214: Received message from endpoint ${msg.endpoint.ID}, data: [${data.join(',')}]`);
      
      let payload = {};
      
      // Check if message is from endpoint 21 (circuit_1) or 22 (circuit_2)
      if (data && data.length >= 3 && data[0] === 39) { // Changed to 3 bytes and moved command check
        if (msg.endpoint.ID === 21) {
          // Circuit 1
          if (data.length === 4) {
            // 4-byte patterns (like 40215)
            if (data[1] === 2 && (data[2] === 247 || data[2] === 244) && data[3] === 255) {
              payload.state_circuit_1 = 'OFF';
              console.log(`EFAPEL 40214: Circuit 1 turned OFF - 4-byte pattern [${data.join(',')}]`);
            } else if (data[1] === 0 && data[2] === 0 && data[3] === 0) {
              payload.state_circuit_1 = 'OFF';
              console.log('EFAPEL 40214: Status confirmation - Circuit 1 OFF');
            } else if (data[1] === 1 && data[2] === 0 && data[3] === 255) {
              payload.state_circuit_1 = 'ON';
              console.log('EFAPEL 40214: Circuit 1 turned ON via physical switch');
            } else if (data[1] === 3 && data[2] === 255 && data[3] === 0) {
              payload.state_circuit_1 = 'ON';
              console.log('EFAPEL 40214: Status confirmation - Circuit 1 ON');
            }
          } else if (data.length === 3) {
            // 3-byte patterns (like 40213)
            if (data[1] === 1 && data[2] === 255) {
              payload.state_circuit_1 = 'ON';
              console.log(`EFAPEL 40214: Circuit 1 turned ON - 3-byte pattern [${data.join(',')}]`);
            } else if (data[1] === 0 && data[2] === 255) {
              payload.state_circuit_1 = 'OFF';
              console.log(`EFAPEL 40214: Circuit 1 turned OFF - 3-byte pattern [${data.join(',')}]`);
            }
          }
        } else if (msg.endpoint.ID === 22) {
          // Circuit 2
          if (data.length === 4) {
            // 4-byte patterns (like 40215)
            if (data[1] === 2 && (data[2] === 247 || data[2] === 244) && data[3] === 255) {
              payload.state_circuit_2 = 'OFF';
              console.log(`EFAPEL 40214: Circuit 2 turned OFF - 4-byte pattern [${data.join(',')}]`);
            } else if (data[1] === 0 && data[2] === 0 && data[3] === 0) {
              payload.state_circuit_2 = 'OFF';
              console.log('EFAPEL 40214: Status confirmation - Circuit 2 OFF');
            } else if (data[1] === 1 && data[2] === 0 && data[3] === 255) {
              payload.state_circuit_2 = 'ON';
              console.log('EFAPEL 40214: Circuit 2 turned ON via physical switch');
            } else if (data[1] === 3 && data[2] === 255 && data[3] === 0) {
              payload.state_circuit_2 = 'ON';
              console.log('EFAPEL 40214: Status confirmation - Circuit 2 ON');
            }
          } else if (data.length === 3) {
            // 3-byte patterns (like 40213)
            if (data[1] === 1 && data[2] === 255) {
              payload.state_circuit_2 = 'ON';
              console.log(`EFAPEL 40214: Circuit 2 turned ON - 3-byte pattern [${data.join(',')}]`);
            } else if (data[1] === 0 && data[2] === 255) {
              payload.state_circuit_2 = 'OFF';
              console.log(`EFAPEL 40214: Circuit 2 turned OFF - 3-byte pattern [${data.join(',')}]`);
            }
          }
        }
        
        if (Object.keys(payload).length === 0) {
          console.log(`EFAPEL 40214 Debug: Unknown pattern [${data.join(',')}] from endpoint ${msg.endpoint.ID}`);
        }
      }
      
      return payload;
    },
  },
};



const definition = {
  fingerprint: EFAPEL_40214_DEVICES.map(ieeeAddr => ({
    endpoint: "8", 
    modelID: '0110', 
    ieeeAddr: new RegExp(`^${ieeeAddr}$`)
  })),
  model: "40214",
  vendor: "EFAPEL-Domus40",
  description: "2 Circuit Switch Metering D40",
  exposes: [
    e.switch().withEndpoint('circuit_1'),
    e.switch().withEndpoint('circuit_2'),
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
      return {circuit_1: 21, circuit_2: 22};
  },
  configure: async (device, coordinatorEndpoint, logger) => {
    const endpoint = device.getEndpoint(21);
    const options = {transactionSequenceNumber: 0, srcEndpoint: 8, disableResponse: true, disableRecovery: true};
    await endpoint.command('genOnOff', 'toggle', {}, options);
  }

};

module.exports = definition;

