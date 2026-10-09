import http from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import {
  connectDatabase,
  disconnectDatabase,
  getDbStatus,
} from '../config/database';
import { env } from '../config/env';

interface HttpResponse {
  status: number;
  body: any;
}

function makeHttpRequest(
  server: http.Server,
  path: string,
  method = 'GET'
): Promise<HttpResponse> {
  const address = server.address() as any;
  const port = address.port;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: { 'Content-Type': 'application/json' },
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

async function runDatabaseStartupTests() {
  console.log('\n===============================================================');
  console.log(' DATABASE STARTUP & CONFIGURATION VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  // Preserve initial environment settings
  const origNodeEnv = process.env.NODE_ENV;
  const origMongoUri = process.env.MONGODB_URI;
  const origUseInMemory = process.env.USE_IN_MEMORY_DB;

  let passedTests = 0;
  let totalTests = 0;

  function record(testName: string, passed: boolean, details?: string) {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
    }
  }

  // Spin up an HTTP test server for API & health check tests
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Production environment with missing MONGODB_URI
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Production mode with missing MONGODB_URI ---');
    await disconnectDatabase();
    process.env.NODE_ENV = 'production';
    process.env.MONGODB_URI = '';
    process.env.USE_IN_MEMORY_DB = 'true'; // Attempt to bypass with in-memory opt-in

    const prodMissingResult = await connectDatabase({ uri: '' });
    record(
      'connectDatabase() returns false in production when MONGODB_URI is missing',
      prodMissingResult === false
    );
    record(
      'In-memory database is strictly blocked in production even if USE_IN_MEMORY_DB=true',
      getDbStatus().status === 'disconnected'
    );

    // -------------------------------------------------------------------------
    // TEST 2: Production environment with invalid / unreachable MONGODB_URI
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Production mode with invalid/unreachable MONGODB_URI ---');
    await disconnectDatabase();
    process.env.NODE_ENV = 'production';
    const unreachableUri = 'mongodb://127.0.0.1:59999/unreachable_db?serverSelectionTimeoutMS=800';

    const prodInvalidResult = await connectDatabase({ uri: unreachableUri });
    record(
      'connectDatabase() returns false when production URI is unreachable',
      prodInvalidResult === false
    );
    record(
      'Database status remains disconnected on connection failure',
      getDbStatus().status === 'disconnected'
    );

    // -------------------------------------------------------------------------
    // TEST 3: Development mode without MONGODB_URI and WITHOUT opt-in
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Development without MONGODB_URI and without opt-in ---');
    await disconnectDatabase();
    process.env.NODE_ENV = 'development';
    process.env.MONGODB_URI = '';
    process.env.USE_IN_MEMORY_DB = 'false';

    const devNoOptInResult = await connectDatabase({ uri: '', allowInMemory: false });
    record(
      'connectDatabase() returns false in dev when no MONGODB_URI and USE_IN_MEMORY_DB is false',
      devNoOptInResult === false
    );
    record(
      'Database status remains disconnected without opt-in',
      getDbStatus().status === 'disconnected'
    );

    // -------------------------------------------------------------------------
    // TEST 4: Development mode with explicit opt-in (USE_IN_MEMORY_DB=true)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Development with explicit in-memory opt-in ---');
    await disconnectDatabase();
    process.env.NODE_ENV = 'development';
    process.env.MONGODB_URI = '';
    process.env.USE_IN_MEMORY_DB = 'true';

    const devOptInResult = await connectDatabase({ uri: '', allowInMemory: true });
    record(
      'connectDatabase() returns true in dev when USE_IN_MEMORY_DB=true',
      devOptInResult === true
    );
    record(
      'Database status reports connected when in-memory instance is running',
      getDbStatus().status === 'connected'
    );

    // Test /api/health when connected
    const healthConnected = await makeHttpRequest(server, '/api/health');
    record(
      '/api/health returns HTTP 200 when database is connected',
      healthConnected.status === 200
    );
    record(
      '/api/health payload confirms database status = "connected"',
      healthConnected.body?.data?.database?.status === 'connected'
    );

    // Test /api/health and /api/* when disconnected
    await disconnectDatabase();
    record(
      'disconnectDatabase() gracefully sets status to "disconnected"',
      getDbStatus().status === 'disconnected'
    );

    const healthDisconnected = await makeHttpRequest(server, '/api/health');
    record(
      '/api/health returns HTTP 503 when database is disconnected (does not hide error behind 200)',
      healthDisconnected.status === 503
    );
    record(
      '/api/health payload confirms server status = "degraded" and database = "disconnected"',
      healthDisconnected.body?.data?.server?.status === 'degraded' &&
        healthDisconnected.body?.data?.database?.status === 'disconnected'
    );

    const apiBlocked = await makeHttpRequest(server, '/api/causes');
    record(
      'Normal API traffic (/api/causes) is blocked with 503 when database is disconnected',
      apiBlocked.status === 503 && apiBlocked.body?.error === 'DATABASE_UNAVAILABLE'
    );

    // -------------------------------------------------------------------------
    // TEST 5: Development mode with a real URI (verified connection)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Development with a real MONGODB_URI ---');
    await disconnectDatabase();
    process.env.NODE_ENV = 'development';
    process.env.USE_IN_MEMORY_DB = 'false'; // Ensure opt-in is disabled

    // Create an isolated MongoDB server acting as a simulated remote instance
    const dedicatedMongo = await MongoMemoryServer.create();
    const dedicatedUri = dedicatedMongo.getUri();
    process.env.MONGODB_URI = dedicatedUri;

    const realUriResult = await connectDatabase({ uri: dedicatedUri, allowInMemory: false });
    record(
      'connectDatabase() connects successfully using provided MONGODB_URI without in-memory opt-in',
      realUriResult === true
    );
    record(
      'Database status is "connected" with real URI target',
      getDbStatus().status === 'connected'
    );

    // Clean up dedicated instance
    await disconnectDatabase();
    await dedicatedMongo.stop();
    record(
      'Clean disconnect after real URI test',
      getDbStatus().status === 'disconnected'
    );

  } finally {
    // Restore environment
    process.env.NODE_ENV = origNodeEnv;
    if (origMongoUri !== undefined) process.env.MONGODB_URI = origMongoUri;
    else delete process.env.MONGODB_URI;
    if (origUseInMemory !== undefined) process.env.USE_IN_MEMORY_DB = origUseInMemory;
    else delete process.env.USE_IN_MEMORY_DB;

    await disconnectDatabase();
    server.close();
  }

  console.log('\n===============================================================');
  console.log(` RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runDatabaseStartupTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
