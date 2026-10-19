import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Trash2,
  Send,
  ExternalLink,
  Lock,
  UserCheck,
  Eye,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import {
  userService,
  UserSummary,
  InvitationItem,
  UserPagination,
  CreateInvitationResponse,
} from '@/src/services/userService';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/services/authService';
import { formatDate } from '@/src/lib/utils';
import { Modal } from '@/src/components/common/Modal';
import { Button } from '@/src/components/common/Button';

export const UsersManagementTab: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Sub-tabs: 'directory' | 'invitations'
  const [subTab, setSubTab] = useState<'directory' | 'invitations'>('directory');

  // Directory state
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [pagination, setPagination] = useState<UserPagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Invitations state
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [invPagination, setInvPagination] = useState<UserPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [isLoadingInvitations, setIsLoadingInvitations] = useState<boolean>(false);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState<boolean>(false);
  const [inviteFormError, setInviteFormError] = useState<string | null>(null);
  const [latestInviteResult, setLatestInviteResult] = useState<CreateInvitationResponse | null>(null);

  // Sensitive Action Modals
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    user: UserSummary;
    targetActive: boolean;
  } | null>(null);
  const [confirmRoleModal, setConfirmRoleModal] = useState<{
    user: UserSummary;
    targetRole: UserRole;
  } | null>(null);
  const [confirmRevokeModal, setConfirmRevokeModal] = useState<InvitationItem | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Fetch Users
  const fetchUsers = useCallback(
    async (pageToLoad: number = 1) => {
      if (!isAdmin) return;
      setIsLoadingUsers(true);
      setUserError(null);
      try {
        const data = await userService.listUsers({
          page: pageToLoad,
          limit: 15,
          search: searchQuery.trim() || undefined,
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        });
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err: any) {
        console.error('Failed to load users:', err);
        setUserError(err.message || 'Unable to retrieve users directory.');
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [isAdmin, searchQuery, roleFilter, statusFilter]
  );

  // Fetch Invitations
  const fetchInvitations = useCallback(
    async (pageToLoad: number = 1) => {
      if (!isAdmin) return;
      setIsLoadingInvitations(true);
      setInvitationError(null);
      try {
        const data = await userService.listInvitations({
          page: pageToLoad,
          limit: 20,
        });
        setInvitations(data.invitations);
        setInvPagination(data.pagination);
      } catch (err: any) {
        console.error('Failed to load invitations:', err);
        setInvitationError(err.message || 'Unable to retrieve administrative invitations.');
      } finally {
        setIsLoadingInvitations(false);
      }
    },
    [isAdmin]
  );

  useEffect(() => {
    if (isAdmin) {
      if (subTab === 'directory') {
        fetchUsers(1);
      } else {
        fetchInvitations(1);
      }
    }
  }, [isAdmin, subTab, fetchUsers, fetchInvitations]);

  // Handle invitation submission
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteFormError('Please enter a valid email address.');
      return;
    }

    setIsSubmittingInvite(true);
    setInviteFormError(null);
    try {
      const result = await userService.createInvitation({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        role: inviteRole,
      });

      setLatestInviteResult(result);
      showToast(
        'success',
        result.emailSent
          ? `Official invitation sent to ${inviteEmail}`
          : `Invitation created. Please deliver direct link to invitee.`
      );

      // Reset input fields
      setInviteEmail('');
      setInviteName('');
      setInviteRole('STAFF');
      fetchInvitations(1);
    } catch (err: any) {
      console.error('Failed to create invitation:', err);
      setInviteFormError(err.message || 'Could not issue invitation. Please try again.');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Handle Resend
  const handleResend = async (invitationId: string) => {
    setIsProcessingAction(true);
    try {
      const result = await userService.resendInvitation(invitationId);
      showToast(
        'success',
        result.emailSent
          ? `Invitation resent to ${result.invitation.email}`
          : `Token refreshed. Copy the direct activation link.`
      );
      setLatestInviteResult(result);
      fetchInvitations(invPagination.page);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to resend invitation.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Revoke
  const handleConfirmRevoke = async () => {
    if (!confirmRevokeModal) return;
    setIsProcessingAction(true);
    try {
      await userService.revokeInvitation(confirmRevokeModal._id);
      showToast('success', `Invitation for ${confirmRevokeModal.email} has been revoked.`);
      setConfirmRevokeModal(null);
      fetchInvitations(invPagination.page);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to revoke invitation.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Account Status Toggle (Deactivate / Reactivate)
  const handleConfirmStatusChange = async () => {
    if (!confirmStatusModal) return;
    setIsProcessingAction(true);
    try {
      const updated = await userService.updateUserStatus(
        confirmStatusModal.user._id,
        confirmStatusModal.targetActive
      );
      showToast(
        'success',
        `User ${updated.email} status updated to ${updated.isActive ? 'ACTIVE' : 'DEACTIVATED'}.`
      );
      setConfirmStatusModal(null);
      fetchUsers(pagination.page);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update user status.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Role Change
  const handleConfirmRoleChange = async () => {
    if (!confirmRoleModal) return;
    setIsProcessingAction(true);
    try {
      const updated = await userService.updateUserRole(
        confirmRoleModal.user._id,
        confirmRoleModal.targetRole
      );
      showToast('success', `User ${updated.email} role updated to ${updated.role}.`);
      setConfirmRoleModal(null);
      fetchUsers(pagination.page);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update user role.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Copy activation link to clipboard
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('success', 'Activation link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper for role styling
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            ADMIN
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            STAFF
          </span>
        );
      case 'VOLUNTEER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5 text-blue-700" />
            VOLUNTEER
          </span>
        );
      case 'DONOR':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            DONOR
          </span>
        );
    }
  };

  // Guard: If not ADMIN, display clear RBAC restriction notice
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-2xl mx-auto my-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-2">Restricted Access</h3>
        <p className="text-sm text-stone-600 mb-4">
          The <strong>Users & Roles</strong> management module is strictly restricted to authorized
          Trust Administrators (ADMIN). Staff officers and other roles do not possess permissions to
          invite administrative accounts, alter user roles, or manage directory accounts.
        </p>
        <p className="text-xs text-stone-500">
          If you require administrative privileges, please contact an existing Trust Administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-stone-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Header & Sub-Tabs */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-800 border border-amber-200">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Users & Roles Management</h2>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              Administer trust accounts, manage access permissions across the four official roles, and
              safely invite verified Administrators and Staff officers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (subTab === 'directory') fetchUsers(pagination.page);
                else fetchInvitations(invPagination.page);
              }}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-stone-500" />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setInviteFormError(null);
                setLatestInviteResult(null);
                setIsInviteModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-[#14532d] hover:bg-[#166534] text-white"
            >
              <UserPlus className="w-4 h-4" />
              Invite Admin / Staff
            </Button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => setSubTab('directory')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              subTab === 'directory'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            User Directory
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                subTab === 'directory' ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {pagination.total}
            </span>
          </button>
          <button
            onClick={() => setSubTab('invitations')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              subTab === 'invitations'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Mail className="w-4 h-4" />
            Pending Invitations
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                subTab === 'invitations' ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {invPagination.total}
            </span>
          </button>
        </div>
      </div>

      {/* Manual Delivery Notice Banner if latest invite could not deliver via SMTP */}
      {latestInviteResult && !latestInviteResult.emailSent && latestInviteResult.invitationUrl && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Direct Onboarding Link Generated
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Live email delivery is currently inactive (SMTP credentials not configured in
                  server/.env). Onboarding is completely unblocked: copy the verified single-use link
                  below and share it directly with the invitee (via private messaging or email).
                </p>
                <div className="mt-3 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-300 max-w-2xl">
                  <code className="text-xs text-stone-800 font-mono flex-1 truncate select-all">
                    {latestInviteResult.invitationUrl}
                  </code>
                  <button
                    onClick={() =>
                      handleCopyLink(
                        latestInviteResult.invitationUrl!,
                        latestInviteResult.invitation._id
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
                  >
                    {copiedId === latestInviteResult.invitation._id ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setLatestInviteResult(null)}
              className="text-amber-500 hover:text-amber-800 text-sm font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: USER DIRECTORY */}
      {subTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search query */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchUsers(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <Filter className="w-3.5 h-3.5" />
                Role:
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-medium px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
                <option value="VOLUNTEER">VOLUNTEER</option>
                <option value="DONOR">DONOR</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="deactivated">Deactivated Only</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUsers(1)}
                className="text-xs py-1.5"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            {isLoadingUsers ? (
              <div className="p-12 text-center text-stone-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#14532d] mb-3" />
                <p className="text-sm font-medium">Loading Trust User Directory from MongoDB...</p>
              </div>
            ) : userError ? (
              <div className="p-8 text-center text-red-600">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="font-semibold text-sm">{userError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(1)}
                  className="mt-3 text-xs"
                >
                  Retry Loading
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-stone-500">
                <Users className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <p className="text-base font-semibold text-stone-800">No users found</p>
                <p className="text-xs text-stone-500 mt-1">
                  Try adjusting your search criteria or role filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">User</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Registered</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {users.map((item) => {
                      const isSelf = item._id === currentUser?.id;
                      return (
                        <tr key={item._id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-stone-900 flex items-center gap-2">
                              {item.name || 'Unnamed User'}
                              {isSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-500 font-mono mt-0.5">
                              {item.email}
                            </div>
                            {item.phone && (
                              <div className="text-[11px] text-stone-400 mt-0.5">{item.phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">{getRoleBadge(item.role)}</td>
                          <td className="px-6 py-4">
                            {item.isActive ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                DEACTIVATED
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-stone-500">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Change Role Button */}
                              <button
                                onClick={() =>
                                  setConfirmRoleModal({
                                    user: item,
                                    targetRole: item.role,
                                  })
                                }
                                disabled={isSelf}
                                title={
                                  isSelf
                                    ? 'You cannot modify your own administrative role'
                                    : 'Change user role'
                                }
                                className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
                                  isSelf
                                    ? 'opacity-40 cursor-not-allowed bg-stone-50 border-stone-200 text-stone-400'
                                    : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
                                }`}
                              >
                                Change Role
                              </button>

                              {/* Toggle Active/Deactivated Button */}
                              {item.isActive ? (
                                <button
                                  onClick={() =>
                                    setConfirmStatusModal({
                                      user: item,
                                      targetActive: false,
                                    })
                                  }
                                  disabled={isSelf}
                                  title={
                                    isSelf
                                      ? 'You cannot deactivate your own account'
                                      : 'Deactivate account'
                                  }
                                  className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
                                    isSelf
                                      ? 'opacity-40 cursor-not-allowed bg-stone-50 border-stone-200 text-stone-400'
                                      : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                                  }`}
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setConfirmStatusModal({
                                      user: item,
                                      targetActive: true,
                                    })
                                  }
                                  className="text-xs px-2.5 py-1.5 rounded-md border font-medium bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 transition-colors"
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination footer */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total
                  users)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchUsers(pagination.page - 1)}
                    className="text-xs py-1"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchUsers(pagination.page + 1)}
                    className="text-xs py-1"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVITATIONS */}
      {subTab === 'invitations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Administrative Invitations</h3>
                <p className="text-xs text-stone-500">
                  Track single-use invitation tokens, renewal state, and expiration timestamps.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setInviteFormError(null);
                  setLatestInviteResult(null);
                  setIsInviteModalOpen(true);
                }}
                className="text-xs bg-[#14532d] hover:bg-[#166534] text-white flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                New Invitation
              </Button>
            </div>

            {isLoadingInvitations ? (
              <div className="p-12 text-center text-stone-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#14532d] mb-3" />
                <p className="text-sm font-medium">Loading invitations list...</p>
              </div>
            ) : invitationError ? (
              <div className="p-8 text-center text-red-600">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="font-semibold text-sm">{invitationError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchInvitations(1)}
                  className="mt-3 text-xs"
                >
                  Retry
                </Button>
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-12 text-center text-stone-500">
                <Mail className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <p className="text-base font-semibold text-stone-800">No invitations issued yet</p>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  Click the "New Invitation" button above to onboard an administrator or staff
                  officer with cryptographically verified single-use access.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Invitee</th>
                      <th className="px-6 py-3.5">Assigned Role</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Expires</th>
                      <th className="px-6 py-3.5">Invited By</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {invitations.map((inv) => {
                      const isExpired = new Date(inv.expiresAt) < new Date();
                      const status =
                        inv.status === 'PENDING' && isExpired ? 'EXPIRED' : inv.status;

                      return (
                        <tr key={inv._id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-stone-900">
                              {inv.name || 'Unnamed Invitee'}
                            </div>
                            <div className="text-xs text-stone-500 font-mono mt-0.5">{inv.email}</div>
                          </td>
                          <td className="px-6 py-4">{getRoleBadge(inv.role)}</td>
                          <td className="px-6 py-4">
                            {status === 'ACCEPTED' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ACCEPTED
                              </span>
                            ) : status === 'REVOKED' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                                <XCircle className="w-3.5 h-3.5 text-stone-500" />
                                REVOKED
                              </span>
                            ) : status === 'EXPIRED' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                <Clock className="w-3.5 h-3.5 text-red-600" />
                                EXPIRED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                PENDING
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-stone-500">
                            {formatDate(inv.expiresAt)}
                          </td>
                          <td className="px-6 py-4 text-xs text-stone-600">
                            {inv.invitedBy?.name || 'Administrator'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleResend(inv._id)}
                                    disabled={isProcessingAction}
                                    title="Resend invitation & refresh 72h window"
                                    className="text-xs px-2.5 py-1.5 rounded-md border font-medium bg-white hover:bg-stone-100 border-stone-200 text-stone-700 transition-colors flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3 h-3 text-stone-500" />
                                    Resend
                                  </button>
                                  <button
                                    onClick={() => setConfirmRevokeModal(inv)}
                                    disabled={isProcessingAction}
                                    title="Revoke invitation"
                                    className="text-xs px-2.5 py-1.5 rounded-md border font-medium bg-red-50 hover:bg-red-100 border-red-200 text-red-700 transition-colors"
                                  >
                                    Revoke
                                  </button>
                                </>
                              )}

                              {status === 'EXPIRED' && (
                                <button
                                  onClick={() => handleResend(inv._id)}
                                  disabled={isProcessingAction}
                                  className="text-xs px-2.5 py-1.5 rounded-md border font-medium bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 transition-colors flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Renew Link
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: INVITE ADMIN OR STAFF */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Trust Officer or Administrator"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <p className="text-xs text-stone-600">
            Send an authorized, cryptographically secure invitation. The invitee will receive a
            single-use activation link allowing them to safely configure their personal password.
          </p>

          {inviteFormError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{inviteFormError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. officer@example.org"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Anand Kulkarni"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Assigned Administrative Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex flex-col transition-all ${
                  inviteRole === 'STAFF'
                    ? 'border-[#14532d] bg-emerald-50/50 ring-1 ring-[#14532d]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">STAFF Officer</span>
                  <input
                    type="radio"
                    name="role"
                    value="STAFF"
                    checked={inviteRole === 'STAFF'}
                    onChange={() => setInviteRole('STAFF')}
                    className="accent-[#14532d]"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1">
                  Access to event coordination, volunteer records, and help request reviews.
                </span>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex flex-col transition-all ${
                  inviteRole === 'ADMIN'
                    ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Trust ADMIN</span>
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={inviteRole === 'ADMIN'}
                    onChange={() => setInviteRole('ADMIN')}
                    className="accent-amber-600"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1">
                  Full administrative authority including User Management, audits, and governance.
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingInvite}
              className="bg-[#14532d] hover:bg-[#166534] text-white flex items-center gap-1.5"
            >
              {isSubmittingInvite ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Token...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Issue Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CONFIRM DEACTIVATE / REACTIVATE */}
      <Modal
        isOpen={Boolean(confirmStatusModal)}
        onClose={() => setConfirmStatusModal(null)}
        title={confirmStatusModal?.targetActive ? 'Reactivate User Account' : 'Deactivate User Account'}
      >
        {confirmStatusModal && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              {confirmStatusModal.targetActive ? (
                <>
                  Are you sure you want to reactivate the account for{' '}
                  <strong>{confirmStatusModal.user.email}</strong>? They will immediately regain
                  system access with their existing role ({confirmStatusModal.user.role}).
                </>
              ) : (
                <>
                  Are you sure you want to deactivate the account for{' '}
                  <strong>{confirmStatusModal.user.email}</strong>? Their active sessions will be
                  terminated and future logins will be rejected immediately.
                </>
              )}
            </p>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1 text-stone-600">
              <div>
                <strong>User:</strong> {confirmStatusModal.user.name || 'Unnamed'} (
                {confirmStatusModal.user.email})
              </div>
              <div>
                <strong>Role:</strong> {confirmStatusModal.user.role}
              </div>
              <div>
                <strong>Current Status:</strong>{' '}
                {confirmStatusModal.user.isActive ? 'Active' : 'Deactivated'}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmStatusModal(null)}
                disabled={isProcessingAction}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmStatusChange}
                disabled={isProcessingAction}
                className={
                  confirmStatusModal.targetActive
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-red-700 hover:bg-red-800 text-white'
                }
              >
                {isProcessingAction ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : confirmStatusModal.targetActive ? (
                  'Confirm Reactivation'
                ) : (
                  'Confirm Deactivation'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: CONFIRM ROLE CHANGE */}
      <Modal
        isOpen={Boolean(confirmRoleModal)}
        onClose={() => setConfirmRoleModal(null)}
        title="Modify User Role & Privileges"
      >
        {confirmRoleModal && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600">
              Select the new role to grant to <strong>{confirmRoleModal.user.email}</strong>.
              Privileges are updated in real-time in MongoDB.
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Select Role</label>
              <select
                value={confirmRoleModal.targetRole}
                onChange={(e) =>
                  setConfirmRoleModal({
                    ...confirmRoleModal,
                    targetRole: e.target.value as UserRole,
                  })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              >
                <option value="ADMIN">ADMIN — Full Administrative Control</option>
                <option value="STAFF">STAFF — Trust Operations Officer</option>
                <option value="VOLUNTEER">VOLUNTEER — Sevadar & Shifts</option>
                <option value="DONOR">DONOR — Community Supporter</option>
              </select>
            </div>

            {confirmRoleModal.targetRole === 'ADMIN' && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Security Advisory:</strong> Granting ADMIN role permits this user to manage
                  other users, audit reports, and critical financial records.
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRoleModal(null)}
                disabled={isProcessingAction}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmRoleChange}
                disabled={isProcessingAction}
                className="bg-[#14532d] hover:bg-[#166534] text-white"
              >
                {isProcessingAction ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Apply Role Change'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: CONFIRM REVOKE INVITATION */}
      <Modal
        isOpen={Boolean(confirmRevokeModal)}
        onClose={() => setConfirmRevokeModal(null)}
        title="Revoke Administrative Invitation"
      >
        {confirmRevokeModal && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Are you sure you want to revoke the invitation issued to{' '}
              <strong>{confirmRevokeModal.email}</strong>? The single-use activation link will be
              rendered permanently invalid.
            </p>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRevokeModal(null)}
                disabled={isProcessingAction}
              >
                Keep Active
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmRevoke}
                disabled={isProcessingAction}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                {isProcessingAction ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Revoke Invitation'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
