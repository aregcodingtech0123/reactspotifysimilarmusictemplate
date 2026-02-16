/**
 * STEP 1 - Backend API Verification Script
 * 
 * Run this with: node test-api.js
 * 
 * This will test all backend endpoints and show the exact response structure.
 */

const API_BASE = 'http://localhost:4001';

async function testEndpoint(name, url) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(url);
    const json = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response OK: ${response.ok}`);
    console.log('\nFull Response JSON:');
    console.log(JSON.stringify(json, null, 2));
    
    if (json.success && json.data) {
      console.log('\n✅ Response has success=true and data field');
      if (Array.isArray(json.data)) {
        console.log(`✅ Data is array with ${json.data.length} items`);
        if (json.data.length > 0) {
          console.log('\nFirst item structure:');
          console.log(JSON.stringify(json.data[0], null, 2));
          console.log('\nFirst item fields:', Object.keys(json.data[0]));
        } else {
          console.log('⚠️  Array is empty - no data in database');
        }
      } else if (typeof json.data === 'object') {
        console.log('✅ Data is object');
        if (json.data.songs && Array.isArray(json.data.songs)) {
          console.log(`✅ Data.songs is array with ${json.data.songs.length} items`);
          if (json.data.songs.length > 0) {
            console.log('\nFirst song structure:');
            console.log(JSON.stringify(json.data.songs[0], null, 2));
            console.log('\nFirst song fields:', Object.keys(json.data.songs[0]));
          }
        } else {
          console.log('✅ Data object keys:', Object.keys(json.data));
        }
      }
    } else {
      console.log('❌ Response structure unexpected');
      console.log('Expected: { success: true, data: ... }');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('This usually means:');
    console.error('  1. Backend is not running on port 4001');
    console.error('  2. CORS is blocking the request');
    console.error('  3. Network connectivity issue');
  }
}

async function runTests() {
  console.log('\n🔍 BACKEND API VERIFICATION');
  console.log('Testing endpoints on:', API_BASE);
  console.log('\n⚠️  Make sure backend is running on port 4001!');
  
  await testEndpoint('GET /api/songs', `${API_BASE}/api/songs?limit=5`);
  await testEndpoint('GET /api/songs/trending', `${API_BASE}/api/songs/trending?limit=5`);
  await testEndpoint('GET /api/songs/new', `${API_BASE}/api/songs/new?limit=5`);
  await testEndpoint('GET /api/songs/genre/Rock', `${API_BASE}/api/songs/genre/Rock?limit=5`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed');
  console.log('='.repeat(60));
  console.log('\n📋 SUMMARY:');
  console.log('If you see empty arrays [], the database needs to be seeded.');
  console.log('Run: curl -X POST http://localhost:4001/api/songs/seed -H "Content-Type: application/json" -d \'{"source":"trending"}\'');
}

runTests().catch(console.error);
