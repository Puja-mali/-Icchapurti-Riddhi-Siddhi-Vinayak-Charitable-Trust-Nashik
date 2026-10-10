import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  User,
  Building,
} from 'lucide-react';
import { userService, ValidateInvitationResponse } from '@/src/services/userService';
import { Button } from '@/src/components/common/Button';

export const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<ValidateInvitationResponse | null>(null);

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setValidationError('Activation token missing. Please use the complete link provided in your invitation.');
      return;
    }

    const validate = async () => {
      setIsValidating(true);
      setValidationError(null);
      try {
        const data = await userService.validateInvitation(token);
        setInvitationData(data);
        if (data.name) setFullName(data.name);
      } catch (err: any) {
        console.error('Failed to validate invitation token:', err);
        setValidationError(
          err.message ||
            'This invitation link is invalid, expired, or has already been used. Please contact a Trust Administrator.'
        );
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [token]);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid =
    hasMinLength && hasUpperCase && hasLowerCase && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!isFormValid) {
      setFormError('Please ensure your password satisfies all security criteria and matches the confirmation.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await userService.acceptInvitation({
        token,
        password,
        name: fullName.trim() || undefined,
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Failed to accept invitation:', err);
      setFormError(err.message || 'Failed to activate account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#faf8f5]">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#14532d] text-white shadow-md mb-3">
            <Building className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Icchapurti Riddhi Siddhi Vinayak
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Charitable Trust, Nashik • Official Trust Operations
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          {isValidating ? (
            <div className="py-12 text-center text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#14532d] mb-3" />
              <p className="text-sm font-medium">Verifying invitation credentials...</p>
              <p className="text-xs text-stone-400 mt-1">
                Checking cryptographic token validity and role authorization
              </p>
            </div>
          ) : validationError ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Invitation Link Invalid</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{validationError}</p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={() => navigate('/admin/login')}
                  className="w-full text-xs bg-[#14532d] hover:bg-[#166534] text-white"
                >
                  Go to Administrative Login
                </Button>
                <Link
                  to="/"
                  className="text-xs text-stone-500 hover:text-stone-800 text-center py-1 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">Account Activated Successfully!</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Your credentials have been securely registered as an authorized{' '}
                  <strong className="text-emerald-800">
                    {invitationData?.role === 'ADMIN' ? 'Trust Administrator' : 'Trust Staff Officer'}
                  </strong>{' '}
                  ({invitationData?.role}).
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 font-mono">
                {invitationData?.email}
              </div>

              <Button
                variant="primary"
                onClick={() => navigate('/admin/login')}
                className="w-full bg-[#14532d] hover:bg-[#166534] text-white flex items-center justify-center gap-2 py-3"
              >
                <span>Proceed to Administrative Login</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Authorized Invitation
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      invitationData?.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {invitationData?.role === 'ADMIN' ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Shield className="w-3.5 h-3.5" />
                    )}
                    Role: {invitationData?.role}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-stone-900">Activate Your Account</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Set your official password to finalize your access.
                </p>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Verified Email (Read-Only) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Authorized Email</label>
                <input
                  type="text"
                  disabled
                  value={invitationData?.email || ''}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-100 text-stone-600 font-mono cursor-not-allowed"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Create Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                <span className="font-bold text-stone-700 block mb-1">Security Criteria:</span>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? 'text-emerald-700 font-semibold' : 'text-stone-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasMinLength ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  />
                  At least 8 characters
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasUpperCase ? 'text-emerald-700 font-semibold' : 'text-stone-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasUpperCase ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  />
                  At least one uppercase letter (A-Z)
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasLowerCase ? 'text-emerald-700 font-semibold' : 'text-stone-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasLowerCase ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  />
                  At least one lowercase letter (a-z)
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasNumber ? 'text-emerald-700 font-semibold' : 'text-stone-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasNumber ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  />
                  At least one numerical digit (0-9)
                </div>
                {password.length > 0 && confirmPassword.length > 0 && (
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-red-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordsMatch ? 'bg-emerald-600' : 'bg-red-500'
                      }`}
                    />
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-[#14532d] hover:bg-[#166534] text-white py-2.5 font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Activating Profile...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Activate Account & Access Portal
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
