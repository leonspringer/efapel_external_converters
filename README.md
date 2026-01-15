# Efapel Domus40 External Converter for Zigbee2MQTT

An external converter for Efapel Domus40 to Zigbee2MQTT. This information was created in the context of Home Assistant with the Zigbee2MQTT plugin installed, so there may be discrepancies between this and your specific setup.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Supported Models](#supported-models)
- [Issues](#issues)

## Installation

1. Create an `external_converter` directory if it doesn't exist in the Zigbee2MQTT home directory. For example: `config/zigbee2mqtt/external_converters/`.
2. Copy the necessary files to the directory.

## Usage

1. Pair devices with your coordinator in Zigbee2MQTT. Instructions to bind buttons together can be found in the manual: [Efapel Manuals on manualslib.com](https://www.manualslib.com/brand/efapel/).
2. Make note of the IEEE Address of the paired device, e.g., `0x00124b001cdf1234`.
3. Add the IEEE Address to the `EFAPEL_<MODEL>_DEVICES` list in the matching external converter file for your device model.
4. Restart Zigbee2MQTT and check the logs in the filesystem (not the UI) for any issues. A successful load of the converters should look something like this:

    ```
    [2025-01-30 19:50:36] info: 	z2m: Loaded external converter 'efapel_40213.js'.
    [2025-01-30 19:50:36] info: 	z2m: Loaded external converter 'efapel_40214.js'.
    [2025-01-30 19:50:36] info: 	z2m: Loaded external converter 'efapel_40215.js'.
    [2025-01-30 19:50:36] info: 	z2m: Loaded external converter 'efapel_40218.js'.
    ```

## Supported Models

- 40213
- 40214
- 40215
- 40218

## Issues

I need help with the following aspects of these external converters:

- Device fingerprinting by IEEE Address is not ideal. Grouping them by model would be better.
~~ - State of the switches is not supported at the moment.~~ 
- Some of these devices have energy monitoring included, which is currently not supported.


