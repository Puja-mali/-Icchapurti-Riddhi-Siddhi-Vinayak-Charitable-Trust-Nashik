import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useTrust } from "@/src/context/TrustContext";
import { authService } from "@/src/services/authService";
import { ApiError } from "@/src/services/api";
import { TrustEmblem } from "@/src/components/common/TrustEmblem";

export const ForgotPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const fromAdmin = searchParams.get("from") === "admin";
  const backTo = fromAdmin ? "/admin/login" : "/login";
  const backLabel = fromAdmin ? "Back to Secretariat & Board Login" : "Back to Sign In";

  const { trustProfile } = useTrust();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trustName = trustProfile?.trustName || "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid registered email address.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(cleanEmail);
      setIsSubmitted(true);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err?.message || "Unable to process password reset request. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        {/* Branding Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2">
            <TrustEmblem size="sm" />
            <span className="text-lg font-serif font-bold text-stone-900 tracking-tight">
              {trustName}
            </span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-stone-900 pt-1">
            {fromAdmin ? "Secretariat & Administrative Recovery" : "Account Recovery"}
          </h1>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            {fromAdmin
              ? "Reset your access credentials for Trust Administration, Secretariat & Board accounts."
              : "Reset your access password for supporter, volunteer, Secretariat, and administrative accounts."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-md p-6 sm:p-7 border border-stone-200 shadow-2xs">
          {isSubmitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-md text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Password Reset Request Received</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  If an account matches the email address <strong className="font-mono text-emerald-950">{email}</strong>, instructions to reset your password will be sent.
                </p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Please check your inbox and spam folder. Reset links are valid for <strong>60 minutes</strong>. If you do not see an email within a few minutes, check your spam or junk folder, verify that your address was entered correctly, or contact the Trust Secretariat.
                </p>
              </div>

              <div className="pt-2">
                <Link to={backTo} className="block">
                  <Button variant="outline" size="md" className="w-full text-xs font-semibold" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                    {backLabel}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] disabled:opacity-60"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Enter the email address you registered with to receive a secure reset link.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full font-semibold"
                  rightIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>

                <Link to={backTo} className="block text-center pt-2">
                  <span className="text-xs text-stone-600 hover:text-[#14532d] hover:underline font-medium inline-flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> {backLabel}
                  </span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
