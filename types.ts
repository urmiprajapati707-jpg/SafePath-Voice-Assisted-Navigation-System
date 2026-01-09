
export interface NavigationStep {
  instruction: string;
  distance: number;
  type: 'turn' | 'forward' | 'crosswalk' | 'arrival';
}

export interface Obstacle {
  label: string;
  distance: string;
  position: 'left' | 'center' | 'right';
  urgency: 'low' | 'medium' | 'high';
}

export interface AppState {
  isNavigating: boolean;
  destination: string;
  currentLocation: { lat: number; lng: number } | null;
  obstacles: Obstacle[];
  isVisionActive: boolean;
  isListening: boolean;
  lastAnnouncement: string;
}

export interface Contact {
  name: string;
  phone: string;
}
