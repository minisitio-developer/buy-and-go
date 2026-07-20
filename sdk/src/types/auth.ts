export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: PlanTier;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  user: User;
  invitedAt: string;
  acceptedAt?: string;
}

export type MemberRole = 'owner' | 'admin' | 'member';
