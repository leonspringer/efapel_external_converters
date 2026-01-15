// ===== USER EDITABLE DEVICE LIST =====
// Add or remove IEEE addresses for EFAPEL 40215 devices here
const EFAPEL_40215_DEVICES = [
  '0x00124b00112233ff', // Front Porch Light
  '0x00124b00112233ee', // Dining Room Lights
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
      console.log(`EFAPEL 40215: Received message from endpoint ${msg.endpoint.ID}, data: [${data.join(',')}]`);
      
      // Check if message is from endpoint 25 (light endpoint)
      if (msg.endpoint.ID === 25 && data && data.length >= 4) {
        let payload = {};
        
        // Analyze the message patterns based on logs:
        // OFF state patterns:
        //   [39,2,247,255] - Light turning off (from physical switch)
        //   [39,2,244,255] - Light turning off (from IKEA switch/Z2M command)
        //   [39,0,0,0] - Status confirmation for off
        // ON state patterns:
        //   [39,1,0,255] - Light turning on
        //   [39,3,255,0] - Status confirmation for on
        
        if (data[0] === 39) { // Command identifier
          if (data[1] === 2 && (data[2] === 247 || data[2] === 244) && data[3] === 255) {
            // Light turned off (via physical switch or Z2M command)
            payload.state_25 = 'OFF';
            payload.brightness_25 = 0;
            console.log(`EFAPEL: Light turned OFF - pattern [${data.join(',')}]`);
            return payload;
          } else if (data[1] === 0 && data[2] === 0 && data[3] === 0) {
            // Status confirmation - light is off
            payload.state_25 = 'OFF';
            payload.brightness_25 = 0;
            console.log('EFAPEL: Status confirmation - light OFF');
            return payload;
          } else if (data[1] === 1 && data[2] === 0 && data[3] === 255) {
            // Light turned on via physical switch
            payload.state_25 = 'ON';
            payload.brightness_25 = 254; // Max brightness for now
            console.log('EFAPEL: Light turned ON via physical switch');
            return payload;
          } else if (data[1] === 3 && data[2] === 255 && data[3] === 0) {
            // Status confirmation - light is on
            payload.state_25 = 'ON';
            payload.brightness_25 = 254; // Max brightness for now
            console.log('EFAPEL: Status confirmation - light ON');
            return payload;
          } else {
            // Other patterns might indicate different brightness levels
            console.log(`EFAPEL Debug: Unknown pattern [${data.join(',')}] from endpoint ${msg.endpoint.ID}`);
          }
        }
      }
      
      // Return empty object if no match
      return {};
    },
  },
};

const definition = {
  fingerprint: EFAPEL_40215_DEVICES.map(ieeeAddr => ({
    endpoint: "8", 
    modelID: '0110', 
    ieeeAddr: new RegExp(`^${ieeeAddr}$`)
  })),
  model: "40215/40415",
  vendor: "EFAPEL-Domus40",
  description: "Electronic Dimmer 250Va Rlc Metering D40",
  exposes: [
    e.light().withEndpoint('25').withBrightness(),
  ],
  fromZigbee: [
    fzLocal.efapel_raw_cluster,
  ],
  toZigbee: [
    tz.light_onoff_brightness,
  ],
  endpoint: (device) => {
    return {25: 25, 9: 9};
  },
  meta: {multiEndpoint: true},
  configure: async (device, coordinatorEndpoint, logger) => {
    // Simplified configure function for compatibility
    try {
      const endpoint25 = device.getEndpoint(25);
      await reporting.bind(endpoint25, coordinatorEndpoint, ['genOnOff']);
    } catch (error) {
      logger.warn(`EFAPEL 40215: Configure failed: ${error.message}`);
    }
  },
};

module.exports = definition;