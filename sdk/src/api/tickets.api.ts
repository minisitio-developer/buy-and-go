import { AxiosInstance } from 'axios';
import {
  TicketType,
  CreateTicketTypeRequest,
  Lot,
  Order,
  Ticket,
  Coupon,
} from '../types/ticket';

export class TicketsAPI {
  constructor(private http: AxiosInstance) {}

  async listTicketTypes(eventId: string): Promise<TicketType[]> {
    const res = await this.http.get<TicketType[]>(`/events/${eventId}/ticket-types`);
    return res.data;
  }

  async getTicketType(eventId: string, ticketTypeId: string): Promise<TicketType> {
    const res = await this.http.get<TicketType>(`/events/${eventId}/ticket-types/${ticketTypeId}`);
    return res.data;
  }

  async createTicketType(eventId: string, data: CreateTicketTypeRequest): Promise<TicketType> {
    const res = await this.http.post<TicketType>(`/events/${eventId}/ticket-types`, data);
    return res.data;
  }

  async updateTicketType(eventId: string, ticketTypeId: string, data: Partial<CreateTicketTypeRequest>): Promise<TicketType> {
    const res = await this.http.put<TicketType>(`/events/${eventId}/ticket-types/${ticketTypeId}`, data);
    return res.data;
  }

  async deleteTicketType(eventId: string, ticketTypeId: string): Promise<void> {
    await this.http.delete(`/events/${eventId}/ticket-types/${ticketTypeId}`);
  }

  async listLots(eventId: string): Promise<Lot[]> {
    const res = await this.http.get<Lot[]>(`/events/${eventId}/lots`);
    return res.data;
  }

  async createLot(eventId: string, data: { name: string; price: number; quantity: number; startDate: string; endDate: string }): Promise<Lot> {
    const res = await this.http.post<Lot>(`/events/${eventId}/lots`, data);
    return res.data;
  }

  async listOrders(eventId: string, params?: { page?: number; limit?: number; status?: string }): Promise<{ data: Order[]; total: number }> {
    const res = await this.http.get(`/events/${eventId}/orders`, { params });
    return res.data;
  }

  async getOrder(eventId: string, orderId: string): Promise<Order> {
    const res = await this.http.get<Order>(`/events/${eventId}/orders/${orderId}`);
    return res.data;
  }

  async cancelOrder(eventId: string, orderId: string): Promise<Order> {
    const res = await this.http.post<Order>(`/events/${eventId}/orders/${orderId}/cancel`);
    return res.data;
  }

  async listTickets(eventId: string, params?: { page?: number; limit?: number; status?: string; checkedIn?: boolean }): Promise<{ data: Ticket[]; total: number }> {
    const res = await this.http.get(`/events/${eventId}/tickets`, { params });
    return res.data;
  }

  async getTicket(eventId: string, ticketId: string): Promise<Ticket> {
    const res = await this.http.get<Ticket>(`/events/${eventId}/tickets/${ticketId}`);
    return res.data;
  }

  async getTicketByCode(eventId: string, code: string): Promise<Ticket> {
    const res = await this.http.get<Ticket>(`/events/${eventId}/tickets/code/${code}`);
    return res.data;
  }

  async transferTicket(eventId: string, ticketId: string, toEmail: string): Promise<Ticket> {
    const res = await this.http.post<Ticket>(`/events/${eventId}/tickets/${ticketId}/transfer`, { toEmail });
    return res.data;
  }

  async listCoupons(eventId: string): Promise<Coupon[]> {
    const res = await this.http.get<Coupon[]>(`/events/${eventId}/coupons`);
    return res.data;
  }

  async createCoupon(eventId: string, data: {
    code: string; discountType: string; discountValue: number; maxUses: number; validFrom: string; validUntil: string;
  }): Promise<Coupon> {
    const res = await this.http.post<Coupon>(`/events/${eventId}/coupons`, data);
    return res.data;
  }

  async deleteCoupon(eventId: string, couponId: string): Promise<void> {
    await this.http.delete(`/events/${eventId}/coupons/${couponId}`);
  }
}
