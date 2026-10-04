import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import http from 'http';
import { app } from '../app';
import { User } from '../models/User';
import { Donation } from '../models/Donation';
import { Cause } from '../models/Cause';
import { Event } from '../models/Event';
import { Volunteer } from '../models/Volunteer';
import { HelpRequest } from '../models/HelpRequest';
import { BlogPost } from '../models/BlogPost';
import { TransparencyReport } from '../models/TransparencyReport';
import { generateAccessToken } from '../utils/jwt';
import { hashPassword } from '../utils/password';

async function makeRequest(
  server: http.Server,
  path: string,
  method = 'GET',
  token?: string
): Promise<{ status: number; body: any }> {
  const address = server.address() as any;
  const port = address.port;

  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 500, body: raw });
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== Starting Admin Dashboard Summary Tests ===\n');

  // 1. Start MongoDB In-Memory Server
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('✅ Connected to Test In-Memory MongoDB');

  // 2. Start Express app server on random port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  console.log('✅ Test HTTP Server listening');

  try {
    // ----------------------------------------------------
    // TEST 1: Unauthenticated request (no token) -> 401
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Unauthenticated request ---');
    const noAuth = await makeRequest(server, '/api/admin/dashboard/summary');
    console.log(`Status: ${noAuth.status} (Expected: 401)`);
    if (noAuth.status !== 401) throw new Error('Expected 401 for unauthenticated request');
    console.log('Response message:', noAuth.body.message);
    console.log('✅ PASS: Unauthenticated request blocked with 401');

    // ----------------------------------------------------
    // TEST 2: Invalid Bearer token -> 401
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Invalid Bearer token ---');
    const invalidToken = await makeRequest(
      server,
      '/api/admin/dashboard/summary',
      'GET',
      'invalid.jwt.token'
    );
    console.log(`Status: ${invalidToken.status} (Expected: 401)`);
    if (invalidToken.status !== 401) throw new Error('Expected 401 for invalid token');
    console.log('✅ PASS: Invalid token blocked with 401');

    // ----------------------------------------------------
    // TEST 3: Authenticated DONOR user (non-admin) -> 403
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Authenticated DONOR user ---');
    const passwordHash = await hashPassword('Password123!');
    const donorUser = await User.create({
      name: 'Rohan Donor',
      email: 'rohan.donor@example.com',
      passwordHash,
      role: 'DONOR',
      isActive: true,
      isEmailVerified: true,
    });
    const donorToken = generateAccessToken({
      id: donorUser._id.toString(),
      email: donorUser.email,
      name: donorUser.name,
      role: donorUser.role,
      isActive: donorUser.isActive,
    });

    const donorRes = await makeRequest(server, '/api/admin/dashboard/summary', 'GET', donorToken);
    console.log(`Status: ${donorRes.status} (Expected: 403)`);
    if (donorRes.status !== 403) throw new Error('Expected 403 for DONOR user');
    console.log('Response message:', donorRes.body.message);
    console.log('✅ PASS: DONOR request blocked with 403');

    // ----------------------------------------------------
    // TEST 4: Authenticated VOLUNTEER user (non-admin) -> 403
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Authenticated VOLUNTEER user ---');
    const volunteerUser = await User.create({
      name: 'Kavita Volunteer',
      email: 'kavita.volunteer@example.com',
      passwordHash,
      role: 'VOLUNTEER',
      isActive: true,
      isEmailVerified: true,
    });
    const volunteerToken = generateAccessToken({
      id: volunteerUser._id.toString(),
      email: volunteerUser.email,
      name: volunteerUser.name,
      role: volunteerUser.role,
      isActive: volunteerUser.isActive,
    });

    const volunteerRes = await makeRequest(
      server,
      '/api/admin/dashboard/summary',
      'GET',
      volunteerToken
    );
    console.log(`Status: ${volunteerRes.status} (Expected: 403)`);
    if (volunteerRes.status !== 403) throw new Error('Expected 403 for VOLUNTEER user');
    console.log('Response message:', volunteerRes.body.message);
    console.log('✅ PASS: VOLUNTEER request blocked with 403');

    // ----------------------------------------------------
    // TEST 5: Authenticated ADMIN on empty collections -> 200 with 0s
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Authenticated ADMIN on EMPTY database ---');
    const adminUser = await User.create({
      name: 'Siddhivinayak Admin',
      email: 'admin@sct.org',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    });
    const adminToken = generateAccessToken({
      id: adminUser._id.toString(),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      isActive: adminUser.isActive,
    });

    const emptyRes = await makeRequest(server, '/api/admin/dashboard/summary', 'GET', adminToken);
    console.log(`Status: ${emptyRes.status} (Expected: 200)`);
    if (emptyRes.status !== 200) throw new Error('Expected 200 for ADMIN user');
    const emptyData = emptyRes.body.data;
    console.log('Empty DB data returned:', emptyData);

    // Verify all counts are exactly 0 and no demo data
    if (emptyData.totalDonations !== 0) throw new Error('Expected totalDonations to be 0');
    if (emptyData.totalDonationAmount !== 0) throw new Error('Expected totalDonationAmount to be 0');
    if (emptyData.currentMonthDonationAmount !== 0)
      throw new Error('Expected currentMonthDonationAmount to be 0');
    if (emptyData.totalCampaigns !== 0) throw new Error('Expected totalCampaigns to be 0');
    if (emptyData.activeCampaigns !== 0) throw new Error('Expected activeCampaigns to be 0');
    if (emptyData.totalEvents !== 0) throw new Error('Expected totalEvents to be 0');
    if (emptyData.upcomingEvents !== 0) throw new Error('Expected upcomingEvents to be 0');
    if (emptyData.totalVolunteers !== 0) throw new Error('Expected totalVolunteers to be 0');
    if (emptyData.totalHelpRequests !== 0) throw new Error('Expected totalHelpRequests to be 0');
    if (emptyData.pendingHelpRequests !== 0) throw new Error('Expected pendingHelpRequests to be 0');
    if (emptyData.publishedNews !== 0) throw new Error('Expected publishedNews to be 0');
    if (emptyData.galleryItems !== 0) throw new Error('Expected galleryItems to be 0');
    if (emptyData.transparencyReports !== 0) throw new Error('Expected transparencyReports to be 0');
    if (!Array.isArray(emptyData.recentActivity) || emptyData.recentActivity.length !== 0)
      throw new Error('Expected recentActivity to be empty array');
    console.log('✅ PASS: Empty database returned zero/empty values with no mock figures');

    // ----------------------------------------------------
    // TEST 6: Authenticated ADMIN with REAL database records -> 200
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Authenticated ADMIN with REAL database records ---');

    // 6a. Add real causes
    const activeCause = await Cause.create({
      title: 'Free Medical, Health & Naturopathy Camps',
      slug: 'free-medical-health-camps',
      shortDescription: 'Free health checkup and medicine camps',
      description: 'Periodic medical assistance, health checkups, and medicine distribution for underprivileged families in Nashik.',
      targetAmount: 500000,
      raisedAmount: 15000,
      category: 'Medical Support',
      imageUrl: 'https://example.com/medical-camp.jpg',
      status: 'ACTIVE',
      location: 'Nashik, Maharashtra',
      donorCount: 2,
      urgent: true,
      allocationBreakdown: [],
      impactMilestones: [],
    });

    await Cause.create({
      title: 'Archived Campus Solar Project',
      slug: 'archived-solar-project',
      shortDescription: 'Completed solar project',
      description: 'Archived project details.',
      targetAmount: 200000,
      raisedAmount: 200000,
      category: 'Environment',
      imageUrl: 'https://example.com/solar.jpg',
      status: 'COMPLETED',
      location: 'Pune, Maharashtra',
      donorCount: 10,
      urgent: false,
      allocationBreakdown: [],
      impactMilestones: [],
    });

    // 6b. Add real donations (verified vs failed vs pending)
    // Successful donation 1 (₹10,000)
    await Donation.create({
      donorName: 'Ananya Sharma',
      donorEmail: 'ananya@example.com',
      amount: 10000,
      currency: 'INR',
      status: 'SUCCESS',
      causeId: activeCause._id,
      purpose: 'Pediatric Surgery',
      paymentVerifiedAt: new Date(),
    });

    // Successful donation 2 (₹5,000)
    await Donation.create({
      donorName: 'Rajesh Patil',
      donorEmail: 'rajesh@example.com',
      amount: 5000,
      currency: 'INR',
      status: 'SUCCESS',
      causeId: activeCause._id,
      purpose: 'General Trust Corpus',
      paymentVerifiedAt: new Date(),
    });

    // Pending donation (₹3,000 - should NOT be included in verified amounts!)
    await Donation.create({
      donorName: 'Vikram Pend',
      donorEmail: 'vikram@example.com',
      amount: 3000,
      currency: 'INR',
      status: 'PENDING',
      causeId: activeCause._id,
      purpose: 'Emergency Support',
    });

    // Failed donation (₹7,000 - should NOT be included in verified amounts!)
    await Donation.create({
      donorName: 'Sneha Fail',
      donorEmail: 'sneha@example.com',
      amount: 7000,
      currency: 'INR',
      status: 'FAILED',
      causeId: activeCause._id,
      purpose: 'Medical Aid',
    });

    // 6c. Add real events (with galleryUrls)
    await Event.create({
      title: 'Free Blood Diagnostic & Health Camp',
      slug: 'free-blood-camp-2026',
      description: 'Full body diagnostic testing for 400 underprivileged senior citizens.',
      shortDescription: 'Senior citizen health screening',
      location: 'Dharavi Community Center, Mumbai',
      startDate: new Date(Date.now() + 86400000 * 5),
      status: 'UPCOMING',
      imageUrl: 'https://example.com/camp.jpg',
      galleryUrls: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg',
      ],
      registrationRequired: true,
      registrationLimit: 100,
    });

    await Event.create({
      title: 'Past Monsoon Sapling Drive',
      slug: 'past-monsoon-sapling-drive',
      description: 'Completed sapling planting.',
      shortDescription: 'Sapling planting completed',
      location: 'Vidyanagar Grounds',
      startDate: new Date(Date.now() - 86400000 * 30),
      status: 'COMPLETED',
      imageUrl: 'https://example.com/tree.jpg',
      galleryUrls: ['https://example.com/tree1.jpg', 'https://example.com/tree2.jpg'],
      registrationRequired: false,
    });

    // 6d. Add real volunteer
    await Volunteer.create({
      user: volunteerUser._id,
      skills: ['First Aid', 'Crowd Management'],
      availability: 'WEEKENDS',
      registeredEvents: [],
      volunteerHours: 12,
    });

    // 6e. Add real help requests
    await HelpRequest.create({
      name: 'Sunil Beneficiary',
      email: 'sunil@example.com',
      phone: '+919876543211',
      requestType: 'Medical',
      description: 'Heart stent subsidy assistance needed for elderly father.',
      location: 'Kurla West, Mumbai',
      urgency: 'HIGH',
      status: 'PENDING',
    });

    await HelpRequest.create({
      name: 'Meena Beneficiary',
      email: 'meena@example.com',
      phone: '+919876543212',
      requestType: 'Education',
      description: 'College textbook grant for rural engineering student.',
      location: 'Thane East',
      urgency: 'MEDIUM',
      status: 'RESOLVED',
    });

    // 6f. Add real blog post
    await BlogPost.create({
      title: 'Audited Report: How Every Rupee Was Disbursed in Q3',
      slug: 'audited-report-q3-disbursal',
      excerpt: 'Comprehensive overview of medical and tribal outreach expenditures.',
      content: 'Detailed breakdown of medical and tribal educational programs.',
      coverImage: 'https://example.com/audit.jpg',
      category: 'Governance & Audits',
      author: 'Finance & Compliance Committee',
      tags: ['Transparency', 'Audit'],
      isPublished: true,
      publishedAt: new Date(),
      isFeatured: true,
      isKumbhRelated: false,
    });

    await BlogPost.create({
      title: 'Draft Upcoming Initiative',
      slug: 'draft-upcoming-initiative',
      excerpt: 'Draft content excerpt.',
      content: 'Draft content.',
      coverImage: 'https://example.com/draft.jpg',
      category: 'Outreach',
      author: 'Trust Team',
      tags: ['Draft'],
      isPublished: false,
      isFeatured: false,
      isKumbhRelated: false,
    });

    // 6g. Add real transparency report
    await TransparencyReport.create({
      title: 'Statutory Annual Audit FY 2025-26',
      description: 'Audited financial balance sheet and 80G tax utilization report.',
      reportType: 'Audit Report',
      financialYear: '2025-2026',
      fileUrl: 'https://example.com/audit-2025-26.pdf',
      isPublished: true,
      publishedAt: new Date(),
      isFeatured: true,
      isKumbhRelated: false,
    });

    // Now query the endpoint!
    const realRes = await makeRequest(server, '/api/admin/dashboard/summary', 'GET', adminToken);
    console.log(`Status: ${realRes.status} (Expected: 200)`);
    if (realRes.status !== 200) throw new Error('Expected 200 for ADMIN user with real data');

    const realData = realRes.body.data;
    console.log('Real summary data computed by MongoDB:');
    console.log(JSON.stringify(realData, null, 2));

    // Validations
    console.log('\n--- Verifying Exact Mathematical and Relational Counts ---');

    // Donations: total 4 records created, only 2 SUCCESS with sum 10,000 + 5,000 = 15,000
    if (realData.totalDonations !== 4)
      throw new Error(`Expected totalDonations = 4, got ${realData.totalDonations}`);
    if (realData.totalVerifiedDonations !== 2)
      throw new Error(`Expected totalVerifiedDonations = 2, got ${realData.totalVerifiedDonations}`);
    if (realData.totalDonationAmount !== 15000)
      throw new Error(`Expected totalDonationAmount = 15000, got ${realData.totalDonationAmount}`);
    if (realData.currentMonthDonationAmount !== 15000)
      throw new Error(
        `Expected currentMonthDonationAmount = 15000, got ${realData.currentMonthDonationAmount}`
      );
    console.log('✅ Donations verified: Only SUCCESS payments (₹15,000) counted; PENDING/FAILED excluded');

    // Campaigns: 2 total, 1 ACTIVE
    if (realData.totalCampaigns !== 2)
      throw new Error(`Expected totalCampaigns = 2, got ${realData.totalCampaigns}`);
    if (realData.activeCampaigns !== 1)
      throw new Error(`Expected activeCampaigns = 1, got ${realData.activeCampaigns}`);
    console.log('✅ Campaigns verified: 2 total, 1 active');

    // Events: 2 total, 1 UPCOMING
    if (realData.totalEvents !== 2)
      throw new Error(`Expected totalEvents = 2, got ${realData.totalEvents}`);
    if (realData.upcomingEvents !== 1)
      throw new Error(`Expected upcomingEvents = 1, got ${realData.upcomingEvents}`);
    console.log('✅ Events verified: 2 total, 1 upcoming');

    // Volunteers: 1
    if (realData.totalVolunteers !== 1)
      throw new Error(`Expected totalVolunteers = 1, got ${realData.totalVolunteers}`);
    if (realData.pendingVolunteerApplications !== 0)
      throw new Error('Expected pendingVolunteerApplications = 0');
    console.log('✅ Volunteers verified: 1 total, 0 pending applications');

    // Help Requests: 2 total, 1 PENDING
    if (realData.totalHelpRequests !== 2)
      throw new Error(`Expected totalHelpRequests = 2, got ${realData.totalHelpRequests}`);
    if (realData.pendingHelpRequests !== 1)
      throw new Error(`Expected pendingHelpRequests = 1, got ${realData.pendingHelpRequests}`);
    console.log('✅ Help requests verified: 2 total, 1 pending');

    // Blog posts: 2 total, 1 published
    if (realData.publishedNews !== 1)
      throw new Error(`Expected publishedNews = 1, got ${realData.publishedNews}`);
    if (realData.totalBlogPosts !== 2)
      throw new Error(`Expected totalBlogPosts = 2, got ${realData.totalBlogPosts}`);
    console.log('✅ Blogs verified: 2 total, 1 published');

    // Gallery items across events: 3 + 2 = 5
    if (realData.galleryItems !== 5)
      throw new Error(`Expected galleryItems = 5, got ${realData.galleryItems}`);
    console.log('✅ Gallery items aggregated from event photos: 5 items');

    // Transparency reports: 1 published
    if (realData.transparencyReports !== 1)
      throw new Error(`Expected transparencyReports = 1, got ${realData.transparencyReports}`);
    console.log('✅ Transparency reports verified: 1 published');

    // Recent activity check:
    console.log(`Recent activity count: ${realData.recentActivity.length}`);
    if (realData.recentActivity.length === 0)
      throw new Error('Expected recentActivity to contain items');

    // Verify no beneficiary sensitive information in activity items!
    for (const act of realData.recentActivity) {
      const str = JSON.stringify(act);
      if (str.includes('sunil@example.com') || str.includes('+919876543211')) {
        throw new Error('Sensitive beneficiary PII was found in recentActivity!');
      }
    }
    console.log('✅ Privacy verification passed: Zero beneficiary sensitive PII in activity feed');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
