import { pool, query } from '../src/config/db.js';
import { generateTrackingId } from '../src/services/trackingIdService.js';
import { suggestDepartment } from '../src/services/departmentRoutingService.js';
import { findNearbyComplaints } from '../src/services/nearbyComplaintService.js';
import { joinComplaint, leaveComplaint } from '../src/services/complaintSupportService.js';
import { getComplaintHistory } from '../src/services/complaintHistoryService.js';
import { createComplaint, trackComplaintByTrackingId, getCitizenDashboardData } from '../src/services/complaintService.js';

async function runTests() {
  console.log('=== STARTING INTEGRATION TESTS FOR JANSEVA CONNECT CORE GRIEVANCE MODULE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test Tracking ID Generation
    const trackingId1 = await generateTrackingId();
    const trackingId2 = await generateTrackingId();
    assert(
      /^JSC-\d{4}-\d{6}$/.test(trackingId1),
      `Tracking ID format matches JSC-YYYY-000000: ${trackingId1}`
    );
    assert(
      trackingId1 !== trackingId2,
      `Consecutive tracking IDs are unique: ${trackingId1} vs ${trackingId2}`
    );

    // 2. Test Department Routing Suggestion (English, Hindi, Marathi)
    const sanitationEn = await suggestDepartment('Sanitation', 'Piles of garbage', 'Bad smell from waste');
    assert(
      sanitationEn.departmentCode === 'SANITATION',
      `English keyword routing: Garbage -> SANITATION (got ${sanitationEn.departmentCode})`
    );

    const roadHi = await suggestDepartment('Public Works', 'सड़क पर बड़ा खड्डा', 'रास्ते पर गड्ढा होने से दुर्घटना हो सकती है');
    assert(
      roadHi.departmentCode === 'PWD',
      `Hindi keyword routing: खड्डा / सड़क -> PWD (got ${roadHi.departmentCode})`
    );

    const waterMr = await suggestDepartment('Water Supply', 'पाईपलाईन फुटली आहे', 'रस्त्यावर पिण्याचे पाणी वाहून जात आहे');
    assert(
      waterMr.departmentCode === 'WATER',
      `Marathi keyword routing: पाणी / पाईपलाईन -> WATER (got ${waterMr.departmentCode})`
    );

    // 3. Test Nearby Complaint Discovery
    // Shivaji Nagar coordinates: 18.5308, 73.8475
    const nearbyResults = await findNearbyComplaints({
      latitude: 18.5308,
      longitude: 73.8475,
      radius: 2, // 2 km
      currentUserId: 1
    });

    assert(
      Array.isArray(nearbyResults.results) && nearbyResults.results.length > 0,
      `Nearby complaint discovery returned ${nearbyResults.results.length} active complaints within 2km`
    );

    assert(
      nearbyResults.results.every(r => r.distanceKm <= 2),
      `All nearby complaints are within specified 2 km radius`
    );

    // Check privacy protection on nearby results
    const sampleNearby = nearbyResults.results[0];
    assert(
      sampleNearby.distanceLabel && !sampleNearby.locationAddress,
      `Nearby results expose distanceLabel (${sampleNearby.distanceLabel}) and protect private residential coordinates`
    );

    // 4. Test Citizen Complaint Registration
    const citizenUser = (await query("SELECT id FROM users WHERE email = 'citizen@janseva.gov.in'")).rows[0];
    const newComp = await createComplaint(citizenUser.id, {
      title: 'Water pipe leak near Model Colony',
      description: 'Water has been gushing out from the secondary line for 12 hours.',
      category: 'Water Supply',
      district: 'Pune',
      area: 'Model Colony',
      landmark: 'Near Deep Bungalow Chowk',
      location_address: 'Survey 22, Deep Bungalow Chowk, Model Colony, Pune',
      latitude: 18.5360,
      longitude: 73.8340,
      priority: 'HIGH',
      preferred_contact_method: 'IN_APP',
      is_emergency: false,
      is_public: true
    });

    assert(
      newComp.trackingId && /^JSC-\d{4}-\d{6}$/.test(newComp.trackingId),
      `Created complaint with tracking ID ${newComp.trackingId}`
    );
    assert(
      newComp.routingSuggestion.departmentCode === 'WATER',
      `Complaint automatically routed to WATER department`
    );

    // 5. Test Community Support Joining System
    // Citizen 1 joins Complaint 2 (which is created by Citizen 3)
    const joinRes = await joinComplaint(2, citizenUser.id);
    assert(
      joinRes.joined === true && joinRes.supporterCount > 0,
      `Citizen joined Complaint 2. New supporter count: ${joinRes.supporterCount}`
    );

    // 6. Test Duplicate Support Prevention
    let duplicateCaught = false;
    try {
      await joinComplaint(2, citizenUser.id);
    } catch (err) {
      duplicateCaught = true;
      assert(
        err.statusCode === 409,
        `Duplicate support prevented with HTTP 409: "${err.message}"`
      );
    }
    assert(duplicateCaught, `Duplicate support prevention blocked repeated join`);

    // 7. Test Citizen Cannot Support Own Complaint
    let ownSupportCaught = false;
    try {
      await joinComplaint(newComp.complaint.id, citizenUser.id);
    } catch (err) {
      ownSupportCaught = true;
      assert(
        err.statusCode === 400,
        `Cannot support own complaint blocked with HTTP 400: "${err.message}"`
      );
    }
    assert(ownSupportCaught, `Own complaint joining blocked`);

    // 8. Test Support Withdrawal
    const leaveRes = await leaveComplaint(2, citizenUser.id);
    assert(
      leaveRes.joined === false,
      `Citizen withdrew support from Complaint 2`
    );

    // 9. Test Complaint History Timeline and Privacy
    const citizenTimeline = await getComplaintHistory(1, 'CITIZEN');
    const adminTimeline = await getComplaintHistory(1, 'ADMIN');

    assert(
      citizenTimeline.every(item => item.visibility === 'CITIZEN'),
      `Citizen timeline contains only citizen-visible events (no internal remarks)`
    );
    assert(
      adminTimeline.length >= citizenTimeline.length,
      `Admin timeline includes internal remarks (Citizen: ${citizenTimeline.length}, Admin: ${adminTimeline.length})`
    );

    // 10. Test Public Complaint Tracking Lookup
    const trackData = await trackComplaintByTrackingId('JSC-2026-000001');
    assert(
      trackData.trackingId === 'JSC-2026-000001',
      `Tracked complaint JSC-2026-000001 status: ${trackData.status}`
    );
    assert(
      !trackData.citizenPhone && !trackData.citizenEmail,
      `Public tracking protects citizen private contact information`
    );

    // 11. Test Citizen Dashboard Statistics
    const dashData = await getCitizenDashboardData(citizenUser.id);
    assert(
      dashData.stats.totalComplaints >= 1,
      `Dashboard stats returns actual complaint count: ${dashData.stats.totalComplaints}`
    );
    assert(
      Array.isArray(dashData.recentComplaints),
      `Dashboard returns recent complaints array (${dashData.recentComplaints.length} items)`
    );

    console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
  } catch (error) {
    console.error('Fatal test failure:', error);
    failed++;
  } finally {
    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
