/**
 * Siddhivinayak Charitable Trust - First Administrator Provisioning Script
 *
 * SECURE USAGE:
 * Run locally using:
 *   npx tsx server/src/scripts/createAdmin.ts
 * Or via npm script:
 *   npm run create-admin
 *
 * Supports interactive command-line prompts or environment variables:
 *   ADMIN_NAME="Siddhivinayak Admin"
 *   ADMIN_EMAIL="admin@trust.org"
 *   ADMIN_PASSWORD="SecurePassword123!"
 *   ADMIN_PHONE="+919876543210"
 *
 * SECURITY:
 * - Credentials are NEVER hard-coded in source code.
 * - Password is automatically hashed with bcrypt (salt rounds = 12).
 * - Plaintext password is never stored, displayed, or written to disk.
 */

import readline from 'readline';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

import { User } from '../models/User';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../utils/logger';

function askQuestion(query: string, hideInput = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

async function run(): Promise<void> {
  console.log('\n===========================================================');
  console.log(' Siddhivinayak Charitable Trust - Create First Admin Account');
  console.log('===========================================================\n');

  const connected = await connectDatabase();
  if (!connected) {
    console.error('\n[ERROR] Could not connect to MongoDB.');
    console.error('Please verify your MONGODB_URI in .env or provide real MongoDB Atlas credentials.\n');
    process.exit(1);
  }

  try {
    // 1. Full Name
    let name = process.env.ADMIN_NAME || '';
    if (!name) {
      name = await askQuestion('Enter Admin Full Name (e.g. Trust Administrator): ');
      if (!name) name = 'Trust Administrator';
    }

    // 2. Email Address
    let email = process.env.ADMIN_EMAIL || '';
    while (!email || !validateEmail(email)) {
      email = await askQuestion('Enter Admin Email Address: ');
      if (!validateEmail(email)) {
        console.log('❌ Invalid email format. Please try again.');
      }
    }
    email = email.toLowerCase().trim();

    // 3. Password
    let password = process.env.ADMIN_PASSWORD || '';
    while (!password) {
      password = await askQuestion('Enter Admin Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number): ');
      const err = validatePassword(password);
      if (err) {
        console.log(`❌ ${err}. Please try again.`);
        password = '';
      }
    }

    // 4. Phone Number (optional)
    let phone = process.env.ADMIN_PHONE || '';
    if (!phone) {
      phone = await askQuestion('Enter Admin Phone Number (optional): ');
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      console.log(`\nUser with email "${email}" already exists.`);
      console.log(`Current role: ${existing.role}`);
      const confirm = await askQuestion('Would you like to promote this account to ADMIN and update its password? (y/n): ');
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        existing.role = 'ADMIN';
        existing.passwordHash = passwordHash;
        existing.isActive = true;
        existing.isEmailVerified = true;
        if (phone) existing.phone = phone;
        if (name) existing.name = name;
        await existing.save();
        console.log('\n✅ Account successfully updated and granted ADMIN privileges!');
      } else {
        console.log('\nOperation cancelled. No changes were made.');
      }
    } else {
      const newAdmin = await User.create({
        name,
        email,
        phone,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
      });

      console.log('\n✅ Real Admin Account created successfully!');
      console.log(`   ID:    ${newAdmin._id}`);
      console.log(`   Name:  ${newAdmin.name}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Role:  ${newAdmin.role}`);
      console.log('\nYou can now log in at /login with these credentials.\n');
    }
  } catch (error) {
    logger.error('Failed to create admin user:', error);
    console.error('\n[ERROR] An error occurred while creating admin user:', error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

run();
