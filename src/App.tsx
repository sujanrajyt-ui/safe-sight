import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { ResultsPanel, HistoryPanel } from './components/ResultsPanel';
import { LoadingOverlay } from './components/LoadingOverlay';
import { analyzeVideo } from './utils/analysis';
import { RiskAnalysis, LocationResult } from './types';

export function App() {
  // State
  const [locationName, setLocationName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyses, setAnalyses] = useState<RiskAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<RiskAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Map state - default center is India (matching Python app)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(4);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile || !selectedLocation) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setErrorMessage('');
    
    try {
      // Run the analysis pipeline (converted from Python analysis.py)
      const result = await analyzeVideo(videoFile, setProgress);
      
      // Check if valid street footage
      if (!result.isValidStreetFootage) {
        setErrorMessage('This is not a footage of street or road. Please upload traffic/street footage.');
        setVideoFile(null);
        setIsAnalyzing(false);
        return;
      }
      
      const newAnalysis: RiskAnalysis = {
        id: Date.now().toString(),
        locationName: locationName || selectedLocation.displayName.split(',')[0],
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        riskLevel: result.riskLevel,
        riskScore: result.riskScore,
        timestamp: new Date(),
        videoName: videoFile.name,
        violations: result.violations,
        frameStats: result.frameStats,
        isValidStreetFootage: result.isValidStreetFootage
      };
      
      setAnalyses(prev => [...prev, newAnalysis]);
      setCurrentAnalysis(newAnalysis);
      setMapCenter([selectedLocation.lat, selectedLocation.lon]);
      setMapZoom(16);
      
      // Reset form for next analysis
      setVideoFile(null);
      setLocationName('');
      setSelectedLocation(null);
    } catch (error) {
      console.error('[App] Analysis failed:', error);
      setErrorMessage('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  }, [videoFile, selectedLocation, locationName]);

  const handleSelectAnalysis = (analysis: RiskAnalysis) => {
    setCurrentAnalysis(analysis);
    setMapCenter([analysis.lat, analysis.lon]);
    setMapZoom(16);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar - bottom on mobile, left on desktop */}
      <Sidebar
        locationName={locationName}
        setLocationName={setLocationName}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        videoFile={videoFile}
        setVideoFile={setVideoFile}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        progress={progress}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      
      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Map - dark theme like Python Folium CartoDB dark_matter */}
        <MapView
          center={mapCenter}
          zoom={mapZoom}
          analyses={analyses}
        />
        
        {/* Overlay Gradient for depth effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30" />
        
        {/* Header Overlay with status */}
        <div className="absolute top-4 left-4 z-[999]">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-lg md:rounded-xl px-3 md:px-5 py-2 md:py-3 flex items-center gap-3 md:gap-4 shadow-2xl">
            <div className="relative flex-shrink-0">
              <div className="w-2 md:w-3 h-2 md:h-3 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-2 md:w-3 h-2 md:h-3 bg-emerald-500 rounded-full animate-ping opacity-75" />
            </div>
            <div className="min-w-0">
              <span className="text-xs md:text-sm font-bold text-white block">Live Risk Map</span>
              <p className="text-xs text-slate-400 truncate">
                {analyses.length === 0 
                  ? 'No locations analyzed yet'
                  : `${analyses.length} location${analyses.length !== 1 ? 's' : ''} analyzed`
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Zoom Controls Info - hidden on mobile */}
        <div className="absolute top-4 right-4 z-[999] hidden md:flex items-center gap-2 text-xs text-slate-500">
          <kbd className="px-2 py-1 bg-slate-800/80 rounded">Scroll</kbd>
          <span>to zoom</span>
          <kbd className="px-2 py-1 bg-slate-800/80 rounded ml-2">Drag</kbd>
          <span>to pan</span>
        </div>
        
        {/* Results Panel */}
        {currentAnalysis && (
          <ResultsPanel
            analysis={currentAnalysis}
            onClose={() => setCurrentAnalysis(null)}
          />
        )}
        
        {/* History Panel - shows when no analysis is selected */}
        {analyses.length > 0 && !currentAnalysis && (
          <HistoryPanel analyses={analyses} onSelect={handleSelectAnalysis} />
        )}
        
        {/* Loading Overlay */}
        <LoadingOverlay progress={progress} isVisible={isAnalyzing} />
        
        {/* Empty State */}
        {analyses.length === 0 && !isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-6 max-w-md px-8">
              <div className="relative">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 flex items-center justify-center shadow-2xl">
                  <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-medium">YOLOv8 Ready</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-200">No Analysis Yet</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Upload traffic footage and select a location to begin AI-powered risk analysis using object detection and risk scoring algorithms.
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Object Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span>Risk Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Geolocation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
