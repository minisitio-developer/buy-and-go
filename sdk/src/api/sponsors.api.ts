import { AxiosInstance } from 'axios';
import {
  Sponsor,
  CreateSponsorRequest,
  SponsorBooth,
  CreateBoothRequest,
  SponsorMetric,
} from '../types/sponsor';

export class SponsorsAPI {
  constructor(private http: AxiosInstance) {}

  async list(eventId: string): Promise<Sponsor[]> {
    const res = await this.http.get<Sponsor[]>(`/events/${eventId}/sponsors`);
    return res.data;
  }

  async getById(eventId: string, sponsorId: string): Promise<Sponsor> {
    const res = await this.http.get<Sponsor>(`/events/${eventId}/sponsors/${sponsorId}`);
    return res.data;
  }

  async create(eventId: string, data: CreateSponsorRequest): Promise<Sponsor> {
    const res = await this.http.post<Sponsor>(`/events/${eventId}/sponsors`, data);
    return res.data;
  }

  async update(eventId: string, sponsorId: string, data: Partial<CreateSponsorRequest>): Promise<Sponsor> {
    const res = await this.http.put<Sponsor>(`/events/${eventId}/sponsors/${sponsorId}`, data);
    return res.data;
  }

  async delete(eventId: string, sponsorId: string): Promise<void> {
    await this.http.delete(`/events/${eventId}/sponsors/${sponsorId}`);
  }

  async confirm(eventId: string, sponsorId: string): Promise<Sponsor> {
    const res = await this.http.post<Sponsor>(`/events/${eventId}/sponsors/${sponsorId}/confirm`);
    return res.data;
  }

  async listBooths(eventId: string): Promise<SponsorBooth[]> {
    const res = await this.http.get<SponsorBooth[]>(`/events/${eventId}/booths`);
    return res.data;
  }

  async createBooth(eventId: string, data: CreateBoothRequest): Promise<SponsorBooth> {
    const res = await this.http.post<SponsorBooth>(`/events/${eventId}/booths`, data);
    return res.data;
  }

  async updateBooth(eventId: string, boothId: string, data: Partial<CreateBoothRequest>): Promise<SponsorBooth> {
    const res = await this.http.put<SponsorBooth>(`/events/${eventId}/booths/${boothId}`, data);
    return res.data;
  }

  async deleteBooth(eventId: string, boothId: string): Promise<void> {
    await this.http.delete(`/events/${eventId}/booths/${boothId}`);
  }

  async getMetrics(eventId: string, sponsorId: string): Promise<SponsorMetric[]> {
    const res = await this.http.get<SponsorMetric[]>(`/events/${eventId}/sponsors/${sponsorId}/metrics`);
    return res.data;
  }

  async recordBoothCheckin(eventId: string, boothId: string, attendeeId: string): Promise<void> {
    await this.http.post(`/events/${eventId}/booths/${boothId}/checkin`, { attendeeId });
  }

  async recordBoothLead(eventId: string, boothId: string, data: { name: string; email: string; phone?: string }): Promise<void> {
    await this.http.post(`/events/${eventId}/booths/${boothId}/leads`, data);
  }
}
