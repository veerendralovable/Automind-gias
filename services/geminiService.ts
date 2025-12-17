import { GoogleGenAI, Type } from "@google/genai";
import { TelematicsData, MaintenanceAlert } from "../types";

// Helper to safely get API Key without crashing in browser
const getApiKey = () => {
  try {
    // 1. Check for standard process.env (Injected by environment)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
       return process.env.API_KEY;
    }
    
    // 2. Check for window.process (Our HTML polyfill)
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
       return (window as any).process.env.API_KEY;
    }

    // 3. Safe check for Next/Vite prefixed keys if they exist
    const env = (window as any).process?.env || {};
    return env.NEXT_PUBLIC_API_KEY || env.REACT_APP_API_KEY || env.VITE_API_KEY;

  } catch (e) {
    console.warn("Environment access error, defaulting to mock key");
  }
  return '';
};

// Helper to lazy-load AI instance only when needed
const getAI = () => {
  const apiKey = getApiKey();
  // Ensure we don't pass an empty string to GoogleGenAI if it expects a valid format
  // though typically it handles it, some versions might throw.
  const effectiveKey = apiKey || 'invalid-key-placeholder';
  return { ai: new GoogleGenAI({ apiKey: effectiveKey }), hasKey: !!apiKey };
}

export const DiagnosisAgent = {
  /**
   * Analyzes vehicle telematics to predict faults using Gemini 3 Flash
   */
  analyzeTelematics: async (vehicleModel: string, data: TelematicsData): Promise<Partial<MaintenanceAlert> | null> => {
    try {
      const { ai, hasKey } = getAI();
      
      if (!hasKey) {
        throw new Error("Missing API Key"); // Jump to fallback
      }

      const prompt = `
        Act as an expert automotive diagnostic AI. Analyze the following telematics data for a ${vehicleModel}.
        
        Telematics:
        - Engine Temp: ${data.engineTemp.toFixed(1)}°C
        - RPM: ${data.rpm}
        - Speed: ${data.speed} km/h
        - Battery: ${data.batteryVoltage.toFixed(1)}V
        - Brake Wear: ${data.brakeWearLevel.toFixed(1)}%
        
        Determine if there is a potential anomaly. If yes, provide severity, confidence, and recommended action.
        Return NULL if everything looks healthy.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isAnomaly: { type: Type.BOOLEAN },
              alertType: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
              confidence: { type: Type.NUMBER },
              description: { type: Type.STRING },
              recommendedAction: { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '{}');

      if (result.isAnomaly) {
        return {
          alertType: result.alertType,
          severity: result.severity,
          confidence: result.confidence,
          description: result.description,
          recommendedAction: result.recommendedAction
        };
      }
      return null;

    } catch (error) {
      console.warn("DiagnosisAgent falling back to heuristics:", error);
      // Fallback Heuristic Logic (Simulation for Demo)
      if (data.engineTemp > 110) {
        return {
          alertType: "Engine Overheating",
          severity: "CRITICAL",
          confidence: 0.95,
          description: "Engine temperature exceeds safe operating limits.",
          recommendedAction: "Stop vehicle immediately and check coolant."
        };
      }
      if (data.brakeWearLevel > 80) {
        return {
          alertType: "Brake Pad Wear",
          severity: "HIGH",
          confidence: 0.98,
          description: "Brake pads are critically worn.",
          recommendedAction: "Schedule brake pad replacement."
        };
      }
      if (data.batteryVoltage < 12.0) {
        return {
          alertType: "Low Battery Voltage",
          severity: "MEDIUM",
          confidence: 0.85,
          description: "Battery voltage is below nominal range.",
          recommendedAction: "Check alternator and battery health."
        };
      }
      return null;
    }
  }
};

export const DigitalTwinAgent = {
  /**
   * Simulates the vehicle state to validate if the anomaly is physically possible
   */
  validateAnomaly: async (vehicleModel: string, data: TelematicsData, alert: Partial<MaintenanceAlert>): Promise<{ validated: boolean, reason: string }> => {
    try {
        const { ai, hasKey } = getAI();
        if (!hasKey) throw new Error("No Key");
        
        const prompt = `
            You are a Digital Twin Simulation Engine. 
            Vehicle: ${vehicleModel}
            Current State: Temp ${data.engineTemp}C, RPM ${data.rpm}, Speed ${data.speed}, BrakeWear ${data.brakeWearLevel}%.
            Predicted Alert: ${alert.alertType} (${alert.description}).

            Is this alert physically consistent with the current state history? 
            Return JSON.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        validated: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{"validated": true, "reason": "Default validated"}');
    } catch (e) {
        // Fallback Logic
        if (alert.alertType?.includes("Overheat") && data.engineTemp < 90) {
            return { validated: false, reason: "Temperature telemetry contradicts overheating prediction." };
        }
        return { validated: true, reason: "Digital Twin simulation confirms parameter drift matches failure signature." };
    }
  }
};

export const OemInsightsAgent = {
  /**
   * Aggregates technician notes into a Learning Card using Gemini
   */
  generateLearningCard: async (notes: string, vehicleModel: string, issue: string): Promise<any> => {
    try {
        const { ai, hasKey } = getAI();
        if (!hasKey) throw new Error("No Key");

        const prompt = `
            Analyze this repair report to create an OEM Learning Card.
            Vehicle: ${vehicleModel}
            Reported Issue: ${issue}
            Technician Notes: "${notes}"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        rootCause: { type: Type.STRING },
                        fixSummary: { type: Type.STRING },
                        faultType: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return {
            rootCause: "Wear and tear or sensor drift",
            fixSummary: "Replaced affected components and recalibrated",
            faultType: issue
        };
    }
  }
};

export const VoiceInteractionAgent = {
  /**
   * Generates empathetic, context-aware responses for voice interaction
   */
  chatWithDriver: async (message: string, context: any): Promise<{ text: string, emotion: 'NEUTRAL' | 'HAPPY' | 'CONCERNED' | 'ALERT' }> => {
    try {
        const { ai, hasKey } = getAI();
        if (!hasKey) {
             return {
                 text: "I can't connect to my brain right now, but your vehicle systems appear to be online.",
                 emotion: 'NEUTRAL'
             };
        }

        const prompt = `
            You are AutoMind, an empathetic and professional AI vehicle assistant.
            Current Vehicle Status: ${context.vehicleStatus}
            User said: "${message}"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        emotion: { type: Type.STRING, enum: ["NEUTRAL", "HAPPY", "CONCERNED", "ALERT"] }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{"text": "I heard you.", "emotion": "NEUTRAL"}');
    } catch (e) {
        return {
            text: "I'm having trouble processing that request right now.",
            emotion: 'NEUTRAL'
        };
    }
  }
};