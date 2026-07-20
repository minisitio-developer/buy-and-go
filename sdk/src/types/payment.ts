export interface Payment {
  id: string;
  orderId: string;
  eventId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  gateway: PaymentGateway;
  gatewayTransactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export type PaymentGateway = 'stripe' | 'asaas' | 'mercado_pago' | 'pagarme' | 'custom';

export interface PixPayment {
  id: string;
  paymentId: string;
  qrCode: string;
  qrCodeImage: string;
  copyPasteKey: string;
  expiresAt: string;
  paidAt?: string;
}

export interface BoletoPayment {
  id: string;
  paymentId: string;
  barcode: string;
  barcodeNumber: string;
  digitableLine: string;
  pdfUrl: string;
  expiresAt: string;
  paidAt?: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason?: string;
  status: RefundStatus;
  gatewayRefundId?: string;
  createdAt: string;
}

export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PaymentGatewayConfig {
  id: string;
  organizationId: string;
  gateway: PaymentGateway;
  displayName: string;
  isActive: boolean;
  config: Record<string, string>;
  createdAt: string;
}
