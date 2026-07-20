export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
  maxPerOrder: number;
  benefits: string[];
  isTransferable: boolean;
  startSale: string;
  endSale: string;
  status: TicketTypeStatus;
  createdAt: string;
  updatedAt: string;
}

export type TicketTypeStatus = 'active' | 'paused' | 'sold_out' | 'cancelled';

export interface CreateTicketTypeRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  quantity: number;
  maxPerOrder?: number;
  benefits?: string[];
  isTransferable?: boolean;
  startSale: string;
  endSale: string;
}

export interface Lot {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  startDate: string;
  endDate: string;
  status: LotStatus;
  createdAt: string;
  updatedAt: string;
}

export type LotStatus = 'active' | 'expired' | 'sold_out';

export interface Order {
  id: string;
  eventId: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerDocument?: string;
  totalAmount: number;
  discountAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  tickets: Ticket[];
  couponId?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';

export type PaymentMethod = 'credit_card' | 'pix' | 'boleto' | 'free';

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  code: string;
  qrCode: string;
  holderName: string;
  holderEmail: string;
  holderDocument?: string;
  status: TicketStatus;
  checkedIn: boolean;
  checkedInAt?: string;
  transferCount: number;
  createdAt: string;
}

export type TicketStatus = 'active' | 'used' | 'cancelled' | 'refunded';

export interface Coupon {
  id: string;
  eventId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number;
  usedCount: number;
  minOrderValue?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export type DiscountType = 'percentage' | 'fixed';
