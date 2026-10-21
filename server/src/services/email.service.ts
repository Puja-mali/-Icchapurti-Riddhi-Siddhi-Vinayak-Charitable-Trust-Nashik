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
   * Lazily initialize or retrieve the Nodemailer transporter with cloud-ready safeguards.
   */
  private static getTransporter(): Transporter | null {
    if (!isEmailConfigured()) {
      return null;
    }

    const host =
      (process.env.SMTP_HOST || process.env.EMAIL_HOST || process.env.MAIL_HOST || process.env.SMTP_SERVER || '').trim() ||
      env.EMAIL_HOST;
    const user =
      (process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USERNAME || process.env.MAIL_USER || process.env.SMTP_USERNAME || process.env.EMAIL_USERNAME || '').trim() ||
      env.EMAIL_USER;
    let pass =
      (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.MAIL_PASSWORD || process.env.MAIL_PASS || '').trim() ||
      env.EMAIL_PASSWORD;

    // Clean quotes and remove internal spacing for 16-character Google App Passwords
    pass = pass.replace(/^["']|["']$/g, '').trim();
    if (pass.replace(/\s+/g, '').length === 16) {
      pass = pass.replace(/\s+/g, '');
    }

    const isGmailService =
      (process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE || '').toLowerCase() === 'gmail' ||
      (user && (user.toLowerCase().endsWith('@gmail.com') || user.toLowerCase().endsWith('@googlemail.com')));

    const resolvedHost = host || (isGmailService ? 'smtp.gmail.com' : 'smtp.gmail.com');
    const portRaw = process.env.SMTP_PORT || process.env.EMAIL_PORT || process.env.MAIL_PORT;
    let port = portRaw ? parseInt(portRaw, 10) : env.EMAIL_PORT || 587;
    if (isNaN(port) || port <= 0) {
      port = 587;
    }

    // Port 465 is implicit TLS (SSL). Port 587 uses explicit STARTTLS.
    const secure = port === 465;

    try {
      const transportConfig: any = {
        host: resolvedHost,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        // Force IPv4 lookup to prevent DNS resolution timeouts in Render & Docker containers
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
        tls: {
          rejectUnauthorized: false,
        },
      };

      if (port === 587 || port === 25) {
        transportConfig.requireTLS = true;
      }

      this.transporter = nodemailer.createTransport(transportConfig);
    } catch (err: any) {
      logger.error(`[EMAIL SERVICE] Failed to create nodemailer transporter: ${err.message}`);
      this.transporter = null;
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
        `[EMAIL SERVICE] Skipped delivery (SMTP credentials not configured in environment variables). To: ${to}, Subject: "${subject}"`
      );
      return {
        success: false,
        reason: 'SMTP credentials not configured in environment variables (SMTP_USER / SMTP_PASS)',
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

      const senderEmail =
        (process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.MAIL_FROM_ADDRESS || process.env.MAIL_FROM || '').trim() ||
        (process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USERNAME || '').trim() ||
        env.EMAIL_FROM;

      const fromName =
        (process.env.EMAIL_FROM_NAME || process.env.MAIL_FROM_NAME || '').trim() ||
        env.EMAIL_FROM_NAME;

      const info = await transporter.sendMail({
        from: `"${fromName}" <${senderEmail}>`,
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
      <p>Regd. Public Charitable Trust • Reg. No. E/1341 • Official Trust Acknowledgment</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p><strong>Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik</strong></p>
      <p>Reg. No. E/1341 • Nashik, Maharashtra</p>
      <p>Email: <a href="mailto:ichhapurtiriddhisiddhivinayak@gmail.com" style="color: #14532d;">ichhapurtiriddhisiddhivinayak@gmail.com</a> • Phone: <a href="tel:9922271777" style="color: #14532d;">9922271777</a> / <a href="tel:7588833127" style="color: #14532d;">7588833127</a></p>
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
      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Note: Keep this receipt number and transaction reference for your records. The Trust does not claim Section 80G tax deductions; this receipt confirms your voluntary contribution for personal and Trust accounting records.</p>
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

  /**
   * 9. Administrative Invitation Email (ADMIN / STAFF Onboarding)
   */
  public static async sendAdminInvitationEmail(data: {
    email: string;
    name?: string;
    role: 'ADMIN' | 'STAFF';
    inviteUrl: string;
    expiresInHours?: number;
    invitedByName?: string;
  }): Promise<EmailSendResult> {
    const roleTitle = data.role === 'ADMIN' ? 'Trust Administrator' : 'Trust Staff Officer';
    const hours = data.expiresInHours || 72;
    const subject = `Official Trust Invitation: Authorized ${roleTitle} Access`;

    const body = `
      <div style="margin-bottom: 16px;">
        <span class="badge" style="background-color: #fef3c7; color: #92400e;">Administrative Authorization</span>
      </div>
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Namaste${
        data.name ? ` ${escapeHtml(data.name)}` : ''
      },</h2>
      <p>You have been formally invited${
        data.invitedByName ? ` by <strong>${escapeHtml(data.invitedByName)}</strong>` : ''
      } to access the administrative operations platform of <strong>Icchapurti Riddhi Siddhi Vinayak Charitable Trust</strong> as an authorized <strong>${escapeHtml(
      roleTitle
    )}</strong> (${data.role}).</p>

      <div class="card" style="border-left: 4px solid #14532d;">
        <p style="margin: 0; font-size: 13px;"><strong>Assigned Role:</strong> <span style="color: #14532d; font-weight: 700;">${escapeHtml(
          roleTitle
        )}</span></p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;"><strong>Authorized Email:</strong> <code>${escapeHtml(
          data.email
        )}</code></p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #b45309;"><strong>Link Validity:</strong> Single-use activation valid for ${hours} hours</p>
      </div>

      <p style="font-size: 13px; color: #334155;">To activate your administrative profile and choose your secure password, click the button below:</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${escapeHtml(
          data.inviteUrl
        )}" class="btn" style="color: #ffffff !important; background-color: #14532d; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate Account & Set Password</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">If the button does not work, copy and paste this verified link into your browser:</p>
      <p style="font-size: 11px; word-break: break-all; color: #1e40af; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">
        ${escapeHtml(data.inviteUrl)}
      </p>

      <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        Security Notice: Never forward this invitation link. Trust administrators will never ask for your password. If you did not expect this invitation, please notify trust leadership immediately.
      </p>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 10. Password Reset Email
   */
  public static async sendPasswordResetEmail(data: {
    email: string;
    name?: string;
    resetUrl: string;
    expiresInMinutes?: number;
  }): Promise<EmailSendResult> {
    const minutes = data.expiresInMinutes || 60;
    const subject = `Password Reset Request - Shree Siddhivinayak Charitable Trust`;

    const body = `
      <div style="margin-bottom: 16px;">
        <span class="badge" style="background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca;">Security Authorization</span>
      </div>
      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Namaste${
        data.name ? ` ${escapeHtml(data.name)}` : ''
      },</h2>
      <p>We received a request to reset the password for your account associated with <strong>${escapeHtml(
        data.email
      )}</strong> at Shree Siddhivinayak Charitable Trust.</p>

      <div class="card" style="border-left: 4px solid #b91c1c;">
        <p style="margin: 0; font-size: 13px;"><strong>Security Notice:</strong> Single-use password reset link</p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #b45309;"><strong>Validity:</strong> This link expires in <strong>${minutes} minutes</strong>.</p>
      </div>

      <p style="font-size: 13px; color: #334155;">To set a new password, click the secure button below:</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${escapeHtml(
          data.resetUrl
        )}" class="btn" style="color: #ffffff !important; background-color: #14532d; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">If the button does not work, copy and paste this link into your browser:</p>
      <p style="font-size: 11px; word-break: break-all; color: #1e40af; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">
        ${escapeHtml(data.resetUrl)}
      </p>

      <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        If you did not make this request, you can safely ignore this email. Your current password remains unchanged and your account is secure.
      </p>
    `;

    const html = this.wrapTemplate(subject, body);
    return this.sendMail({ to: data.email, subject, html });
  }
}

