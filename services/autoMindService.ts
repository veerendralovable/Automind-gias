import { UserRole, Vehicle, VehicleStatus, MaintenanceAlert, ServiceAppointment, LearningCard, UEBALog, ClusterAnalysis } from "../types";
import { DiagnosisAgent, OemInsightsAgent } from "./geminiService";
import { DigitalTwin } from "../lib/digitalTwin";
import { UEBA } from "../lib/ueba";
import { supabase } from "../lib/supabaseClient";

// --- STORY-DRIVEN MOCK DATA ---

// 1. RAHUL (Owner) - Hyundai i20
const RAHUL_VEHICLE: Vehicle = {
  id: 'rahul-i20',
  vin: 'MALBB81BLDM092381',
  model: 'Hyundai i20 Asta',
  year: 2022,
  ownerId: 'rahul',
  status: VehicleStatus.WARNING,
  healthScore: 78,
  imageUrl: 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/40530/i20-exterior-right-front-three-quarter-5.jpeg?q=75', // i20 Image
  telematics: { speed: 45, rpm: 2100, engineTemp: 92, batteryVoltage: 12.4, brakeWearLevel: 87, timestamp: new Date().toISOString() }
};

// 2. KAVYA (Fleet Manager) - Delhivery Fleet
// Generating 9 At-Risk Vehicles + some healthy ones
const FLEET_RISK_VEHICLES: Vehicle[] = [
  // 4 Turbo Overheating (Tata Ace)
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `fleet-tata-${i}`,
    vin: `DL-03-142${i + 2}`,
    model: 'Tata Ace Gold',
    year: 2021,
    ownerId: 'kavya',
    status: VehicleStatus.CRITICAL,
    healthScore: 65,
    imageUrl: 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/135805/ace-gold-exterior-right-front-three-quarter-3.jpeg?isig=0&q=75',
    telematics: { speed: 30, rpm: 3500, engineTemp: 112, batteryVoltage: 12.1, brakeWearLevel: 40, timestamp: new Date().toISOString() }
  })),
  // 2 Brake Pad Issues (Ashok Leyland)
  ...Array.from({ length: 2 }).map((_, i) => ({
    id: `fleet-al-${i}`,
    vin: `DL-03-155${i}`,
    model: 'Ashok Leyland Dost',
    year: 2022,
    ownerId: 'kavya',
    status: VehicleStatus.WARNING,
    healthScore: 72,
    imageUrl: 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/145899/bada-dost-exterior-right-front-three-quarter-2.jpeg?isig=0&q=75',
    telematics: { speed: 50, rpm: 1800, engineTemp: 88, batteryVoltage: 12.6, brakeWearLevel: 89, timestamp: new Date().toISOString() }
  })),
  // 3 Battery Degradation (Mahindra Bolero)
  ...Array.from({ length: 3 }).map((_, i) => ({
    id: `fleet-mah-${i}`,
    vin: `DL-03-166${i}`,
    model: 'Mahindra Bolero Pickup',
    year: 2020,
    ownerId: 'kavya',
    status: VehicleStatus.WARNING,
    healthScore: 75,
    imageUrl: 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/140781/bolero-pickup-exterior-right-front-three-quarter.jpeg?isig=0&q=75',
    telematics: { speed: 0, rpm: 0, engineTemp: 30, batteryVoltage: 11.2, brakeWearLevel: 20, timestamp: new Date().toISOString() }
  })),
];

// Generate ~50 healthy vehicles for bulk view
const FLEET_HEALTHY_VEHICLES: Vehicle[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `fleet-h-${i}`,
  vin: `DL-03-900${i}`,
  model: i % 2 === 0 ? 'Tata Ace Gold' : 'Mahindra Bolero',
  year: 2023,
  ownerId: 'kavya',
  status: VehicleStatus.HEALTHY,
  healthScore: 96,
  imageUrl: 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/135805/ace-gold-exterior-right-front-three-quarter-3.jpeg?isig=0&q=75',
  telematics: { speed: 0, rpm: 0, engineTemp: 40, batteryVoltage: 12.8, brakeWearLevel: 10, timestamp: new Date().toISOString() }
}));

