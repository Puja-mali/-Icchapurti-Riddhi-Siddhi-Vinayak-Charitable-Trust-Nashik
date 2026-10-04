import nodemailer, { Transporter } from 'nodemailer';
import { env, isEmailConfigured } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  reason?: string;
  error?: string;
}

// Utility to escape user-provided strings in HTML templates
function escapeHtml(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Lazily initialize or retrieve the Nodemailer transporter.
   */
  private static getTransporter(): Transporter | null {
    if (!isEmailConfigured()) {
      return null;
    }

    if (!this.transporter) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.EMAIL_HOST,
          port: env.EMAIL_PORT,
          secure: env.EMAIL_SECURE, // true for 465, false for 587/STARTTLS
          auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASSWORD,
          },
          // Short timeouts to guarantee fast response without hanging user requests
          connectionTimeout: 8000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        });
      } catch (err: any) {
        logger.error(`[EMAIL SERVICE] Failed to create nodemailer transporter: ${err.message}`);
        this.transporter = null;
      }
    }

    return this.transporter;
  }

  /**
   * Primary fail-safe email dispatcher.
   * NEVER throws an error; ensures caller business operations never break.
   */
  public static async sendMail(options: EmailOptions): Promise<EmailSendResult> {
    const { to, subject, html, text } = options;

    if (!isEmailConfigured()) {
      logger.info(
        `[EMAIL SERVICE] Skipped delivery (SMTP credentials not configured in server/.env). To: ${to}, Subject: "${subject}"`
      );
      return {
        success: false,
        reason: 'CODE VERIFIED — LIVE EMAIL DELIVERY NOT TESTED (SMTP credentials not configured)',
      };
    }

    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        return {
          success: false,
          reason: 'Transporter initialization failed',
        };
      }

      const info = await transporter.sendMail({
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      });

      logger.info(`[EMAIL SERVICE] Successfully sent email to ${to}. MessageId: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      // Log sanitized error message without credentials or tokens
      logger.error(`[EMAIL SERVICE] Delivery failed to ${to}: ${error.message || error}`);
      return {
        success: false,
        error: error.message || 'Unknown email delivery failure',
      };
    }
  }

  // ============================================================================
  // BRANDED TEMPLATE BUILDERS
  // ============================================================================

  private static wrapTemplate(title: string, bodyContent: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header { background-color: #14532d; color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #b45309; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 12px; color: #dcfce7; }
    .content { padding: 32px 24px; font-size: 14px; line-height: 1.6; color: #334155; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .badge { display: inline-block; background-color: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
    .btn { display: inline-block; background-color: #14532d; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 13px; margin: 16px 0; }
    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik</h1>
      <p>Regd. Public Charitable Trust • Reg. No. E-9389 / Nashik • Official Trust Acknowledgment</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p><strong>Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik</strong></p>
      <p>7, Pokar Avenue, Nandanvan Garden Apartment, Nashik, Maharashtra, India, PIN 422004</p>
      <p>Phone: 0253 6029200 / 0253 6018200 • Email: contact@siddhivinayaktrust.org</p>
      <p>For verified audit records, visit our Public Transparency Registry online.</p>
      <p>This is an automated operational notification. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 1. Verified Donation Success Receipt Email
   */
  public static async sendDonationSuccessEmail(data: {
    donorEmail: string;
    donorName: string;
    amount: number;
    receiptNumber: string;
    causeTitle?: string;
    receiptUrl?: string;
    paymentId?: string;
  }): Promise<EmailSendResult> {
    const formattedAmount = `₹${data.amount.toLocaleString('en-IN')}`;
    const subject = `Official Donation Receipt: ${formattedAmount} - ${data.receiptNumber}`;

    const body = `
      <div style="margin-bottom: 16px;">
        <span class="badge">Payment Verified & Audited</span>
      </div>
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Thank You for Your Generous Seva, ${escapeHtml(
        data.donorName
      )}!</h2>
      <p>We gratefully acknowledge receipt of your voluntary contribution towards <strong>${escapeHtml(
        data.causeTitle || 'General Trust Corpus'
      )}</strong>. Your support empowers our verified community welfare and medical relief initiatives.</p>
      
      <div class="card">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Official Receipt No:</td>
            <td style="padding: 6px 0; font-weight: 700; text-align: right; font-family: monospace;">${escapeHtml(
              data.receiptNumber
            )}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Contribution Amount:</td>
            <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #14532d; font-size: 15px;">${escapeHtml(
              formattedAmount
            )}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Designated Purpose:</td>
            <td style="padding: 6px 0; text-align: right;">${escapeHtml(
              data.causeTitle || 'General Welfare Seva'
            )}</td>
          </tr>
          ${
            data.paymentId
              ? `<tr>
            <td style="padding: 6px 0; color: #64748b;">Gateway Transaction ID:</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 11px;">${escapeHtml(
              data.paymentId
            )}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Acknowledgment:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #166534;">Voluntary Contribution Acknowledged</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #475569;">You can view and print your verified electronic receipt anytime from your donor dashboard:</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(
          env.CLIENT_URL
        )}/dashboard" class="btn" style="color: #ffffff !important;">Access Donor Dashboard & Receipts</a>
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Note: Keep this receipt number and transaction reference for your records. Section 80G tax deduction eligibility is subject to CBDT verified trust credentials and donor PAN submission.</p>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.donorEmail, subject, html });
  }

  /**
   * 2. Donation Payment Failed Alert Email
   */
  public static async sendDonationFailedEmail(data: {
    donorEmail: string;
    donorName: string;
    amount: number;
    failureReason?: string;
  }): Promise<EmailSendResult> {
    const formattedAmount = `₹${data.amount.toLocaleString('en-IN')}`;
    const subject = `Payment Attempt Notice - ${formattedAmount}`;

    const body = `
      <h2 style="margin: 0 0 16px 0; color: #991b1b; font-size: 18px;">Donation Transaction Update</h2>
      <p>Dear ${escapeHtml(data.donorName)},</p>
      <p>We noticed an attempt to contribute <strong>${escapeHtml(
        formattedAmount
      )}</strong> to Shree Siddhivinayak Charitable Trust could not be completed by the banking partner.</p>
      
      <div class="card" style="border-left: 4px solid #ef4444;">
        <p style="margin: 0; font-size: 13px; color: #7f1d1d;"><strong>Reason:</strong> ${escapeHtml(
          data.failureReason || 'Payment declined or cancelled by issuing bank'
        )}</p>
      </div>

      <p>No funds have been debited for this transaction. If amount was deducted, your bank typically reconciles it within 3-5 business days.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(
          env.CLIENT_URL
        )}/donate" class="btn" style="color: #ffffff !important;">Try Contribution Again</a>
      </div>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.donorEmail, subject, html });
  }

  /**
   * 3. Volunteer Application Received Email
   */
  public static async sendVolunteerApplicationReceivedEmail(data: {
    email: string;
    fullName: string;
    roleTitle?: string;
    referenceNumber: string;
  }): Promise<EmailSendResult> {
    const subject = `Volunteer Seva Application Received - Ref: ${data.referenceNumber}`;

    const body = `
      <div style="margin-bottom: 16px;">
        <span class="badge">Application Registered</span>
      </div>
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Thank You for Offering Your Seva, ${escapeHtml(
        data.fullName
      )}!</h2>
      <p>Your volunteer application for <strong>${escapeHtml(
        data.roleTitle || 'Trust Seva Wing'
      )}</strong> has been received by our Seva Coordination Committee.</p>
      
      <div class="card">
        <p style="margin: 0; font-size: 13px;"><strong>Application Reference:</strong> <code style="color: #14532d; font-weight: bold;">${escapeHtml(
          data.referenceNumber
        )}</code></p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b;">Status: Pending Initial Review by Trust Volunteer Coordinators</p>
      </div>

      <p>Our volunteer desk reviews applications to align skills and availability with upcoming ground drives and community distribution programs. We will notify you once your application is reviewed.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(
          env.CLIENT_URL
        )}/volunteer-portal" class="btn" style="color: #ffffff !important;">View Volunteer Portal</a>
      </div>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 4. Volunteer Application Reviewed / Approved / Rejected Email
   */
  public static async sendVolunteerStatusEmail(data: {
    email: string;
    fullName: string;
    roleTitle?: string;
    status: 'APPROVED' | 'REJECTED';
    notes?: string;
  }): Promise<EmailSendResult> {
    const isApproved = data.status === 'APPROVED';
    const subject = isApproved
      ? `Congratulations! Your Volunteer Application has been Approved`
      : `Update on Your Volunteer Application with Shree Siddhivinayak Trust`;

    const body = `
      <div style="margin-bottom: 16px;">
        <span class="badge" style="background-color: ${isApproved ? '#dcfce7' : '#fee2e2'}; color: ${
      isApproved ? '#166534' : '#991b1b'
    };">
          ${isApproved ? 'Application Approved' : 'Application Status Update'}
        </span>
      </div>
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Dear ${escapeHtml(
        data.fullName
      )},</h2>
      ${
        isApproved
          ? `<p>We are delighted to welcome you to the volunteer cadre for <strong>${escapeHtml(
              data.roleTitle || 'Trust Initiatives'
            )}</strong>! Your selfless dedication helps support students, families, and community members in need.</p>
            <p>You can now log your volunteer shifts, download verified service certificates, and register for upcoming trust events directly through your Volunteer Portal.</p>`
          : `<p>Thank you for your interest in volunteering with us for <strong>${escapeHtml(
              data.roleTitle || 'Trust Initiatives'
            )}</strong>. At this time, we are unable to accept your application due to current capacity or scheduling alignment.</p>
            <p>We deeply respect your willingness to serve and encourage you to apply again for future initiatives or participate in open community events.</p>`
      }

      ${
        data.notes
          ? `<div class="card">
        <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Coordinator Remarks:</strong> ${escapeHtml(
          data.notes
        )}</p>
      </div>`
          : ''
      }

      <div style="text-align: center;">
        <a href="${escapeHtml(
          env.CLIENT_URL
        )}/volunteer-portal" class="btn" style="color: #ffffff !important;">Access Volunteer Portal</a>
      </div>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 5. Help Request Received Email
   */
  public static async sendHelpRequestReceivedEmail(data: {
    email: string;
    requesterName: string;
    trackingId: string;
    category: string;
  }): Promise<EmailSendResult> {
    const subject = `Aid Request Registered - Tracking ID: ${data.trackingId}`;

    const body = `
      <div style="margin-bottom: 16px;">
        <span class="badge">Request Lodged</span>
      </div>
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Namaste ${escapeHtml(
        data.requesterName
      )},</h2>
      <p>Your request for charitable assistance in the category <strong>${escapeHtml(
        data.category
      )}</strong> has been registered with Shree Siddhivinayak Charitable Trust.</p>
      
      <div class="card">
        <p style="margin: 0; font-size: 13px;"><strong>Public Tracking ID:</strong> <code style="color: #14532d; font-weight: bold; font-size: 14px;">${escapeHtml(
          data.trackingId
        )}</code></p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Please save this tracking code to check status and progress updates.</p>
      </div>

      <p>Our verification officers inspect all assistance requests to ensure aid reaches authentic beneficiaries with full transparency. If urgent documents are required, a field coordinator may contact your registered telephone number.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(
          env.CLIENT_URL
        )}/request-help?trackingId=${escapeHtml(
      data.trackingId
    )}" class="btn" style="color: #ffffff !important;">Track Request Status</a>
      </div>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 6. Help Request Status Updated Email
   */
  public static async sendHelpRequestStatusUpdatedEmail(data: {
    email: string;
    requesterName: string;
    trackingId: string;
    status: string;
    adminNotes?: string;
  }): Promise<EmailSendResult> {
    const subject = `Update on Aid Request ${data.trackingId} - Status: ${data.status}`;

    const body = `
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Aid Request Update</h2>
      <p>Dear ${escapeHtml(data.requesterName)},</p>
      <p>The status of your aid request <strong>${escapeHtml(
        data.trackingId
      )}</strong> has been updated by the trust administration:</p>
      
      <div class="card">
        <p style="margin: 0; font-size: 14px;"><strong>Current Status:</strong> <span style="color: #14532d; font-weight: bold;">${escapeHtml(
          data.status
        )}</span></p>
        ${
          data.adminNotes
            ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #475569;"><strong>Notes / Next Steps:</strong> ${escapeHtml(
                data.adminNotes
              )}</p>`
            : ''
        }
      </div>

      <div style="text-align: center;">
        <a href="${escapeHtml(
          env.CLIENT_URL
        )}/request-help?trackingId=${escapeHtml(
      data.trackingId
    )}" class="btn" style="color: #ffffff !important;">Check Complete Details</a>
      </div>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 7. Event Registration Confirmation Email
   */
  public static async sendEventRegistrationEmail(data: {
    email: string;
    attendeeName: string;
    eventTitle: string;
    startDate?: string;
    location?: string;
    registrationCode?: string;
  }): Promise<EmailSendResult> {
    const subject = `Confirmed: Registration for ${data.eventTitle}`;

    const body = `
      <div style="margin-bottom: 16px;">
        <span class="badge">Event Confirmed</span>
      </div>
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Registration Confirmed, ${escapeHtml(
        data.attendeeName
      )}!</h2>
      <p>You are officially registered for the trust event <strong>${escapeHtml(
        data.eventTitle
      )}</strong>.</p>
      
      <div class="card">
        ${
          data.startDate
            ? `<p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Date & Time:</strong> ${escapeHtml(
                data.startDate
              )}</p>`
            : ''
        }
        ${
          data.location
            ? `<p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Location:</strong> ${escapeHtml(
                data.location
              )}</p>`
            : ''
        }
        ${
          data.registrationCode
            ? `<p style="margin: 0; font-size: 13px;"><strong>Passcode / Registration Code:</strong> <code style="color: #14532d; font-weight: bold;">${escapeHtml(
                data.registrationCode
              )}</code></p>`
            : ''
        }
      </div>

      <p>Please arrive at least 15 minutes before scheduled start time. For volunteer coordinators, please carry any assigned trust identification.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(
          env.CLIENT_URL
        )}/events" class="btn" style="color: #ffffff !important;">View Event Details</a>
      </div>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 8. Welcome / New Account Registration Email
   */
  public static async sendWelcomeEmail(data: {
    email: string;
    name: string;
  }): Promise<EmailSendResult> {
    const subject = `Welcome to Shree Siddhivinayak Charitable Trust`;

    const body = `
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Welcome, ${escapeHtml(
        data.name
      )}!</h2>
      <p>Thank you for creating your verified profile with Shree Siddhivinayak Charitable Trust. Your account allows you to track all your seva contributions, download verified voluntary contribution receipts, and participate in community drives.</p>
      
      <div class="card">
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
          <li>Access verified personal contribution records & receipts</li>
          <li>View your personalized <strong>Impact Passport</strong></li>
          <li>Explore and volunteer for active grassroots causes</li>
          <li>Track public trust audits with 100% financial transparency</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="${escapeHtml(
          env.CLIENT_URL
        )}/dashboard" class="btn" style="color: #ffffff !important;">Go to Donor Portal</a>
      </div>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.email, subject, html });
  }
}
