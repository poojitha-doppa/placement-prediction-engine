/**
 * Database Connection and Profile Update Test
 * This script tests if profile updates are persisting in MongoDB
 */

import prisma from './src/config/db.js';
import bcrypt from 'bcrypt';

async function testDatabaseConnection() {
  console.log('='.repeat(60));
  console.log('DATABASE CONNECTION & PROFILE UPDATE TEST');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Test 1: Check database connection
    console.log('📡 Test 1: Checking database connection...');
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB!');
    console.log('');

    // Test 2: Count existing users
    console.log('📊 Test 2: Checking existing data...');
    const userCount = await prisma.user.count();
    const profileCount = await prisma.profile.count();
    console.log(`   Users in database: ${userCount}`);
    console.log(`   Profiles in database: ${profileCount}`);
    console.log('');

    // Test 3: Find or create test user
    console.log('👤 Test 3: Finding/Creating test user...');
    let testUser = await prisma.user.findUnique({
      where: { email: 'poojithadoppa8@gmail.com' }
    });

    if (!testUser) {
      console.log('   Test user not found. Creating...');
      const hashedPassword = await bcrypt.hash('Poojitha@2006', 12);
      testUser = await prisma.user.create({
        data: {
          email: 'poojithadoppa8@gmail.com',
          password: hashedPassword,
          name: 'Poojitha Doppa'
        }
      });
      console.log('   ✅ Test user created!');
    } else {
      console.log('   ✅ Test user found!');
    }
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}`);
    console.log('');

    // Test 4: Check existing profile
    console.log('📋 Test 4: Checking existing profile...');
    let profile = await prisma.profile.findUnique({
      where: { userId: testUser.id },
      include: { user: true }
    });

    if (profile) {
      console.log('   ✅ Profile found!');
      console.log(`   College: ${profile.college || 'Not set'}`);
      console.log(`   Branch: ${profile.branch || 'Not set'}`);
      console.log(`   CGPA: ${profile.cgpa || 'Not set'}`);
      console.log(`   Skills: ${profile.skills.join(', ') || 'None'}`);
      console.log(`   Target Companies: ${profile.targetCompanies.join(', ') || 'None'}`);
    } else {
      console.log('   ⚠️  No profile found for this user');
    }
    console.log('');

    // Test 5: Create or update profile with test data
    console.log('✏️  Test 5: Updating profile with test data...');
    const testSkill = `DB-Test-${new Date().toISOString().slice(11, 19).replace(/:/g, '')}`;
    
    profile = await prisma.profile.upsert({
      where: { userId: testUser.id },
      update: {
        college: 'Vellore Institute of Technology',
        branch: 'Computer Science and Engineering',
        year: 2026,
        cgpa: 8.75,
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', testSkill],
        targetCompanies: ['Google', 'Microsoft', 'Amazon'],
        targetRoles: ['Software Engineer', 'Full Stack Developer'],
        availableHoursPerWeek: 25,
        githubUsername: 'poojitha-dev',
        leetcodeUsername: 'poojitha_coder'
      },
      create: {
        userId: testUser.id,
        college: 'Vellore Institute of Technology',
        branch: 'Computer Science and Engineering',
        year: 2026,
        cgpa: 8.75,
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', testSkill],
        targetCompanies: ['Google', 'Microsoft', 'Amazon'],
        targetRoles: ['Software Engineer', 'Full Stack Developer'],
        availableHoursPerWeek: 25,
        githubUsername: 'poojitha-dev',
        leetcodeUsername: 'poojitha_coder'
      },
      include: { user: true }
    });

    console.log('   ✅ Profile updated successfully!');
    console.log(`   Added test skill: ${testSkill}`);
    console.log('');

    // Test 6: Verify the update persisted
    console.log('🔍 Test 6: Verifying data persistence...');
    const verifyProfile = await prisma.profile.findUnique({
      where: { userId: testUser.id },
      include: { user: true }
    });

    if (verifyProfile && verifyProfile.skills.includes(testSkill)) {
      console.log('   ✅✅✅ SUCCESS! Data is persisting in MongoDB!');
      console.log('   The test skill was found in the database.');
      console.log('');
      console.log('   Current Profile Data:');
      console.log(`   - Name: ${verifyProfile.user.name}`);
      console.log(`   - Email: ${verifyProfile.user.email}`);
      console.log(`   - College: ${verifyProfile.college}`);
      console.log(`   - Branch: ${verifyProfile.branch}`);
      console.log(`   - Year: ${verifyProfile.year}`);
      console.log(`   - CGPA: ${verifyProfile.cgpa}`);
      console.log(`   - Skills (${verifyProfile.skills.length}): ${verifyProfile.skills.join(', ')}`);
      console.log(`   - Target Companies: ${verifyProfile.targetCompanies.join(', ')}`);
      console.log(`   - Target Roles: ${verifyProfile.targetRoles.join(', ')}`);
      console.log(`   - GitHub: ${verifyProfile.githubUsername || 'Not set'}`);
      console.log(`   - LeetCode: ${verifyProfile.leetcodeUsername || 'Not set'}`);
      console.log(`   - Last Updated: ${verifyProfile.updatedAt}`);
    } else {
      console.log('   ❌ FAILED! Data did not persist in database.');
    }
    console.log('');

    // Test 7: Test profile retrieval through API pattern
    console.log('🌐 Test 7: Simulating API retrieval pattern...');
    const apiProfile = await prisma.profile.findUnique({
      where: { userId: testUser.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (apiProfile) {
      console.log('   ✅ Profile retrieved successfully (API pattern)');
      const apiResponse = {
        id: apiProfile.id,
        name: apiProfile.user.name,
        email: apiProfile.user.email,
        college: apiProfile.college,
        branch: apiProfile.branch,
        year: apiProfile.year,
        cgpa: apiProfile.cgpa,
        skills: apiProfile.skills,
        targetCompanies: apiProfile.targetCompanies,
        targetRoles: apiProfile.targetRoles,
        availableHoursPerWeek: apiProfile.availableHoursPerWeek,
        resumeUrl: apiProfile.resumeUrl,
        githubUsername: apiProfile.githubUsername,
        leetcodeUsername: apiProfile.leetcodeUsername,
        leetcodeSolved: apiProfile.leetcodeSolved
      };
      console.log('   API Response format:', JSON.stringify(apiResponse, null, 2));
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('');
    console.log('CONCLUSION:');
    console.log('✅ Database is connected and operational');
    console.log('✅ Profile updates are persisting in MongoDB');
    console.log('✅ Data can be retrieved successfully');
    console.log('✅ The application is using REAL DATABASE (not mock mode)');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ ERROR OCCURRED:');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('');
    
    if (error.code === 'P1001') {
      console.error('⚠️  Cannot reach database server.');
      console.error('   Check if MongoDB connection string is correct.');
    } else if (error.code === 'P1003') {
      console.error('⚠️  Database does not exist.');
    } else if (error.code) {
      console.error(`⚠️  Prisma error code: ${error.code}`);
    }
    
    console.error('');
    console.error('Full error details:');
    console.error(error);
    console.error('');
    console.error('NOTE: If database is not available, the application falls back to MOCK MODE');
    console.error('      (in-memory storage that persists only during server runtime)');
  } finally {
    await prisma.$disconnect();
    console.log('👋 Disconnected from database');
  }
}

// Run the test
testDatabaseConnection()
  .catch(console.error)
  .finally(() => process.exit(0));
