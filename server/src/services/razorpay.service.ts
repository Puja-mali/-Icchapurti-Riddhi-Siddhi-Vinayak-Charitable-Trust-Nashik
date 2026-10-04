import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env, isRazorpayConfigured } from '../config/env';
import { logger } from '../utils/logger';

let razorpayClient: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayClient) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        'Razorpay payment gateway is not configured. RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.'
      );
    }
    razorpayClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

export class RazorpayService {
  /**
   * Check whether Razorpay credentials are fully provisioned
   */
  public static isConfigured(): boolean {
    return isRazorpayConfigured();
  }

  /**
   * Safe public configuration details (never reveals secret)
   */
  public static getPublicConfig() {
    return {
      isConfigured: isRazorpayConfigured(),
      keyId: isRazorpayConfigured() ? env.RAZORPAY_KEY_ID : null,
      currency: 'INR',
    };
  }

  /**
   * Create a Razorpay Order
   * Amount must be in whole units (e.g., INR), which gets converted into paise (x 100)
   */
  public static async createOrder(params: {
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }) {
    const razorpay = getRazorpayInstance();
    const currency = params.currency || 'INR';
    const amountInSubunits = Math.round(params.amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInSubunits,
      currency,
      receipt: params.receipt,
      notes: params.notes || {},
    });

    return order;
  }

  /**
   * Cryptographically verify standard payment response signature using HMAC-SHA256
   * Form: sha256(order_id + "|" + payment_id, secret)
   */
  public static verifySignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!env.RAZORPAY_KEY_SECRET) {
      logger.error('Cannot verify Razorpay signature: RAZORPAY_KEY_SECRET is missing');
      return false;
    }

    try {
      const payload = `${params.orderId}|${params.paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const actualBuffer = Buffer.from(params.signature, 'utf8');

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch (err) {
      logger.error(`Razorpay signature verification exception: ${err}`);
      return false;
    }
  }

  /**
   * Cryptographically verify webhook signature using HMAC-SHA256
   */
  public static verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      logger.warn('RAZORPAY_WEBHOOK_SECRET is not configured; cannot verify webhook signature');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const actualBuffer = Buffer.from(signature, 'utf8');

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch (err) {
      logger.error(`Razorpay webhook signature verification exception: ${err}`);
      return false;
    }
  }

  /**
   * Fetch payment entity directly from Razorpay API to confirm state, amount, and order ID
   */
  public static async fetchPayment(paymentId: string) {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  }
}
