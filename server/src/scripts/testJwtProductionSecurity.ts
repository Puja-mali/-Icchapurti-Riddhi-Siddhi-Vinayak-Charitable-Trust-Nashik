/**
 * Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik
 * Production JWT Configuration & Security Startup Test Suite
 *
 * Validates:
 * 1. Startup fails immediately in production if JWT_ACCESS_SECRET is missing or empty
 * 2. Startup fails immediately in production if JWT_REFRESH_SECRET is missing or empty
 * 3. Startup fails in production if JWT_ACCESS_SECRET uses development fallback
 * 4. Startup fails in production if JWT_REFRESH_SECRET uses development fallback
 * 5. Startup fails in production if secrets contain "dev_" prefix
 * 6. Startup succeeds in production when both secrets are strong production keys
 * 7. Development mode permits safe development fallbacks without crashing
 */

import {
  DEV_JWT_ACCESS_FALLBACK,
  DEV_JWT_REFRESH_FALLBACK,
  validateJwtSecrets,
  env,
} from '../config/env';

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

function runJwtSecuritySuite() {
  console.log('\n===============================================================');
  console.log(' Production JWT Secrets Startup & Security Verification Suite');
  console.log('===============================================================\n');

  // TEST 1: Dev mode allows fallback secrets without throwing
  console.log('--- TEST GROUP 1: Development Environment Behavior ---');
  try {
    validateJwtSecrets({
      isProduction: false,
      JWT_ACCESS_SECRET: DEV_JWT_ACCESS_FALLBACK,
      JWT_REFRESH_SECRET: DEV_JWT_REFRESH_FALLBACK,
    });
    assert(true, 'Development mode permits fallback secrets safely');
  } catch (err: any) {
    assert(false, 'Development mode should not throw for fallback secrets', err.message);
  }

  // TEST 2: In dev mode, env object contains working fallback
  assert(
    typeof env.JWT_ACCESS_SECRET === 'string' && env.JWT_ACCESS_SECRET.length > 0,
    'env.JWT_ACCESS_SECRET is populated in dev'
  );
  assert(
    typeof env.JWT_REFRESH_SECRET === 'string' && env.JWT_REFRESH_SECRET.length > 0,
    'env.JWT_REFRESH_SECRET is populated in dev'
  );

  // TEST 3: Production mode rejects empty access secret
  console.log('\n--- TEST GROUP 2: Production Startup Failure Enforcements ---');
  let threwOnEmptyAccess = false;
  try {
    validateJwtSecrets({
      isProduction: true,
      JWT_ACCESS_SECRET: '',
      JWT_REFRESH_SECRET: 'production_high_entropy_refresh_secret_key_random_64_chars_long_12345',
    });
  } catch (err: any) {
    threwOnEmptyAccess = true;
    assert(
      err.message.includes('JWT_ACCESS_SECRET is missing, empty, or using a development fallback'),
      'Throws clear fatal error when JWT_ACCESS_SECRET is empty in production'
    );
  }
  assert(threwOnEmptyAccess, 'Production startup fails when JWT_ACCESS_SECRET is empty');

  // TEST 4: Production mode rejects empty refresh secret
  let threwOnEmptyRefresh = false;
  try {
    validateJwtSecrets({
      isProduction: true,
      JWT_ACCESS_SECRET: 'production_high_entropy_access_secret_key_random_64_chars_long_12345',
      JWT_REFRESH_SECRET: '',
    });
  } catch (err: any) {
    threwOnEmptyRefresh = true;
    assert(
      err.message.includes('JWT_REFRESH_SECRET is missing, empty, or using a development fallback'),
      'Throws clear fatal error when JWT_REFRESH_SECRET is empty in production'
    );
  }
  assert(threwOnEmptyRefresh, 'Production startup fails when JWT_REFRESH_SECRET is empty');

  // TEST 5: Production mode rejects development fallback for access secret
  let threwOnDevAccess = false;
  try {
    validateJwtSecrets({
      isProduction: true,
      JWT_ACCESS_SECRET: DEV_JWT_ACCESS_FALLBACK,
      JWT_REFRESH_SECRET: 'production_high_entropy_refresh_secret_key_random_64_chars_long_12345',
    });
  } catch (err: any) {
    threwOnDevAccess = true;
    assert(
      err.message.includes('JWT_ACCESS_SECRET is missing, empty, or using a development fallback'),
      'Throws clear fatal error when JWT_ACCESS_SECRET uses dev fallback in production'
    );
  }
  assert(threwOnDevAccess, 'Production startup fails when JWT_ACCESS_SECRET uses dev fallback');

  // TEST 6: Production mode rejects development fallback for refresh secret
  let threwOnDevRefresh = false;
  try {
    validateJwtSecrets({
      isProduction: true,
      JWT_ACCESS_SECRET: 'production_high_entropy_access_secret_key_random_64_chars_long_12345',
      JWT_REFRESH_SECRET: DEV_JWT_REFRESH_FALLBACK,
    });
  } catch (err: any) {
    threwOnDevRefresh = true;
    assert(
      err.message.includes('JWT_REFRESH_SECRET is missing, empty, or using a development fallback'),
      'Throws clear fatal error when JWT_REFRESH_SECRET uses dev fallback in production'
    );
  }
  assert(threwOnDevRefresh, 'Production startup fails when JWT_REFRESH_SECRET uses dev fallback');

  // TEST 7: Production mode rejects secret with "dev_" prefix
  let threwOnDevPrefix = false;
  try {
    validateJwtSecrets({
      isProduction: true,
      JWT_ACCESS_SECRET: 'dev_some_custom_secret_that_looks_like_dev_mode',
      JWT_REFRESH_SECRET: 'production_high_entropy_refresh_secret_key_random_64_chars_long_12345',
    });
  } catch (err: any) {
    threwOnDevPrefix = true;
  }
  assert(threwOnDevPrefix, 'Production startup fails when JWT secret contains "dev_" prefix');

  // TEST 8: Production mode passes with robust production secrets
  console.log('\n--- TEST GROUP 3: Valid Production Configuration ---');
  let succeededOnValidProd = false;
  try {
    validateJwtSecrets({
      isProduction: true,
      JWT_ACCESS_SECRET: 'prod_9f83b2e7c41a65d08e2f31b456a7c980d2e1f4356789abcdef0123456789abcd',
      JWT_REFRESH_SECRET: 'prod_71c2a3b4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    });
    // Wait, the test string has "prod_", not "dev_"
    succeededOnValidProd = true;
    assert(true, 'Production validation succeeds when strong non-dev secrets are supplied');
  } catch (err: any) {
    assert(false, 'Should not throw on valid production secrets', err.message);
  }
  assert(succeededOnValidProd, 'Valid production secrets pass verification');

  console.log(`\n===============================================================`);
  console.log(` Production JWT Security Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`===============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runJwtSecuritySuite();
