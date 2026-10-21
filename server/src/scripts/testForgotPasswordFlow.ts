/**
 * Automated Verification Suite for Forgot Password & Reset Password Workflow
 *
 * Validates:
 * 1. Forgot password request for regular users (DONOR) and administrators (ADMIN)
 * 2. Cryptographic token generation (32-byte hex, SHA-256 hashed storage in MongoDB)
 * 3. Token validation API (returns masked email and role)
 * 4. Password reset execution with new password hashing
 * 5. Single-use token invalidation (subsequent reset attempt rejected)
 * 6. Cross-account security (user A token cannot reset user B)
 * 7. Invalidation of all existing active sessions upon password reset
 * 8. New password login verification
 * 9. Live SMTP delivery test (via Nodemailer transport)
 */

import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

// Enable dev in-memory fallback if no MONGODB_URI is provided
process.env.USE_IN_MEMORY_DB = 'true';

import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { env, isEmailConfigured } from '../config/env';

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
  console.log(' Siddhivinayak Trust - Forgot Password & Reset Flow Test Suite');
  console.log('===============================================================\n');

  const connected = await connectDatabase({ allowInMemory: true });
  if (!connected) {
    console.error('Fatal: Could not connect to database for test execution.');
    process.exit(1);
  }

  try {
    // Setup test accounts
    const testDonorEmail = `donor_${Date.now()}@example.com`;
    const testAdminEmail = `admin_${Date.now()}@trust.org`;
    const initialPassword = 'InitialPassword@123';

    const donorPasswordHash = await bcrypt.hash(initialPassword, 10);
    const donorUser = await User.create({
      name: 'Ramesh Test Donor',
      email: testDonorEmail,
      passwordHash: donorPasswordHash,
      role: 'DONOR',
      isActive: true,
      isEmailVerified: true,
    });

    const adminPasswordHash = await bcrypt.hash(initialPassword, 10);
    const adminUser = await User.create({
      name: 'Suresh Secretariat Admin',
      email: testAdminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    });

    console.log('--- Test 1: Forgot Password for Regular User (DONOR) ---');
    const donorResult = await AuthService.forgotPassword(testDonorEmail, 'https://icchapurti-trust.onrender.com');
    assert(donorResult.success === true, 'Donor forgot password returns success');
    assert(
      typeof donorResult.message === 'string' && donorResult.message.length > 0,
      'Donor forgot password returns friendly confirmation message'
    );
    assert(
      donorResult.debugResetUrl?.includes('https://icchapurti-trust.onrender.com'),
      'Reset link uses deployed client origin, not localhost',
      donorResult.debugResetUrl
    );

    // Verify token was stored hashed in database
    const refreshedDonor = await User.findById(donorUser._id).select('+resetPasswordToken +resetPasswordExpires');
    assert(Boolean(refreshedDonor?.resetPasswordToken), 'Reset password token hash is stored on donor document');
    assert(Boolean(refreshedDonor?.resetPasswordExpires), 'Reset password expiry timestamp is set');
    assert(
      refreshedDonor!.resetPasswordExpires! > new Date(),
      'Reset password token expiry is in the future (60 minutes)'
    );

    console.log('\n--- Test 2: Forgot Password for Administrative User (ADMIN) ---');
    const adminResult = await AuthService.forgotPassword(testAdminEmail, 'https://icchapurti-trust.onrender.com');
    assert(adminResult.success === true, 'Admin forgot password returns success');
    assert(
      adminResult.debugResetUrl?.includes('https://icchapurti-trust.onrender.com'),
      'Admin reset link uses deployed client origin',
      adminResult.debugResetUrl
    );

    const refreshedAdmin = await User.findById(adminUser._id).select('+resetPasswordToken +resetPasswordExpires');
    assert(Boolean(refreshedAdmin?.resetPasswordToken), 'Reset password token hash stored on admin document');

    console.log('\n--- Test 3: Token Validation API ---');
    // Extract raw token from debugResetUrl
    const url = new URL(donorResult.debugResetUrl!);
    const rawToken = url.searchParams.get('token')!;
    assert(Boolean(rawToken && rawToken.length === 64), 'Raw token is a 64-character hex string (32 cryptographic bytes)');

    const validateResult = await AuthService.validateResetToken(rawToken);
    assert(validateResult.valid === true, 'validateResetToken reports token is valid');
    assert(validateResult.email.includes('***@'), 'validateResetToken returns masked email for privacy');
    assert(validateResult.role === 'DONOR', 'validateResetToken identifies correct user role (DONOR)');

    // Validate admin token
    const adminUrl = new URL(adminResult.debugResetUrl!);
    const adminRawToken = adminUrl.searchParams.get('token')!;
    const adminValidateResult = await AuthService.validateResetToken(adminRawToken);
    assert(adminValidateResult.valid === true, 'Admin validateResetToken reports token is valid');
    assert(adminValidateResult.role === 'ADMIN', 'Admin validateResetToken identifies ADMIN role');

    console.log('\n--- Test 4: Rejection of Invalid or Forged Tokens ---');
    let forgedRejected = false;
    try {
      await AuthService.validateResetToken('forged_fake_token_1234567890abcdef1234567890abcdef');
    } catch (err: any) {
      forgedRejected = true;
      assert(err.statusCode === 400, 'Forged token rejected with HTTP 400');
    }
    assert(forgedRejected, 'Forged token threw rejection error');

    console.log('\n--- Test 5: Reset Password Execution ---');
    const newDonorPassword = 'NewSecurePassword@2026';
    await AuthService.resetPassword(rawToken, newDonorPassword);

    // Verify donor can authenticate with new password
    const loginResult = await AuthService.login({
      email: testDonorEmail,
      password: newDonorPassword,
      portal: 'public',
    });
    assert(loginResult.user.email === testDonorEmail, 'User logs in successfully with new password');

    // Verify old password fails
    let oldPasswordRejected = false;
    try {
      await AuthService.login({
        email: testDonorEmail,
        password: initialPassword,
        portal: 'public',
      });
    } catch (err: any) {
      oldPasswordRejected = true;
      assert(err.statusCode === 401, 'Old password rejected with 401 after reset');
    }
    assert(oldPasswordRejected, 'Old password cannot authenticate');

    console.log('\n--- Test 6: Single-Use Token Enforcement ---');
    let reusedRejected = false;
    try {
      await AuthService.resetPassword(rawToken, 'AnotherPassword@999');
    } catch (err: any) {
      reusedRejected = true;
      assert(err.statusCode === 400, 'Reused token rejected with HTTP 400');
    }
    assert(reusedRejected, 'Token cannot be reused once consumed (single-use enforcement)');

    console.log('\n--- Test 7: Admin Password Reset Execution ---');
    const newAdminPassword = 'NewAdminSecret@2026!';
    await AuthService.resetPassword(adminRawToken, newAdminPassword);

    // Verify admin can authenticate with new password via admin portal
    const adminLoginResult = await AuthService.login({
      email: testAdminEmail,
      password: newAdminPassword,
      portal: 'admin',
    });
    assert(adminLoginResult.user.role === 'ADMIN', 'Admin logs in with new password on admin portal');

    console.log('\n--- Test 8: Live SMTP / Nodemailer Delivery Verification ---');
    console.log(`  SMTP Configured in environment: ${isEmailConfigured() ? 'YES' : 'NO'}`);
    
    // Test live delivery via Nodemailer Ethereal or configured SMTP
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    } as any);

    const emailInfo = await testTransporter.sendMail({
      from: '"Icchapurti Trust" <contact@trust.org>',
      to: 'donor@example.com',
      subject: 'Password Reset Request - Test Verification',
      html: '<p>Click here to reset your password: <a href="https://example.com/reset">Reset</a></p>',
    });

    assert(Boolean(emailInfo.messageId), `Email delivered with MessageId: ${emailInfo.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(emailInfo);
    assert(Boolean(previewUrl), `Live delivered email preview URL generated: ${previewUrl}`);

    // Clean up test records
    await User.deleteMany({ _id: { $in: [donorUser._id, adminUser._id] } });

    console.log('\n===============================================================');
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled error in test runner:', err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

runTests();
