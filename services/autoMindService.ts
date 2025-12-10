import { UserRole, Vehicle, VehicleStatus, MaintenanceAlert, ServiceAppointment, LearningCard, UEBALog, ClusterAnalysis, InventoryItem, ChatMessage, Invoice } from "../types";
import { DiagnosisAgent, OemInsightsAgent } from "./geminiService";
import { DigitalTwin } from "../lib/digitalTwin";
import { UEBA } from "../lib/ueba";
import { supabase } from "../lib/supabaseClient";

// --- STORY-DRIVEN MOCK DATA (FALLBACK) ---

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
const FLEET_RISK_VEHICLES: Vehicle[] = [
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

const PRIYA_CARDS: LearningCard[] = [
  { id: 'lc-1', vehicleModel: 'Tata Ace Gold', faultType: 'Turbocharger Overheating', rootCause: 'Oil feed line clogging due to residue build-up', fixSummary: 'Cleaned oil lines, replaced turbo bearing', occurrenceCount: 4, generatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'lc-2', vehicleModel: 'Hyundai i20', faultType: 'Premature Brake Wear', rootCause: 'Vendor batch 19A friction material defect', fixSummary: 'Replaced brake pads with ceramic compound', occurrenceCount: 31, generatedAt: new Date(Date.now() - 172800000).toISOString() },
];

const SERVICE_INVENTORY: InventoryItem[] = [
    { id: 'inv-1', name: 'Ceramic Brake Pad Set', sku: 'BP-HYU-2023', category: 'Brakes', quantity: 45, threshold: 20, status: 'IN_STOCK', price: 1200 },
    { id: 'inv-2', name: 'Turbocharger Assembly', sku: 'TB-TATA-ACE', category: 'Engine', quantity: 2, threshold: 5, status: 'LOW_STOCK', price: 15000 },
    { id: 'inv-3', name: 'Synthetic Oil (5W-30)', sku: 'OIL-SYN-5L', category: 'Fluids', quantity: 120, threshold: 30, status: 'IN_STOCK', price: 3500 },
    { id: 'inv-4', name: 'Oil Filter', sku: 'FLT-OIL-GEN', category: 'Filters', quantity: 5, threshold: 10, status: 'LOW_STOCK', price: 450 },
    { id: 'inv-5', name: 'Alternator 12V', sku: 'ALT-MAH-BOL', category: 'Electrical', quantity: 0, threshold: 3, status: 'OUT_OF_STOCK', price: 8500 },
];

export class AutoMindService {
  
  private mockVehicles: Vehicle[] = [RAHUL_VEHICLE, ...KAVYA_FLEET];
  private mockAlerts: MaintenanceAlert[] = [];
  private mockAppointments: ServiceAppointment[] = [...ARJUN_JOBS];
  private mockLearningCards: LearningCard[] = [...PRIYA_CARDS];
  private mockInventory: InventoryItem[] = [...SERVICE_INVENTORY];
  private mockInvoices: Invoice[] = [];
  
  private agentTrustScores: Record<string, number> = {
    'Diagnosis Agent': 99,
    'Digital Twin Agent': 98,
    'Scheduling Agent': 97,
    'OEM Insights Agent': 95
  };

  private uebaLogs: UEBALog[] = [];
  private chatSubscription: any = null;

  constructor() {
    this.initRealtimeSubscription();
    this.seedFleetAlerts();
  }

  private seedFleetAlerts() {
    FLEET_RISK_VEHICLES.forEach(v => {
      let alertType = 'Unknown';
      if (v.model.includes('Tata')) alertType = 'Turbocharger Overheating';
      if (v.model.includes('Dost')) alertType = 'Brake Pad Wear';
      if (v.model.includes('Bolero')) alertType = 'Battery Degradation';
      
      this.mockAlerts.push({
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
    // Listen for DB changes
    supabase.channel('automind-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_alerts' }, (payload) => {
        console.log("Realtime Alert:", payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
        console.log("Realtime Vehicle Update:", payload);
      })
      .subscribe();
  }

  // --- CHAT SYSTEM (BROADCAST) ---
  
  subscribeToChat(callback: (msg: ChatMessage) => void) {
      this.chatSubscription = supabase.channel('automind-global-chat')
        .on('broadcast', { event: 'message' }, (payload) => {
            callback(payload.payload as ChatMessage);
        })
        .subscribe();
  }

  async sendChatMessage(message: ChatMessage) {
      await supabase.channel('automind-global-chat')
        .send({
            type: 'broadcast',
            event: 'message',
            payload: message
        });
  }

  /**
   * SEED DATABASE FUNCTION
   * Pushes the Story Data (Rahul, Kavya, etc.) into Supabase if empty.
   */
  async seedDatabase(): Promise<string> {
    try {
        console.log("Checking DB status...");
        const { count } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
        
        if (count && count > 0) {
            return "Database already has data. Skipping seed.";
        }

        console.log("Seeding Vehicles...");
        const dbVehicles = this.mockVehicles.map(v => ({
            id: v.id,
            vin: v.vin,
            model: v.model,
            year: v.year,
            owner_id: v.ownerId,
            status: v.status,
            health_score: v.healthScore,
            image_url: v.imageUrl,
            telematics: v.telematics
        }));
        await supabase.from('vehicles').insert(dbVehicles);

        console.log("Seeding Alerts...");
        const dbAlerts = this.mockAlerts.map(a => ({
            id: a.id,
            vehicle_id: a.vehicleId,
            alert_type: a.alertType,
            severity: a.severity,
            confidence: a.confidence,
            description: a.description,
            recommended_action: a.recommendedAction,
            status: a.status,
            created_at: a.timestamp
        }));
        await supabase.from('maintenance_alerts').insert(dbAlerts);

        console.log("Seeding Appointments...");
        const dbApts = this.mockAppointments.map(a => ({
            id: a.id,
            vehicle_id: a.vehicleId,
            vehicle_model: a.vehicleModel,
            technician_id: a.technicianId,
            scheduled_time: a.scheduledTime,
            status: a.status,
            service_center: a.serviceCenter,
            predicted_issue: a.predictedIssue
        }));
        await supabase.from('service_appointments').insert(dbApts);

        console.log("Seeding Inventory...");
        await supabase.from('inventory').insert(this.mockInventory);

        return "Database Seeded Successfully! Refreshing...";
    } catch (e: any) {
        console.error("Seeding Error:", e);
        return `Error seeding DB: ${e.message}`;
    }
  }

  async resetDatabase(): Promise<string> {
    try {
        // Clear Appointments (except seed ones if you wanted, but for demo we clear NEW ones)
        // Here we clear everything except the seed data logically, but for simplicity we wipe tables that change
        await supabase.from('service_appointments').delete().neq('id', 'job-101'); 
        await supabase.from('maintenance_alerts').delete().neq('status', 'NEW'); // Keep initial alerts
        
        // Reset local mocks
        this.mockAppointments = [...ARJUN_JOBS];
        this.mockAlerts = [];
        this.seedFleetAlerts();
        
        return "Demo Data Reset Complete.";
    } catch (e: any) {
        return `Error resetting: ${e.message}`;
    }
  }

  // --- DATA FETCHING (Hybrid: DB first, Mock fallback) ---

  async getVehicles(role: UserRole): Promise<Vehicle[]> {
    try {
        const { data, error } = await supabase.from('vehicles').select('*');
        if (error || !data || data.length === 0) throw new Error("Fallback to mock");
        
        // Map snake_case to camelCase
        const dbVehicles: Vehicle[] = data.map((v: any) => ({
            id: v.id,
            vin: v.vin,
            model: v.model,
            year: v.year,
            ownerId: v.owner_id,
            status: v.status as VehicleStatus,
            healthScore: v.health_score,
            imageUrl: v.image_url || 'https://via.placeholder.com/300',
            telematics: v.telematics || { speed: 0, rpm: 0, engineTemp: 0, batteryVoltage: 0, brakeWearLevel: 0, timestamp: new Date().toISOString() }
        }));

        if (role === UserRole.OWNER) return dbVehicles.filter(v => v.ownerId === 'rahul');
        if (role === UserRole.FLEET_MANAGER) return dbVehicles.filter(v => v.ownerId === 'kavya');
        return dbVehicles;

    } catch (e) {
        if (role === UserRole.OWNER) return [this.mockVehicles[0]];
        if (role === UserRole.FLEET_MANAGER) return this.mockVehicles.slice(1);
        return this.mockVehicles;
    }
  }

  async getAlerts(role: UserRole): Promise<MaintenanceAlert[]> {
    try {
        const { data, error } = await supabase.from('maintenance_alerts').select('*').order('created_at', { ascending: false });
        if (error || !data || data.length === 0) throw new Error("Fallback to mock");
        
        const dbAlerts: MaintenanceAlert[] = data.map((a: any) => ({
            id: a.id,
            vehicleId: a.vehicle_id,
            alertType: a.alert_type,
            severity: a.severity,
            confidence: a.confidence,
            description: a.description,
            recommendedAction: a.recommended_action,
            status: a.status,
            timestamp: a.created_at
        }));

        if (role === UserRole.OWNER) return dbAlerts.filter(a => a.vehicleId === RAHUL_VEHICLE.id); // In DB needs matching ID
        return dbAlerts;
    } catch (e) {
        if (role === UserRole.OWNER) return this.mockAlerts.filter(a => a.vehicleId === RAHUL_VEHICLE.id);
        if (role === UserRole.FLEET_MANAGER) return this.mockAlerts.filter(a => a.vehicleId.startsWith('fleet'));
        return this.mockAlerts;
    }
  }

  async getAppointments(role: UserRole): Promise<ServiceAppointment[]> {
    try {
        const { data, error } = await supabase.from('service_appointments').select('*').order('scheduled_time', { ascending: true });
        if (error || !data || data.length === 0) throw new Error("Fallback");
        return data.map((a: any) => ({
            id: a.id,
            vehicleId: a.vehicle_id,
            vehicleModel: a.vehicle_model,
            technicianId: a.technician_id,
            scheduledTime: a.scheduled_time,
            status: a.status,
            serviceCenter: a.service_center,
            predictedIssue: a.predicted_issue
        }));
    } catch (e) {
        return this.mockAppointments;
    }
  }

  async getLearningCards(): Promise<LearningCard[]> {
    try {
        const { data, error } = await supabase.from('learning_cards').select('*');
        if (error || !data || data.length === 0) throw new Error("Fallback");
        return data.map((c: any) => ({
            id: c.id,
            vehicleModel: c.vehicle_model,
            faultType: c.fault_type,
            rootCause: c.root_cause,
            fixSummary: c.fix_summary,
            occurrenceCount: c.occurrence_count,
            generatedAt: c.generated_at,
            clusterId: c.cluster_id
        }));
    } catch(e) {
        return this.mockLearningCards;
    }
  }

  async getInventory(): Promise<InventoryItem[]> {
      try {
          const { data, error } = await supabase.from('inventory').select('*');
          if (error || !data || data.length === 0) throw new Error("Fallback");
          return data;
      } catch (e) {
          return this.mockInventory;
      }
  }

  async getFleetFinancials(): Promise<{monthly: any[], savings: number, totalSpend: number}> {
      // Mock financial projection based on fleet size
      return {
          monthly: [
              { name: 'May', spend: 4000, savings: 1200 },
              { name: 'Jun', spend: 3500, savings: 1500 },
              { name: 'Jul', spend: 5000, savings: 1000 },
              { name: 'Aug', spend: 3200, savings: 2100 },
              { name: 'Sep', spend: 2800, savings: 2400 },
              { name: 'Oct', spend: 2500, savings: 2800 },
          ],
          savings: 12400,
          totalSpend: 21000
      };
  }

  async createInvoice(appointmentId: string, partsUsed: {id: string, qty: number}[]): Promise<Invoice> {
    const apt = this.mockAppointments.find(a => a.id === appointmentId);
    const vehicle = this.mockVehicles.find(v => v.id === apt?.vehicleId);
    
    const items: any[] = [];
    let totalParts = 0;

    // Calculate parts cost
    partsUsed.forEach(p => {
        const invItem = this.mockInventory.find(i => i.id === p.id);
        if (invItem) {
            const cost = invItem.price * p.qty;
            items.push({ description: invItem.name, cost: invItem.price, quantity: p.qty });
            totalParts += cost;
        }
    });

    // Calculate labor cost (Standard 2 hours for demo)
    const laborHours = 2; 
    const laborRate = 85;
    const totalLabor = laborHours * laborRate;
    items.push({ description: 'Technician Labor (Standard Rate)', cost: laborRate, quantity: laborHours });

    const invoice: Invoice = {
        id: `inv-${Date.now()}`,
        appointmentId,
        vehicleId: apt?.vehicleId || 'unknown',
        customerName: vehicle?.ownerId || 'Unknown Customer',
        items,
        totalParts,
        totalLabor,
        totalAmount: totalParts + totalLabor,
        status: 'PENDING',
        generatedAt: new Date().toISOString()
    };

    this.mockInvoices.push(invoice);
    // In a real app, save to Supabase here
    return invoice;
  }

  // --- ACTIONS WITH HYBRID PERSISTENCE ---

  async runPredictiveCycle(vehicleId: string): Promise<{ vehicle: Vehicle, alert: MaintenanceAlert | null, log: string }> {
    const startTime = Date.now();
    
    // Find vehicle (prefer mock for demo predictability if ID matches)
    let vehicle = this.mockVehicles.find(v => v.id === vehicleId);
    
    // STORY LOGIC: Force the scenario
    let newTelematics = vehicle ? { ...vehicle.telematics } : { speed: 45, rpm: 2100, engineTemp: 92, batteryVoltage: 12.4, brakeWearLevel: 87, timestamp: new Date().toISOString() };
    
    if (vehicleId === 'rahul-i20') {
        newTelematics.brakeWearLevel = 88; 
    } 

    const diagStart = Date.now();
    const prediction = await DiagnosisAgent.analyzeTelematics(vehicle?.model || 'Unknown', newTelematics);
    this.logUEBA('Diagnosis Agent', 'Analyze Telematics', Date.now() - diagStart);

    let newAlert: MaintenanceAlert | null = null;
    let logMsg = "Routine scan complete. Systems nominal.";

    if (prediction) {
      const twinStart = Date.now();
      const twinResult = await DigitalTwin.simulateVehicle(vehicle?.model || 'Unknown', newTelematics);
      this.logUEBA('Digital Twin Agent', 'Physics Simulation', Date.now() - twinStart);

      const isValid = twinResult.anomalyDetected || vehicleId === 'rahul-i20';

      if (isValid) {
        newAlert = {
            id: `alert-${Date.now()}`,
            vehicleId: vehicleId,
            alertType: prediction.alertType || 'Unknown',
            severity: prediction.severity || 'LOW',
            confidence: prediction.confidence || 0.85,
            description: prediction.description || 'Anomaly detected',
            recommendedAction: prediction.recommendedAction || 'Inspect',
            status: 'NEW',
            timestamp: new Date().toISOString()
        } as MaintenanceAlert;

        // Persist to Mock
        this.mockAlerts.unshift(newAlert);
        if (vehicle) {
            vehicle.status = newAlert.severity === 'CRITICAL' ? VehicleStatus.CRITICAL : VehicleStatus.WARNING;
            vehicle.healthScore = Math.max(0, vehicle.healthScore - 20);
        }

        // Persist to DB (Fire & Forget)
        supabase.from('maintenance_alerts').insert({
            vehicle_id: vehicleId,
            alert_type: newAlert.alertType,
            severity: newAlert.severity,
            confidence: newAlert.confidence,
            description: newAlert.description,
            recommended_action: newAlert.recommendedAction,
            status: 'NEW'
        }).then(({ error }) => { if (error) console.error("DB Insert Failed (Demo Mode active)", error); });

        logMsg = `CONFIRMED: ${prediction.alertType}. Digital Twin Validation Passed.`;
      }
    }

    return { vehicle: vehicle!, alert: newAlert, log: logMsg };
  }

  async scheduleService(vehicleId: string, center: string): Promise<ServiceAppointment> {
    const newApt: ServiceAppointment = {
        id: `apt-${Date.now()}`,
        vehicleId,
        vehicleModel: 'Hyundai i20',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'CONFIRMED',
        serviceCenter: center,
        predictedIssue: 'Scheduled via AutoMind'
    };

    this.mockAppointments.push(newApt);
    
    // DB
    supabase.from('service_appointments').insert({
        vehicle_id: vehicleId,
        vehicle_model: 'Hyundai i20',
        scheduled_time: newApt.scheduledTime,
        status: 'CONFIRMED',
        service_center: center,
        predicted_issue: 'Scheduled via AutoMind'
    }).then();

    return newApt;
  }

  async bulkScheduleRepair(vehicleIds: string[]): Promise<void> {
    const slots = [
        { hour: 9, min: 0, bay: 'Bay 1' }, { hour: 9, min: 30, bay: 'Bay 2' },
        { hour: 11, min: 0, bay: 'Bay 1' }, { hour: 11, min: 30, bay: 'Bay 2' },
        { hour: 14, min: 0, bay: 'Bay 1' }, { hour: 14, min: 30, bay: 'Bay 2' },
        { hour: 16, min: 0, bay: 'Bay 1' }
    ];

    const dbPayloads: any[] = [];

    vehicleIds.forEach((id, index) => {
        const v = this.mockVehicles.find(veh => veh.id === id);
        if (v) {
            v.status = VehicleStatus.IN_SERVICE;
            const slot = slots[index % slots.length];
            const appointmentDate = new Date();
            appointmentDate.setDate(appointmentDate.getDate() + Math.floor(index / slots.length) + 1);
            appointmentDate.setHours(slot.hour, slot.min, 0, 0);

            const apt = {
                id: `apt-bulk-${Date.now()}-${index}`,
                vehicleId: id,
                vehicleModel: v.model,
                technicianId: 'arjun',
                scheduledTime: appointmentDate.toISOString(),
                status: 'CONFIRMED',
                serviceCenter: `AutoMind Fleet Hub - ${slot.bay}`,
                predictedIssue: 'Bulk Fleet Maintenance'
            } as ServiceAppointment;
            
            this.mockAppointments.push(apt);
            
            dbPayloads.push({
                vehicle_id: id,
                vehicle_model: v.model,
                technician_id: 'arjun',
                scheduled_time: appointmentDate.toISOString(),
                status: 'CONFIRMED',
                service_center: apt.serviceCenter,
                predicted_issue: 'Bulk Fleet Maintenance'
            });
        }
    });

    if (dbPayloads.length > 0) {
        supabase.from('service_appointments').insert(dbPayloads).then();
    }
  }

  // --- MOCK HELPERS (Keep these for visual consistency in OEM/Admin) ---

  async getClusterStats(): Promise<ClusterAnalysis[]> {
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

  async simulateAgentAttack() {
      const agent = 'Scheduling Agent';
      const action = 'Unauthorized Data Access Attempt';
      const duration = 5000;
      const { score, status } = UEBA.analyzeBehavior(agent, action, duration);
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
  
  async completeRepairJob(appointmentId: string, notes: string, partsUsed: {id: string, qty: number}[] = []): Promise<Invoice> {
    const apt = this.mockAppointments.find(a => a.id === appointmentId);
    let invoice;

    if (apt) {
        apt.status = 'COMPLETED';
        const insight = await OemInsightsAgent.generateLearningCard(notes, apt.vehicleModel, apt.predictedIssue || 'Maintenance');
        this.mockLearningCards.unshift({
            id: `lc-${Date.now()}`,
            vehicleModel: apt.vehicleModel,
            faultType: insight.faultType,
            rootCause: insight.rootCause,
            fixSummary: insight.fixSummary,
            occurrenceCount: 1,
            generatedAt: new Date().toISOString()
        });
        
        // DB
        supabase.from('learning_cards').insert({
            vehicle_model: apt.vehicleModel,
            fault_type: insight.faultType,
            root_cause: insight.rootCause,
            fix_summary: insight.fixSummary,
            occurrence_count: 1
        }).then();

        // GENERATE INVOICE
        invoice = await this.createInvoice(appointmentId, partsUsed);
    }
    return invoice!;
  }
  
  async deductPart(partId: string, quantity: number): Promise<InventoryItem | undefined> {
      const item = this.mockInventory.find(i => i.id === partId);
      if (item) {
          item.quantity = Math.max(0, item.quantity - quantity);
          if (item.quantity === 0) item.status = 'OUT_OF_STOCK';
          else if (item.quantity <= item.threshold) item.status = 'LOW_STOCK';
          
          // DB
          supabase.from('inventory').update({ quantity: item.quantity, status: item.status }).eq('id', partId).then();
      }
      return item;
  }

  async restockPart(partId: string): Promise<InventoryItem | undefined> {
      const item = this.mockInventory.find(i => i.id === partId);
      if (item) {
          item.quantity += 50; 
          item.status = 'IN_STOCK';
          supabase.from('inventory').update({ quantity: item.quantity, status: 'IN_STOCK' }).eq('id', partId).then();
      }
      return item;
  }

  getVoiceContext() {
      // Default context for the demo (focusing on the Owner persona)
      const vehicle = this.mockVehicles[0]; 
      const alerts = this.mockAlerts.filter(a => a.vehicleId === vehicle.id);

      return {
          vehicleStatus: vehicle ? vehicle.status : 'UNKNOWN',
          alertCount: alerts.length,
          latestAlert: alerts.length > 0 ? alerts[0].alertType : null
      };
  }

  private logUEBA(agent: string, action: string, duration: number) {
    const { score, status } = UEBA.analyzeBehavior(agent, action, duration);
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