const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const ota = require('zigbee-herdsman-converters/lib/ota');
const utils = require('zigbee-herdsman-converters/lib/utils');
const globalStore = require('zigbee-herdsman-converters/lib/store');
const e = exposes.presets;
const ea = exposes.access;



const definition = {
  fingerprint: [{endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cdda...$/}],
  model: "40218",
  vendor: "EFAPEL-Domus40",
  description: "Blinds Command Metering D40",
  exposes: [
    e.cover_position().withEndpoint('cover'), 
    e.switch().withEndpoint('left'),
    e.switch().withEndpoint('right'),
  ],
  fromZigbee: [fz.livolo_dimmer_state],
  toZigbee: [tz.cover_via_brightness],
  // toZigbee: [tz.light_onoff_brightness], //working
  endpoint: (device) => {
      return {cover: 24 ,left: 24, right: 24, bottom_left: 24, bottom_right: 24};
  },
  configure: async (device, coordinatorEndpoint, logger) => {
    const endpoint = device.getEndpoint(24);
    const options = {transactionSequenceNumber: 0, srcEndpoint: 8, disableResponse: true, disableRecovery: true};
    await endpoint.command('genOnOff', 'toggle', {}, options);
  }

};

module.exports = definition;


// const {deviceEndpoints, electricityMeter, light, commandsLevelCtrl, windowCovering} = require('zigbee-herdsman-converters/lib/modernExtend');

// const definition = {
//   fingerprint: [{endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cdd....$/}],
//   model: "40218",
//   vendor: "EFAPEL-Domus40",
//   description: "Blinds Command Metering D40",
//   extend: [
//     deviceEndpoints({ endpoints: { "8":8,"9":9,"24":24 } }),
//     commandsLevelCtrl({"endpointNames":["24"]}),
//     // electricityMeter({
//     //   endpointNames: ["9"],
//     //   current: true,
//     // }),
//     windowCovering({ endpointNames: ["24"], controls: 'lift', coverMode: true }),
//   ],
//   meta: { multiEndpoint: true },
// };

// module.exports = definition;
