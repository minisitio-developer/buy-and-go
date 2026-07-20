import { AxiosInstance } from 'axios';
import {
  Attendee,
  Checkin,
  CheckinStats,
  CheckinRequest,
  ManualCheckinRequest,
  FaceCheckinRequest,
  CreateAttendeeRequest,
} from '../types/checkin';

export class CheckinAPI {
  constructor(private http: AxiosInstance) {}

  async checkin(data: CheckinRequest): Promise<Checkin> {
    const res = await this.http.post<Checkin>('/checkin', data);
    return res.data;
  }

  async manualCheckin(data: ManualCheckinRequest): Promise<Checkin> {
    const res = await this.http.post<Checkin>('/checkin/manual', data);
    return res.data;
  }

  async faceCheckin(data: FaceCheckinRequest): Promise<Checkin> {
    const res = await this.http.post<Checkin>('/checkin/face', data);
    return res.data;
  }

  async getStats(eventId: string): Promise<CheckinStats> {
    const res = await this.http.get<CheckinStats>(`/checkin/stats/${eventId}`);
    return res.data;
  }

  async getRealTimeStats(eventId: string): Promise<CheckinStats> {
    const res = await this.http.get<CheckinStats>(`/checkin/stats/${eventId}/realtime`);
    return res.data;
  }

  async listCheckins(eventId: string, params?: { page?: number; limit?: number; method?: string }): Promise<{ data: Checkin[]; total: number }> {
    const res = await this.http.get(`/checkin/${eventId}`, { params });
    return res.data;
  }

  async listAttendees(eventId: string, params?: {
    page?: number; limit?: number; search?: string; checkedIn?: boolean;
  }): Promise<{ data: Attendee[]; total: number }> {
    const res = await this.http.get(`/checkin/${eventId}/attendees`, { params });
    return res.data;
  }

  async getAttendee(eventId: string, attendeeId: string): Promise<Attendee> {
    const res = await this.http.get<Attendee>(`/checkin/${eventId}/attendees/${attendeeId}`);
    return res.data;
  }

  async createAttendee(eventId: string, data: CreateAttendeeRequest): Promise<Attendee> {
    const res = await this.http.post<Attendee>(`/checkin/${eventId}/attendees`, data);
    return res.data;
  }

  async updateAttendee(eventId: string, attendeeId: string, data: Partial<CreateAttendeeRequest>): Promise<Attendee> {
    const res = await this.http.put<Attendee>(`/checkin/${eventId}/attendees/${attendeeId}`, data);
    return res.data;
  }

  async deleteAttendee(eventId: string, attendeeId: string): Promise<void> {
    await this.http.delete(`/checkin/${eventId}/attendees/${attendeeId}`);
  }

  async batchCreateAttendees(eventId: string, attendees: CreateAttendeeRequest[]): Promise<Attendee[]> {
    const res = await this.http.post<Attendee[]>(`/checkin/${eventId}/attendees/batch`, { attendees });
    return res.data;
  }

  async importCSV(eventId: string, csvData: string): Promise<{ imported: number; errors: { row: number; message: string }[] }> {
    const res = await this.http.post(`/checkin/${eventId}/attendees/import`, { csvData });
    return res.data;
  }

  async exportAttendees(eventId: string, format?: 'json' | 'csv'): Promise<Blob> {
    const res = await this.http.get(`/checkin/${eventId}/attendees/export`, {
      params: { format },
      responseType: 'blob',
    });
    return res.data;
  }
}
