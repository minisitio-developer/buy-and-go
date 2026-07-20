import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthAPI } from './api/auth.api';
import { EventsAPI } from './api/events.api';
import { TicketsAPI } from './api/tickets.api';
import { CheckinAPI } from './api/checkin.api';
import { CRMAPI } from './api/crm.api';
import { SponsorsAPI } from './api/sponsors.api';
import { PaymentsAPI } from './api/payments.api';
import { AIAPI } from './api/ai.api';

export interface EventOSClientConfig {
  baseURL: string;
  apiKey?: string;
  token?: string;
}

export class EventOSClient {
  private http: AxiosInstance;
  private tokenKey = 'eventos_auth_token';

  public auth: AuthAPI;
  public events: EventsAPI;
  public tickets: TicketsAPI;
  public checkin: CheckinAPI;
  public crm: CRMAPI;
  public sponsors: SponsorsAPI;
  public payments: PaymentsAPI;
  public ai: AIAPI;

  constructor(config: EventOSClientConfig) {
    this.http = axios.create({
      baseURL: config.baseURL.replace(/\/+$/, ''),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
      },
    });

    if (config.token) {
      this.setToken(config.token);
    }

    this.http.interceptors.request.use(
      (req: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && req.headers) {
          req.headers.Authorization = `Bearer ${token}`;
        }
        return req;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.http.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            try {
              const refreshToken = this.getRefreshToken();
              if (refreshToken) {
                const res = await this.http.post('/auth/refresh', { refreshToken });
                const { token } = res.data;
                this.setToken(token);
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.http(originalRequest);
              }
            } catch {
              this.clearTokens();
            }
          }
        }

        const message =
          (error.response?.data as { message?: string })?.message ||
          error.message ||
          'Unknown error';

        return Promise.reject(new EventOSError(message, error.response?.status));
      }
    );

    this.auth = new AuthAPI(this.http);
    this.events = new EventsAPI(this.http);
    this.tickets = new TicketsAPI(this.http);
    this.checkin = new CheckinAPI(this.http);
    this.crm = new CRMAPI(this.http);
    this.sponsors = new SponsorsAPI(this.http);
    this.payments = new PaymentsAPI(this.http);
    this.ai = new AIAPI(this.http);
  }

  async authenticate(email: string, password: string): Promise<void> {
    const res = await this.auth.login({ email, password });
    this.setToken(res.token);
    this.setRefreshToken(res.refreshToken);
  }

  setToken(token: string): void {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      globalThis.localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      globalThis.localStorage.setItem(`${this.tokenKey}_refresh`, token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage.getItem(`${this.tokenKey}_refresh`);
    }
    return null;
  }

  clearTokens(): void {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      globalThis.localStorage.removeItem(this.tokenKey);
      globalThis.localStorage.removeItem(`${this.tokenKey}_refresh`);
    }
  }
}

export class EventOSError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'EventOSError';
  }
}
