import { AxiosInstance } from 'axios';
import {
  ChatRequest,
  ChatResponse,
  AgentRequest,
  AgentResponse,
  Conversation,
  Agent,
  FaceEnrollmentRequest,
  FaceEnrollmentResponse,
  FaceRecognitionRequest,
  FaceRecognitionResponse,
} from '../types/ai';

export class AIAPI {
  constructor(private http: AxiosInstance) {}

  async chat(data: ChatRequest): Promise<ChatResponse> {
    const res = await this.http.post<ChatResponse>('/ai/chat', data);
    return res.data;
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const res = await this.http.get<Conversation>(`/ai/conversations/${conversationId}`);
    return res.data;
  }

  async listConversations(params?: { page?: number; limit?: number }): Promise<{ data: Conversation[]; total: number }> {
    const res = await this.http.get('/ai/conversations', { params });
    return res.data;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.http.delete(`/ai/conversations/${conversationId}`);
  }

  async listAgents(): Promise<Agent[]> {
    const res = await this.http.get<Agent[]>('/ai/agents');
    return res.data;
  }

  async getAgent(agentId: string): Promise<Agent> {
    const res = await this.http.get<Agent>(`/ai/agents/${agentId}`);
    return res.data;
  }

  async executeAgent(data: AgentRequest): Promise<AgentResponse> {
    const res = await this.http.post<AgentResponse>('/ai/agents/execute', data);
    return res.data;
  }

  async suggest(eventId: string, prompt: string): Promise<{ suggestions: string[] }> {
    const res = await this.http.post('/ai/suggest', { eventId, prompt });
    return res.data;
  }

  async generateReport(eventId: string, type: string): Promise<{ report: string }> {
    const res = await this.http.post('/ai/reports/generate', { eventId, type });
    return res.data;
  }

  async analyzeAttendees(eventId: string): Promise<{ analysis: Record<string, unknown> }> {
    const res = await this.http.post('/ai/analyze/attendees', { eventId });
    return res.data;
  }

  async analyzeEvent(eventId: string): Promise<{ analysis: Record<string, unknown> }> {
    const res = await this.http.post(`/ai/analyze/event/${eventId}`);
    return res.data;
  }

  async enrollFace(data: FaceEnrollmentRequest): Promise<FaceEnrollmentResponse> {
    const res = await this.http.post<FaceEnrollmentResponse>('/ai/face/enroll', data);
    return res.data;
  }

  async recognizeFace(data: FaceRecognitionRequest): Promise<FaceRecognitionResponse> {
    const res = await this.http.post<FaceRecognitionResponse>('/ai/face/recognize', data);
    return res.data;
  }

  async getFaceEnrollments(eventId: string): Promise<{ attendeeId: string; enrolled: boolean; enrolledAt: string }[]> {
    const res = await this.http.get(`/ai/face/enrollments/${eventId}`);
    return res.data;
  }

  async deleteFaceEnrollment(attendeeId: string): Promise<void> {
    await this.http.delete(`/ai/face/enrollments/${attendeeId}`);
  }
}
