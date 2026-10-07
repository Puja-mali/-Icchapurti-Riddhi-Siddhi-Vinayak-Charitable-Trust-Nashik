import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  FileCheck,
  CreditCard,
  Building,
  Smartphone,
  Info,
  ArrowRight,
  Download,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Printer,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { TRUST_INFO } from "@/src/data/mockData";
import { Cause, DonationRecord } from "@/src/types";
import { causeService } from "@/src/services/causeService";
import { DonationService, PaymentConfigResponse } from "@/src/services/donationService";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { PageHeader } from "@/src/components/common/PageHeader";
import { formatCurrency } from "@/src/lib/utils";
import { useLanguage } from "@/src/context/LanguageContext";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const Donate: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCauseParam = searchParams.get("cause") || "";

  const [causes, setCauses] = useState<Cause[]>([]);
  const [isLoadingCauses, setIsLoadingCauses] = useState(true);
  const [selectedCauseId, setSelectedCauseId] = useState(initialCauseParam);

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse | null>(null);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);

  const [selectedAmount, setSelectedAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState(user?.name || "");
  const [donorEmail, setDonorEmail] = useState(user?.email || "");
  const [donorPhone, setDonorPhone] = useState(user?.phone || "");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Real payment flow states
  const [flowState, setFlowState] = useState<
    "idle" | "creating_order" | "checkout_open" | "verifying" | "success" | "failed" | "cancelled" | "pending"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedDonation, setVerifiedDonation] = useState<DonationRecord | null>(null);

  // Sync logged in user details if available
  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.name);
      if (!donorEmail) setDonorEmail(user.email);
      if (!donorPhone && user.phone) setDonorPhone(user.phone);
    }
  }, [user]);

  // Load active causes and check Razorpay gateway status
  useEffect(() => {
    const initPage = async () => {
      try {
        setIsCheckingConfig(true);
        const config = await DonationService.getPaymentConfig();
        setPaymentConfig(config);
      } catch (err) {
        console.warn("Could not retrieve payment config:", err);
      } finally {
        setIsCheckingConfig(false);
      }

      try {
        setIsLoadingCauses(true);
        const response = await causeService.getCauses();
        const loadedCauses = response.causes || [];
        setCauses(loadedCauses);

        if (initialCauseParam) {
          const matched = loadedCauses.find(
            (c) => c.id === initialCauseParam || c.slug === initialCauseParam
          );
          if (matched) {
            setSelectedCauseId(matched.id);
          } else if (loadedCauses.length > 0) {
            setSelectedCauseId(loadedCauses[0].id);
          }
        } else if (loadedCauses.length > 0) {
          setSelectedCauseId(loadedCauses[0].id);
        }
      } catch (err) {
        console.error("Error loading causes for donate portal:", err);
      } finally {
        setIsLoadingCauses(false);
      }
    };

    initPage();
  }, [initialCauseParam]);

  const selectedCause =
    causes.find((c) => c.id === selectedCauseId || c.slug === selectedCauseId) ||
    causes[0] ||
    null;

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(0);
  };

  /**
   * Complete real Razorpay checkout and cryptographic server verification flow
   */
  const handleInitiateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (finalAmount < 1) {
      setErrorMessage("Donation amount must be at least ₹1.");
      return;
    }

    if (!donorName.trim() && !isAnonymous) {
      setErrorMessage("Please enter your name for the official trust receipt.");
      return;
    }

    if (!donorEmail.trim()) {
      setErrorMessage("Please enter a valid email address for receipt delivery.");
      return;
    }

    if (!paymentConfig?.isConfigured) {
      setErrorMessage(
        "Payment Gateway Configuration Required: Razorpay credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured in the server environment. Please contact the administrator to enable online payments."
      );
      return;
    }

    try {
      // Step 1: Create authentic Order on backend
      setFlowState("creating_order");
      const order = await DonationService.createOrder({
        amount: finalAmount,
        causeId: selectedCause?.id || null,
        donorName: isAnonymous ? "Anonymous Contributor" : donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: donorPhone.trim() || undefined,
        purpose: selectedCause ? `Support for: ${selectedCause.title}` : "General Trust Corpus",
      });

      // Step 2: Open Razorpay checkout modal
      setFlowState("checkout_open");
      const paymentResponse = await DonationService.openCheckout({
        order,
        themeColor: "#047857", // Emerald-700
        onDismiss: () => {
          setFlowState("idle");
        },
      });

      // Step 3: Verify signature cryptographically on backend and update Cause
      setFlowState("verifying");
      const verified = await DonationService.verifyPayment({
        razorpayOrderId: paymentResponse.razorpayOrderId,
        razorpayPaymentId: paymentResponse.razorpayPaymentId,
        razorpaySignature: paymentResponse.razorpaySignature,
      });

      // Step 4: Display verified success receipt modal
      setVerifiedDonation(verified);
      setFlowState("success");
    } catch (err: any) {
      if (err.message === "PAYMENT_DISMISSED_BY_USER") {
        setFlowState("cancelled");
        setErrorMessage(
          "Payment Cancelled: You closed the Razorpay checkout modal before completing the payment. No funds were debited from your account."
        );
        return;
      }
      console.error("Donation process error:", err);
      if (flowState === "verifying") {
        setFlowState("pending");
        setErrorMessage(
          "Payment Confirmation Pending: The payment was submitted, but verification is taking longer than expected. If your account was debited, your official receipt will appear in your donor dashboard once confirmed."
        );
      } else {
        setFlowState("failed");
        setErrorMessage(
          err.message || "An unexpected error occurred during transaction processing. Please try again."
        );
      }
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const isGatewayReady = Boolean(paymentConfig?.isConfigured);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      {/* 1. Page Header */}
      <PageHeader
        badge="Trust Contribution Portal • Razorpay Secure"
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
        title="Support Our Community Initiatives"
        description="Every contribution is recorded transparently in the trust database, allocated to verified program requirements, and issued an official electronic receipt."
      />

      {/* Gateway Status Alert if not configured */}
      {!isCheckingConfig && !isGatewayReady && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950 text-sm">Payment Gateway Setup Notice</p>
            <p className="leading-relaxed">
              Razorpay credentials (<code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">RAZORPAY_KEY_ID</code> &{" "}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">RAZORPAY_KEY_SECRET</code>) are not configured in the server environment.
              To accept live contributions, configure these variables in the server configuration. Simulated success has been disabled to protect financial audit integrity.
            </p>
          </div>
        </div>
      )}

      {/* Payment Cancelled Banner */}
      {flowState === "cancelled" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Payment Cancelled</p>
              <p className="leading-relaxed">
                {errorMessage ||
                  "The Razorpay checkout window was dismissed before completing the transaction. No charges were made."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFlowState("idle");
              setErrorMessage(null);
            }}
            className="text-amber-800 hover:text-amber-950 font-bold text-xs underline shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Payment Pending Banner */}
      {flowState === "pending" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sky-950">Payment Verification Pending</p>
              <p className="leading-relaxed">
                {errorMessage ||
                  "We are confirming the payment capture status with Razorpay. If your account was debited, your official receipt will be recorded automatically."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFlowState("idle");
              setErrorMessage(null);
            }}
            className="text-sky-800 hover:text-sky-950 font-bold text-xs underline shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Payment Failed / Error Banner */}
      {(flowState === "failed" || (errorMessage && flowState !== "cancelled" && flowState !== "pending")) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-950">Payment Failed</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFlowState("idle");
              setErrorMessage(null);
            }}
            className="text-rose-600 hover:text-rose-900 font-bold text-xs underline shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Donation Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
        <form onSubmit={handleInitiateDonation} className="p-6 sm:p-10 space-y-8">
          {/* 1. Select Program */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              1. Select Service Program / Cause
            </label>
            {isLoadingCauses ? (
              <div className="flex items-center gap-2 text-xs text-stone-500 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Loading verified programs...</span>
              </div>
            ) : causes.length === 0 ? (
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600">
                General Trust Corpus (No separate campaigns currently active)
              </div>
            ) : (
              <select
                value={selectedCauseId}
                onChange={(e) => setSelectedCauseId(e.target.value)}
                disabled={flowState !== "idle" && flowState !== "failed"}
                className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 disabled:opacity-50 cursor-pointer"
              >
                {causes.map((cause) => (
                  <option key={cause.id} value={cause.id}>
                    [{cause.category}] {cause.title} — Goal: {formatCurrency(cause.targetAmount)}
                  </option>
                ))}
              </select>
            )}
            {selectedCause && (
              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>Location: {selectedCause.location}</span>
                <span className="font-semibold text-emerald-800">
                  Raised so far: {formatCurrency(selectedCause.raisedAmount)}
                </span>
              </div>
            )}
          </div>

          {/* 2. Select Amount */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                2. Choose Contribution Amount (INR)
              </label>
              <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Official Digital Receipt Included
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    disabled={flowState !== "idle" && flowState !== "failed"}
                    onClick={() => handleAmountClick(amt)}
                    className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? "bg-[#14532d] text-white border-[#14532d] shadow-xs"
                        : "bg-stone-50/80 hover:bg-stone-100 text-stone-800 border-stone-200"
                    }`}
                  >
                    {formatCurrency(amt)}
                  </button>
                );
              })}
            </div>

            {/* Custom Amount */}
            <div className="pt-1">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Or enter custom amount in Rupees..."
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  disabled={flowState !== "idle" && flowState !== "failed"}
                  min="1"
                  step="1"
                  className="w-full pl-8 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* 3. Donor Particulars */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              3. Donor Particulars (For Official Trust Receipt)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-medium text-stone-600 block mb-1">
                  Full Name / Organization *
                </span>
                <input
                  type="text"
                  required={!isAnonymous}
                  disabled={isAnonymous || (flowState !== "idle" && flowState !== "failed")}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Ramesh K. Joshi"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 disabled:opacity-50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30"
                />
              </div>

              <div>
                <span className="text-[11px] font-medium text-stone-600 block mb-1">
                  Email Address (for e-Receipt) *
                </span>
                <input
                  type="email"
                  required
                  disabled={flowState !== "idle" && flowState !== "failed"}
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="donor@example.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 disabled:opacity-50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30"
                />
              </div>

              <div className="sm:col-span-2">
                <span className="text-[11px] font-medium text-stone-600 block mb-1">
                  Mobile Number (Optional)
                </span>
                <input
                  type="tel"
                  disabled={flowState !== "idle" && flowState !== "failed"}
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 disabled:opacity-50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                disabled={flowState !== "idle" && flowState !== "failed"}
                className="w-4 h-4 rounded text-[#14532d] focus:ring-[#14532d] border-stone-300"
              />
              <label htmlFor="anon" className="text-xs text-stone-600 cursor-pointer">
                Display as &quot;Anonymous Well-Wisher&quot; in public audits
              </label>
            </div>
          </div>

          {/* 4. Payment Gateway Channels */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                4. Payment Gateways Handled via Razorpay
              </label>
              <span className="text-[11px] text-stone-500 font-medium">256-Bit SSL Encrypted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-600">
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-left">
                <Smartphone className="w-4 h-4 mb-1.5 text-[#14532d]" />
                <div className="text-xs font-bold text-stone-900">UPI / QR</div>
                <div className="text-[10px] text-stone-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-left">
                <CreditCard className="w-4 h-4 mb-1.5 text-[#14532d]" />
                <div className="text-xs font-bold text-stone-900">Cards</div>
                <div className="text-[10px] text-stone-500 mt-0.5">RuPay, Visa, MasterCard</div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-left">
                <Building className="w-4 h-4 mb-1.5 text-[#14532d]" />
                <div className="text-xs font-bold text-stone-900">Net Banking</div>
                <div className="text-[10px] text-stone-500 mt-0.5">SBI, HDFC, ICICI, Axis & 50+ Banks</div>
              </div>
            </div>
          </div>

          {/* Legal/Receipt Disclaimer */}
          <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 text-[11px] text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800">Donation Transparency & Receipt Policy:</p>
            <p className="leading-relaxed">
              Official receipts are generated only after cryptographic verification of payment capture from the banking network.
              Tax deductibility under section 80G is subject to trust registration status and annual regulatory filings.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={!isGatewayReady || (flowState !== "idle" && flowState !== "failed")}
              isLoading={flowState === "creating_order" || flowState === "verifying"}
              className="w-full text-sm font-semibold bg-[#14532d] hover:bg-[#0f4023] text-white py-3.5 rounded-xl shadow-xs"
              leftIcon={
                flowState === "verifying" ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                ) : (
                  <Heart className="w-4 h-4 fill-current text-amber-300" />
                )
              }
            >
              {flowState === "creating_order"
                ? "Connecting to Payment Gateway..."
                : flowState === "checkout_open"
                ? "Awaiting Gateway Payment..."
                : flowState === "verifying"
                ? "Verifying Payment Cryptographically..."
                : `Proceed to Pay ${formatCurrency(finalAmount)}`}
            </Button>

            <div className="flex items-center justify-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#14532d]" />
                Secure Razorpay Checkout • Verified Ledger
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                Official Trust e-Receipt
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* OFFICIAL VERIFIED RECEIPT MODAL */}
      {verifiedDonation && (
        <Modal
          isOpen={!!verifiedDonation}
          onClose={() => setVerifiedDonation(null)}
          title="Contribution Verified & Digital Receipt Issued"
          description="Your donation has been confirmed by the payment gateway and recorded in the trust database."
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  Payment Captured & Verified
                </h4>
                <p className="text-xs text-stone-600">
                  Receipt #{verifiedDonation.receiptNumber} generated on{" "}
                  {new Date(verifiedDonation.paymentVerifiedAt || verifiedDonation.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Generated Official Receipt Slip */}
            <div className="bg-stone-50 rounded-md p-5 border border-stone-200 text-xs space-y-3 font-mono print:p-0 print:border-none">
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <div>
                  <span className="font-bold text-stone-900 text-sm block">
                    {TRUST_INFO.name.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-stone-500 font-sans block">
                    Official Charitable Trust Contribution Receipt
                  </span>
                </div>
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                  VERIFIED SUCCESS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-stone-700 pt-1">
                <div>
                  <span className="text-stone-400 block text-[10px]">DONOR</span>
                  <span className="font-semibold text-stone-900">{verifiedDonation.donorName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">AMOUNT</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {formatCurrency(verifiedDonation.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">PROGRAM / PURPOSE</span>
                  <span className="font-sans text-xs font-medium text-stone-900">
                    {typeof verifiedDonation.causeId === "object" && verifiedDonation.causeId !== null
                      ? verifiedDonation.causeId.title
                      : verifiedDonation.purpose || "General Trust Corpus"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">TRANSACTION / PAYMENT ID</span>
                  <span className="text-xs text-stone-800 break-all">
                    {verifiedDonation.razorpayPaymentId || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">RAZORPAY ORDER ID</span>
                  <span className="text-xs text-stone-800 break-all">
                    {verifiedDonation.razorpayOrderId || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">RECEIPT NUMBER</span>
                  <span className="text-xs font-bold text-emerald-800">
                    {verifiedDonation.receiptNumber}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-[10px] text-stone-500 font-sans">
                <span>Verified in Trust Database via HMAC-SHA256</span>
                <span>Audit Status: Confirmed</span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs"
                onClick={handlePrintReceipt}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Receipt
              </Button>

              <Link
                to={`/user/dashboard`}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto text-xs bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View in My Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
