export interface Event {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  location?: string;
  startDate: string;
  endDate: string;
  timezone: string;
  status: EventStatus;
  visibility: EventVisibility;
  maxAttendees?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

export type EventVisibility = 'public' | 'private' | 'invite_only';

export interface CreateEventRequest {
  name: string;
  description?: string;
  bannerUrl?: string;
  location?: string;
  startDate: string;
  endDate: string;
  timezone: string;
  maxAttendees?: number;
  visibility?: EventVisibility;
  metadata?: Record<string, unknown>;
}

export interface UpdateEventRequest {
  name?: string;
  description?: string;
  bannerUrl?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  status?: EventStatus;
  visibility?: EventVisibility;
  maxAttendees?: number;
  metadata?: Record<string, unknown>;
}

export interface Room {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
}

export interface Schedule {
  id: string;
  eventId: string;
  roomId?: string;
  title: string;
  description?: string;
  speakerName?: string;
  speakerBio?: string;
  startTime: string;
  endTime: string;
  type: ScheduleType;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleType = 'talk' | 'workshop' | 'panel' | 'networking' | 'break' | 'other';

export interface CreateScheduleRequest {
  roomId?: string;
  title: string;
  description?: string;
  speakerName?: string;
  speakerBio?: string;
  startTime: string;
  endTime: string;
  type?: ScheduleType;
  metadata?: Record<string, unknown>;
}
