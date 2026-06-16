"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFallbackWindSpeed = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const app_1 = require("firebase-admin/app");
const database_1 = require("firebase-admin/database");
(0, app_1.initializeApp)();
function formatTimestamp(date) {
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getUTCFullYear();
    const m = pad(date.getUTCMonth() + 1);
    const d = pad(date.getUTCDate());
    const h = pad(date.getUTCHours());
    const min = pad(date.getUTCMinutes());
    const s = pad(date.getUTCSeconds());
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
}
exports.fetchFallbackWindSpeed = (0, scheduler_1.onSchedule)({
    schedule: "every 1 minutes",
    timeZone: "America/New_York",
}, async (event) => {
    const db = (0, database_1.getDatabase)();
    try {
        // 1. Read configuration from database
        const configRef = db.ref("config");
        const configSnap = await configRef.get();
        let zipCode = "04576"; // Default to Southport, ME (matches hardware location)
        let fallbackMode = "auto";
        let hardwareZipCode = "04576"; // Default to Southport, ME (hardware location)
        if (configSnap.exists()) {
            const config = configSnap.val();
            if (config.zip_code) {
                zipCode = String(config.zip_code);
            }
            if (config.fallback_mode) {
                fallbackMode = String(config.fallback_mode).toLowerCase();
            }
            if (config.hardware_zip_code) {
                hardwareZipCode = String(config.hardware_zip_code);
            }
        }
        logger.info(`Running fallback function. Mode: ${fallbackMode}, Active Zip Code: ${zipCode}, Hardware Zip Code: ${hardwareZipCode}`);
        if (fallbackMode === "never") {
            logger.info("Fallback mode is set to 'never'. Skipping execution.");
            return;
        }
        // 2. Check if active location matches hardware location
        const isHardwareLocation = zipCode === hardwareZipCode;
        logger.info(`Location comparison: Active (${zipCode}) vs Hardware (${hardwareZipCode}). Matches: ${isHardwareLocation}`);
        if (isHardwareLocation && fallbackMode === "auto") {
            // If active ZIP matches hardware ZIP and mode is "auto", check if hardware data is fresh
            const sensorsRef = db.ref("sensors");
            const sensorsSnap = await sensorsRef.get();
            if (sensorsSnap.exists()) {
                const sensors = sensorsSnap.val();
                if (sensors.timestamp) {
                    const timestampStr = String(sensors.timestamp);
                    const formattedStr = timestampStr.includes(" ") ? timestampStr.replace(" ", "T") : timestampStr;
                    const lastUpdate = new Date(formattedStr).getTime();
                    if (!isNaN(lastUpdate)) {
                        const now = Date.now();
                        const elapsedMinutes = (now - lastUpdate) / 60000;
                        // If the last update was written by the fallback itself, the hardware is still offline
                        const isLastUpdateFallback = sensors.source === "fallback";
                        if (elapsedMinutes < 5 && !isLastUpdateFallback) {
                            logger.info(`Hardware is online (last update was ${elapsedMinutes.toFixed(1)} mins ago). Skipping fallback.`);
                            return;
                        }
                        else if (isLastUpdateFallback) {
                            logger.info(`Hardware is still offline (last update was fallback ${elapsedMinutes.toFixed(1)} mins ago). Fetching fallback.`);
                        }
                        else {
                            logger.warn(`Hardware went offline (last update was ${elapsedMinutes.toFixed(1)} mins ago). Fetching fallback.`);
                        }
                    }
                    else {
                        logger.warn(`Unable to parse timestamp: "${timestampStr}". Fetching fallback.`);
                    }
                }
                else {
                    logger.warn("No sensors/timestamp found in database. Fetching fallback.");
                }
            }
            else {
                logger.warn("No sensors node found in database. Fetching fallback.");
            }
        }
        else if (!isHardwareLocation) {
            logger.info(`Active ZIP ${zipCode} is different from hardware ZIP ${hardwareZipCode}. Bypassing staleness check to fetch weather API.`);
        }
        // 3. Fetch data from WeatherAPI
        const apiKey = "94643db3bf724426bc3151704251507";
        const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${zipCode}&aqi=no`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`WeatherAPI request failed with status: ${response.status}`);
        }
        const weatherData = await response.json();
        const windMph = weatherData?.current?.wind_mph;
        if (typeof windMph !== "number") {
            throw new Error("Invalid response format: current.wind_mph not found or not a number.");
        }
        // 4. Update the database
        const nowStr = formatTimestamp(new Date());
        await db.ref("sensors").update({
            wind_speed: windMph,
            timestamp: nowStr,
            source: "fallback"
        });
        logger.info(`Successfully updated database with fallback wind speed: ${windMph} MPH from WeatherAPI`);
    }
    catch (error) {
        logger.error("Error running fallback function:", error);
    }
});
//# sourceMappingURL=index.js.map