import http from 'http';

const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runE2E() {
  console.log('=== STARTING HTTP E2E WORKFLOW TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.success, 'Health check GET /api/health');

    // 2. Auth Login
    const login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'citizen@janseva.gov.in',
        password: 'Citizen@123'
      })
    });
    assert(login.status === 200 && login.data.data.token, 'Citizen login POST /api/auth/login');
    const token = login.data.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. Citizen Dashboard Stats
    const stats = await request('/api/citizen/dashboard/stats', { headers: authHeaders });
    assert(stats.status === 200 && stats.data.data.totalComplaints !== undefined, 'Dashboard stats GET /api/citizen/dashboard/stats');

    // 4. Register Complaint
    const newComp = await request('/api/complaints', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Broken streetlight on Senapati Bapat Road',
        description: 'The street light has been flickering and completely dead since Wednesday night, posing security risks.',
        category: 'Electrical',
        subcategory: 'Streetlight Failure',
        state: 'Maharashtra',
        district: 'Pune',
        area: 'Senapati Bapat Road',
        landmark: 'Opposite Symbiosis College',
        location_address: 'Senapati Bapat Road, Ward 10, Pune 411016',
        latitude: 18.5312,
        longitude: 73.8320,
        priority: 'MEDIUM',
        preferred_contact_method: 'IN_APP',
        is_emergency: false,
        is_public: true
      })
    });
    assert(
      newComp.status === 201 && newComp.data.data.trackingId,
      `Register complaint POST /api/complaints -> Generated Tracking ID: ${newComp.data?.data?.trackingId}`
    );
    const trackingId = newComp.data.data.trackingId;
    const createdId = newComp.data.data.complaintId;

    // 5. My Complaints
    const myComplaints = await request('/api/complaints/my', { headers: authHeaders });
    assert(
      myComplaints.status === 200 && myComplaints.data.data.some(c => c.tracking_id === trackingId),
      `My Complaints GET /api/complaints/my includes newly submitted ${trackingId}`
    );

    // 6. Nearby Discovery
    const nearby = await request('/api/complaints/nearby?latitude=18.5308&longitude=73.8475&radius=5', {
      headers: authHeaders
    });
    assert(
      nearby.status === 200 && Array.isArray(nearby.data.data) && nearby.data.data.length > 0,
      `Nearby Discovery GET /api/complaints/nearby found ${nearby.data.data.length} complaints`
    );

    // 7. Community Join: Citizen 1 joins Complaint 1
    const joinRes = await request('/api/complaints/1/join', {
      method: 'POST',
      headers: authHeaders
    });
    // Either 200 (joined) or 409 (already joined from earlier test or seed)
    assert(
      joinRes.status === 200 || joinRes.status === 409,
      `Join community complaint POST /api/complaints/1/join (Status: ${joinRes.status})`
    );

    // 8. Test Duplicate Support Prevention
    // Joining Complaint 1 again must return 409
    const dupJoinRes = await request('/api/complaints/1/join', {
      method: 'POST',
      headers: authHeaders
    });
    assert(
      dupJoinRes.status === 409,
      `Duplicate support prevention POST /api/complaints/1/join returned 409 Conflict: "${dupJoinRes.data.message}"`
    );

    // 9. Joined Complaints
    const joinedList = await request('/api/citizen/joined-complaints', { headers: authHeaders });
    assert(
      joinedList.status === 200 && Array.isArray(joinedList.data.data),
      `Joined Complaints GET /api/citizen/joined-complaints returned ${joinedList.data.data.length} records`
    );

    // 10. Public Tracking Lookup
    const trackRes = await request(`/api/complaints/track/${trackingId}`);
    assert(
      trackRes.status === 200 && trackRes.data.data.trackingId === trackingId,
      `Public Track GET /api/complaints/track/${trackingId}`
    );
    assert(
      !trackRes.data.data.citizenPhone && !trackRes.data.data.citizenEmail,
      'Public tracking hides sensitive contact info'
    );

    // 11. Timeline History (Citizen Privacy Verification)
    const historyRes = await request(`/api/complaints/1/history`, { headers: authHeaders });
    assert(
      historyRes.status === 200 && historyRes.data.data.every(h => h.visibility === 'CITIZEN'),
      'Complaint history timeline hides internal administrative remarks from citizen'
    );

    // 12. Metadata Endpoints
    const depts = await request('/api/departments');
    assert(depts.status === 200 && depts.data.data.length >= 7, 'Metadata GET /api/departments returns active departments');

    const cats = await request('/api/complaints/meta/categories');
    assert(cats.status === 200 && cats.data.data.length >= 6, 'Metadata GET /api/complaints/meta/categories returns standard categories');

    console.log(`\n=== E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
  } catch (err) {
    console.error('E2E test error:', err);
    failed++;
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runE2E();
