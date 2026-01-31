import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Clock, Video, X, Shield, AlertCircle, BarChart3, Users, Car } from 'lucide-react';
import { RiskAnalysis } from '../types';

// Risk colors matching Python map_view.py
const RISK_COLORS = {
  LOW: { gradient: 'from-green-600 to-green-500', bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', color: '#22c55e' },
  MEDIUM: { gradient: 'from-orange-600 to-orange-500', bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', color: '#f97316' },
  HIGH: { gradient: 'from-red-600 to-red-500', bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', color: '#ef4444' },
  CRITICAL: { gradient: 'from-red-700 to-red-600', bg: 'bg-red-600/10 border-red-600/30', text: 'text-red-500', color: '#dc2626' },
};

interface ResultsPanelProps {
  analysis: RiskAnalysis | null;
  onClose: () => void;
}

export function ResultsPanel({ analysis, onClose }: ResultsPanelProps) {
  if (!analysis) return null;

  const colors = RISK_COLORS[analysis.riskLevel] || RISK_COLORS.LOW;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed md:absolute inset-0 md:inset-auto md:top-4 md:right-4 md:bottom-4 md:w-[420px] md:max-h-[calc(100vh-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 md:rounded-2xl shadow-2xl overflow-hidden z-[1000] flex flex-col rounded-t-2xl md:rounded-2xl"
      >
        {/* Header */}
        <div className={`p-4 md:p-6 bg-gradient-to-r ${colors.gradient}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="w-10 md:w-14 h-10 md:h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur flex-shrink-0">
                <AlertTriangle className="w-5 md:w-7 h-5 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-white truncate">Analysis Complete</h2>
                <p className="text-white/80 text-xs md:text-sm mt-0.5 truncate">{analysis.locationName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Risk Score */}
        <div className="p-4 md:p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-slate-400 text-xs md:text-sm font-semibold tracking-wider">RISK SCORE</span>
            <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold ${colors.bg} border`}>
              {analysis.riskLevel}
            </span>
          </div>
          
          <div className="flex justify-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-center"
            >
              <span className="text-4xl md:text-5xl font-black text-white">{analysis.riskScore}</span>
              <span className="text-lg md:text-xl text-slate-400 font-medium">/100</span>
            </motion.div>
          </div>
        </div>

        {/* Frame Statistics */}
        {analysis.frameStats && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-800 bg-slate-800/30">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Frame Analysis Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-base md:text-lg font-bold text-white">{analysis.frameStats.processedFrames}</p>
                <p className="text-xs text-slate-500">Frames</p>
              </div>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-base md:text-lg font-bold text-cyan-400">{analysis.frameStats.avgVehicles}</p>
                <p className="text-xs text-slate-500">Avg Vehicles</p>
              </div>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-base md:text-lg font-bold text-purple-400">{analysis.frameStats.avgPersons}</p>
                <p className="text-xs text-slate-500">Avg Persons</p>
              </div>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-base md:text-lg font-bold text-orange-400">{analysis.frameStats.maxScore}</p>
                <p className="text-xs text-slate-500">Peak Risk</p>
              </div>
            </div>
          </div>
        )}

        {/* Safety Assessment */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            Safety Assessment
          </h3>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-xl border border-slate-700 bg-slate-800/40"
          >
            {analysis.riskLevel === 'LOW' ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-semibold text-sm">Safe Area</p>
                    <p className="text-slate-300 text-sm mt-1">
                      This location shows minimal traffic hazards and pedestrian safety concerns. Vehicle flow and movement patterns are normal with no significant congestion or irregular behavior detected.
                    </p>
                  </div>
                </div>
              </div>
            ) : analysis.riskLevel === 'MEDIUM' ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm">Moderate Caution Required</p>
                    <p className="text-slate-300 text-sm mt-1">
                      The area shows some traffic density and occasional irregular patterns. Exercise standard caution with normal traffic awareness. {analysis.violations.length > 0 && `Detected ${analysis.violations.length} risk factor${analysis.violations.length !== 1 ? 's' : ''}.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : analysis.riskLevel === 'HIGH' ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-400 font-semibold text-sm">High Risk - Use Caution</p>
                    <p className="text-slate-300 text-sm mt-1">
                      Multiple traffic irregularities and safety concerns detected. {analysis.violations.length > 0 && `Identified ${analysis.violations.length} risk factor${analysis.violations.length !== 1 ? 's' : ''}.`} Heightened awareness recommended for drivers and pedestrians.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-500 font-semibold text-sm">Critical Risk - Avoid if Possible</p>
                    <p className="text-slate-300 text-sm mt-1">
                      Significant hazards and safety violations detected. {analysis.violations.length > 0 && `Multiple critical risk factors (${analysis.violations.length}) identified.`} This area requires immediate attention and highest caution level.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer Stats */}
        <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/50">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="text-center">
              <div className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-2 bg-slate-800 rounded-xl flex items-center justify-center">
                <Video className="w-5 md:w-6 h-5 md:h-6 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">Source</p>
              <p className="text-xs md:text-sm text-white font-medium truncate" title={analysis.videoName}>
                {analysis.videoName.length > 10 ? `${analysis.videoName.substring(0, 10)}...` : analysis.videoName}
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-2 bg-slate-800 rounded-xl flex items-center justify-center">
                <Clock className="w-5 md:w-6 h-5 md:h-6 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-xs md:text-sm text-white font-medium">
                {new Date(analysis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Analysis History Panel - matching Python's map legend style
interface HistoryPanelProps {
  analyses: RiskAnalysis[];
  onSelect: (analysis: RiskAnalysis) => void;
}

export function HistoryPanel({ analyses, onSelect }: HistoryPanelProps) {
  if (analyses.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[999]">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-sm font-bold text-white">Analysis History</span>
            <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-800 rounded-full">
              {analyses.length} location{analyses.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Legend - matching Python map_view.py */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-slate-400">LOW</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-slate-400">MEDIUM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-slate-400">HIGH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-600 rounded-full" />
              <span className="text-slate-400">CRITICAL</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          {analyses.map((analysis) => {
            const colors = RISK_COLORS[analysis.riskLevel] || RISK_COLORS.LOW;
            
            return (
              <motion.button
                key={analysis.id}
                onClick={() => onSelect(analysis)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0 p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors min-w-[200px] text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ background: colors.color, boxShadow: `0 0 10px ${colors.color}50` }}
                  />
                  <span className="text-xs text-slate-400 font-mono">{analysis.riskScore}/100</span>
                </div>
                <p className="text-sm text-white font-semibold truncate">{analysis.locationName}</p>
                <p className={`text-xs ${colors.text} font-medium mt-1`}>{analysis.riskLevel} Risk</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(analysis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
