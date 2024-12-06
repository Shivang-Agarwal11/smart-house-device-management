export const commandMappings = {
    lighting: {
        // Basic On/Off Controls
        turn_on: {
            description: "Turn on/off the device",
            type:'boolean',
            values: [true,false]
        },

        // Brightness Control
        set_brightness: {
            description: "Set brightness level",
            type:'range',
            values: { min: 0, max: 100 } // brightness level from 0 to 100
        }
    },
    climate: {
        turn_on: {
            description: "Turn on/off the device",
            type:'boolean',
            values: [true,false]
        },
        // Temperature Control
        set_temperature: {
            description: "Set temperature level",
            type:'range',
            values: { min: 16, max: 30 } // temperature level from 16 to 30 degrees
        },

        set_fan_speed: {
            description: "Set fan speed",
            type:'speed',
            values: ["low", "medium", "high", "auto"] // predefined fan speed settings
        },

        // Mode Settings
        set_mode: {
            description: "Set device mode",
            type:'temperature',
            values: ["cool", "heat", "fan", "auto", "dry"] // common mode settings for HVAC devices
        },
    },
    entertainment: {
        turn_on: {
            description: "Turn on/off the device",
            type:'boolean',
            values: [true,false]
        },
        // Volume Control
        set_volume: {
            description: "Set volume level",
            type:'range',
            values: { min: 0, max: 100 } // volume level from 0 to 100
        },
        set_state: {
            description: "Set State",
            type:'state',
            values: ["play", "pause", "stop"] // volume level from 0 to 100
        },
    },
    // Fan Speed Control
    kitchen:{
        turn_on: {
            description: "Turn on/off the device",
            type:'boolean',
            values: [true,false]
        },
        set_timer: {
            description: "Set timer in minutes",
            type:'range',
            values: { min: 1, max: 1440 } // timer from 1 minute to 24 hours (1440 minutes)
        },
        set_temperature: {
            description: "Set temperature level",
            type:'range',
            values: { min: 16, max: 30 } // temperature level from 16 to 30 degrees
        }
    }
};
