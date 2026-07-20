import { AxiosInstance } from 'axios';
import {
  Payment,
  PixPayment,
  BoletoPayment,
  Refund,
  PaymentGatewayConfig,
} from '../types/payment';

export class PaymentsAPI {
  constructor(private http: AxiosInstance) {}

  async list(eventId: string, params?: { page?: number; limit?: number; status?: string }): Promise<{ data: Payment[]; total: number }> {
    const res = await this.http.get(`/events/${eventId}/payments`, { params });
    return res.data;
  }

  async getById(eventId: string, paymentId: string): Promise<Payment> {
    const res = await this.http.get<Payment>(`/events/${eventId}/payments/${paymentId}`);
    return res.data;
  }

  async getPixDetails(eventId: string, paymentId: string): Promise<PixPayment> {
    const res = await this.http.get<PixPayment>(`/events/${eventId}/payments/${paymentId}/pix`);
    return res.data;
  }

  async getBoletoDetails(eventId: string, paymentId: string): Promise<BoletoPayment> {
    const res = await this.http.get<BoletoPayment>(`/events/${eventId}/payments/${paymentId}/boleto`);
    return res.data;
  }

  async requestRefund(eventId: string, paymentId: string, data: { amount: number; reason?: string }): Promise<Refund> {
    const res = await this.http.post<Refund>(`/events/${eventId}/payments/${paymentId}/refund`, data);
    return res.data;
  }

  async listRefunds(eventId: string, paymentId: string): Promise<Refund[]> {
    const res = await this.http.get<Refund[]>(`/events/${eventId}/payments/${paymentId}/refunds`);
    return res.data;
  }

  async getGateways(): Promise<PaymentGatewayConfig[]> {
    const res = await this.http.get<PaymentGatewayConfig[]>('/payments/gateways');
    return res.data;
  }

  async configureGateway(data: {
    gateway: string;
    displayName: string;
    config: Record<string, string>;
  }): Promise<PaymentGatewayConfig> {
    const res = await this.http.post<PaymentGatewayConfig>('/payments/gateways', data);
    return res.data;
  }

  async updateGateway(id: string, data: Partial<{
    displayName: string;
    config: Record<string, string>;
    isActive: boolean;
  }>): Promise<PaymentGatewayConfig> {
    const res = await this.http.put<PaymentGatewayConfig>(`/payments/gateways/${id}`, data);
    return res.data;
  }

  async deleteGateway(id: string): Promise<void> {
    await this.http.delete(`/payments/gateways/${id}`);
  }

  async processPayment(eventId: string, data: {
    orderId: string;
    method: string;
    pixKey?: string;
    cpfCnpj?: string;
  }): Promise<Payment> {
    const res = await this.http.post<Payment>(`/events/${eventId}/payments/process`, data);
    return res.data;
  }

  async simulatePayment(eventId: string, data: {
    orderId: string;
    status: 'completed' | 'failed';
  }): Promise<Payment> {
    const res = await this.http.post<Payment>(`/events/${eventId}/payments/simulate`, data);
    return res.data;
  }
}
