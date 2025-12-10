export enum UserRole {
  OWNER = 'OWNER',
  FLEET_MANAGER = 'FLEET_MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  OEM_ENGINEER = 'OEM_ENGINEER',
  ADMIN = 'ADMIN'
}

export enum VehicleStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  IN_SERVICE = 'IN_SERVICE'
}

export interface TelematicsData {
  speed: number;
  rpm: number;
  engineTemp: number;
  batteryVoltage: number;
  brakeWearLevel: number; // 0-100%
  timestamp: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  model: string;
  year: number;
  ownerId: string;
  status: VehicleStatus;
  healthScore: number; // 0-100
  telematics: TelematicsData;
  imageUrl: string;
}

export interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  alertType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  description: string;
  recommendedAction: string;
  status: 'NEW' | 'SCHEDULED' | 'RESOLVED';
  timestamp: string;
}

export interface ServiceAppointment {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  technicianId?: string;
  scheduledTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
  serviceCenter: string;
  predictedIssue?: string;
}

export interface RepairJob extends ServiceAppointment {
  diagnosisNotes?: string;
  partsReplaced?: string[];
}

export interface LearningCard {
  id: string;
  vehicleModel: string;
  faultType: string;
  rootCause: string;
  fixSummary: string;
  occurrenceCount: number;
  generatedAt: string;
  clusterId?: string;
}

export interface ClusterAnalysis {
  id: string;
  faultType: string;
  vehicleModel: string;
  count: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  vendorBatch?: string;
}

export interface UEBALog {
  id: string;
  agentName: string;
  action: string;
  trustScore: number; // 0-100
  timestamp: string;
  status: 'NORMAL' | 'ANOMALY';
}