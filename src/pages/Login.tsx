import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useTrust } from "@/src/context/TrustContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { ApiError } from "@/src/services/api";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, user } = useAuth();
  const { trustProfile } = useTrust();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated as DONOR or VOLUNTEER, redirect to their home portal
  useEffect(() => {
    if (user) {
      if (user.role === "DONOR") {
        const fromPath = (location.state as any)?.from?.pathname;
        const target = fromPath && typeof fromPath === "string" && !fromPath.startsWith("/admin") && fromPath !== "/login" && fromPath !== "/admin/login"
          ? fromPath
          : "/dashboard";
        navigate(target, { replace: true });
      } else if (user.role === "VOLUNTEER") {
        const fromPath = (location.state as any)?.from?.pathname;
        const target = fromPath && typeof fromPath === "string" && !fromPath.startsWith("/admin") && fromPath !== "/login" && fromPath !== "/admin/login"
          ? fromPath
          : "/volunteer-portal";
        navigate(target, { replace: true });
      }
    }
  }, [user, navigate, location.state]);

  const trustName = trustProfile?.trustName || "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate strictly for the public portal
      const authenticatedUser = await login({ email: cleanEmail, password, portal: "public" });

      // Safe return path for legitimate public users (DONOR / VOLUNTEER)
      const fromPath = (location.state as any)?.from?.pathname;
      const target =
        fromPath &&
        typeof fromPath === "string" &&
        !fromPath.startsWith("/admin") &&
        fromPath !== "/login" &&
        fromPath !== "/admin/login"
          ? fromPath
          : authenticatedUser.role === "VOLUNTEER"
          ? "/volunteer-portal"
          : "/dashboard";

      navigate(target, { replace: true });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err?.message || "Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-4 sm:space-y-5">
        {/* Branding header */}
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
            {t.auth.loginTitle}
          </h1>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            {t.auth.loginSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-md p-5 sm:p-7 border border-stone-200 shadow-2xs">
          <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4 text-xs sm:text-sm">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">{t.auth.email}</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  autoComplete="username"
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-stone-700">{t.auth.password}</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#14532d] hover:underline font-semibold cursor-pointer"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
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
                  className="w-full pl-8 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#14532d] disabled:opacity-60"
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

            <div className="pt-1.5">
              <Button
                type="submit"
                size="md"
                variant="primary"
                disabled={isLoading}
                className="w-full font-semibold cursor-pointer h-9 sm:h-10 text-xs sm:text-sm justify-center"
                rightIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              >
                {isLoading ? t.auth.loggingIn : t.auth.signInButton}
              </Button>
            </div>
          </form>

          <div className="mt-4 pt-3 border-t border-stone-100 text-center text-xs text-stone-600">
            {t.auth.dontHaveAccount}{" "}
            <Link to="/register" className="font-semibold text-[#14532d] hover:underline inline-block py-1">
              {t.auth.registerButton}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
