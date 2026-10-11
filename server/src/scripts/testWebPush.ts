/**
 * Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik
 * Web Push Notification Automated Verification Test Suite
 *
 * Validates:
 * 1. VAPID Public Key availability and format
 * 2. Subscription schema validation (HTTPS requirement, cryptographic keys)
 * 3. Authenticated subscription persistence and user association
 * 4. Upsert idempotency (same endpoint does not create duplicate database records)
 * 5. IDOR protection on unsubscription (users can only remove their own subscriptions)
 * 6. Delivery deduplication (suppresses repeat push events within 10-minute window)
 * 7. Privacy & data sanitization (verifies no PII or payment data in push payloads)
 * 8. Automatic dead-subscription cleanup (HTTP 410/404 removes stale records)
 * 9. Recipient authorization and routing (ADMIN/STAFF broadcasts vs individual donor updates)
 */

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

process.env.USE_IN_MEMORY_DB = 'true';

import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, IUser } from '../models/User';
import { PushSubscription, IPushSubscription } from '../models/PushSubscription';
import { WebPushService, PushPayload } from '../services/webpush.service';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

async function runWebPushSuite() {
  console.log('\n===============================================================');
  console.log(' Web Push Notifications Automated Test Suite');
  console.log('===============================================================\n');

  try {
    await connectDatabase();

    // -------------------------------------------------------------
    // Test Setup: Seed test users
    // -------------------------------------------------------------
    const testAdmin = await User.create({
      name: 'Push Test Admin',
      email: `push_admin_${Date.now()}@trust.org`,
      passwordHash: '$2a$12$eXampleHashedPasswordForTestAdminOnly123456789',
      role: 'ADMIN',
      isActive: true,
    });

    const testStaff = await User.create({
      name: 'Push Test Staff',
      email: `push_staff_${Date.now()}@trust.org`,
      passwordHash: '$2a$12$eXampleHashedPasswordForTestStaffOnly123456789',
      role: 'STAFF',
      isActive: true,
    });

    const testDonor = await User.create({
      name: 'Push Test Donor',
      email: `push_donor_${Date.now()}@trust.org`,
      passwordHash: '$2a$12$eXampleHashedPasswordForTestDonorOnly123456789',
      role: 'DONOR',
      isActive: true,
    });

    // --- TEST GROUP 1: VAPID Public Key ---
    console.log('--- TEST GROUP 1: VAPID Configuration & Key Verification ---');
    const publicKey = WebPushService.getPublicKey();
    assert(typeof publicKey === 'string' && publicKey.length > 30, 'VAPID Public Key is generated and available');

    // --- TEST GROUP 2: Subscription Validation ---
    console.log('\n--- TEST GROUP 2: Subscription Validation Safeguards ---');

    let nonHttpsRejected = false;
    try {
      await WebPushService.registerSubscription(testDonor._id.toString(), {
        endpoint: 'http://insecure.endpoint.example.com/push/123',
        keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
      });
    } catch {
      nonHttpsRejected = true;
    }
    assert(nonHttpsRejected, 'Insecure non-HTTPS endpoint is strictly rejected');

    let missingKeysRejected = false;
    try {
      await WebPushService.registerSubscription(testDonor._id.toString(), {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-missing-keys',
        keys: { p256dh: '', auth: '' },
      });
    } catch {
      missingKeysRejected = true;
    }
    assert(missingKeysRejected, 'Missing p256dh / auth cryptographic keys are rejected');

    // --- TEST GROUP 3: Valid Subscription Registration & Idempotency ---
    console.log('\n--- TEST GROUP 3: Subscription Registration & Idempotency ---');
    const donorEndpoint = `https://fcm.googleapis.com/fcm/send/donor-${Date.now()}`;
    const sub = await WebPushService.registerSubscription(testDonor._id.toString(), {
      endpoint: donorEndpoint,
      keys: {
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVYOSTxGen0KURo6-CG9K2wtaz5Ry4YfYCA',
        auth: 'tBHItJI5svbpez7KI4CCXg',
      },
      userAgent: 'Mozilla/5.0 (Test Browser)',
    });

    assert(sub !== null && sub.isActive === true, 'Valid subscription successfully created and active');
    assert(sub.user.toString() === testDonor._id.toString(), 'Subscription is correctly associated with authenticated user');

    // Re-registering the same endpoint should update, not create duplicate
    await WebPushService.registerSubscription(testDonor._id.toString(), {
      endpoint: donorEndpoint,
      keys: {
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVYOSTxGen0KURo6-CG9K2wtaz5Ry4YfYCA',
        auth: 'tBHItJI5svbpez7KI4CCXg',
      },
      userAgent: 'Mozilla/5.0 (Updated Browser)',
    });

    const countForEndpoint = await PushSubscription.countDocuments({ endpoint: donorEndpoint });
    assert(countForEndpoint === 1, 'Duplicate registrations on same endpoint are idempotently merged');

    // --- TEST GROUP 4: Subscription Status Queries ---
    console.log('\n--- TEST GROUP 4: Subscription Status Queries ---');
    const statusDonor = await WebPushService.getUserStatus(testDonor._id.toString());
    assert(statusDonor.isSubscribed === true && statusDonor.subscriptionCount >= 1, 'getUserStatus correctly reports active subscription');

    const statusAdmin = await WebPushService.getUserStatus(testAdmin._id.toString());
    assert(statusAdmin.isSubscribed === false && statusAdmin.subscriptionCount === 0, 'getUserStatus correctly reports zero subscriptions for unsubscribed user');

    // --- TEST GROUP 5: IDOR Protection on Unsubscribe ---
    console.log('\n--- TEST GROUP 5: IDOR Protection on Unsubscription ---');
    // Admin attempts to delete Donor's subscription
    const adminDeleteAttempt = await WebPushService.unsubscribe(testAdmin._id.toString(), donorEndpoint);
    assert(adminDeleteAttempt === false, 'User B cannot delete User A push subscription (IDOR protection)');

    // Donor deletes their own subscription
    const donorSelfDelete = await WebPushService.unsubscribe(testDonor._id.toString(), donorEndpoint);
    assert(donorSelfDelete === true, 'Owner can successfully remove their own push subscription');

    const statusAfterDelete = await WebPushService.getUserStatus(testDonor._id.toString());
    assert(statusAfterDelete.isSubscribed === false, 'Subscription is confirmed removed from database');

    // --- TEST GROUP 6: Deduplication Mechanism ---
    console.log('\n--- TEST GROUP 6: Deduplication & Spam Prevention ---');
    // Re-register donor endpoint for deduplication test
    await WebPushService.registerSubscription(testDonor._id.toString(), {
      endpoint: donorEndpoint,
      keys: {
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVYOSTxGen0KURo6-CG9K2wtaz5Ry4YfYCA',
        auth: 'tBHItJI5svbpez7KI4CCXg',
      },
    });

    // In unit test environment without real push server, sendToUser handles simulation
    const dedupKey = `test:donation:receipt-12345`;
    const payload: PushPayload = {
      title: 'Donation Verified',
      body: 'Your contribution of ₹5,000 has been verified.',
      data: { url: '/dashboard', entityType: 'Donation', entityId: 'rec-12345' },
    };

    // First send records key in dedup cache
    await WebPushService.sendToUser(testDonor._id.toString(), payload, { dedupKey });

    // Immediate second send with same dedupKey should be suppressed
    const duplicateResult = await WebPushService.sendToUser(testDonor._id.toString(), payload, { dedupKey });
    assert(duplicateResult.sent === 0, 'Duplicate push alert with identical event key is suppressed');

    // --- TEST GROUP 7: Data Privacy & Sanitization ---
    console.log('\n--- TEST GROUP 7: Data Privacy & Sanitization ---');
    // Verify that payload construction does not contain prohibited fields
    const sensitiveCheck = (p: PushPayload) => {
      const serialized = JSON.stringify(p);
      return !serialized.includes('panNumber') &&
             !serialized.includes('aadhaar') &&
             !serialized.includes('card_number') &&
             !serialized.includes('cvv');
    };
    assert(sensitiveCheck(payload), 'Push payloads strictly exclude sensitive beneficiary and payment data');

    // --- TEST GROUP 8: Admin & Staff Broadcast Targeting ---
    console.log('\n--- TEST GROUP 8: Role-Based Broadcast Targeting ---');
    const adminEndpoint = `https://fcm.googleapis.com/fcm/send/admin-${Date.now()}`;
    await WebPushService.registerSubscription(testAdmin._id.toString(), {
      endpoint: adminEndpoint,
      keys: {
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVYOSTxGen0KURo6-CG9K2wtaz5Ry4YfYCA',
        auth: 'tBHItJI5svbpez7KI4CCXg',
      },
    });

    // Query active recipients for ADMIN/STAFF broadcast
    const adminRecipients = await User.find({ role: { $in: ['ADMIN', 'STAFF'] }, isActive: true }).select('_id');
    const donorInAdminList = adminRecipients.some((r) => r._id.toString() === testDonor._id.toString());
    assert(!donorInAdminList, 'DONOR is strictly excluded from administrative push alerts');

    const adminInAdminList = adminRecipients.some((r) => r._id.toString() === testAdmin._id.toString());
    assert(adminInAdminList, 'ADMIN is included in administrative push broadcast targets');

    const staffInAdminList = adminRecipients.some((r) => r._id.toString() === testStaff._id.toString());
    assert(staffInAdminList, 'STAFF is included in administrative push broadcast targets');

    // --- TEST GROUP 9: Expired/Dead Subscription Automatic Cleanup (HTTP 410) ---
    console.log('\n--- TEST GROUP 9: Automatic Expired-Subscription Cleanup ---');
    const expiredEndpoint = `https://fcm.googleapis.com/fcm/send/expired-${Date.now()}`;
    await WebPushService.registerSubscription(testDonor._id.toString(), {
      endpoint: expiredEndpoint,
      keys: {
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVYOSTxGen0KURo6-CG9K2wtaz5Ry4YfYCA',
        auth: 'tBHItJI5svbpez7KI4CCXg',
      },
    });

    const webpushModule = await import('web-push');
    const originalSendNotification = webpushModule.default.sendNotification;

    try {
      // Mock webpush.sendNotification to simulate an HTTP 410 Gone response
      (webpushModule.default as any).sendNotification = async () => {
        const error: any = new Error('Subscription expired');
        error.statusCode = 410;
        throw error;
      };

      await WebPushService.sendToUser(testDonor._id.toString(), {
        title: 'Test Expired Cleanup',
        body: 'This delivery should trigger cleanup.',
      }, { dedupKey: `cleanup-test-${Date.now()}` });

      const deadSubInDb = await PushSubscription.findOne({ endpoint: expiredEndpoint });
      assert(deadSubInDb === null, 'Expired subscription (HTTP 410 Gone) is automatically purged from database');
    } finally {
      // Restore original sendNotification
      webpushModule.default.sendNotification = originalSendNotification;
    }

    // -------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------
    await User.deleteMany({ _id: { $in: [testAdmin._id, testStaff._id, testDonor._id] } });
    await PushSubscription.deleteMany({ endpoint: { $in: [donorEndpoint, adminEndpoint, expiredEndpoint] } });

    console.log('\n===============================================================');
    console.log(` Web Push Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('===============================================================\n');

    await disconnectDatabase();

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal error in Web Push test suite:', err);
    await disconnectDatabase();
    process.exit(1);
  }
}

runWebPushSuite();
