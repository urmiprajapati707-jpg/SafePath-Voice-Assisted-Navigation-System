
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AIVision } from './components/AIVision';
import { VoiceInterface } from './components/VoiceInterface';
import { NavigationPanel } from './components/NavigationPanel';
import { SOSButton } from './components/SOSButton';
import { AppState, NavigationStep } from './types';
import { SpeechService } from './services/speechService';
import { GeminiService } from './services/geminiService';
import { Eye, Map as MapIcon, Settings, User, Navigation as NavIcon } from 'lucide-react';

const App: React.FC = () => {
  const gemini = useRef(new GeminiService());
  const [state, setState] = useState<AppState>({
    isNavigating: false,
    destination: '',
    currentLocation: null,
    obstacles: [],
    isVisionActive: true,
    isListening: false,
    lastAnnouncement: ''
  });

  const [steps, setSteps] = useState<NavigationStep[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    SpeechService.speak("System initialized. Path vision is monitoring. Where would you like to go?");
    
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setState(prev => ({ 
            ...prev, 
            currentLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude } 
          }));
        },
        (err) => {
          console.error(err);
          SpeechService.speak("GPS error. Please ensure location services are enabled.");
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleSetDestination = async (dest: string) => {
    if (!state.currentLocation) {
      SpeechService.speak("Waiting for GPS signal before starting navigation.");
      return;
    }

    setIsSearching(true);
    setState(prev => ({ ...prev, destination: dest, isNavigating: true }));
    SpeechService.speak(`Searching for routes to ${dest}. Please wait.`);

    const newSteps = await gemini.current.getRoute(dest, state.currentLocation);
    setSteps(newSteps);
    setIsSearching(false);

    if (newSteps.length > 0) {
      SpeechService.speak(`Route found. First instruction: ${newSteps[0].instruction}`);
    }
  };

  const handleObstacle = useCallback((msg: string) => {
    setState(prev => ({ ...prev, lastAnnouncement: msg }));
    // Haptic priority for hazards
    if (msg.toLowerCase().includes('warning') || msg.toLowerCase().includes('stop')) {
      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col p-4 md:p-8 gap-4 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <NavIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-none">Smart Voice <span className="text-blue-500">Nav</span></h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Accessibility Suite v1.0</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <User className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col gap-4">
          <div className="flex-[2] min-h-[250px] relative">
            <AIVision 
              isActive={state.isVisionActive} 
              onObstacleDetected={handleObstacle} 
            />
          </div>
          <div className="flex-1">
            <SOSButton />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-[1.5]">
            <NavigationPanel 
              destination={state.destination} 
              isNavigating={state.isNavigating}
              steps={steps}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1">
            <VoiceInterface 
              isListening={state.isListening}
              onSetDestination={handleSetDestination}
              onToggleListening={() => setState(s => ({ ...s, isListening: !s.isListening }))}
            />
            
            <button 
              onClick={() => {
                const newState = !state.isVisionActive;
                setState(s => ({ ...s, isVisionActive: newState }));
                SpeechService.speak(newState ? "Obstacle detection active" : "Obstacle detection paused");
              }}
              className={`flex flex-col items-center justify-center rounded-[40px] transition-all duration-300 border-4 shadow-2xl ${
                state.isVisionActive 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <div className={`p-4 rounded-full mb-2 ${state.isVisionActive ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
                <Eye className="w-10 h-10" />
              </div>
              <span className="font-black uppercase text-xs tracking-widest">
                Vision: {state.isVisionActive ? 'LIVE' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="h-14 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 flex items-center px-6 justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shadow-lg ${state.currentLocation ? 'bg-green-500 shadow-green-900/50' : 'bg-red-500 animate-pulse shadow-red-900/50'}`} />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {state.currentLocation ? 'GPS Fixed' : 'Searching GPS...'}
          </span>
        </div>
        <div className="flex-1 px-8">
           <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full bg-blue-500 transition-all duration-500 ${isSearching ? 'w-full animate-shimmer' : 'w-0'}`} />
           </div>
        </div>
        <div className="text-sm font-bold text-blue-400 italic truncate max-w-[200px]">
          {state.lastAnnouncement || 'Scanning path...'}
        </div>
      </footer>
    </div>
  );
};

export default App;
