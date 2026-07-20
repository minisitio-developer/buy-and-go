import { AxiosInstance } from 'axios';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  Room,
  CreateRoomRequest,
  Schedule,
  CreateScheduleRequest,
} from '../types/event';

export class EventsAPI {
  constructor(private http: AxiosInstance) {}

  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ data: Event[]; total: number; page: number; limit: number }> {
    const res = await this.http.get('/events', { params });
    return res.data;
  }

  async getById(id: string): Promise<Event> {
    const res = await this.http.get<Event>(`/events/${id}`);
    return res.data;
  }

  async getBySlug(slug: string): Promise<Event> {
    const res = await this.http.get<Event>(`/events/slug/${slug}`);
    return res.data;
  }

  async create(data: CreateEventRequest): Promise<Event> {
    const res = await this.http.post<Event>('/events', data);
    return res.data;
  }

  async update(id: string, data: UpdateEventRequest): Promise<Event> {
    const res = await this.http.put<Event>(`/events/${id}`, data);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`/events/${id}`);
  }

  async publish(id: string): Promise<Event> {
    const res = await this.http.post<Event>(`/events/${id}/publish`);
    return res.data;
  }

  async listRooms(eventId: string): Promise<Room[]> {
    const res = await this.http.get<Room[]>(`/events/${eventId}/rooms`);
    return res.data;
  }

  async createRoom(eventId: string, data: CreateRoomRequest): Promise<Room> {
    const res = await this.http.post<Room>(`/events/${eventId}/rooms`, data);
    return res.data;
  }

  async updateRoom(eventId: string, roomId: string, data: Partial<CreateRoomRequest>): Promise<Room> {
    const res = await this.http.put<Room>(`/events/${eventId}/rooms/${roomId}`, data);
    return res.data;
  }

  async deleteRoom(eventId: string, roomId: string): Promise<void> {
    await this.http.delete(`/events/${eventId}/rooms/${roomId}`);
  }

  async listSchedules(eventId: string, roomId?: string): Promise<Schedule[]> {
    const params = roomId ? { roomId } : {};
    const res = await this.http.get<Schedule[]>(`/events/${eventId}/schedules`, { params });
    return res.data;
  }

  async createSchedule(eventId: string, data: CreateScheduleRequest): Promise<Schedule> {
    const res = await this.http.post<Schedule>(`/events/${eventId}/schedules`, data);
    return res.data;
  }

  async updateSchedule(eventId: string, scheduleId: string, data: Partial<CreateScheduleRequest>): Promise<Schedule> {
    const res = await this.http.put<Schedule>(`/events/${eventId}/schedules/${scheduleId}`, data);
    return res.data;
  }

  async deleteSchedule(eventId: string, scheduleId: string): Promise<void> {
    await this.http.delete(`/events/${eventId}/schedules/${scheduleId}`);
  }
}
