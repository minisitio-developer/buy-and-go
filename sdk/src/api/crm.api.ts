import { AxiosInstance } from 'axios';
import {
  Pipeline,
  CreatePipelineRequest,
  Stage,
  Deal,
  CreateDealRequest,
  Contact,
  CreateContactRequest,
} from '../types/crm';

export class CRMAPI {
  constructor(private http: AxiosInstance) {}

  async listPipelines(): Promise<Pipeline[]> {
    const res = await this.http.get<Pipeline[]>('/crm/pipelines');
    return res.data;
  }

  async getPipeline(id: string): Promise<Pipeline> {
    const res = await this.http.get<Pipeline>(`/crm/pipelines/${id}`);
    return res.data;
  }

  async createPipeline(data: CreatePipelineRequest): Promise<Pipeline> {
    const res = await this.http.post<Pipeline>('/crm/pipelines', data);
    return res.data;
  }

  async updatePipeline(id: string, data: Partial<CreatePipelineRequest>): Promise<Pipeline> {
    const res = await this.http.put<Pipeline>(`/crm/pipelines/${id}`, data);
    return res.data;
  }

  async deletePipeline(id: string): Promise<void> {
    await this.http.delete(`/crm/pipelines/${id}`);
  }

  async listStages(pipelineId: string): Promise<Stage[]> {
    const res = await this.http.get<Stage[]>(`/crm/pipelines/${pipelineId}/stages`);
    return res.data;
  }

  async createStage(pipelineId: string, data: { name: string; color?: string; probability: number }): Promise<Stage> {
    const res = await this.http.post<Stage>(`/crm/pipelines/${pipelineId}/stages`, data);
    return res.data;
  }

  async updateStage(pipelineId: string, stageId: string, data: Partial<{ name: string; color?: string; probability: number; order: number }>): Promise<Stage> {
    const res = await this.http.put<Stage>(`/crm/pipelines/${pipelineId}/stages/${stageId}`, data);
    return res.data;
  }

  async deleteStage(pipelineId: string, stageId: string): Promise<void> {
    await this.http.delete(`/crm/pipelines/${pipelineId}/stages/${stageId}`);
  }

  async listDeals(pipelineId: string, params?: { stageId?: string; status?: string; page?: number; limit?: number }): Promise<{ data: Deal[]; total: number }> {
    const res = await this.http.get(`/crm/pipelines/${pipelineId}/deals`, { params });
    return res.data;
  }

  async getDeal(dealId: string): Promise<Deal> {
    const res = await this.http.get<Deal>(`/crm/deals/${dealId}`);
    return res.data;
  }

  async createDeal(data: CreateDealRequest): Promise<Deal> {
    const res = await this.http.post<Deal>('/crm/deals', data);
    return res.data;
  }

  async updateDeal(dealId: string, data: Partial<CreateDealRequest>): Promise<Deal> {
    const res = await this.http.put<Deal>(`/crm/deals/${dealId}`, data);
    return res.data;
  }

  async moveDeal(dealId: string, stageId: string): Promise<Deal> {
    const res = await this.http.post<Deal>(`/crm/deals/${dealId}/move`, { stageId });
    return res.data;
  }

  async deleteDeal(dealId: string): Promise<void> {
    await this.http.delete(`/crm/deals/${dealId}`);
  }

  async listContacts(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: Contact[]; total: number }> {
    const res = await this.http.get('/crm/contacts', { params });
    return res.data;
  }

  async getContact(id: string): Promise<Contact> {
    const res = await this.http.get<Contact>(`/crm/contacts/${id}`);
    return res.data;
  }

  async createContact(data: CreateContactRequest): Promise<Contact> {
    const res = await this.http.post<Contact>('/crm/contacts', data);
    return res.data;
  }

  async updateContact(id: string, data: Partial<CreateContactRequest>): Promise<Contact> {
    const res = await this.http.put<Contact>(`/crm/contacts/${id}`, data);
    return res.data;
  }

  async deleteContact(id: string): Promise<void> {
    await this.http.delete(`/crm/contacts/${id}`);
  }
}