const KAVYA_FLEET = [...FLEET_RISK_VEHICLES, ...FLEET_HEALTHY_VEHICLES];

// 3. ARJUN (Technician) - Assigned Job
const ARJUN_JOBS: ServiceAppointment[] = [
  {
    id: 'job-101',
    vehicleId: 'fleet-tata-3',
    vehicleModel: 'Tata Ace Gold',
    technicianId: 'arjun',
    scheduledTime: new Date().toISOString(),
    status: 'CONFIRMED',
    serviceCenter: 'AutoMind Hub - Bay 2',
    predictedIssue: 'Turbocharger Overheating'
  }
];

// 4. PRIYA (OEM) - Learning Cards & Clusters
const PRIYA_CARDS: LearningCard[] = [
  { id: 'lc-1', vehicleModel: 'Tata Ace Gold', faultType: 'Turbocharger Overheating', rootCause: 'Oil feed line clogging due to residue build-up', fixSummary: 'Cleaned oil lines, replaced turbo bearing', occurrenceCount: 4, generatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'lc-2', vehicleModel: 'Hyundai i20', faultType: 'Premature Brake Wear', rootCause: 'Vendor batch 19A friction material defect', fixSummary: 'Replaced brake pads with ceramic compound', occurrenceCount: 31, generatedAt: new Date(Date.now() - 172800000).toISOString() },
];

export class AutoMindService {
  
  private vehicles: Vehicle[] = [RAHUL_VEHICLE, ...KAVYA_FLEET];
  private alerts: MaintenanceAlert[] = [];
  private appointments: ServiceAppointment[] = [...ARJUN_JOBS];
  private learningCards: LearningCard[] = [...PRIYA_CARDS];
  private uebaLogs: UEBALog[] = [];
  
  // New: Agent Trust Scores State for Demo
  private agentTrustScores: Record<string, number> = {
    'Diagnosis Agent': 99,
    'Digital Twin Agent': 98,
    'Scheduling Agent': 97,
    'OEM Insights Agent': 95
  };

  constructor() {
    this.initRealtimeSubscription();
    // Seed initial alerts for Kavya's fleet
    this.seedFleetAlerts();
    // Seed initial UEBA log
    this.uebaLogs.push({
        id: 'ueba-init',
        agentName: 'System',
        action: 'System Boot Sequence',
        trustScore: 100,
        timestamp: new Date().toISOString(),
        status: 'NORMAL'
    });
  }

