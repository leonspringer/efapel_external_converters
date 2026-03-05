# Efapel Domus40 External Converter for Zigbee2MQTT

An external converter for Efapel Domus40 to Zigbee2MQTT. This information was created in the context of Home Assistant with the Zigbee2MQTT plugin installed, so there may be discrepancies between this and your specific setup.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Supported Models](#supported-models)
- [Issues](#issues)

## Installation

### Step 1: Download the Release
1. Go to the [Releases page](https://github.com/leonspringer/efapel_external_converters/releases) on GitHub.
2. Find the latest release version (e.g., v0.2.0).
3. Download the `Source code (zip)` file.
4. Unzip the downloaded file to a folder on your computer.

### Step 2: Copy the Converter Files
1. Open the unzipped folder - you should see files named `efapel_40213.js`, `efapel_40214.js`, etc.
2. On your system running Zigbee2MQTT, navigate to: `config/zigbee2mqtt/external_converters/`
   - If the `external_converters` folder doesn't exist, create it.
   - Note: On Home Assistant, this is typically at: `/homeassistant/zigbee2mqtt/external_converters/` or `config/zigbee2mqtt/external_converters/`
3. Copy the `.js` files from the unzipped folder into the `external_converters` directory.

### Step 3: Restart Zigbee2MQTT
1. In Home Assistant or Zigbee2MQTT, restart the Zigbee2MQTT service/add-on.
2. Check the logs to confirm the converters loaded successfully. You should see messages like:
    ```
    [2025-01-30 19:50:36] info: z2m: Loaded external converter 'efapel_40213.js'.
    [2025-01-30 19:50:36] info: z2m: Loaded external converter 'efapel_40214.js'.
    [2025-01-30 19:50:36] info: z2m: Loaded external converter 'efapel_40215.js'.
    [2025-01-30 19:50:36] info: z2m: Loaded external converter 'efapel_40218.js'.
    [2025-01-30 19:50:36] info: z2m: Loaded external converter 'efapel_40226.js'.
    ```

## Usage

1. **Pair your Efapel device** with Zigbee2MQTT:
   - In the Zigbee2MQTT UI, enable pairing mode.
   - Put your Efapel device into pairing mode (instructions in the device manual: [Efapel Manuals](https://www.manualslib.com/brand/efapel/)).
   - Wait for the device to appear in Zigbee2MQTT.

2. **Find your device's IEEE Address**:
   - In the Zigbee2MQTT UI, click on your newly paired device.
   - Look for the IEEE Address field - it will look something like `0x00124b001cdf1234`.
   - Copy this address.

3. **Add the device to the converter file**:
   - Open the appropriate converter file for your device model (e.g., `efapel_40218.js` for model 40218).
   - Find the `EFAPEL_<MODEL>_DEVICES` list at the top of the file.
   - Add your device's IEEE Address to this list:
     ```javascript
     const EFAPEL_40218_DEVICES = [
       '0x00124b00445566aa',  // Study Wall Switch
       '0x00124b00445566bb',  // Garage Switch
       '0x00124b00445566cc',  // Entry Way Switch
       '0xYOUR_IEEE_ADDRESS', // Your Device (replace with actual address)
     ];
     ```
   - Save the file.

4. **Restart Zigbee2MQTT** again to apply the changes.

5. **Test your device** - You should now be able to see the state of your switch and control it from Home Assistant or Zigbee2MQTT.

## Supported Models

- 40213
- 40214
- 40215
- 40218
- 40226

## Issues

I need help with the following aspects of these external converters:

- Device fingerprinting by IEEE Address is not ideal. Grouping them by model would be better.
- Some of these devices have energy monitoring included, which is currently not supported.


