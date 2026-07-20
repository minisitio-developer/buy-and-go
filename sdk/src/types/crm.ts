export interface Pipeline {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  stages: Stage[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  color?: string;
  probability: number;
  dealsCount: number;
  totalValue: number;
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  stages: { name: string; color?: string; probability: number }[];
}

export interface Deal {
  id: string;
  pipelineId: string;
  stageId: string;
  eventId?: string;
  title: string;
  value: number;
  currency: string;
  status: DealStatus;
  contactId?: string;
  contact?: Contact;
  expectedCloseDate?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type DealStatus = 'open' | 'won' | 'lost' | 'abandoned';

export interface CreateDealRequest {
  pipelineId: string;
  stageId: string;
  eventId?: string;
  title: string;
  value: number;
  currency?: string;
  contactId?: string;
  expectedCloseDate?: string;
  notes?: string;
  tags?: string[];
}

export interface Contact {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatarUrl?: string;
  tags?: string[];
  notes?: string;
  dealsCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  tags?: string[];
  notes?: string;
}
