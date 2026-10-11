import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useTrust } from "@/src/context/TrustContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { ApiError } from "@/src/services/api";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { trustProfile } = useTrust();
  const { t } = useLanguage();

  const trustName = trustProfile?.trustName || "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"DONOR" | "VOLUNTEER">("DONOR");
  const [agreed, setAgreed] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side quick validations
    if (password.length < 8) {
      setErrorMessage(t.auth?.passwordTooShort || "Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t.auth?.passwordsDoNotMatch || "Passwords do not match.");
      return;
    }

    if (!agreed) {
      setErrorMessage("Please accept the terms and Transparency Charter to proceed.");
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role,
      });

      setSuccessMessage(t.auth?.registerSuccess || "Account registered successfully! Redirecting...");

      setTimeout(() => {
        if (user.role === "VOLUNTEER") {
          navigate("/volunteer-portal");
        } else {
          navigate("/dashboard");
        }
      }, 1200);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        if (err.errors && Array.isArray(err.errors)) {
          const map: Record<string, string> = {};
          err.errors.forEach((fe) => {
            if (fe.field) map[fe.field] = fe.message;
          });
          setFieldErrors(map);
        }
      } else {
        setErrorMessage(err?.message || "Registration failed. Please check server connectivity.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-4 sm:space-y-5">
        {/* Branding */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#14532d] text-white flex items-center justify-center font-serif font-bold text-sm">
              IT
            </div>
            <span className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
              {trustName}
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 pt-1">
            {t.auth?.registerTitle || "Create Supporter Account"}
          </h1>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            {t.auth?.registerSubtitle || "Register an official donor or volunteer account for auditable receipts and Impact Passports."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-md p-5 sm:p-7 border border-stone-200 shadow-2xs space-y-3.5 sm:space-y-4">
          {/* Public Role selector - Strictly DONOR or VOLUNTEER only */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
              Choose Account Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-md">
              <button
                type="button"
                onClick={() => setRole("DONOR")}
                className={`py-2 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  role === "DONOR"
                    ? "bg-white text-[#14532d] shadow-2xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {t.auth?.donorRole || "Philanthropist / Donor"}
              </button>
              <button
                type="button"
                onClick={() => setRole("VOLUNTEER")}
                className={`py-2 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  role === "VOLUNTEER"
                    ? "bg-white text-[#14532d] shadow-2xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {t.auth?.volunteerRole || "Student / Volunteer"}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 italic px-0.5">
              Note: Staff & Administrator accounts are provisioned via administrative command.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {t.auth?.fullName || "Full Legal Name"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth?.fullNamePlaceholder || "e.g. Sanya Kapoor"}
                  className={`w-full pl-8 pr-3 py-2 bg-stone-50 border rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] ${
                    fieldErrors.name ? "border-red-400 bg-red-50/40" : "border-stone-200"
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {t.auth?.email || "Email Address"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth?.emailPlaceholder || "sanya@example.com"}
                  className={`w-full pl-8 pr-3 py-2 bg-stone-50 border rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] ${
                    fieldErrors.email ? "border-red-400 bg-red-50/40" : "border-stone-200"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {t.auth?.phone || "Phone Number"}
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.auth?.phonePlaceholder || "+91 98765 43210"}
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {t.auth?.createPassword || "Create Password"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className={`w-full pl-8 pr-9 py-2 bg-stone-50 border rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] ${
                    fieldErrors.password ? "border-red-400 bg-red-50/40" : "border-stone-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {t.auth?.passwordRequirements || "At least 8 characters with 1 uppercase, 1 lowercase & 1 number"}
              </p>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {t.auth?.confirmPassword || "Confirm Password"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password..."
                  className="w-full pl-8 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-0.5">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#14532d] focus:ring-[#14532d] border-stone-300 mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-stone-600 leading-relaxed cursor-pointer">
                {t.auth?.termsConsent ||
                  "I agree to the Trust Transparency Charter and consent to verified recordkeeping."}
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="md"
                variant="primary"
                disabled={isLoading}
                className="w-full font-semibold h-9 sm:h-10 text-xs sm:text-sm justify-center cursor-pointer"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                {isLoading
                  ? t.auth?.registering || "Creating account..."
                  : t.auth?.registerButton || "Create Account"}
              </Button>
            </div>
          </form>

          <div className="pt-3 border-t border-stone-100 text-center text-xs text-stone-600">
            {t.auth?.alreadyHaveAccount || "Already have an account?"}{" "}
            <Link to="/login" className="font-semibold text-[#14532d] hover:underline">
              {t.auth?.signInButton || "Sign In"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
