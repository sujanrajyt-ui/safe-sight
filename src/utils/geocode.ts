/**
 * geocode.ts - Geolocation Utilities
 * Converted from Python geo_utils.py
 */

import { LocationResult } from '../types';

/**
 * Search for locations using OpenStreetMap Nominatim API
 * Equivalent to Python geocode_address_fallback()
 */
export async function geocodeLocation(address: string): Promise<LocationResult | null> {
  if (!address || address.length < 2) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'SafeSightAI/1.0 (Traffic Risk Analyzer)'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('[geocode] Error:', error);
    return null;
  }
}

/**
 * Search for multiple location suggestions
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'SafeSightAI/1.0 (Traffic Risk Analyzer)'
        }
      }
    );
    
    const data = await response.json();
    
    return data.map((item: { lat: string; lon: string; display_name: string }) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name
    }));
  } catch (error) {
    console.error('[geocode] Search error:', error);
    return [];
  }
}

/**
 * Get user's current location using browser Geolocation API
 * Equivalent to Python get_live_location() but using browser APIs
 */
export async function getLiveLocation(): Promise<LocationResult | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('[geocode] Geolocation not supported');
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': 'SafeSightAI/1.0'
              }
            }
          );
          const data = await response.json();
          
          resolve({
            lat: latitude,
            lon: longitude,
            displayName: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
        } catch {
          resolve({
            lat: latitude,
            lon: longitude,
            displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
        }
      },
      (error) => {
        console.log('[geocode] Geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Default center point (India center, matching Python app)
 */
export const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
export const DEFAULT_ZOOM = 4;
