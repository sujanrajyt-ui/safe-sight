/**
 * risk_logic.ts - Converted from Python risk_logic.py
 * Risk scoring logic for traffic analysis
 */

import { Detection, VEHICLE_CLASSES, FrameAnalysis } from '../types';

/**
 * Calculate Intersection over Union (IoU) between two bounding boxes
 */
export function iou(boxA: [number, number, number, number], boxB: [number, number, number, number]): number {
  const xA = Math.max(boxA[0], boxB[0]);
  const yA = Math.max(boxA[1], boxB[1]);
  const xB = Math.min(boxA[2], boxB[2]);
  const yB = Math.min(boxA[3], boxB[3]);

  const interW = Math.max(0, xB - xA);
  const interH = Math.max(0, yB - yA);
  const interArea = interW * interH;

  if (interArea === 0) return 0;

  const boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]);
  const boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]);

  return interArea / (boxAArea + boxBArea - interArea);
}

/**
 * Get center point of a bounding box
 */
export function getCenter(box: [number, number, number, number]): [number, number] {
  const [x1, y1, x2, y2] = box;
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1: [number, number], p2: [number, number]): number {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

/**
 * Compute a risk score (0-100) for a single frame
 * Ported from Python compute_frame_risk()
 */
export function computeFrameRisk(
  detections: Detection[],
  frameWidth: number,
  frameHeight: number
): FrameAnalysis {
  let score = 0;
  let overlaps = 0;
  let proximityRisks = 0;

  const vehicles = detections.filter(d => VEHICLE_CLASSES.includes(d.className));
  const persons = detections.filter(d => d.className === 'person');

  // 1) Base score: how crowded is the frame
  score += 3 * vehicles.length;
  score += 5 * persons.length;

  // 2) Vehicle-vehicle overlap (potential collision risk)
  for (let i = 0; i < vehicles.length; i++) {
    for (let j = i + 1; j < vehicles.length; j++) {
      if (iou(vehicles[i].bbox, vehicles[j].bbox) > 0.1) {
        score += 20;
        overlaps++;
      }
    }
  }

  // 3) Vehicle-person proximity in lower half of frame (danger zone)
  for (const v of vehicles) {
    for (const p of persons) {
      const [cx_v, cy_v] = getCenter(v.bbox);
      const [cx_p, cy_p] = getCenter(p.bbox);
      const dist = distance([cx_v, cy_v], [cx_p, cy_p]);

      // If pedestrian is in lower half (closer to camera) and near vehicle
      if (cy_p > frameHeight * 0.5 && dist < frameWidth * 0.2) {
        score += 30;
        proximityRisks++;
      }
    }
  }

  // Clamp to [0, 100]
  score = Math.max(0, Math.min(score, 100));

  return {
    frameIndex: 0,
    score,
    detections,
    vehicleCount: vehicles.length,
    personCount: persons.length,
    overlaps,
    proximityRisks
  };
}

/**
 * Aggregate list of frame scores to a final (risk_level, risk_score)
 * Ported from Python aggregate_video_risk()
 */
export function aggregateVideoRisk(
  frameScores: number[]
): { riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; riskScore: number } {
  if (frameScores.length === 0) {
    return { riskLevel: 'LOW', riskScore: 0 };
  }

  const avgScore = frameScores.reduce((a, b) => a + b, 0) / frameScores.length;

  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (avgScore < 20) {
    level = 'LOW';
  } else if (avgScore < 50) {
    level = 'MEDIUM';
  } else if (avgScore < 75) {
    level = 'HIGH';
  } else {
    level = 'CRITICAL';
  }

  return { riskLevel: level, riskScore: Math.round(avgScore) };
}

/**
 * Generate violation summary from frame analyses
 */
export function generateViolations(
  frameAnalyses: FrameAnalysis[],
  avgScore: number
): { type: string; count: number; severity: 'low' | 'medium' | 'high' }[] {
  const violations: { type: string; count: number; severity: 'low' | 'medium' | 'high' }[] = [];

  // Count total incidents
  const totalOverlaps = frameAnalyses.reduce((sum, f) => sum + f.overlaps, 0);
  const totalProximity = frameAnalyses.reduce((sum, f) => sum + f.proximityRisks, 0);
  const avgVehicles = frameAnalyses.reduce((sum, f) => sum + f.vehicleCount, 0) / frameAnalyses.length;
  const avgPersons = frameAnalyses.reduce((sum, f) => sum + f.personCount, 0) / frameAnalyses.length;

  // Vehicle-vehicle near collisions
  if (totalOverlaps > 0) {
    violations.push({
      type: 'Vehicle Near-Collisions',
      count: totalOverlaps,
      severity: totalOverlaps > 5 ? 'high' : totalOverlaps > 2 ? 'medium' : 'low'
    });
  }

  // Pedestrian risks
  if (totalProximity > 0) {
    violations.push({
      type: 'Pedestrian Proximity Risks',
      count: totalProximity,
      severity: 'high'
    });
  }

  // Traffic congestion
  if (avgVehicles > 8) {
    violations.push({
      type: 'High Traffic Congestion',
      count: Math.round(avgVehicles),
      severity: avgVehicles > 15 ? 'high' : 'medium'
    });
  }

  // Crowded pedestrians
  if (avgPersons > 5) {
    violations.push({
      type: 'Crowded Pedestrian Area',
      count: Math.round(avgPersons),
      severity: avgPersons > 10 ? 'high' : 'medium'
    });
  }

  // High-risk frames
  const highRiskFrames = frameAnalyses.filter(f => f.score > 60).length;
  if (highRiskFrames > 3) {
    violations.push({
      type: 'High-Risk Frame Clusters',
      count: highRiskFrames,
      severity: 'high'
    });
  }

  // If no specific violations but still some risk
  if (violations.length === 0 && avgScore > 10) {
    violations.push({
      type: 'General Traffic Activity',
      count: Math.round(avgScore),
      severity: 'low'
    });
  }

  return violations;
}
