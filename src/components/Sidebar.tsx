import { useState, useCallback } from 'react';
import { MapPin, Upload, Zap, AlertTriangle, ChevronRight, X, Search, Navigation, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLocations, getLiveLocation } from '../utils/geocode';
import { LocationResult } from '../types';

interface SidebarProps {
  locationName: string;
  setLocationName: (name: string) => void;
  selectedLocation: LocationResult | null;
  setSelectedLocation: (location: LocationResult | null) => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  progress: number;
}

export function Sidebar({
  locationName,
  setLocationName,
  selectedLocation,
  setSelectedLocation,
  videoFile,
  setVideoFile,
  onAnalyze,
  isAnalyzing,
  progress
}: SidebarProps) {
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setLocationName(query);
    setSelectedLocation(null);
    if (query.length >= 3) {
      const results = await searchLocations(query);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [setLocationName, setSelectedLocation]);

  const handleSelectLocation = (location: LocationResult) => {
    setSelectedLocation(location);
    setLocationName(location.displayName.split(',')[0]);
    setShowResults(false);
    setSearchResults([]);
  };

  const handleGetLiveLocation = async () => {
    setIsLocating(true);
    const location = await getLiveLocation();
    if (location) {
      handleSelectLocation(location);
    }
    setIsLocating(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-96 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col h-screen overflow-hidden">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">SAFE SIGHT</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider">AI TRAFFIC RISK ANALYZER</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Step 1: Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">1</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide">LOCATION TAG</span>
              <p className="text-xs text-slate-500">Search or use GPS</p>
            </div>
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={locationName}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search intersection or address..."
              className="w-full pl-12 pr-12 py-4 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all text-sm"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                >
                  {searchResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectLocation(result)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0 group"
                    >
                      <p className="text-sm text-white truncate group-hover:text-red-400 transition-colors">
                        {result.displayName.split(',')[0]}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{result.displayName}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GPS Button */}
          <button
            onClick={handleGetLiveLocation}
            disabled={isLocating}
            className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {isLocating ? 'Detecting Location...' : 'Use Current Location'}
          </button>
          
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
            >
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-400 font-medium">Location Selected</p>
                <p className="text-xs text-emerald-300/70 truncate">{selectedLocation.displayName.substring(0, 50)}...</p>
              </div>
              <button onClick={() => setSelectedLocation(null)} className="text-emerald-400 hover:text-emerald-300">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Step 2: Video Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">2</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide">UPLOAD FOOTAGE</span>
              <p className="text-xs text-slate-500">MP4, MOV, AVI formats</p>
            </div>
          </div>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
              dragActive 
                ? 'border-red-500 bg-red-500/10' 
                : videoFile 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
            }`}
          >
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="p-8 text-center">
              {videoFile ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/30">
                    <Upload className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold truncate px-4">{videoFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(videoFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3" /> Remove File
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium">Drop video here or click to browse</p>
                    <p className="text-xs text-slate-500 mt-1">Supports traffic camera footage</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Progress */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">AI Analysis in Progress</span>
                <span className="text-red-400 font-mono font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-full"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`text-center py-2 rounded-lg ${progress >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  Frames
                </div>
                <div className={`text-center py-2 rounded-lg ${progress >= 30 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  Detection
                </div>
                <div className={`text-center py-2 rounded-lg ${progress >= 60 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  Risk Calc
                </div>
                <div className={`text-center py-2 rounded-lg ${progress >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  Report
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Button */}
      <div className="p-6 border-t border-slate-800/50">
        <motion.button
          onClick={onAnalyze}
          disabled={!videoFile || !selectedLocation || isAnalyzing}
          whileHover={{ scale: !videoFile || !selectedLocation || isAnalyzing ? 1 : 1.02 }}
          whileTap={{ scale: !videoFile || !selectedLocation || isAnalyzing ? 1 : 0.98 }}
          className="w-full py-4 px-6 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:via-red-400 hover:to-orange-400 disabled:from-slate-700 disabled:via-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-red-500/25 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>ANALYZING...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>START ANALYSIS</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
        
        {(!videoFile || !selectedLocation) && !isAnalyzing && (
          <p className="text-center text-xs text-slate-500 mt-3">
            {!selectedLocation && !videoFile 
              ? 'Select location and upload video to begin'
              : !selectedLocation 
                ? 'Select a location to continue'
                : 'Upload a video to continue'
            }
          </p>
        )}
      </div>
    </div>
  );
}
