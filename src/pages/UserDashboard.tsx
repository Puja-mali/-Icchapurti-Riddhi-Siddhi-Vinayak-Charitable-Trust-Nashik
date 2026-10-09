import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Receipt,
  Download,
  Calendar,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Printer,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { TRUST_INFO } from "@/src/data/mockData";
import { DonationRecord, UserDonation } from "@/src/types";
import { DonationService } from "@/src/services/donationService";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { formatCurrency } from "@/src/lib/utils";
import { useLanguage } from "@/src/context/LanguageContext";
import { DonationImpactAssistant } from "@/src/components/donor/DonationImpactAssistant";
import { NotificationFeed } from "@/src/components/common/NotificationFeed";

export const UserDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [donations, setDonations] = useState<UserDonation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<UserDonation | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const records = await DonationService.getMyDonations();
        const mapped = records.map((r) => DonationService.toUserDonation(r));
        setDonations(mapped);
      } catch (err: any) {
        console.error("Failed to load personal donations:", err);
        setError("Unable to load donation history. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const totalDonated = donations
    .filter((d) => d.status === "Completed")
    .reduce((sum, d) => sum + d.amount, 0);

  const handlePrintReceipt = () => {
    window.print();
  };

  const displayName = user?.name || "Devoted Contributor";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Donor Welcome Banner */}
      <div className="bg-gradient-to-r from-[#143d2c] to-[#0c271c] text-white rounded-2xl p-6 sm:p-8 border border-emerald-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-amber-300/30">
              Donor Portal
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/60 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Your contributions directly fund registered trust initiatives. View verified transaction records and official electronic receipts below.
          </p>
        </div>

        <div className="z-10 shrink-0 flex flex-wrap items-center gap-2.5">
          <a href="#ai-allocation-assistant">
            <Button
              size="md"
              variant="outline"
              className="bg-black/30 hover:bg-black/50 text-amber-300 hover:text-amber-200 font-semibold text-xs border border-amber-300/40 cursor-pointer rounded-xl"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            >
              AI Allocation Advisor
            </Button>
          </a>
          <Link to="/donate">
            <Button
              size="md"
              className="bg-[#14532d] hover:bg-[#0f4023] text-white font-semibold text-xs border border-emerald-600/40 cursor-pointer rounded-xl"
              leftIcon={<Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />}
            >
              Make New Contribution
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Total Contributions
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            {formatCurrency(totalDonated)}
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Verified Gateway Captures
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Verified Receipts
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            {donations.filter((d) => d.status === "Completed").length} Receipts
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Issued with cryptographic hash
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Eligible Contribution Total
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            {formatCurrency(totalDonated)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Official Trust Contribution Record
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Audit Reconciliation
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-700 mt-1">
            Bank Reconciled
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Direct banking payment settlement
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI-Powered Donation Allocation & Impact Assistant */}
      <section id="ai-allocation-assistant" aria-label="AI-Powered Donation Allocation Assistant">
        <DonationImpactAssistant />
      </section>

      {/* Historical Contribution Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              Personal Contribution Ledger & Electronic Receipts
            </h2>
            <p className="text-xs text-stone-500">
              Verified digital receipts for personal recordkeeping and trust audit compliance.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
            <span className="text-xs font-medium">Fetching verified contribution ledger...</span>
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-stone-800">No Contributions Recorded Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              When you donate through the trust portal, your verified payment receipts and transaction records will appear here.
            </p>
            <div className="pt-2">
              <Link to="/donate">
                <Button size="sm" variant="primary" className="bg-emerald-700 text-white hover:bg-emerald-800 text-xs">
                  Support a Cause
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                <tr>
                  <th className="px-5 py-3">Receipt Number</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Cause / Purpose</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Gateway Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {donations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-stone-900">
                      {rec.receiptNumber}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">{rec.date}</td>
                    <td className="px-5 py-3.5 max-w-xs truncate">{rec.causeTitle}</td>
                    <td className="px-5 py-3.5 font-bold text-emerald-800">
                      {formatCurrency(rec.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      {rec.status === "Completed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Verified Success
                        </span>
                      ) : rec.status === "Processing" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Pending Gateway
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {rec.status === "Completed" && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(rec)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Official Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-time Notification Center */}
      <NotificationFeed />

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Trust Contribution Receipt: ${selectedReceipt.receiptNumber}`}
          description="Official Electronic Receipt issued by Shree Siddhivinayak Charitable Trust"
          size="md"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="border border-stone-300 rounded p-5 bg-stone-50 space-y-3">
              <div className="text-center border-b border-stone-200 pb-3">
                <div className="font-serif font-bold text-stone-900 text-sm">{TRUST_INFO.name.toUpperCase()}</div>
                <div className="text-[10px] text-stone-500 font-sans">Official Electronic Donation Receipt</div>
                <div className="text-[10px] text-stone-500 font-sans">Registration No: {TRUST_INFO.registrationNumber}</div>
              </div>

              <div className="space-y-1.5 pt-1 text-stone-800 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-stone-500">Receipt Number:</span>
                  <span className="font-bold text-emerald-900">{selectedReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Donor Name:</span>
                  <span className="font-semibold">{selectedReceipt.rawRecord?.donorName || displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Donor Email:</span>
                  <span>{selectedReceipt.rawRecord?.donorEmail || user?.email || "Recorded on File"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Purpose / Program:</span>
                  <span className="font-sans font-medium">{selectedReceipt.causeTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Contribution Amount:</span>
                  <span className="font-bold text-emerald-800">{formatCurrency(selectedReceipt.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Razorpay Payment ID:</span>
                  <span className="text-[10px] break-all">{selectedReceipt.rawRecord?.razorpayPaymentId || "Verified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Verification Timestamp:</span>
                  <span className="text-[10px]">
                    {selectedReceipt.rawRecord?.paymentVerifiedAt
                      ? new Date(selectedReceipt.rawRecord.paymentVerifiedAt).toLocaleString("en-IN")
                      : selectedReceipt.date}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-2 text-center text-[10px] text-stone-400 font-sans">
                Digitally authenticated and stored in the Siddhivinayak Charitable Trust financial ledger.
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 font-sans">
              <Button size="sm" variant="outline" onClick={handlePrintReceipt} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                Print Receipt
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedReceipt(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
