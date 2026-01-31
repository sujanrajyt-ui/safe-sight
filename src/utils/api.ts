/**
 * api.ts - Backend API Service
 * 
 * For full MERN stack deployment, this module connects to
 * a Node.js/Express backend that runs the Python YOLO analysis.
 * 
 * Backend Structure (for future implementation):
 * - POST /api/analyze - Upload video and get analysis results
 * - GET /api/analyses - Get analysis history
 * - GET /api/analyses/:id - Get specific analysis
 * 
 * The backend would use child_process or a Python microservice
 * to run the actual YOLO detection and risk calculation.
 */

// Backend API base URL - configure for your deployment
// @ts-expect-error Vite env types
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001/api';

export interface AnalysisRequest {
  video: File;
  locationName: string;
  lat: number;
  lon: number;
}

export interface AnalysisResponse {
  id: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  violations: Array<{
    type: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  frameStats: {
    totalFrames: number;
    processedFrames: number;
    avgVehicles: number;
    avgPersons: number;
    maxScore: number;
    minScore: number;
  };
  timestamp: string;
}

/**
 * Upload video for analysis
 * In production, this sends the video to the backend for YOLO processing
 */
export async function uploadForAnalysis(
  request: AnalysisRequest,
  onProgress?: (progress: number) => void
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('video', request.video);
  formData.append('locationName', request.locationName);
  formData.append('lat', request.lat.toString());
  formData.append('lon', request.lon.toString());

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 50); // Upload is 50% of total
        onProgress?.(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          onProgress?.(100);
          resolve(response);
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(`Server error: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred'));
    });

    xhr.open('POST', `${API_BASE_URL}/analyze`);
    xhr.send(formData);
  });
}

/**
 * Get analysis history
 */
export async function getAnalysisHistory(): Promise<AnalysisResponse[]> {
  const response = await fetch(`${API_BASE_URL}/analyses`);
  if (!response.ok) {
    throw new Error('Failed to fetch analysis history');
  }
  return response.json();
}

/**
 * Get specific analysis by ID
 */
export async function getAnalysis(id: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`);
  if (!response.ok) {
    throw new Error('Analysis not found');
  }
  return response.json();
}

/**
 * Health check for backend
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

/*
 * ============================================
 * BACKEND IMPLEMENTATION GUIDE (Node.js/Express)
 * ============================================
 * 
 * To create the full MERN backend:
 * 
 * 1. Create Express server with multer for file uploads
 * 2. Store videos temporarily using temp directory
 * 3. Call Python analysis script via child_process:
 *    
 *    const { spawn } = require('child_process');
 *    const python = spawn('python', ['src/analysis.py', videoPath]);
 *    
 * 4. Parse Python stdout for results
 * 5. Store results in MongoDB
 * 6. Return JSON response
 * 
 * Alternatively, create a FastAPI Python backend:
 * - Endpoint: POST /analyze
 * - Accepts multipart form with video
 * - Runs YOLO detection
 * - Returns JSON results
 * 
 * Deploy options:
 * - Vercel (frontend) + Railway/Render (backend)
 * - Vercel (frontend) + AWS Lambda + S3 (backend)
 * - Full Docker deployment
 */
