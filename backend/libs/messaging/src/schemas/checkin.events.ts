export interface CheckinCreatedEvent {
    attendeeId: string;
    eventId: string;
    method: string;
    checkedInAt: Date;
    checkedInBy?: string;
    deviceId?: string;
    location?: Record<string, any>;
    attendeeName?: string;
    attendeeCategory?: string;
    attendeeCompany?: string;
}

export interface CheckinVerifiedEvent {
    checkinId: string;
    attendeeId: string;
    eventId: string;
    verified: boolean;
    verificationMethod: string;
    score?: number;
}

export interface AttendeeSyncedEvent {
    attendeeId: string;
    eventId: string;
    externalId?: string;
    source: string;
    syncStatus: string;
    data: Record<string, any>;
}
