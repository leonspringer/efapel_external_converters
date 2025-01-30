# Efapel Domus40 External Converter for Zigbee2MQTT


An external converter for Efapel Domus40 to Zigbee2MQTT. This information was created in the context of Home Assistant with the Zigbee2MQTT plugin installed as such there may be discrepancies between this and your specific setup.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

Create an `external_converter` directory if it doesn't exist in zigbee2mqtt home.  e.g. `config/zigbee2mqtt/external_converters/`.

Copy files as needed to directory.

## Usage

To begin using restart Zigbee2MQTT look at the logs for Zigbee2MQTT in the filesystem. *NOT* the UI for any issues loading the converters successful load should look something like this:

```
[2025-01-30 19:50:36] info: 	z2m: Loaded external converter 'efapel_40213.js'.
[2025-01-30 19:50:36] info: 	z2m: Loaded external converter 'efapel_40214.js'.
[2025-01-30 19:50:36] info: 	z2m: Loaded external converter 'efapel_40215_ME.js'.
[2025-01-30 19:50:36] info: 	z2m: Loaded external converter 'efapel_40218.js'.
```

How to pair devices with your coordinator and to bind buttons together can be found in the manual.
[Efapel Manuals on manualslib.com](https://www.manualslib.com/brand/efapel/)

Supported Models:
- 40213
- 40214
- 40215
- 40218


