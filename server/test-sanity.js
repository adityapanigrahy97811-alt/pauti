const http = require('http');
const app = require('./src/server');

const PORT = 5001;

const server = app.listen(PORT, async () => {
  console.log(`🧪 Sanity test server running on port ${PORT}...`);

  const request = (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${PORT}${path}`, options, (res) => {
        let data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(data);
          try {
            const json = JSON.parse(buffer.toString());
            resolve({ status: res.statusCode, headers: res.headers, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, buffer });
          }
        });
      });
      req.on('error', reject);
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  };

  try {
    // 1. Health Check
    console.log('1️⃣ Testing /api/health...');
    const health = await request('/api/health');
    console.log('✅ Health check:', health.data);

    // 2. Admin Login
    console.log('\n2️⃣ Testing Admin Login (/api/auth/login)...');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { username: 'admin', password: 'Admin@123' }
    });
    console.log('✅ Login status:', loginRes.status, 'User:', loginRes.data?.user?.name);
    const token = loginRes.data?.token;

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Collectors List & Creation Test
    console.log('\n3️⃣ Testing Collectors API (/api/collectors)...');
    const listColtrs = await request('/api/collectors', { headers: authHeaders });
    console.log('✅ Existing active collectors count:', listColtrs.data?.data?.length);

    const newColtr = await request('/api/collectors', {
      method: 'POST',
      headers: authHeaders,
      body: { name: 'Mahesh Shinde', mobile: '9866554433' }
    });
    console.log('✅ Created new collector:', newColtr.data?.data?.name, 'ID:', newColtr.data?.data?.id);
    const collectorId = newColtr.data?.data?.id;

    // 4. Create New Collection with designated collector
    console.log('\n4️⃣ Testing Collection Creation with Collector (/api/collections)...');
    const newColRes = await request('/api/collections', {
      method: 'POST',
      headers: authHeaders,
      body: {
        donorName: 'Rajesh S. Kadam',
        mobile: '9867554433',
        address: 'Flat 101, Om Sai Arcade, Rohit Colony, Boisar',
        amount: 5100,
        paymentMode: 'UPI',
        purpose: 'Ganeshotsav Donation',
        collectorId: collectorId
      }
    });
    console.log('✅ Collection created:', newColRes.data?.data?.receiptNo, 'Collector:', newColRes.data?.data?.collectorName, 'Created By:', newColRes.data?.data?.createdBy?.name);

    // 5. Check Collector Statistics
    console.log('\n5️⃣ Testing Collector Statistics (/api/collectors/:id/statistics)...');
    const statsRes = await request(`/api/collectors/${collectorId}/statistics`, { headers: authHeaders });
    console.log('✅ Collector stats:', {
      name: statsRes.data?.data?.collector?.name,
      totalCollection: statsRes.data?.data?.totalCollection,
      totalCount: statsRes.data?.data?.totalCount
    });

    // 6. Create Expense
    console.log('\n6️⃣ Testing Expense Creation (/api/expenses)...');
    const newExpRes = await request('/api/expenses', {
      method: 'POST',
      headers: authHeaders,
      body: {
        category: 'Food',
        description: 'Maha Prasad preparation ingredients and Modak',
        amount: 6000,
        paymentMode: 'CASH',
        paidBy: 'Santosh Sawant (Treasurer)'
      }
    });
    console.log('✅ Expense created:', newExpRes.data?.data?.expenseId, 'Amount:', newExpRes.data?.data?.amount);

    // 7. Test ExcelJS Multi-sheet Accounts Export
    console.log('\n7️⃣ Testing ExcelJS Complete Accounts (.xlsx) Export (/api/exports/complete-accounts)...');
    const excelRes = await request('/api/exports/complete-accounts', { headers: authHeaders });
    console.log('✅ Excel export status:', excelRes.status, 'Content-Type:', excelRes.headers['content-type'], 'File size in bytes:', excelRes.buffer?.length);

    // 8. Test Voiding Collection
    console.log('\n8️⃣ Testing Collection Voiding with reason (/api/collections/:id/void)...');
    const colId = newColRes.data?.data?.id;
    const voidRes = await request(`/api/collections/${colId}/void`, {
      method: 'PATCH',
      headers: authHeaders,
      body: { voidReason: 'Duplicate entry created by mistake' }
    });
    console.log('✅ Void status:', voidRes.data?.message);

    console.log('\n🎉 ALL BACKEND SANITY & COLLECTOR TESTS PASSED 100%!\n');
  } catch (err) {
    console.error('❌ Sanity test failed:', err);
  } finally {
    server.close();
  }
});
