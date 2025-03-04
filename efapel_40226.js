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
  fingerprint: [
    {endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cdf3456$/}, // Entry Light Switch
    {endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cdf1234$/} // North Upstairs Light Switch
  ],
  model: "40226",
  vendor: "EFAPEL-Domus40",
  description: "4-Gang Push Button D40",
  exposes: [
    e.switch().withEndpoint('left'),
    e.switch().withEndpoint('right'),
  ],
  fromZigbee: [fz.livolo_switch_state, fz.livolo_switch_state_raw, fz.livolo_new_switch_state_4gang],
  toZigbee: [tz.light_onoff_brightness, tz.livolo_socket_switch_on_off],
  // toZigbee: [tz.light_onoff_brightness], //working
  endpoint: (device) => {
      return {left: 8, right: 82};
  },
  configure: async (device, coordinatorEndpoint, logger) => {
    const endpoint = device.getEndpoint(8);
    const options = {transactionSequenceNumber: 0, srcEndpoint: 8, disableResponse: true, disableRecovery: true};
    await endpoint.command('genOnOff', 'toggle', {}, options);
  }

};

module.exports = definition;
