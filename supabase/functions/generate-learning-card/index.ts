import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai"

serve(async (req) => {
  const { appointmentId, technicianNotes } = await req.json();

  const apiKey = process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });
  
  const supabase = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  // 1. Get Vehicle Info
  const { data: apt } = await supabase
    .from('service_appointments')
    .select('*, vehicles(model)')
    .eq('id', appointmentId)
    .single();

  const vehicleModel = apt.vehicles.model;

  // 2. Generate Insight
  const prompt = `
    Technician Notes: "${technicianNotes}". 
    Vehicle: ${vehicleModel}.
    Extract { rootCause, fixSummary, faultCategory } in JSON.
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
          faultCategory: { type: Type.STRING }
        }
      }
    }
  });
  
  const insight = JSON.parse(response.text);

  // 3. Upsert Learning Card
  // Check for existing similar cards would happen here using vector search or basic matching
  
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