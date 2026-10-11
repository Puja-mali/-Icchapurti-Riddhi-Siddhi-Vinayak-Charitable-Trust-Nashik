import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useTrust } from "@/src/context/TrustContext";
import { ApiError } from "@/src/services/api";

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, user } = useAuth();
  const { trustProfile } = useTrust();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in as ADMIN or STAFF, redirect immediately
  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "STAFF")) {
      const fromPath = (location.state as any)?.from?.pathname;
      navigate(fromPath && fromPath !== "/admin/login" ? fromPath : "/admin", { replace: true });
    }
  }, [user, navigate, location.state]);

  const trustName = trustProfile?.trustName || "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik";

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter your administrator email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const loggedUser = await login({ email: cleanEmail, password });

      if (loggedUser.role === "ADMIN" || loggedUser.role === "STAFF") {
        const fromPath = (location.state as any)?.from?.pathname;
        navigate(fromPath && fromPath !== "/admin/login" ? fromPath : "/admin", { replace: true });
      } else {
        await logout();
        setErrorMessage(
          "Access denied: Your account is registered with the role of '" +
            loggedUser.role +
            "', which does not have administrative privileges. Please sign in at the standard donor dashboard."
        );
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err?.message || "Failed to sign in. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-amber-200 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Trust Administration Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 pt-1">
            Secretariat & Board Login
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
            Private management portal for {trustName}. Authorized personnel and trustees only.
          </p>
        </div>

        {/* Active Public Session Notice (shown if already logged in as DONOR/VOLUNTEER) */}
        {user && (user.role === "DONOR" || user.role === "VOLUNTEER") && (
          <div className="p-3.5 bg-stone-100 border border-stone-300 rounded-xl text-xs text-stone-800 space-y-2.5 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#14532d] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">Signed in as {user.role}</p>
                <p className="text-stone-600 mt-0.5 leading-relaxed">
                  You are currently authenticated with a public supporter account (<span className="font-mono font-medium">{user.email}</span>). Administrative login requires authorized Secretariat or Trustee credentials.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between gap-2">
              <Link
                to={user.role === "VOLUNTEER" ? "/volunteer-portal" : "/dashboard"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14532d] text-white hover:bg-[#0f4023] font-semibold text-xs shadow-2xs"
              >
                <span>Go to Supporter Portal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm">
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trust.org"
                  autoComplete="username"
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-8 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]/20 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="md"
                variant="primary"
                disabled={isLoading}
                className="w-full font-semibold rounded-xl bg-[#14532d] hover:bg-[#0f4023] shadow-xs cursor-pointer"
                rightIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              >
                {isLoading ? "Verifying Credentials..." : "Authenticate as Admin"}
              </Button>
            </div>
          </form>

              <div className="mt-5 pt-4 border-t border-stone-100 text-center text-[11px] text-stone-500">
                Trust Governance • Role-Based Access Control Strictly Enforced
              </div>
        </div>
      </div>
    </div>
  );
};
