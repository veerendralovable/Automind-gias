import { UEBALog } from "../types";

interface AgentBehaviorProfile {
  name: string;
  baselineLatency: number;
  errorRate: number;
  interactionCount: number;
}

const AGENT_PROFILES: Record<string, AgentBehaviorProfile> = {
  'Diagnosis Agent': { name: 'Diagnosis Agent', baselineLatency: 1500, errorRate: 0.05, interactionCount: 0 },
  'Digital Twin Agent': { name: 'Digital Twin Agent', baselineLatency: 500, errorRate: 0.01, interactionCount: 0 },
  'Scheduling Agent': { name: 'Scheduling Agent', baselineLatency: 800, errorRate: 0.02, interactionCount: 0 },
  'OEM Insights Agent': { name: 'OEM Insights Agent', baselineLatency: 2000, errorRate: 0.1, interactionCount: 0 },
};

export const UEBA = {
  /**
   * Analyzes an agent's action to calculate a real-time Trust Score.
   * Detects anomalies in execution time or decision confidence.
   */
  analyzeBehavior: (agentName: string, action: string, executionTimeMs: number): { score: number; status: 'NORMAL' | 'ANOMALY' } => {
    const profile = AGENT_PROFILES[agentName] || { baselineLatency: 1000, errorRate: 0.05, interactionCount: 0 };
    profile.interactionCount++;

    let score = 100;
    
    // 1. Latency Anomaly Detection
    // If execution is 3x slower than baseline, penalize
    if (executionTimeMs > profile.baselineLatency * 3) {
      score -= 15;
    } else if (executionTimeMs > profile.baselineLatency * 1.5) {
      score -= 5;
    }

    // 2. Frequency Anomaly (Mocked random fluctuation for demo realism)
    const randomFactor = Math.random();
    if (randomFactor < 0.02) {
      score -= 20; // Random "glitch" detected
    }

    // 3. Learning Curve Adjustment
    // Agents with more interactions are more trusted usually, unless they err
    score += Math.min(profile.interactionCount * 0.1, 5);

    // Cap score
    score = Math.min(Math.max(score, 0), 100);

    return {
      score: Math.floor(score),
      status: score < 80 ? 'ANOMALY' : 'NORMAL'
    };
  }
};