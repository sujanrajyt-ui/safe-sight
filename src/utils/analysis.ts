/**
 * analysis.ts - Video Analysis Pipeline
 * Converted from Python analysis.py
 * 
 * Simulates the video analysis pipeline using detection + risk logic
 */

import { FrameAnalysis, ViolationData } from '../types';
import { simulateYoloDetection, getScenarioForFrame } from './detection';
import { computeFrameRisk, aggregateVideoRisk, generateViolations } from './riskLogic';

interface AnalysisResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  violations: ViolationData[];
  frameStats: {
    totalFrames: number;
    processedFrames: number;
    avgVehicles: number;
    avgPersons: number;
    maxScore: number;
    minScore: number;
  };
}

/**
 * Analyze a video file and return risk assessment
 * 
 * In production, this would:
 * 1. Upload video to backend
 * 2. Backend runs YOLO frame-by-frame
 * 3. Returns aggregated results
 * 
 * For frontend demo, we simulate realistic analysis
 */
export async function analyzeVideo(
  file: File,
  onProgress?: (progress: number) => void,
  maxFrames: number = 50,
  frameSkip: number = 3
): Promise<AnalysisResult> {
  console.log(`[analysis] Starting analysis of: ${file.name}`);
  
  // Simulated video properties (in real app, would extract from video metadata)
  const frameWidth = 1920;
  const frameHeight = 1080;
  const totalEstimatedFrames = maxFrames * frameSkip;
  
  const frameAnalyses: FrameAnalysis[] = [];
  const frameScores: number[] = [];
  
  // Simulate frame-by-frame processing
  for (let frameIndex = 0; frameIndex < totalEstimatedFrames; frameIndex++) {
    // Skip frames as in Python version
    if (frameIndex % frameSkip !== 0) continue;
    
    // Update progress
    const progress = Math.min(95, Math.round((frameIndex / totalEstimatedFrames) * 100));
    onProgress?.(progress);
    
    // Simulate processing delay (faster than real YOLO but gives UI feedback)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Get scenario intensity for this frame (creates realistic variation)
    const scenario = getScenarioForFrame(frameIndex, totalEstimatedFrames);
    
    // Simulate YOLO detection
    const detections = simulateYoloDetection(frameWidth, frameHeight, scenario);
    
    // Compute frame risk score (using actual Python logic)
    const frameAnalysis = computeFrameRisk(detections, frameWidth, frameHeight);
    frameAnalysis.frameIndex = frameIndex;
    
    frameAnalyses.push(frameAnalysis);
    frameScores.push(frameAnalysis.score);
    
    // Check max frames limit
    if (frameAnalyses.length >= maxFrames) break;
  }
  
  // Final progress update
  onProgress?.(100);
  
  // Handle empty analysis
  if (frameAnalyses.length === 0) {
    console.log(`[analysis] No frames processed for ${file.name}. Defaulting to LOW, 0.`);
    return {
      riskLevel: 'LOW',
      riskScore: 0,
      violations: [],
      frameStats: {
        totalFrames: 0,
        processedFrames: 0,
        avgVehicles: 0,
        avgPersons: 0,
        maxScore: 0,
        minScore: 0
      }
    };
  }
  
  // Aggregate results (using actual Python logic)
  const { riskLevel, riskScore } = aggregateVideoRisk(frameScores);
  
  // Generate violation summary
  const violations = generateViolations(frameAnalyses, riskScore);
  
  // Compute frame statistics
  const avgVehicles = frameAnalyses.reduce((sum, f) => sum + f.vehicleCount, 0) / frameAnalyses.length;
  const avgPersons = frameAnalyses.reduce((sum, f) => sum + f.personCount, 0) / frameAnalyses.length;
  const maxScore = Math.max(...frameScores);
  const minScore = Math.min(...frameScores);
  
  console.log(`[analysis] Finished ${file.name}: level=${riskLevel}, score=${riskScore}`);
  
  return {
    riskLevel,
    riskScore,
    violations,
    frameStats: {
      totalFrames: totalEstimatedFrames,
      processedFrames: frameAnalyses.length,
      avgVehicles: Math.round(avgVehicles * 10) / 10,
      avgPersons: Math.round(avgPersons * 10) / 10,
      maxScore,
      minScore
    }
  };
}

/**
 * Quick analysis for preview (fewer frames, faster)
 */
export async function quickAnalyze(
  file: File,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> {
  return analyzeVideo(file, onProgress, 20, 5);
}

/**
 * Deep analysis for thorough inspection (more frames)
 */
export async function deepAnalyze(
  file: File,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> {
  return analyzeVideo(file, onProgress, 100, 2);
}
