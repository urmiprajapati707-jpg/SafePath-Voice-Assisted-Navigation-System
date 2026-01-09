
import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { SpeechService } from '../services/speechService';

export const SOSButton: React.FC = () => {
  const [isActivating, setIsActivating] = useState(false);
  const [timer, setTimer] = useState(3);

  useEffect(() => {
    let interval: any;
    if (isActivating && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (isActivating && timer === 0) {
      triggerSOS();
    }
    return () => clearInterval(interval);
  }, [isActivating, timer]);

  const triggerSOS = () => {
    SpeechService.speak("Emergency SOS triggered. Sending location to contacts.");
    // Simulate SMS sending
    console.log("SOS SENT WITH LOCATION");
    setIsActivating(false);
    setTimer(3);
  };

  const handlePress = () => {
    if (isActivating) {
      setIsActivating(false);
      setTimer(3);
      SpeechService.speak("SOS Cancelled");
    } else {
      setIsActivating(true);
      SpeechService.speak("Triggering SOS in 3 seconds. Press again to cancel.");
    }
  };

  return (
    <button
      onClick={handlePress}
      className={`w-full py-6 rounded-3xl flex items-center justify-center gap-4 transition-all duration-300 ${
        isActivating 
          ? 'bg-red-600 animate-pulse scale-105' 
          : 'bg-red-900/40 hover:bg-red-900/60 border-2 border-red-500/50'
      }`}
    >
      {isActivating ? (
        <>
          <ShieldAlert className="w-8 h-8 text-white" />
          <span className="text-2xl font-black text-white">{timer}</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-8 h-8 text-red-500" />
          <span className="text-xl font-bold uppercase tracking-widest text-red-100">SOS EMERGENCY</span>
        </>
      )}
    </button>
  );
};
