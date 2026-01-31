// Types matching the Python detection.py and risk_logic.py structures

export interface Detection {
  className: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  classId: number;
  center: [number, number]; // [cx, cy]
}

export interface FrameAnalysis {
  frameIndex: number;
  score: number;
  detections: Detection[];
  vehicleCount: number;
  personCount: number;
  overlaps: number;
  proximityRisks: number;
}

export interface ViolationData {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  icon?: string;
}

export interface RiskAnalysis {
  id: string;
  locationName: string;
  lat: number;
  lon: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  timestamp: Date;
  videoName: string;
  violations: ViolationData[];
  frameStats: {
    totalFrames: number;
    processedFrames: number;
    avgVehicles: number;
    avgPersons: number;
    maxScore: number;
    minScore: number;
  };
  isValidStreetFootage?: boolean;
}

export interface LocationResult {
  lat: number;
  lon: number;
  displayName: string;
}

export interface CameraResult {
  name: string;
  lat: number;
  lon: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
}

// Target classes from detection.py
export const TARGET_CLASSES: Record<number, string> = {
  0: 'person',
  1: 'bicycle',
  2: 'car',
  3: 'motorcycle',
  5: 'bus',
  7: 'truck',
  9: 'traffic light',
  11: 'stop sign',
};

export const VEHICLE_CLASSES = ['car', 'motorcycle', 'bus', 'truck', 'bicycle'];
export const PERSON_CLASSES = ['person'];
