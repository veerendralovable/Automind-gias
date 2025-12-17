
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai"

serve(async (req) => {
  const { appointmentId, technicianNotes } = await req.json();

  // 1. Init Gemini - Correct initialization using process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const supabase = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  // 2. Get Vehicle Info
  const { data: apt } = await supabase
    .from('service_appointments')
    .select('*, vehicles(model)')
    .eq('id', appointmentId)
    .single();

  const vehicleModel = apt?.vehicles?.model || 'Unknown';

  // 3. Generate Insight - Using gemini-3-pro-preview for complex insight extraction.
  const prompt = `
    Technician Notes: "${technicianNotes}". 
    Vehicle: ${vehicleModel}.
    Extract { rootCause, fixSummary, faultCategory } in JSON.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rootCause: { type: Type.STRING },
          fixSummary: { type: Type.STRING },
          faultCategory: { type: Type.STRING }
        },
        required: ["rootCause", "fixSummary", "faultCategory"]
      }
    }
  });
  
  const insight = JSON.parse(response.text || '{}');

  // 4. Upsert Learning Card
  const { error } = await supabase
    .from('learning_cards')
    .insert({
        vehicle_model: vehicleModel,
        fault_type: insight.faultCategory,
        root_cause: insight.rootCause,
        fix_summary: insight.fixSummary,
        occurrence_count: 1
    });

  return new Response(JSON.stringify({ success: true, insight }), {
    headers: { "Content-Type": "application/json" },
  });
});
