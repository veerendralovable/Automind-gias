import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai"

serve(async (req) => {
  const { vehicleId, telematics } = await req.json();
  
  // 1. Init Gemini
  const apiKey = process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });

  // 2. Init Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  // 3. Diagnosis Agent Logic
  const prompt = `Analyze telematics: Temp ${telematics.engineTemp}, RPM ${telematics.rpm}. Is there an anomaly?`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isAnomaly: { type: Type.BOOLEAN },
          alertType: { type: Type.STRING },
          severity: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        }
      }
    }
  });

  const analysis = JSON.parse(response.text);

  if (analysis.isAnomaly) {
    // 4. Trigger Digital Twin (Internal Call or Direct Logic)
    // For simplicity, we assume validation here
    
    // 5. Insert Alert
    const { error } = await supabase
      .from('maintenance_alerts')
      .insert({
        vehicle_id: vehicleId,
        alert_type: analysis.alertType,
        severity: analysis.severity,
        confidence: analysis.confidence,
        status: 'NEW'
      });
      
    if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, analysis }), {
    headers: { "Content-Type": "application/json" },
  });
});