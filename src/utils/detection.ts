/**
 * detection.ts - Simulated Detection Module
 * 
 * In a real MERN stack app, this would call a Python backend API
 * running YOLOv8. For frontend-only deployment, we simulate realistic detections.
 */

import { Detection, TARGET_CLASSES, VEHICLE_CLASSES } from '../types';

// Target class IDs for traffic analysis (matching Python detection.py)
// IDs: 0=person, 1=bicycle, 2=car, 3=motorcycle, 5=bus, 7=truck

/**
 * Simulates YOLO detection on a video frame
 * In production, this would be an API call to a Python backend
 */
export function simulateYoloDetection(
  frameWidth: number,
  frameHeight: number,
  scenarioIntensity: 'low' | 'medium' | 'high' = 'medium'
): Detection[] {
  const detections: Detection[] = [];
  
  // Determine number of objects based on scenario
  const vehicleCounts = { low: [1, 4], medium: [3, 8], high: [6, 15] };
  const personCounts = { low: [0, 2], medium: [1, 5], high: [3, 10] };
  
  const [minVehicles, maxVehicles] = vehicleCounts[scenarioIntensity];
  const [minPersons, maxPersons] = personCounts[scenarioIntensity];
  
  const numVehicles = Math.floor(Math.random() * (maxVehicles - minVehicles + 1)) + minVehicles;
  const numPersons = Math.floor(Math.random() * (maxPersons - minPersons + 1)) + minPersons;
  
  // Generate vehicle detections
  for (let i = 0; i < numVehicles; i++) {
    const vehicleType = VEHICLE_CLASSES[Math.floor(Math.random() * VEHICLE_CLASSES.length)];
    const classId = Object.entries(TARGET_CLASSES).find(([_, name]) => name === vehicleType)?.[0] || '2';
    
    // Vehicles typically in middle-to-lower portion of frame
    const width = Math.random() * (frameWidth * 0.15) + frameWidth * 0.08;
    const height = Math.random() * (frameHeight * 0.2) + frameHeight * 0.1;
    const x1 = Math.random() * (frameWidth - width);
    const y1 = Math.random() * (frameHeight * 0.5) + frameHeight * 0.2;
    
    detections.push({
      className: vehicleType,
      confidence: Math.random() * 0.3 + 0.7, // 0.7 - 1.0
      bbox: [x1, y1, x1 + width, y1 + height] as [number, number, number, number],
      classId: parseInt(classId),
      center: [x1 + width / 2, y1 + height / 2]
    });
  }
  
  // Generate person detections
  for (let i = 0; i < numPersons; i++) {
    const width = Math.random() * (frameWidth * 0.05) + frameWidth * 0.03;
    const height = Math.random() * (frameHeight * 0.15) + frameHeight * 0.08;
    const x1 = Math.random() * (frameWidth - width);
    // Pedestrians often near edges/crossings - lower portion of frame
    const y1 = Math.random() * (frameHeight * 0.4) + frameHeight * 0.4;
    
    detections.push({
      className: 'person',
      confidence: Math.random() * 0.25 + 0.75,
      bbox: [x1, y1, x1 + width, y1 + height] as [number, number, number, number],
      classId: 0,
      center: [x1 + width / 2, y1 + height / 2]
    });
  }
  
  return detections;
}

/**
 * Simulates varying traffic scenarios across frames
 * This creates realistic variation in a video analysis
 */
export function getScenarioForFrame(
  frameIndex: number,
  totalFrames: number
): 'low' | 'medium' | 'high' {
  // Create natural variation with some "peak" moments
  const normalizedPosition = frameIndex / totalFrames;
  const noise = Math.sin(normalizedPosition * Math.PI * 4) * 0.3 + Math.random() * 0.3;
  
  // Create 2-3 peak danger moments in the video
  const peakMoments = [0.25, 0.5, 0.75];
  let intensity = 0.3 + noise;
  
  for (const peak of peakMoments) {
    const distFromPeak = Math.abs(normalizedPosition - peak);
    if (distFromPeak < 0.1) {
      intensity += (0.1 - distFromPeak) * 5;
    }
  }
  
  if (intensity < 0.4) return 'low';
  if (intensity < 0.7) return 'medium';
  return 'high';
}

/**
 * Format detection info for display
 */
export function formatDetectionSummary(detections: Detection[]): string {
  const counts: Record<string, number> = {};
  
  for (const d of detections) {
    counts[d.className] = (counts[d.className] || 0) + 1;
  }
  
  return Object.entries(counts)
    .map(([cls, count]) => `${count} ${cls}${count > 1 ? 's' : ''}`)
    .join(', ');
}
