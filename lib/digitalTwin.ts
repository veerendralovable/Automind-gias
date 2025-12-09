import { TelematicsData } from "../types";

/**
 * Digital Twin Simulation Engine
 * Simulates vehicle physics to validate reported anomalies.
 */
export const DigitalTwin = {
  /**
   * Runs a physics-based simulation to verify if the telemetry data 
   * is consistent with the reported vehicle state.
   */
  simulateVehicle: async (model: string, data: TelematicsData): Promise<{ anomalyDetected: boolean; confidence: number; simulationLog: string }> => {
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 500));

    const { engineTemp, rpm, speed, batteryVoltage, brakeWearLevel } = data;
    
    let anomalyDetected = false;
    let confidence = 0;
    let logs: string[] = [];

    // 1. Thermal Physics Check
    // Engine temp should correlate with RPM and Load (approximated by speed/rpm ratio)
    const expectedTempRange = rpm > 3000 ? [90, 115] : [80, 105];
    if (engineTemp > expectedTempRange[1]) {
      logs.push(`[Thermal] Temp ${engineTemp}°C exceeds expected max ${expectedTempRange[1]}°C for RPM ${rpm}.`);
      anomalyDetected = true;
      confidence = Math.min((engineTemp - expectedTempRange[1]) / 10, 0.99); // Higher deviation = higher confidence
    } else if (engineTemp < 60 && rpm > 2000) {
      logs.push(`[Thermal] Temp ${engineTemp}°C is abnormally low for active RPM ${rpm}. Possible sensor failure.`);
      anomalyDetected = true;
      confidence = 0.75;
    }

    // 2. Electrical System Check
    // Voltage should be ~13.5-14.5V when engine is running (RPM > 0), ~12V when off
    if (rpm > 0 && batteryVoltage < 13.0) {
      logs.push(`[Electrical] Alternator output ${batteryVoltage}V too low for active engine.`);
      anomalyDetected = true;
      confidence = Math.max(confidence, 0.85);
    }

    // 3. Mechanical Wear Check (Braking)
    if (brakeWearLevel > 85) {
      logs.push(`[Mechanical] Brake wear critical at ${brakeWearLevel}%. Physical limit approach imminent.`);
      anomalyDetected = true;
      confidence = Math.max(confidence, 0.95);
    }

    // 4. Model Specific Simulation (Mocking a complex look-up)
    if (model.includes("Tesla") || model.includes("Lightning")) {
       // EV Logic override
       if (batteryVoltage < 350 && rpm > 0) { // Assuming HV system
         logs.push(`[EV-Powertrain] High Voltage rail sag detected: ${batteryVoltage}V.`);
         anomalyDetected = true;
         confidence = 0.90;
       }
    }

    if (!anomalyDetected) {
      logs.push("Simulation parameters within nominal operating bounds.");
    }

    return {
      anomalyDetected,
      confidence,
      simulationLog: logs.join(" ")
    };
  }
};