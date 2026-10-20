import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, Database, Server, Mail, Clock, CheckCircle } from 'lucide-react';
import { SEO } from '@/src/components/common/SEO';
import { TRUST_BRAND } from '@/src/config/trustBrand';
import { TrustEmblem } from '@/src/components/common/TrustEmblem';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  const lastUpdated = 'October 20, 2026';

  return (
    <>
      <SEO
        title="Privacy Policy & Data Transparency"
        description="Official Privacy Policy for Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik (Reg. No. E/1341). Transparent data collection, storage, and retention practices."
        canonicalPath="/privacy"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#14532d] border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Public Trust Data Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Privacy Policy & Data Stewardship
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {TRUST_BRAND.name} (Registration No. {TRUST_BRAND.registrationNumber}) is committed to complete integrity, statutory compliance, and dignified handling of all public, donor, and beneficiary information.
          </p>
          <div className="text-[11px] font-medium text-stone-400">
            Effective & Verified Date: {lastUpdated}
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* 1. What Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#14532d]" />
              <span>1. Information We Collect and Why</span>
            </h2>
            <p>
              We collect only the minimum necessary information required to deliver charitable aid, issue official donation receipts, organize verified field volunteers, and respond to community inquiries:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li>
                <strong className="text-stone-900">Donors:</strong> Name, email address, optional contact number, and payment transaction reference numbers. This information is legally necessary to generate numbered donation vouchers (Registration E/1341) and maintain our statutory audit ledger.
              </li>
              <li>
                <strong className="text-stone-900">Volunteers:</strong> Full name, email, phone number, address area, preferred skills, and shift attendance history to coordinate grassroots service drives.
              </li>
              <li>
                <strong className="text-stone-900">Beneficiaries & Aid Applicants:</strong> Name, contact coordinates, locality in Nashik, hardship category (e.g. medical, education, food), and verification notes required by our trust committee to prevent fraudulent aid distribution.
              </li>
              <li>
                <strong className="text-stone-900">Public Inquiries:</strong> Name, email, and message content submitted via our liaison form to respond to citizen questions.
              </li>
            </ul>
          </section>

          {/* 2. Security & Storage */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#14532d]" />
              <span>2. Security Architecture & Storage</span>
            </h2>
            <p>
              We implement industry-standard application security controls:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block text-xs">Password Hashing:</span>
                <span className="text-[11px] text-stone-600">All user passwords are encrypted using multi-round bcrypt hashing. Plaintext passwords are never saved or accessible.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block text-xs">Secure Sessions:</span>
                <span className="text-[11px] text-stone-600">Sessions utilize short-lived in-memory access tokens and HttpOnly, Secure, SameSite refresh cookies to prevent token theft.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block text-xs">Least-Privilege RBAC:</span>
                <span className="text-[11px] text-stone-600">Strict server-side authorization middleware separates public donors, volunteers, staff, and secretariat administrators.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block text-xs">Zero Data Selling:</span>
                <span className="text-[11px] text-stone-600">The Trust never sells, rents, monetizes, or trades personal information with any commercial entity or marketing broker.</span>
              </div>
            </div>
          </section>

          {/* 3. Third-Party Service Processors */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#14532d]" />
              <span>3. Third-Party Processors in Use</span>
            </h2>
            <p>
              We partner exclusively with verified infrastructure providers strictly for operational execution:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>
                <strong className="text-stone-900">Razorpay Software Pvt. Ltd.:</strong> Secure PCI-DSS compliant payment processing for voluntary donations. The Trust never touches or stores raw credit card numbers or UPI PINs.
              </li>
              <li>
                <strong className="text-stone-900">MongoDB Atlas:</strong> Encrypted-at-rest cloud database storage for platform records.
              </li>
              <li>
                <strong className="text-stone-900">Google Cloud Platform:</strong> Secure cloud server runtime and SSL/TLS termination.
              </li>
            </ul>
          </section>

          {/* 4. Cookies & Analytics */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#14532d]" />
              <span>4. Cookie and Analytics Policy</span>
            </h2>
            <p>
              Our website uses strictly necessary cookies to keep authenticated donor and admin sessions secure. If optional aggregate analytics (Google Analytics 4) is enabled, it requires prior user consent, respects IP anonymization, and never tracks personal identities or payment information. You may change your cookie preferences at any time using our on-page controls.
            </p>
          </section>

          {/* 5. Data Retention & Deletion */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#14532d]" />
              <span>5. Data Retention & Donor Rights</span>
            </h2>
            <p>
              In accordance with Maharashtra Public Trusts Act regulations and statutory accounting standards, donation voucher registers and financial ledgers are retained for mandatory audit periods. General inquiries, newsletter subscriptions, or non-financial user accounts may be updated or deleted upon request by emailing our secretariat.
            </p>
          </section>

          {/* 6. Contact Us */}
          <section className="space-y-3 pt-4 border-t border-stone-100 bg-stone-50 p-5 rounded-xl border border-stone-200">
            <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#14532d]" />
              <span>6. Contact Trust Secretariat</span>
            </h2>
            <p className="text-xs text-stone-600">
              If you have any questions regarding this Privacy Policy, your personal data, or statutory trust records, please contact our authorized trustees:
            </p>
            <div className="text-xs space-y-1 font-medium text-stone-800">
              <div><strong>Trust Name:</strong> {TRUST_BRAND.name}</div>
              <div><strong>Registration No.:</strong> {TRUST_BRAND.registrationNumber}</div>
              <div><strong>Email:</strong> <a href={`mailto:${TRUST_BRAND.contact.email}`} className="text-[#14532d] underline">{TRUST_BRAND.contact.email}</a></div>
              <div><strong>Phone:</strong> {TRUST_BRAND.contact.phoneDisplay}</div>
              <div><strong>Location:</strong> Nashik, Maharashtra, India</div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
