export interface Sponsor {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  tier: SponsorTier;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contractValue?: number;
  signedAt?: string;
  status: SponsorStatus;
  createdAt: string;
  updatedAt: string;
}

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';

export type SponsorStatus = 'negotiating' | 'confirmed' | 'cancelled' | 'completed';

export interface CreateSponsorRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  tier: SponsorTier;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contractValue?: number;
}

export interface SponsorBooth {
  id: string;
  eventId: string;
  sponsorId: string;
  name: string;
  location?: string;
  size?: string;
  sponsors?: Sponsor;
  checkinsCount: number;
  leadsCollected: number;
  createdAt: string;
}

export interface CreateBoothRequest {
  sponsorId: string;
  name: string;
  location?: string;
  size?: string;
}

export interface SponsorMetric {
  id: string;
  sponsorId: string;
  boothId?: string;
  eventId: string;
  checkinsCount: number;
  leadsCount: number;
  scansCount: number;
  interactionsCount: number;
  date: string;
}
