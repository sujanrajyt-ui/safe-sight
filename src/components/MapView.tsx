import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { RiskAnalysis } from '../types';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  analyses: RiskAnalysis[];
}

// Risk level colors matching Python map_view.py
const RISK_COLORS = {
  LOW: '#22c55e',      // green
  MEDIUM: '#f97316',   // orange
  HIGH: '#ef4444',     // red
  CRITICAL: '#dc2626', // dark red
};

// Custom marker icons
const createCustomIcon = (riskLevel: string) => {
  const color = RISK_COLORS[riskLevel as keyof typeof RISK_COLORS] || RISK_COLORS.LOW;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container" style="position: relative; width: 50px; height: 50px;">
        <div class="pulse-ring" style="
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.3;
          animation: pulse-ring 2s ease-out infinite;
        "></div>
        <div style="
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, ${color}, ${color}dd);
          border-radius: 50% 50% 50% 0;
          transform: translate(-50%, -50%) rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 20px ${color}80, 0 0 0 2px ${color}40;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 14px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">!</div>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50]
  });
};

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef(center);
  
  useEffect(() => {
    if (center[0] !== prevCenter.current[0] || center[1] !== prevCenter.current[1]) {
      map.flyTo(center, zoom, { duration: 1.5 });
      prevCenter.current = center;
    }
  }, [center, zoom, map]);
  
  return null;
}

export function MapView({ center, zoom, analyses }: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
      zoomControl={false}
    >
      {/* Dark theme map tiles - CartoDB dark_matter like Python */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapController center={center} zoom={zoom} />
      
      {analyses.map((analysis) => {
        const color = RISK_COLORS[analysis.riskLevel] || RISK_COLORS.LOW;
        
        return (
          <div key={analysis.id}>
            {/* Risk radius circle */}
            <Circle
              center={[analysis.lat, analysis.lon]}
              radius={100}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.15,
                weight: 2,
                opacity: 0.5
              }}
            />
            
            <Marker
              position={[analysis.lat, analysis.lon]}
              icon={createCustomIcon(analysis.riskLevel)}
            >
              <Popup className="custom-popup">
                <div className="bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-xl min-w-[240px] -m-3 border border-slate-700/50 shadow-2xl">
                  <div className="flex items-start gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: color }}
                    >
                      !
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-white truncate">{analysis.locationName}</h3>
                      <p className="text-xs text-slate-400">{analysis.videoName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg">
                      <span className="text-slate-400 text-sm">Risk Level</span>
                      <span 
                        className="font-bold text-sm px-2 py-1 rounded"
                        style={{ background: `${color}20`, color: color }}
                      >
                        {analysis.riskLevel}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg">
                      <span className="text-slate-400 text-sm">Risk Score</span>
                      <span className="font-mono font-bold text-white">{analysis.riskScore}/100</span>
                    </div>
                    
                    {/* Risk bar */}
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${analysis.riskScore}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}cc)`
                        }}
                      />
                    </div>
                    
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/50 flex justify-between">
                      <span>Analyzed</span>
                      <span>{new Date(analysis.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}
    </MapContainer>
  );
}
