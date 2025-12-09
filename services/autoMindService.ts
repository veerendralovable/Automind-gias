import { UserRole, Vehicle, VehicleStatus, MaintenanceAlert, ServiceAppointment, LearningCard, UEBALog } from "../types";
import { DiagnosisAgent, OemInsightsAgent } from "./geminiService";
import { DigitalTwin } from "../lib/digitalTwin";
import { UEBA } from "../lib/ueba";
import { supabase } from "../lib/supabaseClient";

// --- FALLBACK MOCK DATA (Used if Supabase is empty/unreachable) ---
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    vin: '1HGCM82633A004352',
    model: 'Tesla Model 3',
    year: 2023,
    ownerId: 'u1',
    status: VehicleStatus.HEALTHY,
    healthScore: 98,
    imageUrl: 'https://picsum.photos/400/250',
    telematics: { speed: 65, rpm: 0, engineTemp: 40, batteryVoltage: 400, brakeWearLevel: 10, timestamp: new Date().toISOString() }
  },
  {
    id: 'v2',
    vin: '1G1YY22U655114233',
    model: 'Ford F-150 Lightning',
    year: 2022,
    ownerId: 'u1',
    status: VehicleStatus.WARNING,
    healthScore: 72,
    imageUrl: 'https://picsum.photos/400/251',
    telematics: { speed: 45, rpm: 0, engineTemp: 55, batteryVoltage: 380, brakeWearLevel: 82, timestamp: new Date().toISOString() }
  }
];

export class AutoMindService {
  
  // Local cache to maintain state in this SPA demo
  private vehicles: Vehicle[] = [...MOCK_VEHICLES];
  private alerts: MaintenanceAlert[] = [];
  private appointments: ServiceAppointment[] = [];
  private learningCards: LearningCard[] = [];
  private uebaLogs: UEBALog[] = [];

  constructor() {
    this.initRealtimeSubscription();
  }

