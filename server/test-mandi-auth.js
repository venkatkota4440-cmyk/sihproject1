// Automated verification of Agrinex Mandi API and Authentication System
const http = require('http');

async function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`http://localhost:5000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing Government Mandi API Endpoints ---');
  
  // Test 1: Latest price for Potato
  const latestPotato = await get('/api/market-prices/latest?commodity=Potato');
  console.log('1. Latest Potato Price:', latestPotato.status === 200 && latestPotato.body.success ? 'PASS' : 'FAIL');
  console.log('   Data:', latestPotato.body.data?.commodity, 'Modal Price:', latestPotato.body.data?.modalPrice, latestPotato.body.data?.unit, 'Per Kg:', latestPotato.body.data?.modalPricePerKg);
  console.log('   Source:', latestPotato.body.source);

  // Test 2: Filtered query with limit
  const mandiQuery = await get('/api/market-prices?commodity=Onion&limit=3');
  console.log('2. Filtered Mandi Query (Onion, limit 3):', mandiQuery.status === 200 && mandiQuery.body.success ? 'PASS' : 'FAIL');
  console.log('   Total found:', mandiQuery.body.total, 'Count returned:', mandiQuery.body.count);

  // Test 3: Search with autocomplete
  const searchRes = await get('/api/market-prices/search?commodity=Wheat&limit=2');
  console.log('3. Search Autocomplete (Wheat):', searchRes.status === 200 && searchRes.body.success ? 'PASS' : 'FAIL');
  console.log('   Count:', searchRes.body.count, 'Matches:', searchRes.body.data?.map(d => d.commodity).join(', '));

  // Test 4: States list
  const statesRes = await get('/api/market-prices/states');
  console.log('4. Mandi States List:', statesRes.status === 200 && statesRes.body.success ? 'PASS' : 'FAIL');
  console.log('   States count:', statesRes.body.data?.length);

  // Test 5: Pipeline & Cache Status
  const statusRes = await get('/api/market-prices/status');
  console.log('5. Mandi Pipeline & Redis Status:', statusRes.status === 200 && statusRes.body.success ? 'PASS' : 'FAIL');
  console.log('   Redis Status:', statusRes.body.data?.redis?.status, 'Cache TTL:', statusRes.body.data?.redis?.ttlSeconds);
  console.log('   Mandi Source:', statusRes.body.data?.source);

  console.log('\n--- 2. Testing Authentication Gateway & Registration ---');
  const timestamp = Date.now();
  
  // Test 6: Farmer Registration
  const farmerReg = await post('/api/auth/register', {
    fullName: `Kisan Ramesh ${timestamp}`,
    email: `farmer_${timestamp}@agrinex.gov.in`,
    mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    role: 'FARMER',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Niphad',
    primaryCrop: 'Onion',
    farmLocation: 'Survey No. 42, Niphad',
    termsAccepted: true
  });
  console.log('6. Farmer Registration with agricultural fields:', farmerReg.status === 201 && farmerReg.body.success ? 'PASS' : 'FAIL');
  console.log('   User Role:', farmerReg.body.data?.user?.role, 'Primary Crop:', farmerReg.body.data?.user?.primaryCrop);

  // Test 7: Buyer Registration
  const buyerReg = await post('/api/auth/register', {
    fullName: `Retail Agro Corp ${timestamp}`,
    email: `buyer_${timestamp}@agrinex.gov.in`,
    mobile: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    role: 'BUYER',
    state: 'Delhi',
    district: 'North Delhi',
    businessType: 'Institutional Wholesaler',
    interestedCrops: ['Potato', 'Tomato', 'Onion'],
    termsAccepted: true
  });
  console.log('7. Buyer Registration with institutional fields:', buyerReg.status === 201 && buyerReg.body.success ? 'PASS' : 'FAIL');
  console.log('   User Role:', buyerReg.body.data?.user?.role, 'Business Type:', buyerReg.body.data?.user?.businessType);

  // Test 8: Farmer Login
  const farmerLogin = await post('/api/auth/login', {
    email: `farmer_${timestamp}@agrinex.gov.in`,
    password: 'SecurePassword123!',
    role: 'FARMER'
  });
  console.log('8. Farmer Authentication:', farmerLogin.status === 200 && farmerLogin.body.success ? 'PASS' : 'FAIL');
  console.log('   Token generated:', !!farmerLogin.body.data?.token, 'Role verified:', farmerLogin.body.data?.user?.role);

  // Test 9: Wrong Password Rejection
  const badLogin = await post('/api/auth/login', {
    email: `farmer_${timestamp}@agrinex.gov.in`,
    password: 'WrongPassword999'
  });
  console.log('9. Rejection on Invalid Password:', badLogin.status === 401 ? 'PASS' : 'FAIL');

  console.log('\n--- ALL VERIFICATION CHECKS COMPLETED ---');
}

runTests().catch(console.error);
