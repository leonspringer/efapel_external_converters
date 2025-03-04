const {deviceEndpoints, electricityMeter, light } = require('zigbee-herdsman-converters/lib/modernExtend');

const definition = {
  fingerprint: [
    {endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cdf3456$/}, // Living Room Lights
    {endpoint: "8", modelID: '0110', ieeeAddr: /^0x00124b001cdf1234$/} // Upstairs Hallway Lights
  ],
  model: "40215/40415",
  vendor: "EFAPEL-Domus40",
  description: "Electronic Dimmer 250Va Rlc Metering D40",
  extend: [
    deviceEndpoints({ endpoints: { "9":9,"25":25 } }),
    // electricityMeter({
    //   endpointNames: ["9"],
    //   cluster: 'seMetering'
    // }),
    light({ configureReporting: true, endpointNames: ["25"] }),
  ],
  meta: { multiEndpoint: true },
};

module.exports = definition;