
import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { SpeechService } from '../services/speechService';

interface VoiceInterfaceProps {
  isListening: boolean;
  onSetDestination: (dest: string) => void;
  onToggleListening: () => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  isListening,
  onSetDestination,
  onToggleListening
}) => {
  const handleStartListening = async () => {
    onToggleListening();
    SpeechService.speak("Where would you like to go?");
    try {
      const text = await SpeechService.listenOnce();
      onSetDestination(text);
      onToggleListening();
    } catch (err) {
      SpeechService.speak("Sorry, I didn't catch that. Please try again.");
      onToggleListening();
    }
  };

  return (
    <button
      onClick={handleStartListening}
      disabled={isListening}
      className={`relative group flex flex-col items-center justify-center w-full aspect-square rounded-full transition-all duration-500 ${
        isListening 
          ? 'bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.6)]' 
          : 'bg-slate-800 hover:bg-slate-700 active:scale-95'
      }`}
      aria-label="Voice Control"
    >
      <div className={`p-8 rounded-full ${isListening ? 'animate-ping opacity-25' : ''}`}>
        {isListening ? (
          <Mic className="w-16 h-16 text-white" />
        ) : (
          <Volume2 className="w-16 h-16 text-blue-400 group-hover:text-blue-300" />
        )}
      </div>
      <span className="mt-2 text-lg font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">
        {isListening ? 'Listening...' : 'Hold to Speak'}
      </span>
    </button>
  );
};
