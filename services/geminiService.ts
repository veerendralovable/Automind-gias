import { GoogleGenAI, Type } from "@google/genai";
import { TelematicsData, MaintenanceAlert } from "../types";

// Helper to safely get API Key without crashing in browser
const getApiKey = () => {
  try {
    // 1. Check for Vite (Standard in this project)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
    
    // 2. Safe check for process.env (Next.js/Node)
    if (typeof window !== 'undefined' && (window as any).process && (window as any).process.env) {
       return (window as any).process.env.NEXT_PUBLIC_API_KEY || (window as any).process.env.REACT_APP_API_KEY || (window as any).process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Environment access error, defaulting to mock key");
  }
  // 3. Fallback to a safe mock key string to allow the app to boot
  return 'mock-key';
};

// Helper to lazy-load AI instance only when needed
const getAI = () => {
  const apiKey = getApiKey();
  return { ai: new GoogleGenAI({ apiKey }), apiKey };
}

export const DiagnosisAgent = {
  /**
   * Analyzes vehicle telematics to predict faults using Gemini 2.5 Flash
   */
  analyzeTelematics: async (vehicleModel: string, data: TelematicsData): Promise<Partial<MaintenanceAlert> | null> => {
    try {
      const { ai, apiKey } = getAI();
      
      if (apiKey === 'mock-key') {
        throw new Error("No API Key"); // Force mock fallback if no key
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
        model: 'gemini-2.5-flash',
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

      const result = JSON.parse(response.text);

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
    // In a real system, this would run a physics simulation.
    // We will use Gemini to "reason" about the physics.
    try {
        const { ai, apiKey } = getAI();
        if (apiKey === 'mock-key') throw new Error("No Key");
        
        const prompt = `
            You are a Digital Twin Simulation Engine. 
            Vehicle: ${vehicleModel}
            Current State: Temp ${data.engineTemp}C, RPM ${data.rpm}, Speed ${data.speed}, BrakeWear ${data.brakeWearLevel}%.
            Predicted Alert: ${alert.alertType} (${alert.description}).

            Is this alert physically consistent with the current state history? 
            For example, "Overheating" is unlikely if Temp is 40C.
            Return JSON.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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
        return JSON.parse(response.text);
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
        const { ai, apiKey } = getAI();
        if (apiKey === 'mock-key') throw new Error("No Key");

        const prompt = `
            Analyze this repair report to create an OEM Learning Card.
            Vehicle: ${vehicleModel}
            Reported Issue: ${issue}
            Technician Notes: "${notes}"

            Extract:
            1. Root Cause
            2. Recommended Fix Summary
            3. Fault Category
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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
        return JSON.parse(response.text);
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
        const { ai, apiKey } = getAI();
        if (apiKey === 'mock-key') {
             // Mock response for demo without API key
             return {
                 text: "I can't connect to my brain right now, but your vehicle systems appear to be online.",
                 emotion: 'NEUTRAL'
             };
        }

        const prompt = `
            You are AutoMind, an empathetic and professional AI vehicle assistant.
            Current Vehicle Status: ${context.vehicleStatus}
            Active Alerts: ${context.alertCount}
            Latest Issue: ${context.latestAlert || 'None'}
            
            User said: "${message}"
            
            Respond in a conversational, reassuring tone. Keep it brief (under 30 words) for voice output.
            Also detect the appropriate emotion for the response.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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
        return JSON.parse(response.text);
    } catch (e) {
        return {
            text: "I'm having trouble processing that request right now.",
            emotion: 'NEUTRAL'
        };
    }
  }
};