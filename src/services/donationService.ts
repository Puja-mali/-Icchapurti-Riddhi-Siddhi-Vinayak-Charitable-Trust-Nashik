import { api } from './api';
import { DonationRecord, UserDonation } from '../types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface PaymentConfigResponse {
  isConfigured: boolean;
  keyId: string | null;
  currency: string;
}

export interface CreateOrderRequest {
  amount: number;
  causeId?: string | null;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  purpose?: string;
  currency?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number; // in paise
  currency: string;
  donationId: string;
  keyId: string;
  donor: {
    name: string;
    email: string;
    phone: string;
  };
  causeTitle: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  donation: DonationRecord;
}

export interface DonationsListResponse {
  donations: DonationRecord[];
  metrics: {
    totalCollected: number;
    totalVerifiedDonations: number;
    pendingDonations: number;
    failedDonations: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DonationService {
  /**
   * Asynchronously loads Razorpay standard checkout.js script into the browser DOM
   */
  public static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.getElementById('razorpay-checkout-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Fetch payment gateway configuration status
   */
  public static async getPaymentConfig(): Promise<PaymentConfigResponse> {
    const data = await api.get<PaymentConfigResponse>('/donations/config');
    return data;
  }

  /**
   * Create an authentic Razorpay Order and record preliminary Donation pledge
   */
  public static async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const data = await api.post<CreateOrderResponse>('/donations/create-order', payload);
    return data;
  }

  /**
   * Cryptographically verify payment on server and atomically increment cause funds
   */
  public static async verifyPayment(payload: VerifyPaymentRequest): Promise<DonationRecord> {
    const data = await api.post<VerifyPaymentResponse>('/donations/verify-payment', payload);
    return data.donation;
  }

  /**
   * Opens Razorpay Checkout modal with the created order and waits for completion or dismissal
   */
  public static async openCheckout(params: {
    order: CreateOrderResponse;
    themeColor?: string;
    onDismiss?: () => void;
  }): Promise<VerifyPaymentRequest> {
    const scriptLoaded = await this.loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error(
        'Unable to load Razorpay Checkout SDK. Please verify your internet connection or browser ad-blocker settings.'
      );
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: params.order.keyId,
        amount: params.order.amount,
        currency: params.order.currency,
        name: 'Siddhivinayak Charitable Trust',
        description: params.order.causeTitle || 'Donation to Trust Corpus',
        order_id: params.order.orderId,
        prefill: {
          name: params.order.donor.name,
          email: params.order.donor.email,
          contact: params.order.donor.phone,
        },
        theme: {
          color: params.themeColor || '#047857', // Emerald-700
        },
        modal: {
          ondismiss: () => {
            if (params.onDismiss) {
              params.onDismiss();
            }
            reject(new Error('PAYMENT_DISMISSED_BY_USER'));
          },
        },
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          resolve({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failResponse: any) => {
          reject(
            new Error(
              failResponse.error?.description ||
                failResponse.error?.reason ||
                'Payment attempt was declined or failed.'
            )
          );
        });
        rzp.open();
      } catch (err: any) {
        reject(err);
      }
    });
  }

  /**
   * Fetch authenticated user's verified personal donations
   */
  public static async getMyDonations(): Promise<DonationRecord[]> {
    const data = await api.get<{ donations: DonationRecord[] }>('/donations/my');
    return data.donations || [];
  }

  /**
   * Fetch single donation by database ID
   */
  public static async getDonationById(id: string): Promise<DonationRecord> {
    const data = await api.get<{ donation: DonationRecord }>(`/donations/${id}`);
    return data.donation;
  }

  /**
   * Fetch official donation receipt
   */
  public static async getReceiptByNumber(receiptNumber: string): Promise<DonationRecord> {
    const data = await api.get<{ receipt: DonationRecord }>(`/donations/receipt/${receiptNumber}`);
    return data.receipt;
  }

  /**
   * List all trust donations (ADMIN, STAFF only)
   */
  public static async listAllDonations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    causeId?: string;
    search?: string;
  }): Promise<DonationsListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    if (params?.causeId) query.set('causeId', params.causeId);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString();
    const endpoint = `/donations${queryString ? `?${queryString}` : ''}`;
    const data = await api.get<DonationsListResponse>(endpoint);
    return data;
  }

  /**
   * Helper to format a DonationRecord into the UserDonation UI structure
   */
  public static toUserDonation(record: DonationRecord): UserDonation {
    const causeTitle =
      typeof record.causeId === 'object' && record.causeId !== null
        ? record.causeId.title
        : record.purpose || 'General Trust Corpus';

    let displayStatus: 'Completed' | 'Processing' | 'Failed' = 'Processing';
    if (record.status === 'SUCCESS' || record.status === 'PAID' || record.paymentStatus === 'PAID' || record.paymentStatus === 'SUCCESS') {
      displayStatus = 'Completed';
    } else if (record.status === 'FAILED' || record.paymentStatus === 'FAILED') {
      displayStatus = 'Failed';
    }

    return {
      id: record.id || record._id || record.receiptNumber || `don-${Date.now()}`,
      receiptNumber: record.receiptNumber || 'Pending Confirmation',
      date: new Date(record.paymentVerifiedAt || record.createdAt).toISOString().split('T')[0],
      causeTitle,
      amount: record.amount,
      status: displayStatus,
      passportId: record.razorpayPaymentId || record.razorpayOrderId || 'PASS-TBD',
      taxExemptEligible: true,
      paymentMethod: record.razorpayPaymentId ? `Razorpay (${record.currency})` : 'Online Gateway',
      rawRecord: record,
    };
  }
}
