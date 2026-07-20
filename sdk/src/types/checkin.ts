export interface Attendee {
  id: string;
  eventId: string;
  ticketId: string;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  company?: string;
  role?: string;
  avatarUrl?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  checkinMethod?: CheckinMethod;
  faceEnrolled: boolean;
  faceImageUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type CheckinMethod = 'qr_code' | 'manual' | 'face_recognition' | 'nfc' | 'list';

export interface Checkin {
  id: string;
  eventId: string;
  attendeeId: string;
  ticketId: string;
  ticketCode: string;
  operatorId: string;
  method: CheckinMethod;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface CheckinStats {
  eventId: string;
  totalAttendees: number;
  checkedIn: number;
  pending: number;
  checkinRate: number;
  byMethod: Record<CheckinMethod, number>;
  byHour: { hour: string; count: number }[];
  recentCheckins: Checkin[];
}

export interface CheckinRequest {
  eventId: string;
  ticketCode: string;
  method?: CheckinMethod;
  metadata?: Record<string, unknown>;
}

export interface ManualCheckinRequest {
  eventId: string;
  attendeeId: string;
  method?: CheckinMethod;
  metadata?: Record<string, unknown>;
}

export interface FaceCheckinRequest {
  eventId: string;
  faceImage: string;
  confidence?: number;
}

export interface CreateAttendeeRequest {
  name: string;
  email: string;
  document?: string;
  phone?: string;
  company?: string;
  role?: string;
  metadata?: Record<string, unknown>;
}
