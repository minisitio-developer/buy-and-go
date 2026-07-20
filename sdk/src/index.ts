export { EventOSClient, EventOSClientConfig, EventOSError } from './client';

export * from './types/auth';
export * from './types/event';
export * from './types/ticket';
export * from './types/checkin';
export * from './types/crm';
export * from './types/sponsor';
export * from './types/payment';
export * from './types/ai';

export { AuthAPI } from './api/auth.api';
export { EventsAPI } from './api/events.api';
export { TicketsAPI } from './api/tickets.api';
export { CheckinAPI } from './api/checkin.api';
export { CRMAPI } from './api/crm.api';
export { SponsorsAPI } from './api/sponsors.api';
export { PaymentsAPI } from './api/payments.api';
export { AIAPI } from './api/ai.api';
