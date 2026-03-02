/**
 * Profile Update Test Script
 * Run this in the browser console to test profile update functionality
 */

// Test 1: Check if token exists
console.log('=== TEST 1: Authentication Token ===');
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token found:', token.substring(0, 20) + '...');
} else {
  console.error('❌ No token found - Please login first');
}

// Test 2: Fetch current profile
console.log('\n=== TEST 2: Fetch Current Profile ===');
fetch('http://localhost:3000/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Profile fetched successfully:');
  console.log(data);
  
  // Test 3: Update profile
  console.log('\n=== TEST 3: Update Profile ===');
  const updateData = {
    name: data.name || 'Test User',
    college: data.college || 'Test College',
    branch: data.branch || 'Computer Science',
    year: data.year || 2026,
    cgpa: data.cgpa || 8.5,
    skills: [...(data.skills || []), 'Testing'],
    targetCompanies: data.targetCompanies || ['Google', 'Microsoft'],
    targetRoles: data.targetRoles || ['Software Engineer'],
    availableHoursPerWeek: 20,
    githubUsername: data.githubUsername || 'testuser',
    leetcodeUsername: data.leetcodeUsername || 'testuser',
    codeforcesUsername: null
  };
  
  console.log('Sending update:', updateData);
  
  return fetch('http://localhost:3000/api/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
})
.then(res => res.json())
.then(data => {
  console.log('✅ Profile updated successfully:');
  console.log(data);
  
  // Test 4: Verify update persisted
  console.log('\n=== TEST 4: Verify Update Persisted ===');
  return fetch('http://localhost:3000/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
})
.then(res => res.json())
.then(data => {
  console.log('✅ Re-fetched profile to verify:');
  console.log(data);
  
  if (data.skills && data.skills.includes('Testing')) {
    console.log('✅ UPDATE VERIFIED: "Testing" skill found in profile!');
  } else {
    console.log('⚠️  Could not verify update - check if skills array contains "Testing"');
  }
})
.catch(error => {
  console.error('❌ Error during testing:', error);
  console.error('Error details:', error.message);
});

console.log('\n=== Tests Started - Check results above ===');
