
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GeminiService } from '../services/geminiService';
import { SpeechService } from '../services/speechService';
import { Camera, AlertTriangle, RefreshCcw } from 'lucide-react';

interface AIVisionProps {
  isActive: boolean;
  onObstacleDetected: (msg: string) => void;
}

export const AIVision: React.FC<AIVisionProps> = ({ isActive, onObstacleDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gemini = useRef(new GeminiService());
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      setError("Camera permission required for safety detection.");
      SpeechService.speak("Please enable camera access for obstacle detection.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!isActive || isProcessing || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.readyState !== 4) return;

    setIsProcessing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.6);

    try {
      const result = await gemini.current.analyzeFrame(base64Image);
      if (result && result.toLowerCase() !== 'path is clear') {
        onObstacleDetected(result);
        SpeechService.speak(result);
      }
    } catch (err) {
      console.error("AI analysis failed", err);
    } finally {
      setIsProcessing(false);
    }
  }, [isActive, isProcessing, onObstacleDetected]);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(captureAndAnalyze, 4000); 
    }
    return () => clearInterval(interval);
  }, [isActive, captureAndAnalyze]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-800 group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'grayscale brightness-75 contrast-125' : 'blur-xl opacity-20'}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          {isActive ? (
            <div className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full shadow-lg shadow-red-900/40 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">AI Vision Scanning</span>
            </div>
          ) : (
             <div className="bg-slate-800/80 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vision Suspended</span>
             </div>
          )}
          
          {isProcessing && (
            <div className="bg-blue-600 p-2 rounded-full animate-spin">
              <RefreshCcw className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/90 p-4 rounded-2xl border-2 border-red-500 backdrop-blur-md pointer-events-auto">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <p className="text-sm font-bold text-red-100">{error}</p>
            </div>
          </div>
        )}
      </div>

      {!isActive && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
            <Camera className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Path Vision Idle</p>
        </div>
      )}
    </div>
  );
};
