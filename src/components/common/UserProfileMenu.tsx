import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  ShieldCheck,
  Shield,
  KeyRound,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Heart,
  X,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { authService, UserRole } from '@/src/services/authService';
import { api, ApiError } from '@/src/services/api';
import { Modal } from '@/src/components/common/Modal';
import { Button } from '@/src/components/common/Button';
import { PushNotificationToggle } from '@/src/components/common/PushNotificationToggle';
import { formatDate } from '@/src/lib/utils';

interface UserProfileMenuProps {
  isTransparent?: boolean;
  className?: string;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  isTransparent = false,
  className = '',
}) => {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'view' | 'edit'>('view');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync profile edit fields when profile modal opens
  useEffect(() => {
    if (user && isProfileModalOpen) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setProfileFeedback(null);
    }
  }, [user, isProfileModalOpen]);

  if (!user) return null;

  // Role badge helper
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <ShieldCheck className="w-3 h-3 text-amber-700" />
            Trust Administrator
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Shield className="w-3 h-3 text-emerald-700" />
            Trust Staff
          </span>
        );
      case 'VOLUNTEER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-900 border border-blue-200">
            <UserCheck className="w-3 h-3 text-blue-700" />
            Verified Sevadar
          </span>
        );
      case 'DONOR':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
            <Heart className="w-3 h-3 text-emerald-700" />
            Community Donor
          </span>
        );
    }
  };

  const getDashboardPath = (role: UserRole) => {
    if (role === 'ADMIN' || role === 'STAFF') return '/admin';
    if (role === 'VOLUNTEER') return '/volunteer-portal';
    return '/dashboard';
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsOpen(false);
    try {
      const wasAdmin = user.role === 'ADMIN';
      await logout();
      navigate(wasAdmin ? '/admin/login' : '/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileFeedback(null);
    try {
      await api.patch('/users/me', {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      await refreshProfile();
      setProfileFeedback({ type: 'success', text: 'Profile details updated successfully!' });
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setProfileFeedback({
        type: 'error',
        text: err?.message || 'Failed to update profile details.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: 'error',
        text: 'New password must be at least 8 characters long.',
      });
      return;
    }

    setIsChangingPassword(true);
    setPasswordFeedback(null);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordFeedback({
        type: 'success',
        text: 'Password updated successfully! Please keep your new credentials safe.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setPasswordFeedback({
        type: 'error',
        text: err?.message || 'Failed to update password. Please check your current password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Get initials
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          isTransparent
            ? isOpen
              ? 'bg-white/20 text-white border-white/40 shadow-sm'
              : 'bg-white/10 text-stone-100 hover:bg-white/20 border-white/20 backdrop-blur-sm'
            : isOpen
            ? 'bg-stone-100 text-stone-900 border-stone-300 shadow-sm'
            : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
        }`}
      >
        <span className="w-6 h-6 rounded-full bg-[#14532d] text-amber-200 font-bold flex items-center justify-center text-[11px] shrink-0 border border-emerald-700/50">
          {initials}
        </span>
        <span className="max-w-[110px] truncate hidden sm:inline">{user.name || user.email}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Identity Header */}
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/60">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">{user.name || 'Trust Member'}</p>
                <p className="text-xs text-stone-500 font-mono truncate mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              {getRoleBadge(user.role)}
              <span className="text-[10px] text-stone-400 font-medium">Verified Account</span>
            </div>
          </div>

          {/* Links Section */}
          <div className="py-1">
            <Link
              to={getDashboardPath(user.role)}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#14532d] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#14532d]" />
              <span>
                {user.role === 'ADMIN' || user.role === 'STAFF'
                  ? 'Admin & Governance Portal'
                  : user.role === 'VOLUNTEER'
                  ? 'Volunteer Seva Portal'
                  : 'My Donations & Tax Receipts'}
              </span>
            </Link>

            <Link
              to="/impact-passport"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-[#14532d] transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                {user.role === 'DONOR' ? 'Track My Impact Passport' : 'Impact Passport Ledger'}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setProfileModalTab('view');
                setIsProfileModalOpen(true);
              }}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-stone-500" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setProfileModalTab('edit');
                setIsProfileModalOpen(true);
              }}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Edit Profile Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setPasswordFeedback(null);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setIsPasswordModalOpen(true);
              }}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-stone-500" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="pt-1 border-t border-stone-100">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors cursor-pointer"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: MY PROFILE */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={profileModalTab === 'view' ? "My Account Profile" : "Edit Profile Details"}
      >
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200">
            <button
              type="button"
              onClick={() => {
                setProfileModalTab('view');
                setProfileFeedback(null);
              }}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                profileModalTab === 'view'
                  ? 'border-[#14532d] text-[#14532d]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Overview & Verification
            </button>
            <button
              type="button"
              onClick={() => {
                setProfileModalTab('edit');
                setProfileFeedback(null);
              }}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                profileModalTab === 'edit'
                  ? 'border-[#14532d] text-[#14532d]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Edit Details
            </button>
          </div>

          {profileFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                profileFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {profileFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{profileFeedback.text}</span>
            </div>
          )}

          {profileModalTab === 'view' ? (
            /* VIEW TAB: Verified Details */
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500 font-medium">Full Name:</span>
                  <span className="font-semibold text-stone-900">{user.name || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500 font-medium">Registered Email:</span>
                  <span className="font-mono font-semibold text-stone-800 break-all">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500 font-medium">Phone Number:</span>
                  <span className="text-stone-800">{user.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500 font-medium">Database Role:</span>
                  <span>{getRoleBadge(user.role)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500 font-medium">Account Standing:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Verified & Active
                  </span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-500 font-medium">Member Since:</span>
                    <span className="text-stone-700">{formatDate(user.createdAt)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  <strong>Security Note:</strong> Account roles and verification statuses are strictly managed by Trust administrators and database validation rules to prevent unauthorized privilege escalation.
                </p>
              </div>

              <div className="pt-2">
                <PushNotificationToggle />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProfileModalTab('edit')}
                  className="text-xs"
                >
                  Edit Name / Phone
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="bg-[#14532d] hover:bg-[#166534] text-white text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* EDIT TAB: Update Name & Phone */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <p className="text-xs text-stone-600">
                Update your legal contact details. Security credentials and role assignments remain protected.
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter full legal name"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              <div className="pt-2">
                <PushNotificationToggle />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProfileModalTab('view');
                    setProfileFeedback(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingProfile}
                  className="bg-[#14532d] hover:bg-[#166534] text-white"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* MODAL 2: CHANGE PASSWORD */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Account Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <p className="text-xs text-stone-600">
            Ensure your new password contains at least 8 characters, an uppercase letter, a lowercase letter, and a number.
          </p>

          {passwordFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                passwordFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {passwordFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{passwordFeedback.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-9 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-9 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isChangingPassword}
              className="bg-[#14532d] hover:bg-[#166534] text-white"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