  private initRealtimeSubscription() {
    // Listen for DB changes to update local UI state in real-time
    supabase.channel('automind-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_alerts' }, (payload) => {
        console.log('Realtime Alert:', payload);
        this.fetchAlerts(); // Refresh
      })
      .subscribe();
  }

  // --- API ROUTES (Mapped to Supabase Calls) ---

  async getVehicles(role: UserRole): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (!error && data && data.length > 0) {
        // Map snake_case DB to camelCase Types
        this.vehicles = data.map((v: any) => ({
          id: v.id,
          vin: v.vin,
          model: v.model,
          year: v.year,
          ownerId: v.owner_id,
          status: v.status as VehicleStatus,
          healthScore: v.health_score,
          imageUrl: v.image_url || 'https://picsum.photos/400/250',
          telematics: v.telematics || { speed: 0, rpm: 0, engineTemp: 0, batteryVoltage: 0, brakeWearLevel: 0, timestamp: new Date().toISOString() }
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed, using mock data", e);
    }
    
    // RLS Filtering logic (simulated for client-side demo if RLS fails)
    if (role === UserRole.OWNER) return this.vehicles.slice(0, 2);
    return this.vehicles;
  }

  async fetchAlerts() {
    const { data } = await supabase.from('maintenance_alerts').select('*').order('created_at', { ascending: false });
    if (data) {
      this.alerts = data.map((a: any) => ({
        id: a.id,
        vehicleId: a.vehicle_id,
        alertType: a.alert_type,
        severity: a.severity,
        confidence: a.confidence,
        description: a.description || 'Auto-detected anomaly',
        recommendedAction: a.recommended_action || 'Inspect',
        status: a.status,
        timestamp: a.created_at
      }));
    }
  }

  async getAlerts(role: UserRole): Promise<MaintenanceAlert[]> {
    if (this.alerts.length === 0) await this.fetchAlerts();
    return this.alerts;
  }

  async getAppointments(role: UserRole): Promise<ServiceAppointment[]> {
    const { data } = await supabase.from('service_appointments').select('*, vehicles(model)');
    if (data) {
        this.appointments = data.map((a: any) => ({
            id: a.id,
            vehicleId: a.vehicle_id,
            vehicleModel: a.vehicles?.model || 'Unknown',
            scheduledTime: a.schedule_time,
            status: a.status,
            serviceCenter: 'AutoMind Hub',
            predictedIssue: 'Scheduled Maintenance'
        }));
    }
    return this.appointments;
  }

  async getLearningCards(): Promise<LearningCard[]> {
    const { data } = await supabase.from('learning_cards').select('*');
    if (data) {
        this.learningCards = data.map((c: any) => ({
            id: c.id,
            vehicleModel: c.vehicle_model,
            faultType: c.fault_type,
            rootCause: c.root_cause,
            fixSummary: c.fix_summary,
            occurrenceCount: c.occurrence_count,
            generatedAt: c.created_at
        }));
    }
    return this.learningCards;
  }

  async getUEBALogs(): Promise<UEBALog[]> {
    return this.uebaLogs;
  }

  // --- AGENTIC WORKFLOWS (MASTER AGENT) ---

  /**
   * MASTER AGENT: Run Predictive Maintenance Cycle
   * 1. Ingest Data (Simulated drift)
   * 2. Diagnosis Agent (Gemini)
   * 3. Digital Twin Agent (Physics Sim)
   * 4. UEBA Agent (Trust Score)
   * 5. Persistence (Supabase)
   */
  async runPredictiveCycle(vehicleId: string): Promise<{ vehicle: Vehicle, alert: MaintenanceAlert | null, log: string }> {
    const startTime = Date.now();
    
    // 1. DATA INGESTION
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    // Simulate new data drift
    const newTelematics = { ...vehicle.telematics };
    newTelematics.engineTemp += (Math.random() * 15 - 5); 
    if (vehicle.model.includes("F-150")) newTelematics.brakeWearLevel = 88; // Force critical for demo
    vehicle.telematics = newTelematics;

    // 2. DIAGNOSIS AGENT
    const diagStart = Date.now();
    const prediction = await DiagnosisAgent.analyzeTelematics(vehicle.model, newTelematics);
    this.logUEBA('Diagnosis Agent', 'Analyze Telematics', Date.now() - diagStart);

    let newAlert: MaintenanceAlert | null = null;
    let logMsg = "Routine scan complete. System healthy.";

    if (prediction) {
      // 3. DIGITAL TWIN AGENT (Physics Validation)
      const twinStart = Date.now();
      const twinResult = await DigitalTwin.simulateVehicle(vehicle.model, newTelematics);
      
      // Combined Logic: Gemini Prediction + Physics Validation
      const isValid = twinResult.anomalyDetected || prediction.confidence! > 0.9;
      
      this.logUEBA('Digital Twin Agent', 'Physics Simulation', Date.now() - twinStart);

      if (isValid) {
        newAlert = {
            id: `alert-${Date.now()}`,
            vehicleId: vehicle.id,
            alertType: prediction.alertType || 'Unknown',
            severity: prediction.severity || 'LOW',
            confidence: prediction.confidence || 0.5,
            description: prediction.description || 'Anomaly detected',
            recommendedAction: prediction.recommendedAction || 'Inspect',
            status: 'NEW',
            timestamp: new Date().toISOString()
        } as MaintenanceAlert;

        // Persist to Supabase
        await supabase.from('maintenance_alerts').insert({
            vehicle_id: vehicle.id,
            alert_type: newAlert.alertType,
            severity: newAlert.severity,
            confidence: newAlert.confidence,
            description: newAlert.description,
            recommended_action: newAlert.recommendedAction,
            status: 'NEW'
        });

        // Update local state optimistic
        this.alerts.unshift(newAlert);
        
        // Update vehicle status
        if (newAlert.severity === 'CRITICAL') vehicle.status = VehicleStatus.CRITICAL;
        else if (newAlert.severity === 'HIGH') vehicle.status = VehicleStatus.WARNING;
        vehicle.healthScore = Math.max(0, vehicle.healthScore - 20);

        logMsg = `Anomaly Detected: ${prediction.alertType}. Digital Twin Confidence: ${(twinResult.confidence * 100).toFixed(0)}%. Logs: ${twinResult.simulationLog}`;
      } else {
          logMsg = `Prediction suppressed by Digital Twin. Physics model mismatch.`;
      }
    }

    return { vehicle, alert: newAlert, log: logMsg };
  }

  /**
   * SCHEDULING AGENT
   */
  async scheduleService(vehicleId: string, center: string): Promise<ServiceAppointment> {
    const schedStart = Date.now();
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    
    // Call Edge Function or Insert directly
    const { data, error } = await supabase.from('service_appointments').insert({
        vehicle_id: vehicleId,
        technician_id: 'tech-1', // Auto-assigned
        schedule_time: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'CONFIRMED',
        service_center: center
    }).select().single();

    this.logUEBA('Scheduling Agent', 'Book Appointment', Date.now() - schedStart);
    
    if (vehicle) vehicle.status = VehicleStatus.IN_SERVICE;
    
    // Mock return if DB insert fails (demo mode)
    if (error || !data) {
        const mockApt = {
            id: `apt-${Date.now()}`,
            vehicleId,
            vehicleModel: vehicle?.model || 'Unknown',
            scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString(),
            status: 'CONFIRMED' as const,
            serviceCenter: center,
            predictedIssue: 'Scheduled Service'
        };
        this.appointments.push(mockApt);
        return mockApt;
    }

    return {
        id: data.id,
        vehicleId: data.vehicle_id,
        vehicleModel: vehicle?.model || 'Unknown',
        scheduledTime: data.schedule_time,
        status: data.status,
        serviceCenter: center,
        predictedIssue: 'Service'
    };
  }

  /**
   * TECHNICIAN & OEM INSIGHTS FLOW
   */
  async completeRepairJob(appointmentId: string, notes: string): Promise<void> {
    const oemStart = Date.now();
    
    // 1. Update Appointment
    await supabase.from('service_appointments').update({ status: 'COMPLETED' }).eq('id', appointmentId);

    // 2. Resolve Alert (Best effort matching)
    // In a real app, appointments would link to alerts.
    
    // 3. Trigger OEM Insights (Edge Function preferred, here we use direct service for Client-side demo)
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (apt) {
        const insight = await OemInsightsAgent.generateLearningCard(notes, apt.vehicleModel, apt.predictedIssue || 'Maintenance');
        
        await supabase.from('learning_cards').insert({
            vehicle_model: apt.vehicleModel,
            fault_type: insight.faultType,
            root_cause: insight.rootCause,
            fix_summary: insight.fixSummary,
            occurrence_count: 1
        });
    }

    this.logUEBA('OEM Insights Agent', 'Generate Learning Card', Date.now() - oemStart);
  }

  /**
   * VOICE AGENT CONTEXT
   */
  getVoiceContext() {
    // Get context from the most critical vehicle or the first one
    const criticalVehicle = this.vehicles.find(v => v.status === VehicleStatus.CRITICAL || v.status === VehicleStatus.WARNING) || this.vehicles[0];
    const alertCount = this.alerts.length;
    const latestAlert = this.alerts[0]?.description;
    
    return {
        vehicleStatus: criticalVehicle?.status || 'Unknown',
        alertCount,
        latestAlert
    };
  }

  // --- UTILS ---

  private logUEBA(agent: string, action: string, duration: number) {
    const { score, status } = UEBA.analyzeBehavior(agent, action, duration);
    
    const log: UEBALog = {
        id: `ueba-${Date.now()}`,
        agentName: agent,
        action,
        trustScore: score,
        timestamp: new Date().toISOString(),
        status
    };
    
    this.uebaLogs.unshift(log);
    
    // Persist log (Fire and forget)
    supabase.from('ueba_logs').insert({
        agent_name: agent,
        action,
        trust_score: score,
        status
    }).then();
  }
}

export const autoMind = new AutoMindService();