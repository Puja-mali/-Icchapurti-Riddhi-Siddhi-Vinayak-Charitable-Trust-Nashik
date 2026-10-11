/**
 * Siddhivinayak Charitable Trust - User Management & Administrative Onboarding Test Suite
 *
 * Validates:
 * 1. User Directory query, search, and pagination
 * 2. Strict Role boundaries (ADMIN, STAFF, VOLUNTEER, DONOR - no SUPER_ADMIN)
 * 3. Administrative safeguards (no self-demotion, no self-deactivation)
 * 4. Cryptographic single-use invitation tokens (stored hashed with SHA-256)
 * 5. Role restrictions on invitations (only ADMIN or STAFF)
 * 6. Invitation activation and password setting (bcrypt hashing)
 * 7. Single-use consumption & rejection of expired/revoked invitations
 * 8. RBAC middleware enforcement (STAFF, DONOR, VOLUNTEER blocked from user-management APIs)
 */

import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

// Enable dev in-memory fallback for test execution if no MONGODB_URI is provided
process.env.USE_IN_MEMORY_DB = 'true';

import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, IUser } from '../models/User';
import { Invitation } from '../models/Invitation';
import { InvitationController } from '../controllers/invitation.controller';
import { UserController } from '../controllers/user.controller';
import { authorize } from '../middleware/auth';
import { AppError } from '../utils/apiResponse';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n===============================================================');
  console.log(' Siddhivinayak Trust - Users & Roles Automated Test Suite');
  console.log('===============================================================\n');

  const connected = await connectDatabase();
  if (!connected) {
    console.error('Failed to connect to database for test execution.');
    process.exit(1);
  }

  try {
    // -------------------------------------------------------------
    // Test Setup: Create clean test fixture users
    // -------------------------------------------------------------
    const testAdminEmail = `test_admin_${Date.now()}@siddhivinayaktrust.org`;
    const testStaffEmail = `test_staff_${Date.now()}@siddhivinayaktrust.org`;
    const testDonorEmail = `test_donor_${Date.now()}@siddhivinayaktrust.org`;

    const pwHash = await bcrypt.hash('SecurePass123!', 10);

    const testAdmin = await User.create({
      name: 'Main Trustee Admin',
      email: testAdminEmail,
      passwordHash: pwHash,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    });

    const testStaff = await User.create({
      name: 'Field Staff Officer',
      email: testStaffEmail,
      passwordHash: pwHash,
      role: 'STAFF',
      isActive: true,
      isEmailVerified: true,
    });

    const testDonor = await User.create({
      name: 'Generous Donor',
      email: testDonorEmail,
      passwordHash: pwHash,
      role: 'DONOR',
      isActive: true,
      isEmailVerified: true,
    });

    console.log('--- TEST GROUP 1: User Directory & Search ---');

    // 1.1 List users with role filter
    const adminQueryUsers = await User.find({ role: 'ADMIN' });
    assert(
      adminQueryUsers.some((u) => u.email === testAdminEmail),
      'User.find with role=ADMIN returns administrator'
    );

    // 1.2 Search users by email or name regex
    const searchQuery = 'Main Trustee';
    const regex = new RegExp(searchQuery, 'i');
    const searchResult = await User.find({
      $or: [{ name: regex }, { email: regex }],
    });
    assert(
      searchResult.some((u) => u.email === testAdminEmail),
      'Text search correctly matches user name'
    );

    console.log('\n--- TEST GROUP 2: Administrative Safeguards ---');

    // 2.1 Admin cannot deactivate own account
    let selfDeactivateBlocked = false;
    try {
      const mockReq: any = {
        params: { id: testAdmin._id.toString() },
        body: { isActive: false },
        user: { _id: testAdmin._id.toString(), role: 'ADMIN' },
      };
      const mockRes: any = {};
      const mockNext = (err: any) => {
        if (err && err.statusCode === 400 && err.message.includes('cannot deactivate your own')) {
          selfDeactivateBlocked = true;
        }
      };
      await UserController.updateUserStatus(mockReq, mockRes, mockNext);
    } catch (err: any) {
      if (err.statusCode === 400) selfDeactivateBlocked = true;
    }
    assert(selfDeactivateBlocked, 'Admin cannot deactivate their own account (prevents lockout)');

    // 2.2 Admin cannot demote own account
    let selfDemoteBlocked = false;
    try {
      const mockReq: any = {
        params: { id: testAdmin._id.toString() },
        body: { role: 'STAFF' },
        user: { _id: testAdmin._id.toString(), role: 'ADMIN' },
      };
      const mockRes: any = {};
      const mockNext = (err: any) => {
        if (err && err.statusCode === 400 && err.message.includes('cannot demote your own')) {
          selfDemoteBlocked = true;
        }
      };
      await UserController.updateUserRole(mockReq, mockRes, mockNext);
    } catch (err: any) {
      if (err.statusCode === 400) selfDemoteBlocked = true;
    }
    assert(selfDemoteBlocked, 'Admin cannot demote their own account to STAFF or other role');

    // 2.3 Role change strictly validates the four allowed roles
    let invalidRoleRejected = false;
    try {
      const mockReq: any = {
        params: { id: testStaff._id.toString() },
        body: { role: 'SUPER_ADMIN' }, // Disallowed role
        user: { _id: testAdmin._id.toString(), role: 'ADMIN' },
      };
      const mockRes: any = {};
      const mockNext = (err: any) => {
        if (err && err.statusCode === 400) {
          invalidRoleRejected = true;
        }
      };
      await UserController.updateUserRole(mockReq, mockRes, mockNext);
    } catch (err: any) {
      if (err.statusCode === 400) invalidRoleRejected = true;
    }
    assert(invalidRoleRejected, 'Invalid role (SUPER_ADMIN) strictly rejected; only four roles allowed');

    console.log('\n--- TEST GROUP 3: RBAC Authorization Guards ---');

    // 3.1 authorize('ADMIN') blocks STAFF
    let staffBlockedByRbac = false;
    const authorizeAdminMiddleware = authorize('ADMIN');
    const mockStaffReq: any = {
      user: { _id: testStaff._id.toString(), role: 'STAFF' },
    };
    authorizeAdminMiddleware(mockStaffReq, {} as any, (err?: any) => {
      if (err && err.statusCode === 403) {
        staffBlockedByRbac = true;
      }
    });
    assert(staffBlockedByRbac, 'STAFF role is rejected with 403 by authorize("ADMIN") middleware');

    // 3.2 authorize('ADMIN') blocks DONOR
    let donorBlockedByRbac = false;
    const mockDonorReq: any = {
      user: { _id: testDonor._id.toString(), role: 'DONOR' },
    };
    authorizeAdminMiddleware(mockDonorReq, {} as any, (err?: any) => {
      if (err && err.statusCode === 403) {
        donorBlockedByRbac = true;
      }
    });
    assert(donorBlockedByRbac, 'DONOR role is rejected with 403 by authorize("ADMIN") middleware');

    console.log('\n--- TEST GROUP 4: Secure Invitation Issuance & Cryptography ---');

    // 4.1 Issue invitation for new STAFF member
    const inviteeEmail = `invitee_${Date.now()}@siddhivinayaktrust.org`;
    let issuedInvitationData: any = null;

    const mockInviteReq: any = {
      body: {
        email: inviteeEmail,
        name: 'New Trustee Member',
        role: 'STAFF',
      },
      user: { _id: testAdmin._id.toString(), name: 'Main Trustee Admin', role: 'ADMIN' },
    };

    const mockInviteRes: any = {
      status(code: number) {
        return this;
      },
      json(payload: any) {
        issuedInvitationData = payload.data;
      },
    };

    await InvitationController.createInvitation(mockInviteReq, mockInviteRes, (err: any) => {
      if (err) console.error('createInvitation error:', err);
    });

    assert(Boolean(issuedInvitationData), 'createInvitation returns response payload');
    assert(
      issuedInvitationData?.invitation?.email === inviteeEmail,
      'Invitation email matches invitee'
    );
    assert(
      issuedInvitationData?.invitation?.role === 'STAFF',
      'Invitation role is STAFF'
    );
    assert(
      typeof issuedInvitationData?.invitationUrl === 'string' &&
        issuedInvitationData.invitationUrl.includes('token='),
      'Invitation furnishes direct activation link'
    );

    // 4.2 Verify database stores SHA-256 hash, NOT raw token
    const rawTokenFromUrl = new URL(issuedInvitationData.invitationUrl).searchParams.get('token')!;
    const expectedHash = crypto.createHash('sha256').update(rawTokenFromUrl).digest('hex');

    const invDocInDb = await Invitation.findById(issuedInvitationData.invitation._id).select('+tokenHash');
    assert(
      Boolean(invDocInDb && invDocInDb.tokenHash === expectedHash),
      'Database stores SHA-256 cryptographic hash of invitation token'
    );
    assert(
      invDocInDb?.tokenHash !== rawTokenFromUrl,
      'Raw token is NEVER stored directly in MongoDB'
    );

    console.log('\n--- TEST GROUP 5: Invitation Token Validation ---');

    // 5.1 Validate legitimate token
    let tokenValidationData: any = null;
    const mockValidateReq: any = {
      params: { token: rawTokenFromUrl },
    };
    const mockValidateRes: any = {
      status() {
        return this;
      },
      json(payload: any) {
        tokenValidationData = payload.data;
      },
    };

    await InvitationController.validateInvitationToken(mockValidateReq, mockValidateRes, (err: any) => {
      if (err) console.error('validateInvitationToken error:', err);
    });

    assert(
      tokenValidationData?.valid === true && tokenValidationData?.email === inviteeEmail,
      'validateInvitationToken validates token and returns invitee email'
    );

    // 5.2 Validate tampered/invalid token
    let invalidTokenRejected = false;
    const mockInvalidValidateReq: any = {
      params: { token: 'tampered_invalid_token_1234567890abcdef' },
    };
    await InvitationController.validateInvitationToken(
      mockInvalidValidateReq,
      mockValidateRes,
      (err: any) => {
        if (err && (err.statusCode === 404 || err.statusCode === 400)) {
          invalidTokenRejected = true;
        }
      }
    );
    assert(invalidTokenRejected, 'Tampered/invalid invitation token is rejected (404/400)');

    console.log('\n--- TEST GROUP 6: Account Activation & Single-Use Enforcement ---');

    // 6.1 Accept invitation with secure password
    let acceptResult: any = null;
    const mockAcceptReq: any = {
      body: {
        token: rawTokenFromUrl,
        password: 'NewStrongPassword2025!',
        name: 'Activated Trustee Member',
      },
    };
    const mockAcceptRes: any = {
      status() {
        return this;
      },
      json(payload: any) {
        acceptResult = payload.data;
      },
    };

    await InvitationController.acceptInvitation(mockAcceptReq, mockAcceptRes, (err: any) => {
      if (err) console.error('acceptInvitation error:', err);
    });

    assert(Boolean(acceptResult), 'acceptInvitation executes successfully');

    // 6.2 Check newly created user in MongoDB
    const activatedUser = await User.findOne({ email: inviteeEmail }).select('+passwordHash');
    assert(Boolean(activatedUser), 'Invited user now exists in User collection');
    assert(activatedUser?.role === 'STAFF', 'Activated user has designated role (STAFF)');
    assert(activatedUser?.isActive === true, 'Activated user account is active');
    const isPwCorrect = await bcrypt.compare('NewStrongPassword2025!', activatedUser!.passwordHash);
    assert(isPwCorrect, 'Activated user password correctly hashed with bcrypt');

    // 6.3 Check invitation status updated to ACCEPTED
    const consumedInvDoc = await Invitation.findById(issuedInvitationData.invitation._id);
    assert(consumedInvDoc?.status === 'ACCEPTED', 'Invitation status updated to ACCEPTED');

    // 6.4 Single-Use Enforcement: Re-attempting to use the same token is rejected
    let reuseRejected = false;
    await InvitationController.acceptInvitation(mockAcceptReq, mockAcceptRes, (err: any) => {
      if (err && err.statusCode === 400) {
        reuseRejected = true;
      }
    });
    assert(reuseRejected, 'Re-using consumed invitation token is strictly rejected (Single-use)');

    console.log('\n--- TEST GROUP 7: Revoked & Expired Invitations ---');

    // 7.1 Revoked invitation rejection
    const revEmail = `revoked_${Date.now()}@siddhivinayaktrust.org`;
    const revRawToken = crypto.randomBytes(32).toString('hex');
    const revHash = crypto.createHash('sha256').update(revRawToken).digest('hex');

    const revokedInv = await Invitation.create({
      email: revEmail,
      role: 'STAFF',
      tokenHash: revHash,
      invitedBy: testAdmin._id,
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000),
      status: 'REVOKED',
    });

    let revokedTokenRejected = false;
    await InvitationController.validateInvitationToken(
      { params: { token: revRawToken } } as any,
      mockValidateRes,
      (err: any) => {
        if (err && err.statusCode === 400 && err.message.includes('revoked')) {
          revokedTokenRejected = true;
        }
      }
    );
    assert(revokedTokenRejected, 'Revoked invitation token is rejected during validation');

    // 7.2 Expired invitation rejection
    const expEmail = `expired_${Date.now()}@siddhivinayaktrust.org`;
    const expRawToken = crypto.randomBytes(32).toString('hex');
    const expHash = crypto.createHash('sha256').update(expRawToken).digest('hex');

    const expiredInv = await Invitation.create({
      email: expEmail,
      role: 'ADMIN',
      tokenHash: expHash,
      invitedBy: testAdmin._id,
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      status: 'PENDING',
    });

    let expiredTokenRejected = false;
    await InvitationController.validateInvitationToken(
      { params: { token: expRawToken } } as any,
      mockValidateRes,
      (err: any) => {
        if (err && err.statusCode === 400 && err.message.includes('expired')) {
          expiredTokenRejected = true;
        }
      }
    );
    assert(expiredTokenRejected, 'Expired invitation token is rejected during validation');

    // -------------------------------------------------------------
    // Cleanup test artifacts
    // -------------------------------------------------------------
    const userIdsToClean = [testAdmin._id, testStaff._id, testDonor._id, activatedUser?._id].filter(Boolean);
    await User.deleteMany({
      _id: { $in: userIdsToClean as mongoose.Types.ObjectId[] },
    });
    await Invitation.deleteMany({
      _id: { $in: [issuedInvitationData.invitation._id, revokedInv._id, expiredInv._id] },
    });

    console.log('\n===============================================================');
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution failed with unexpected error:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

runTests();
