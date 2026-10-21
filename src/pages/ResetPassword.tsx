import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useTrust } from "@/src/context/TrustContext";
import { authService } from "@/src/services/authService";
import { ApiError } from "@/src/services/api";
import { TrustEmblem } from "@/src/components/common/TrustEmblem";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { trustProfile } = useTrust();

  const token = searchParams.get("token") || "";

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const trustName = trustProfile?.trustName || "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik";

  // Validate token on mount
  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      if (!token) {
        if (isMounted) {
          setValidationError("Password reset token is missing from the link. Please request a new link.");
          setIsValidating(false);
        }
        return;
      }

      try {
        const result = await authService.validateResetToken(token);
        if (isMounted) {
          setIsTokenValid(true);
          setMaskedEmail(result.email);
          if (result.role) {
            setUserRole(result.role);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setIsTokenValid(false);
          setValidationError(
            err?.message || "This password reset link is invalid, expired, or has already been used. Please request a new one."
          );
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err?.message || "Failed to reset password. The link may have expired.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        {/* Branding header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2">
            <TrustEmblem size="sm" />
            <span className="text-lg font-serif font-bold text-stone-900 tracking-tight">
              {trustName}
            </span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-stone-900 pt-1">
            Choose New Password
          </h1>
          <p className="text-xs text-stone-600">
            Create a strong, confidential password for your verified Trust account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-md p-6 sm:p-7 border border-stone-200 shadow-2xs">
          {isValidating ? (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#14532d] mx-auto" />
              <p className="text-xs text-stone-600">Verifying security token with trust database...</p>
            </div>
          ) : !isTokenValid ? (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-md text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Invalid or Expired Reset Link</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {validationError}
                </p>
              </div>

              <div className="pt-2">
                <Link to="/forgot-password" className="block">
                  <Button variant="primary" size="md" className="w-full text-xs font-semibold">
                    Request a New Reset Link
                  </Button>
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Password Reset Successfully!</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your password has been securely updated in the Trust database. All prior sessions have been invalidated for your safety.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                {userRole === "ADMIN" || userRole === "STAFF" || searchParams.get("from") === "admin" ? (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate("/admin/login", { replace: true })}
                      className="w-full text-xs font-semibold bg-[#14532d] hover:bg-[#0f4023]"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Proceed to Secretariat & Board Login
                    </Button>
                    <Link
                      to="/login"
                      className="block text-center text-[11px] text-stone-500 hover:text-[#14532d] hover:underline"
                    >
                      Supporter or Volunteer? Sign in here →
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate("/login", { replace: true })}
                      className="w-full text-xs font-semibold"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Proceed to Sign In
                    </Button>
                    <Link
                      to="/admin/login"
                      className="block text-center text-[11px] text-stone-500 hover:text-[#14532d] hover:underline"
                    >
                      Secretariat or Board Member? Sign in here →
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {maskedEmail && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-md flex items-center justify-between text-xs">
                  <span className="text-stone-500">Account:</span>
                  <span className="font-mono font-semibold text-stone-800">{maskedEmail}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              <div>
                <label className="font-semibold text-stone-700 block mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full pl-8 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full font-semibold"
                  rightIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                >
                  {isLoading ? "Updating Password..." : "Update Password & Sign In"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
