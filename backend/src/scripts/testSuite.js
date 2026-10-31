import { initializeDatabase, query } from "../config/db.js";

async function runTestSuite() {
  await initializeDatabase();
  console.log("=================================================");
  console.log("   JANSEVA CONNECT - MEMBER 2 COMPREHENSIVE TEST");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Database Table Structure Tests
    console.log("\n--- TEST GROUP 1: Database Tables & Integrity ---");
    const tablesRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tableNames = tablesRes.rows.map((r) => r.table_name);
    assert(tableNames.includes("services"), "services table exists");
    assert(tableNames.includes("service_versions"), "service_versions table exists");
    assert(tableNames.includes("schemes"), "schemes table exists");
    assert(tableNames.includes("scheme_eligibility_rules"), "scheme_eligibility_rules table exists");
    assert(tableNames.includes("departments"), "departments table exists");
    assert(tableNames.includes("contact_messages"), "contact_messages table exists");

    // 2. Count Records
    const servicesCount = await query("SELECT count(*) as c FROM services");
    const schemesCount = await query("SELECT count(*) as c FROM schemes");
    const rulesCount = await query("SELECT count(*) as c FROM scheme_eligibility_rules");
    assert(parseInt(servicesCount.rows[0].c, 10) >= 8, `Public services seeded: ${servicesCount.rows[0].c}`);
    assert(parseInt(schemesCount.rows[0].c, 10) >= 8, `Government schemes seeded: ${schemesCount.rows[0].c}`);
    assert(parseInt(rulesCount.rows[0].c, 10) >= 15, `Eligibility rules seeded: ${rulesCount.rows[0].c}`);

    // 3. API Test: Public Services Listing & Search
    console.log("\n--- TEST GROUP 2: Public Services APIs ---");
    const baseUrl = "http://localhost:5000/api";

    const resServices = await fetch(`${baseUrl}/services?page=1&limit=4`);
    const dataServices = await resServices.json();
    assert(resServices.status === 200 && dataServices.success, "GET /api/services returns 200 and success");
    assert(dataServices.services.length === 4, "Pagination limit respected (4 items returned)");
    assert(dataServices.pagination.total >= 8, `Pagination total accurate (${dataServices.pagination.total})`);

    // Search
    const resSearch = await fetch(`${baseUrl}/services?search=income`);
    const dataSearch = await resSearch.json();
    assert(dataSearch.services.length > 0, `Search for 'income' returned ${dataSearch.services.length} records`);
    assert(dataSearch.services[0].name.toLowerCase().includes("income"), "Search hit matches query keyword");

    // Detail by Slug
    const resDetail = await fetch(`${baseUrl}/services/issuance-of-income-certificate`);
    const dataDetail = await resDetail.json();
    assert(resDetail.status === 200 && dataDetail.service, "GET /api/services/:id by slug returns 200 and details");
    assert(Array.isArray(dataDetail.service.versions), "Version history snapshots included");
    assert(dataDetail.service.official_source_url.startsWith("http"), "Authentic official source URL present");

    // Categories and Departments
    const resCats = await fetch(`${baseUrl}/services/categories`);
    const dataCats = await resCats.json();
    assert(dataCats.categories.length > 0, `Service categories returned: ${dataCats.categories.length}`);

    const resDepts = await fetch(`${baseUrl}/services/departments`);
    const dataDepts = await resDepts.json();
    assert(dataDepts.departments.length > 0, `Service departments returned: ${dataDepts.departments.length}`);

    // 4. API Test: Government Schemes
    console.log("\n--- TEST GROUP 3: Government Schemes APIs ---");
    const resSchemes = await fetch(`${baseUrl}/schemes?limit=4`);
    const dataSchemes = await resSchemes.json();
    assert(resSchemes.status === 200 && dataSchemes.success, "GET /api/schemes returns 200");

    const resFeatured = await fetch(`${baseUrl}/schemes/featured`);
    const dataFeatured = await resFeatured.json();
    assert(dataFeatured.schemes.length > 0, `Featured schemes returned: ${dataFeatured.schemes.length}`);

    const resSchemeDetail = await fetch(`${baseUrl}/schemes/mukhyamantri-majhi-ladki-bahin-yojana`);
    const dataSchemeDetail = await resSchemeDetail.json();
    assert(resSchemeDetail.status === 200 && dataSchemeDetail.scheme, "GET /api/schemes/:id returns scheme details");
    assert(dataSchemeDetail.scheme.rules.length >= 4, `Scheme eligibility rules linked: ${dataSchemeDetail.scheme.rules.length}`);

    // 5. API Test: Rule-Based Eligibility Engine
    console.log("\n--- TEST GROUP 4: Rule-Based Eligibility Engine ---");
    
    // Scenario 1: Female Student in Maharashtra with low income
    const resElig1 = await fetch(`${baseUrl}/eligibility/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: 23,
        state: "Maharashtra",
        district: "Nagpur",
        annualIncome: 150000,
        education: "Undergraduate",
        occupation: "Student",
        gender: "Female",
      }),
    });
    const dataElig1 = await resElig1.json();
    assert(resElig1.status === 200 && dataElig1.success, "POST /api/eligibility/check returns 200");
    assert(dataElig1.counts.likely > 0, `Likely eligible schemes found: ${dataElig1.counts.likely}`);

    const ladkiBahinMatch = dataElig1.results.find((r) => r.slug === "mukhyamantri-majhi-ladki-bahin-yojana");
    assert(ladkiBahinMatch?.status === "LIKELY_ELIGIBLE", "Ladki Bahin classified LIKELY_ELIGIBLE for eligible female");

    const pmKisanStudent = dataElig1.results.find((r) => r.slug === "pm-kisan-samman-nidhi");
    assert(pmKisanStudent?.status === "UNLIKELY_ELIGIBLE", "PM-KISAN classified UNLIKELY_ELIGIBLE for non-farmer student");

    // Scenario 2: Farmer Profile
    const resElig2 = await fetch(`${baseUrl}/eligibility/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: 48,
        state: "Maharashtra",
        district: "Nashik",
        annualIncome: 180000,
        education: "10th Pass",
        occupation: "Farmer",
        gender: "Male",
      }),
    });
    const dataElig2 = await resElig2.json();
    const pmKisanFarmer = dataElig2.results.find((r) => r.slug === "pm-kisan-samman-nidhi");
    assert(pmKisanFarmer?.status === "LIKELY_ELIGIBLE", "PM-KISAN classified LIKELY_ELIGIBLE for verified farmer");

    const ladkiBahinMale = dataElig2.results.find((r) => r.slug === "mukhyamantri-majhi-ladki-bahin-yojana");
    assert(ladkiBahinMale?.status === "UNLIKELY_ELIGIBLE", "Ladki Bahin correctly classified UNLIKELY_ELIGIBLE for male applicant");

    // Scenario 3: High income profile (₹20,00,000)
    const resElig3 = await fetch(`${baseUrl}/eligibility/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: 32,
        state: "Maharashtra",
        district: "Mumbai",
        annualIncome: 2000000,
        education: "Postgraduate",
        occupation: "Salaried Employee",
        gender: "Female",
      }),
    });
    const dataElig3 = await resElig3.json();
    const highIncomeLadki = dataElig3.results.find((r) => r.slug === "mukhyamantri-majhi-ladki-bahin-yojana");
    assert(highIncomeLadki?.status === "UNLIKELY_ELIGIBLE", "Income exceeding limit correctly triggers UNLIKELY_ELIGIBLE");
    assert(highIncomeLadki?.unmatchedCriteria.some(c => c.includes("exceeds")), "Income ceiling failure explicitly reported in unmatchedCriteria");

    // 6. Contact API Test
    console.log("\n--- TEST GROUP 5: Contact Messages API ---");
    const resContact = await fetch(`${baseUrl}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Sunil Patil",
        email: "sunil.patil@example.com",
        subject: "Verification inquiry for RTS water connection",
        message: "Can you confirm if municipal property tax receipts from the prior fiscal year are accepted?",
      }),
    });
    const dataContact = await resContact.json();
    assert(resContact.status === 201 && dataContact.success, "POST /api/contact saves valid message and returns 201");
    assert(typeof dataContact.ticketId === "number", `Ticket ID generated: #${dataContact.ticketId}`);

    // Contact Validation failure test
    const resContactBad = await fetch(`${baseUrl}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "S",
        email: "invalid-email",
        subject: "",
        message: "too short",
      }),
    });
    assert(resContactBad.status === 400, "POST /api/contact properly rejects invalid inputs with 400");

    // 7. Platform Stats API
    console.log("\n--- TEST GROUP 6: Dynamic Platform Stats API ---");
    const resStats = await fetch(`${baseUrl}/stats`);
    const dataStats = await resStats.json();
    assert(dataStats.success, "GET /api/stats returns 200");
    assert(dataStats.stats.totalServices >= 8, `Stats totalServices: ${dataStats.stats.totalServices}`);
    assert(dataStats.stats.totalSchemes >= 8, `Stats totalSchemes: ${dataStats.stats.totalSchemes}`);
    assert(dataStats.stats.totalDepartments >= 8, `Stats totalDepartments: ${dataStats.stats.totalDepartments}`);

    console.log("\n=================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test Suite execution exception:", err);
    process.exit(1);
  }
}

runTestSuite();
