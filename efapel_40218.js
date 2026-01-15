// ===== USER EDITABLE DEVICE LIST =====
// Add or remove IEEE addresses for EFAPEL 40218 devices here
const EFAPEL_40218_DEVICES = [
  '0x00124b00445566aa', // Study Wall Switch
  '0x00124b00445566bb', // Garage Switch
  '0x00124b00445566cc', // Entry Way Switch
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
      console.log(`EFAPEL 40218: Received message from endpoint ${msg.endpoint.ID}, data: [${data.join(',')}]`);
      
      // Check if message is from endpoint 24 (cover endpoint)
      if (msg.endpoint.ID === 24 && data && data.length >= 4) {
        let payload = {};
        
        // For blinds/covers, analyze the 4-byte patterns
        if (data[0] === 39) { // Command identifier
          if ((data[1] === 16 && data[3] === 255) || (data[1] === 0 && data[3] === 255) || (data[1] === 1 && data[3] === 255)) {
            // Cover position command detected
            const position = data[2]; // Position value (0-255)
            
            // Convert 0-255 range to 0-100 percentage
            // 255 = fully up (100%), 0 = fully down (0%)
            const positionPercent = Math.round((position / 255) * 100);
            
            // Update cover attributes (position_cover for slider, state for text display)
            payload.position_cover = positionPercent;  // Cover position for HA slider
            
            console.log(`EFAPEL 40218: Cover position update - ${positionPercent}% (raw: ${position}) - pattern [${data.join(',')}]`);
            
            // Set cover state based on position for Zigbee2MQTT (not generic MQTT)
            if (positionPercent === 100) {
              payload.state = 'OPEN';        // Zigbee2MQTT expects uppercase OPEN
              payload.state_cover = 'OPEN';  // Cover-specific attribute
              console.log('EFAPEL 40218: Cover fully OPEN');
            } else if (positionPercent === 0) {
              payload.state = 'CLOSE';       // Zigbee2MQTT expects CLOSE (not CLOSED)
              payload.state_cover = 'CLOSE'; // Cover-specific attribute
              console.log('EFAPEL 40218: Cover fully Closed');
            } else {
              payload.state = 'OPEN';        // Zigbee2MQTT expects uppercase OPEN (partially open = open)
              payload.state_cover = 'OPEN';  // Cover-specific attribute
              console.log(`EFAPEL 40218: Cover partially open at ${positionPercent}%`);
            }
            
            // Always return payload for real-time updates
            return payload;
          } else if (data[1] === 16 || data[1] === 0 || data[1] === 1) {
            // Other position-related commands (might be different patterns)
            console.log(`EFAPEL 40218: Other cover command type ${data[1]} - pattern [${data.join(',')}] from endpoint ${msg.endpoint.ID}`);
          } else {
            // Other cover command patterns
            console.log(`EFAPEL 40218: Other cover command - pattern [${data.join(',')}] from endpoint ${msg.endpoint.ID}`);
          }
        } else {
          console.log(`EFAPEL 40218 Debug: Unknown pattern [${data.join(',')}] from endpoint ${msg.endpoint.ID}`);
        }
        
        return payload;
      }
      
      return {};
    },
  },
};



const definition = {
  fingerprint: EFAPEL_40218_DEVICES.map(ieeeAddr => ({
    endpoint: "8", 
    modelID: '0110', 
    ieeeAddr: new RegExp(`^${ieeeAddr}$`)
  })),
  model: "40218",
  vendor: "EFAPEL-Domus40",
  description: "Blinds Command Metering D40",
  exposes: [
    e.cover().withPosition().withEndpoint('cover'),
  ],
  fromZigbee: [
    fzLocal.efapel_raw_cluster,
  ],
  toZigbee: [tz.cover_via_brightness],
  // toZigbee: [tz.light_onoff_brightness], //working
  endpoint: (device) => {
      return {cover: 24};
  },
  configure: async (device, coordinatorEndpoint, logger) => {
    // Simplified configure function for compatibility  
    try {
      const endpoint = device.getEndpoint(24);
      // Minimal configuration for covers
    } catch (error) {
      logger.warn(`EFAPEL 40218: Configure failed: ${error.message}`);
    }
  }

};

module.exports = definition;


