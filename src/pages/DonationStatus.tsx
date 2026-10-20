import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Download,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  FileText,
  Home,
} from 'lucide-react';
import { Button } from '@/src/components/common/Button';
import { TrustEmblem } from '@/src/components/common/TrustEmblem';
import { SEO } from '@/src/components/common/SEO';
import { DonationService } from '@/src/services/donationService';
import { DonationRecord } from '@/src/types';
import { formatCurrency } from '@/src/lib/utils';
import { TRUST_BRAND } from '@/src/config/trustBrand';

export const DonationStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const receiptNumber = searchParams.get('receipt') || '';
  const donationId = searchParams.get('id') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [donation, setDonation] = useState<DonationRecord | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!orderId && !receiptNumber && !donationId) {
        setIsLoading(false);
        setErrorStatus('No donation reference identifier provided.');
        return;
      }

      setIsLoading(false);
      try {
        if (receiptNumber) {
          const rec = await DonationService.getReceipt(receiptNumber);
          setDonation(rec);
        } else if (donationId) {
          const rec = await DonationService.getDonationById(donationId);
          setDonation(rec);
        } else {
          // If only orderId is present, attempt lookup
          setErrorStatus('Please provide your verified receipt number to inspect contribution records.');
        }
      } catch (err: any) {
        setErrorStatus(err.message || 'Unable to retrieve donation verification record.');
      }
    };

    fetchStatus();
  }, [orderId, receiptNumber, donationId]);

  const handlePrint = () => {
    window.print();
  };

  const isVerifiedSuccess =
    donation &&
    (donation.status === 'PAID' || donation.status === 'SUCCESS' || donation.paymentStatus === 'PAID' || donation.paymentStatus === 'SUCCESS');

  return (
    <>
      <SEO
        title="Donation Verification Status"
        description="Verify official donation status, transaction confirmation, and auditable contribution receipt for Icchapurti Riddhi Siddhi Vinayak Charitable Trust."
        noIndex={true}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        {isLoading ? (
          <div className="text-center py-16 space-y-4">
            <TrustEmblem size="md" className="mx-auto" />
            <div className="w-8 h-8 rounded-full border-3 border-emerald-200 border-t-[#14532d] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-stone-700">
              Verifying transaction status with banking network...
            </p>
          </div>
        ) : isVerifiedSuccess && donation ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Success */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cryptographically Verified Contribution</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Thank You for Your Support
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Your generous donation has been captured and officially registered into our transparent ledger.
              </p>
            </div>

            {/* Official Receipt Card */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 print:shadow-none print:border-none">
              <div className="flex items-start justify-between border-b border-stone-100 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <TrustEmblem size="sm" />
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                      {TRUST_BRAND.name}
                    </h2>
                    <p className="text-[11px] text-stone-500 font-medium">
                      Nashik, Maharashtra • Reg. No. {TRUST_BRAND.registrationNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Official Receipt
                  </div>
                  <div className="text-xs font-mono font-bold text-stone-900">
                    {donation.receiptNumber || `SCT-REC-${donation._id.slice(-8).toUpperCase()}`}
                  </div>
                </div>
              </div>

              {/* Data Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-stone-500 font-medium block">Donor Name:</span>
                  <span className="font-bold text-stone-900 text-sm">
                    {donation.donorName || 'Generous Supporter'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-500 font-medium block">Contribution Amount:</span>
                  <span className="font-bold text-emerald-900 text-base font-mono">
                    {formatCurrency(donation.amount)}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-500 font-medium block">Designated Cause:</span>
                  <span className="font-semibold text-stone-900">
                    {typeof donation.causeId === 'object' && donation.causeId?.title
                      ? donation.causeId.title
                      : 'General Trust Social Welfare'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-500 font-medium block">Verification Date & Time:</span>
                  <span className="font-mono text-stone-800">
                    {donation.createdAt ? new Date(donation.createdAt).toLocaleString('en-IN') : 'Just now'}
                  </span>
                </div>

                {donation.razorpayPaymentId && (
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-stone-500 font-medium block">Banking Transaction Reference:</span>
                    <span className="font-mono text-[11px] text-stone-700 bg-stone-50 px-2 py-1 rounded border border-stone-200">
                      {donation.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>

              {/* Statutory Note */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <p className="font-semibold text-stone-800">Statutory Notice:</p>
                <p>
                  This official electronic voucher confirms receipt of voluntary donation towards the Trust's social, educational, and welfare initiatives. Note: Section 80G tax deductions are not claimed.
                </p>
              </div>

              {/* Print / Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="text-xs border-stone-300 gap-1.5"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Official Receipt
                </Button>

                <div className="flex items-center gap-2">
                  <Link to="/impact-passport">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-emerald-300 text-[#14532d] bg-emerald-50/50 hover:bg-emerald-100"
                    >
                      Track on Impact Passport
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs bg-[#14532d] hover:bg-[#0f4023] text-white"
                    >
                      Return Home
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Pending, Failed, or Unverified State */
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Donation Status Inquiry
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {errorStatus || 'If you completed payment recently, your transaction may still be completing confirmation with the banking gateway.'}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 max-w-md mx-auto text-left space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">No False Claims Policy:</span> The Trust only generates confirmed receipts after verified banking capture. Unverified or pending transactions are never recorded as completed.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Need assistance?</span> Contact our liaison desk with your banking reference at{' '}
                  <a href={`mailto:${TRUST_BRAND.contact.email}`} className="underline font-semibold text-[#14532d]">
                    {TRUST_BRAND.contact.email}
                  </a>.
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link to="/donate">
                <Button variant="primary" size="sm" className="text-xs bg-[#14532d] text-white">
                  Back to Donate Page
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm" className="text-xs border-stone-300">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DonationStatus;
