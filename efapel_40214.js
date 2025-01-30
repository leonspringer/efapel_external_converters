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
  fingerprint: [{endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cddc...$/}],
  model: "40214",
  vendor: "EFAPEL-Domus40",
  description: "2 Circuit Switch Metering D40",
  exposes: [
    e.switch().withEndpoint('circuit_1'),
    e.switch().withEndpoint('circuit_2'),
  ],
  fromZigbee: [fz.livolo_switch_state, fz.livolo_switch_state_raw, fz.livolo_new_switch_state_4gang],
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
