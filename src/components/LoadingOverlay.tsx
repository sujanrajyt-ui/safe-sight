import { motion } from 'framer-motion';
import { Cpu, Eye, BarChart3, FileText } from 'lucide-react';

interface LoadingOverlayProps {
  progress: number;
  isVisible: boolean;
}

export function LoadingOverlay({ progress, isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  const stages = [
    { icon: Eye, label: 'Frame Extraction', threshold: 0 },
    { icon: Cpu, label: 'YOLO Detection', threshold: 30 },
    { icon: BarChart3, label: 'Risk Calculation', threshold: 60 },
    { icon: FileText, label: 'Report Generation', threshold: 90 },
  ];

  const currentStage = stages.reduce((acc, stage, index) => {
    return progress >= stage.threshold ? index : acc;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[2000] bg-slate-950/95 backdrop-blur-md flex items-center justify-center"
    >
      <div className="text-center space-y-8 max-w-lg px-8">
        {/* Animated AI Scanner */}
        <div className="relative w-40 h-40 mx-auto">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #ef4444, transparent)',
              mask: 'radial-gradient(transparent 60%, black 61%)',
              WebkitMask: 'radial-gradient(transparent 60%, black 61%)'
            }}
          />
          
          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-4 rounded-full"
            style={{
              background: 'conic-gradient(from 180deg, transparent, #f97316, transparent)',
              mask: 'radial-gradient(transparent 55%, black 56%)',
              WebkitMask: 'radial-gradient(transparent 55%, black 56%)'
            }}
          />
          
          {/* Inner circle with percentage */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-2xl">
            <div className="text-center">
              <motion.span
                key={progress}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-black text-white block"
              >
                {progress}%
              </motion.span>
              <span className="text-xs text-slate-500">Processing</span>
            </div>
          </div>
          
          {/* Orbiting dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
          </motion.div>
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Analyzing Traffic Footage</h3>
          <p className="text-slate-400">
            Running AI-powered detection and risk assessment...
          </p>
        </div>
        
        {/* Progress stages */}
        <div className="grid grid-cols-4 gap-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index <= currentStage;
            const isCurrent = index === currentStage;
            
            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`text-center p-3 rounded-xl transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-red-500/20 border border-red-500/50' 
                    : isActive 
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-slate-800/50 border border-slate-700/30'
                }`}
              >
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    isCurrent 
                      ? 'bg-red-500/30 text-red-400' 
                      : isActive 
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700/50 text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <p className={`text-xs font-medium ${
                  isCurrent ? 'text-red-400' : isActive ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {stage.label}
                </p>
              </motion.div>
            );
          })}
        </div>
        
        {/* Detection info */}
        <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-red-500 rounded-full"
          />
          <span>Processing with YOLOv8 object detection model</span>
        </div>
        
        {/* Simulated detection log */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/50 font-mono text-xs text-left max-h-24 overflow-hidden">
          <motion.div
            animate={{ y: [0, -100] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <p className="text-slate-500">[analysis] Frame extraction started...</p>
            <p className="text-emerald-400">[detection] YOLOv8 model loaded ✓</p>
            <p className="text-slate-400">[detection] Processing frame batch...</p>
            <p className="text-cyan-400">[detection] Found: 3 cars, 2 persons</p>
            <p className="text-orange-400">[risk] Computing frame risk score...</p>
            <p className="text-slate-400">[risk] Checking vehicle overlaps...</p>
            <p className="text-yellow-400">[risk] Pedestrian proximity detected</p>
            <p className="text-emerald-400">[analysis] Frame score: 42/100</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
