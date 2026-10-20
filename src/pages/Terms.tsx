import React from 'react';
import { FileText, ShieldCheck, Heart, AlertCircle, Building2, Gavel } from 'lucide-react';
import { SEO } from '@/src/components/common/SEO';
import { TRUST_BRAND } from '@/src/config/trustBrand';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  const lastUpdated = 'October 20, 2026';

  return (
    <>
      <SEO
        title="Terms & Conditions of Service"
        description="Terms and conditions, donation receipt policies, and public guidelines for Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik (Reg. No. E/1341)."
        canonicalPath="/terms"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#14532d] border border-emerald-200 text-xs font-semibold">
            <Gavel className="w-3.5 h-3.5" />
            <span>Public Trust Terms & Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Terms & Conditions of Use
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to the official public portal of {TRUST_BRAND.name} (Reg. No. {TRUST_BRAND.registrationNumber}). By accessing this website or contributing, you accept these terms.
          </p>
          <div className="text-[11px] font-medium text-stone-400">
            Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* 1. Voluntary Contributions & Receipts */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#14532d]" />
              <span>1. Voluntary Donations & Receipt Policy</span>
            </h2>
            <p>
              All financial donations made to {TRUST_BRAND.name} are voluntary contributions directly supporting our educational kits, healthcare camps, food distribution, senior citizen welfare, and grassroots social initiatives.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li>
                <strong>Electronic Receipt:</strong> An official electronic donation receipt bearing a unique verification reference number and trust registration details (E/1341) is generated only upon cryptographic verification of payment capture from the banking network.
              </li>
              <li>
                <strong>Tax Exemption Status:</strong> The Trust operates as an authorized public charitable trust under the Maharashtra Public Trusts Act. Section 80G tax deductions are not claimed or represented. Donors receive an official acknowledgment for their personal and statutory records.
              </li>
              <li>
                <strong>Refund Policy:</strong> In the rare event of an accidental duplicate transaction, banking error, or technical irregularity, donors may contact our secretariat within 7 days with the payment transaction ID for review and reversal.
              </li>
            </ul>
          </section>

          {/* 2. Trust Emblem & Intellectual Property */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14532d]" />
              <span>2. Trust Emblem & Copyright Notice</span>
            </h2>
            <p>
              The sacred emblem, artwork, logo, and organizational materials of {TRUST_BRAND.name} represent the official identity of the Trust. Unauthorized reproduction, commercial exploitation, or deceptive use of the Trust's name or emblem is strictly prohibited.
            </p>
          </section>

          {/* 3. Volunteer Participation */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#14532d]" />
              <span>3. Volunteer Guidelines & Ethics</span>
            </h2>
            <p>
              Volunteers registered with our platform agree to uphold high moral standards, respectful engagement with beneficiaries and senior citizens, and honest reporting of field activity. Certificates are awarded only for physically verified hours and authentic service.
            </p>
          </section>

          {/* 4. Governing Law */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Gavel className="w-4 h-4 text-[#14532d]" />
              <span>4. Governing Jurisdiction</span>
            </h2>
            <p>
              These terms and any operational disputes are governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in Nashik, Maharashtra.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Terms;
