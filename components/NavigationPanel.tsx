
import React from 'react';
import { MapPin, Navigation, ArrowRight, Flag } from 'lucide-react';
import { NavigationStep } from '../types';

interface NavigationPanelProps {
  destination: string;
  isNavigating: boolean;
  steps: NavigationStep[];
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  destination,
  isNavigating,
  steps
}) => {
  if (!isNavigating) {
    return (
      <div className="bg-slate-800/50 p-6 rounded-3xl border-2 border-slate-700 flex flex-col items-center justify-center text-center h-full">
        <MapPin className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 font-medium">No destination set.<br/>Use voice to start navigation.</p>
      </div>
    );
  }

  const currentStep = steps[0];

  return (
    <div className="bg-slate-800 p-6 rounded-3xl border-2 border-blue-500/30 flex flex-col h-full shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Destination</p>
          <h2 className="text-xl font-bold truncate max-w-[200px]">{destination}</h2>
        </div>
        <Navigation className="w-6 h-6 text-blue-500 animate-pulse" />
      </div>

      <div className="flex-1 space-y-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Next Instruction</p>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">{currentStep?.instruction || "Calculating..."}</p>
              <p className="text-blue-400 font-bold mt-1">{currentStep?.distance} Meters</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
           <div className="flex-1 bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2">
              <Flag className="w-4 h-4 text-green-500" />
              <span className="text-sm font-bold">150m Total</span>
           </div>
        </div>
      </div>
    </div>
  );
};
