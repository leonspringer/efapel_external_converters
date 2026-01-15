// ===== USER EDITABLE DEVICE LIST =====
// Add or remove IEEE addresses for EFAPEL 40226 devices here
const EFAPEL_40226_DEVICES = [
  '0x00124b00778899aa', // Backyard Lights
  '0x00124b00778899bb', // Patio Switch
  '0x00124b00778899cc', // Outdoor Sconce
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
    convert: (model, msg, publish, options) => {
      // Handle incoming raw messages from physical switch operations
      const data = msg.data;
      
      // Debug: Log all incoming messages to this cluster
      console.log(`EFAPEL 40226: Received message from endpoint ${msg.endpoint.ID}, data: [${data.join(',')}]`);
      
      // The 40226 is a push button switch that sends commands
      // We might not need to return state here, but log for debugging
      return {};
    },
  },
};

const definition = {
  fingerprint: EFAPEL_40226_DEVICES.map(ieeeAddr => ({
    endpoint: "8", 
    modelID: '0110', 
    ieeeAddr: new RegExp(`^${ieeeAddr}$`)
  })),
  model: "40226",
  vendor: "EFAPEL-Domus40",
  description: "4-Gang Push Button D40",
  exposes: [
    e.switch().withEndpoint('left'),
    e.switch().withEndpoint('right'),
  ],
  fromZigbee: [
    fzLocal.efapel_raw_cluster,
  ],
  toZigbee: [],
  // toZigbee: [tz.light_onoff_brightness], //working
  endpoint: (device) => {
      return {left: 8, right: 82};
  },
  configure: async (device, coordinatorEndpoint, logger) => {
    // Simplified configure function for compatibility
    try {
      const endpoint = device.getEndpoint(8);
      // Minimal configuration for push buttons
    } catch (error) {
      logger.warn(`EFAPEL 40226: Configure failed: ${error.message}`);
    }
  }

};

module.exports = definition;
