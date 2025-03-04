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
    {endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cdf3456$/}, // Laundry Lights
    {endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cdf1234$/} // Upstairs Hallway Lights
  ],
  model: "40213",
  vendor: "EFAPEL-Domus40",
  description: "Circuit Switch Metering D40",
  exposes: [
    e.light().withEndpoint('circuit_1'),
  ],
  fromZigbee: [fz.livolo_switch_state, fz.livolo_switch_state_raw, fz.livolo_new_switch_state_4gang],
  toZigbee: [tz.light_onoff_brightness, tz.livolo_socket_switch_on_off],
  endpoint: (device) => {
      return {circuit_1: 21};
  },
  configure: async (device, coordinatorEndpoint, logger) => {
    const endpoint = device.getEndpoint(21);
    const options = {transactionSequenceNumber: 0, srcEndpoint: 8, disableResponse: true, disableRecovery: true};
    await endpoint.command('genOnOff', 'toggle', {}, options);
  }

};

module.exports = definition;