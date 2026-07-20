export interface ChatRequest {
  conversationId?: string;
  message: string;
  context?: {
    eventId?: string;
    organizationId?: string;
  };
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  timestamp: string;
  suggestions?: string[];
  actions?: SuggestedAction[];
}

export interface SuggestedAction {
  type: 'checkin' | 'report' | 'email' | 'sms' | 'view';
  label: string;
  payload: Record<string, unknown>;
}

export interface AgentRequest {
  agentId: string;
  input: string;
  context?: Record<string, unknown>;
}

export interface AgentResponse {
  agentId: string;
  output: string;
  confidence: number;
  data?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  organizationId: string;
  userId: string;
  title?: string;
  messages: Message[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface Agent {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  avatarUrl?: string;
  capabilities: string[];
  isActive: boolean;
  config: Record<string, unknown>;
  createdAt: string;
}

export interface FaceEnrollmentRequest {
  eventId: string;
  attendeeId: string;
  imageBase64: string;
}

export interface FaceEnrollmentResponse {
  enrolled: boolean;
  faceId: string;
  confidence: number;
}

export interface FaceRecognitionRequest {
  eventId: string;
  imageBase64: string;
}

export interface FaceRecognitionResponse {
  recognized: boolean;
  attendee?: {
    id: string;
    name: string;
    email: string;
    checkedIn: boolean;
  };
  confidence: number;
}