  private seedFleetAlerts() {
    FLEET_RISK_VEHICLES.forEach(v => {
      let alertType = 'Unknown';
      if (v.model.includes('Tata')) alertType = 'Turbocharger Overheating';
      if (v.model.includes('Dost')) alertType = 'Brake Pad Wear';
      if (v.model.includes('Bolero')) alertType = 'Battery Degradation';
      
      this.alerts.push({
        id: `alert-${v.id}`,
        vehicleId: v.id,
        alertType,
        severity: v.status === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM',
        confidence: 0.92,
        description: `Predicted ${alertType} based on telematics drift.`,
        recommendedAction: 'Schedule Inspection',
        status: 'NEW',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initRealtimeSubscription() {
    supabase.channel('automind-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_alerts' }, (payload) => {
        this.fetchAlerts(); 
      })
      .subscribe();
  }

  async getVehicles(role: UserRole): Promise<Vehicle[]> {
    // Role-based filtering for Demo Story
    if (role === UserRole.OWNER) return [this.vehicles[0]]; // Rahul gets only his i20
    if (role === UserRole.FLEET_MANAGER) return this.vehicles.slice(1); // Kavya gets the fleet
    return this.vehicles;
  }

  async fetchAlerts() {
    const { data } = await supabase.from('maintenance_alerts').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
        // Merge real DB alerts with mock alerts if DB is empty
    }
  }

  async getAlerts(role: UserRole): Promise<MaintenanceAlert[]> {
    if (role === UserRole.OWNER) return this.alerts.filter(a => a.vehicleId === RAHUL_VEHICLE.id);
    if (role === UserRole.FLEET_MANAGER) return this.alerts.filter(a => a.vehicleId.startsWith('fleet'));
    return this.alerts;
  }

  async getAppointments(role: UserRole): Promise<ServiceAppointment[]> {
    return this.appointments;
  }

  async getLearningCards(): Promise<LearningCard[]> {
    return this.learningCards;
  }
  
  // NEW: Generate Cluster Stats for OEM Charts
  async getClusterStats(): Promise<ClusterAnalysis[]> {
    // Mock aggregation logic based on the cards
    return [
      { id: 'c-1', faultType: 'Premature Brake Wear', vehicleModel: 'Hyundai i20', count: 31, severity: 'HIGH', vendorBatch: '19A' },
      { id: 'c-2', faultType: 'Turbocharger Overheating', vehicleModel: 'Tata Ace Gold', count: 22, severity: 'CRITICAL' },
      { id: 'c-3', faultType: 'Battery Degradation', vehicleModel: 'Mahindra Bolero', count: 14, severity: 'MEDIUM' },
      { id: 'c-4', faultType: 'Suspension Strut Leak', vehicleModel: 'Maruti Swift', count: 8, severity: 'LOW' }
    ];
  }

  async getUEBALogs(): Promise<UEBALog[]> {
    return this.uebaLogs;
  }
  
  async getAgentTrustScores(): Promise<Record<string, number>> {
    return this.agentTrustScores;
  }
  
  // NEW: Simulate Attack for Admin Story
  async simulateAgentAttack() {
      const agent = 'Scheduling Agent';
      const action = 'Unauthorized Data Access Attempt';
      const duration = 5000; // Anomaly: High Latency
      
      const { score, status } = UEBA.analyzeBehavior(agent, action, duration);
      
      // Force a drop for the demo story
      const attackScore = 62; 
      this.agentTrustScores[agent] = attackScore;

      this.uebaLogs.unshift({
        id: `ueba-attack-${Date.now()}`,
        agentName: agent,
        action: action,
        trustScore: attackScore,
        timestamp: new Date().toISOString(),
        status: 'ANOMALY'
      });
      
      return { success: true };
  }

  // --- MASTER AGENT WORKFLOW ---

  async runPredictiveCycle(vehicleId: string): Promise<{ vehicle: Vehicle, alert: MaintenanceAlert | null, log: string }> {
    const startTime = Date.now();
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    // STORY LOGIC: If it's Rahul's i20, trigger the "Brake Pad" scenario
    let newTelematics = { ...vehicle.telematics };
    
    if (vehicleId === 'rahul-i20') {
        newTelematics.brakeWearLevel = 88; // Critical threshold
        newTelematics.engineTemp = 94; // Slightly high but normal
    } else {
        newTelematics.engineTemp += (Math.random() * 10 - 2); 
    }
    
    vehicle.telematics = newTelematics;

    // 1. DIAGNOSIS AGENT
    const diagStart = Date.now();
    const prediction = await DiagnosisAgent.analyzeTelematics(vehicle.model, newTelematics);
    this.logUEBA('Diagnosis Agent', 'Analyze Telematics', Date.now() - diagStart);

    let newAlert: MaintenanceAlert | null = null;
    let logMsg = "Routine scan complete. Systems nominal.";

    if (prediction) {
      // 2. DIGITAL TWIN AGENT
      const twinStart = Date.now();
      const twinResult = await DigitalTwin.simulateVehicle(vehicle.model, newTelematics);
      this.logUEBA('Digital Twin Agent', 'Physics Simulation', Date.now() - twinStart);

      // Force validation for Demo Story
      const isValid = twinResult.anomalyDetected || vehicleId === 'rahul-i20';

      if (isValid) {
        newAlert = {
            id: `alert-${Date.now()}`,
            vehicleId: vehicle.id,
            alertType: prediction.alertType || 'Unknown',
            severity: prediction.severity || 'LOW',
            confidence: prediction.confidence || 0.85,
            description: prediction.description || 'Anomaly detected',
            recommendedAction: prediction.recommendedAction || 'Inspect',
            status: 'NEW',
            timestamp: new Date().toISOString()
        } as MaintenanceAlert;

        this.alerts.unshift(newAlert);
        
        // Update vehicle status
        if (newAlert.severity === 'CRITICAL' || newAlert.severity === 'HIGH') {
            vehicle.status = newAlert.severity === 'CRITICAL' ? VehicleStatus.CRITICAL : VehicleStatus.WARNING;
            vehicle.healthScore = Math.max(0, vehicle.healthScore - 20);
        }

        logMsg = `CONFIRMED: ${prediction.alertType}. Digital Twin Validation Passed.`;
      } else {
          logMsg = `Prediction suppressed by Digital Twin. Physics model mismatch.`;
      }
    }

    return { vehicle, alert: newAlert, log: logMsg };
  }

  async scheduleService(vehicleId: string, center: string): Promise<ServiceAppointment> {
    const schedStart = Date.now();
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    
    const newApt: ServiceAppointment = {
        id: `apt-${Date.now()}`,
        vehicleId,
        vehicleModel: vehicle?.model || 'Unknown',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'CONFIRMED',
        serviceCenter: center,
        predictedIssue: 'Scheduled via AutoMind'
    };

    this.appointments.push(newApt);
    if (vehicle) vehicle.status = VehicleStatus.IN_SERVICE;

    this.logUEBA('Scheduling Agent', 'Book Appointment', Date.now() - schedStart);
    return newApt;
  }
  
  // NEW: Bulk Scheduling Logic for Fleet Manager
  async bulkScheduleRepair(vehicleIds: string[]): Promise<void> {
    const start = Date.now();
    
    vehicleIds.forEach((id, index) => {
        const v = this.vehicles.find(veh => veh.id === id);
        if (v) {
            v.status = VehicleStatus.IN_SERVICE;
            // Create a job for Arjun
            this.appointments.push({
                id: `apt-bulk-${Date.now()}-${index}`,
                vehicleId: id,
                vehicleModel: v.model,
                technicianId: 'arjun',
                scheduledTime: new Date(Date.now() + 86400000 + (index * 3600000)).toISOString(), // Staggered by 1 hour
                status: 'CONFIRMED',
                serviceCenter: 'AutoMind Fleet Hub - Bay 1',
                predictedIssue: 'Bulk Fleet Maintenance'
            });
        }
    });

    this.logUEBA('Scheduling Agent', 'Bulk Schedule Optimization', Date.now() - start);
  }

  async completeRepairJob(appointmentId: string, notes: string): Promise<void> {
    const oemStart = Date.now();
    
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (apt) {
        apt.status = 'COMPLETED';
        const insight = await OemInsightsAgent.generateLearningCard(notes, apt.vehicleModel, apt.predictedIssue || 'Maintenance');
        
        this.learningCards.unshift({
            id: `lc-${Date.now()}`,
            vehicleModel: apt.vehicleModel,
            faultType: insight.faultType,
            rootCause: insight.rootCause,
            fixSummary: insight.fixSummary,
            occurrenceCount: 1,
            generatedAt: new Date().toISOString()
        });
    }

    this.logUEBA('OEM Insights Agent', 'Generate Learning Card', Date.now() - oemStart);
  }

  getVoiceContext() {
    const criticalVehicle = this.vehicles.find(v => v.status === VehicleStatus.CRITICAL || v.status === VehicleStatus.WARNING);
    return {
        vehicleStatus: criticalVehicle?.status || 'HEALTHY',
        alertCount: this.alerts.length,
        latestAlert: this.alerts[0]?.alertType
    };
  }

  private logUEBA(agent: string, action: string, duration: number) {
    const { score, status } = UEBA.analyzeBehavior(agent, action, duration);
    
    // Update the live map for the dashboard
    this.agentTrustScores[agent] = score;

    this.uebaLogs.unshift({
        id: `ueba-${Date.now()}`,
        agentName: agent,
        action,
        trustScore: score,
        timestamp: new Date().toISOString(),
        status
    });
  }
}

export const autoMind = new AutoMindService();