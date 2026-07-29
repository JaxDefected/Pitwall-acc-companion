import { NormalizedAccSetup } from '../utils/accParser';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: number;
}

export interface DriverProfile {
  name?: string;
  preferredStyle?: string;
  currentCar?: string;
  currentTrack?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  activeSetup?: NormalizedAccSetup | null;
  driverProfile?: DriverProfile;
}

export interface ChatResponse {
  reply: string;
  warnings?: string[];
}
