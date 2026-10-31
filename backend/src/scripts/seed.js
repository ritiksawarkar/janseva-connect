import { pool, initializeDatabase } from "../config/db.js";

export async function runSeeds() {
  const client = await pool.connect();
  try {
    console.log("Seeding verified data for JanSeva Connect...");
    await client.query("BEGIN");

    // Clean existing seed tables (safe for fresh development)
    await client.query("DELETE FROM scheme_eligibility_rules;");
    await client.query("DELETE FROM service_versions;");
    await client.query("DELETE FROM services;");
    await client.query("DELETE FROM schemes;");
    await client.query("DELETE FROM contact_messages;");
    await client.query("DELETE FROM departments;");

    // Reset sequences
    await client.query("ALTER SEQUENCE departments_id_seq RESTART WITH 1;");
    await client.query("ALTER SEQUENCE services_id_seq RESTART WITH 1;");
    await client.query("ALTER SEQUENCE service_versions_id_seq RESTART WITH 1;");
    await client.query("ALTER SEQUENCE schemes_id_seq RESTART WITH 1;");
    await client.query("ALTER SEQUENCE scheme_eligibility_rules_id_seq RESTART WITH 1;");

    // 1. Departments
    const deptResults = await client.query(`
      INSERT INTO departments (name, code, description, contact_email, website_url)
      VALUES
        ('Revenue and Forest Department, Maharashtra', 'REV_MH', 'Handles land records, revenue, caste, income, and domicile certificates', 'helpdesk.rev@maharashtra.gov.in', 'https://aaplesarkar.mahaonline.gov.in/'),
        ('Social Justice and Special Assistance Department, Maharashtra', 'SOC_MH', 'Welfare of backward classes, scholarships, and pension schemes', 'support.sjsa@maharashtra.gov.in', 'https://mahadbt.maharashtra.gov.in/'),
        ('Higher and Technical Education Department, Maharashtra', 'HED_MH', 'Higher education scholarships, university administration, and technical training', 'hed.support@maharashtra.gov.in', 'https://mahadbt.maharashtra.gov.in/'),
        ('Department of Agriculture and Farmers Welfare', 'AGRI_IN', 'Agricultural schemes, farmer financial support, and crop welfare', 'pmkisan-ict@gov.in', 'https://pmkisan.gov.in/'),
        ('Public Health and Family Welfare Department', 'HLTH_MH', 'Public health facilities, health insurance, and vital registrations', 'health.helpdesk@maharashtra.gov.in', 'https://arogya.maharashtra.gov.in/'),
        ('Women and Child Development Department, Maharashtra', 'WCD_MH', 'Empowerment of women, child welfare, and direct benefit schemes', 'wcd.help@maharashtra.gov.in', 'https://ladkibahin.maharashtra.gov.in/'),
        ('Urban Development & Municipal Administration Department', 'URB_MH', 'Municipal services, property tax, water supply, and civic registrations', 'urban.support@maharashtra.gov.in', 'https://aaplesarkar.mahaonline.gov.in/'),
        ('Ministry of Skill Development and Entrepreneurship', 'SKILL_IN', 'Vocational training, national apprenticeships, and employment creation', 'apprenticeship-support@gov.in', 'https://www.apprenticeshipindia.gov.in/')
      RETURNING id, code;
    `);

    const deptMap = {};
    deptResults.rows.forEach(r => {
      deptMap[r.code] = r.id;
    });

    // 2. Public Services (8 verified records)
    const servicesData = [
      {
        name: "Issuance of Income Certificate",
        slug: "issuance-of-income-certificate",
        description: "Official certificate issued by the Revenue Department authenticating an applicant's annual family income for scholarship, fee concession, and welfare scheme purposes.",
        eligibility: "Resident of Maharashtra having verifiable family income proofs from agricultural, employment, or business sources.",
        fees: "₹33.60 standard citizen service charge under Maharashtra Right to Public Services Act (RTS).",
        department_id: deptMap['REV_MH'],
        category: "Certificates",
        official_application_url: "https://aaplesarkar.mahaonline.gov.in/",
        official_source_url: "https://aaplesarkar.mahaonline.gov.in/",
        is_verified: true,
        status: "ACTIVE",
        current_version: 1,
        documents: JSON.stringify([
          "Identity Proof (Aadhaar Card / Voter ID / PAN Card)",
          "Address Proof (Ration Card / Electricity Bill / Telephone Bill)",
          "Income Proof (Salary Slip / Form 16 / Income declaration from Talathi)",
          "Self-declaration / Affidavit in prescribed RTS format",
          "Passport-size photograph of the applicant"
        ]),
        application_steps: JSON.stringify([
          "Register or log in to the Aaple Sarkar MahaOnline portal.",
          "Select 'Revenue Department' and choose 'Income Certificate'.",
          "Fill applicant personal details, family income breakdown, and Tehsildar office location.",
          "Upload scanned copies of identity, address, and income proofs.",
          "Pay the statutory RTS application fee online and submit.",
          "Download acknowledgment slip containing application tracking number. Delivery window: 15 working days."
        ])
      },
      {
        name: "Issuance of Domicile and Age/Nationality Certificate",
        slug: "issuance-of-domicile-certificate",
        description: "Statutory proof certifying that an applicant has been a continuous resident of Maharashtra for at least 15 years, required for government jobs, admissions, and state benefits.",
        eligibility: "Applicant residing in Maharashtra continuously for a minimum period of 15 years.",
        fees: "₹33.60 standard government service fee.",
        department_id: deptMap['REV_MH'],
        category: "Certificates",
        official_application_url: "https://aaplesarkar.mahaonline.gov.in/",
        official_source_url: "https://aaplesarkar.mahaonline.gov.in/",
        is_verified: true,
        status: "ACTIVE",
        current_version: 1,
        documents: JSON.stringify([
          "Identity Proof (Aadhaar / Voter ID / Driving License)",
          "Address Proof (Ration Card / Light Bill / Rent Agreement)",
          "15 Years Continuous Residence Proof (School Leaving Certificate / Electricity bills / Land revenue receipts)",
          "Birth Certificate or School Leaving Certificate showing place of birth",
          "Self-declaration in prescribed format"
        ]),
        application_steps: JSON.stringify([
          "Sign in to Aaple Sarkar portal using registered mobile number.",
          "Navigate to Revenue Department -> Certificate of Age, Nationality and Domicile.",
          "Enter residency duration and address history in Maharashtra.",
          "Attach supporting school leaving and address documents.",
          "Pay the online processing fee and note the application token.",
          "Track status online; Tehsildar office issues digitally signed certificate within 15 days."
        ])
      },
      {
        name: "Issuance of Caste Certificate",
        slug: "issuance-of-caste-certificate",
        description: "Official legal document issued by the Sub-Divisional Officer certifying the caste or tribe of a citizen belonging to SC, ST, VJNT, OBC, or SBC categories.",
        eligibility: "Citizen of Maharashtra whose family has ancestral linkage to the recognized community prior to the prescribed cutoff year.",
        fees: "₹33.60 RTS statutory fee.",
        department_id: deptMap['REV_MH'],
        category: "Certificates",
        official_application_url: "https://aaplesarkar.mahaonline.gov.in/",
        official_source_url: "https://aaplesarkar.mahaonline.gov.in/",
        is_verified: true,
        status: "ACTIVE",
        current_version: 1,
        documents: JSON.stringify([
          "Aadhaar Card and Voter Card of applicant",
          "Applicant's School Leaving Certificate / Bonafide Certificate",
          "Father's or Paternal Grandfather's School Leaving Certificate or Birth Extract showing caste",
          "Paternal family tree affidavit (Vamshavali) on stamp paper",
          "Evidence of residence prior to deemed cutoff date (e.g., 1950 for SC, 1961 for VJNT/NT, 1967 for OBC)"
        ]),
        application_steps: JSON.stringify([
          "Log in to Aaple Sarkar portal and select Revenue Department -> Caste Certificate.",
          "Choose appropriate category (SC, ST, OBC, VJ/NT, SBC).",
          "Fill applicant details and paternal genealogical details.",
          "Upload paternal ancestry proofs and applicant identity documents.",
          "Complete online payment and track application with Sub-Divisional Magistrate (SDO)."
        ])
      },
      {
        name: "Issuance of Non-Creamy Layer Certificate (NCL)",
        slug: "issuance-of-non-creamy-layer-certificate",
        description: "Certification verifying that an OBC/VJNT/SBC category applicant does not fall within the creamy layer as defined by annual family income guidelines for reservation benefits.",
        eligibility: "Applicant belonging to OBC, SBC, VJ, or NT category whose parental gross annual income from all sources does not exceed ₹8,00,000 for three consecutive financial years.",
        fees: "₹33.60 official application fee.",
        department_id: deptMap['REV_MH'],
        category: "Certificates",
        official_application_url: "https://aaplesarkar.mahaonline.gov.in/",
        official_source_url: "https://aaplesarkar.mahaonline.gov.in/",
        is_verified: true,
        status: "ACTIVE",
        current_version: 1,
        documents: JSON.stringify([
          "Valid Caste Certificate of applicant or father",
          "Last 3 financial years Income Proof (IT Returns / Form 16 / Tehsildar income certificate)",
          "Aadhaar Card and Ration Card",
          "Affidavit stating that family does not hold constitutional posts or agricultural wealth exceeding statutory ceiling"
        ]),
        application_steps: JSON.stringify([
          "Access Aaple Sarkar -> Revenue Department -> Non-Creamy Layer Certificate.",
          "Provide caste certificate reference number and parent income details for preceding 3 years.",
          "Upload caste proof, income declarations, and affidavit.",
          "Submit application and download transaction receipt.",
          "Issued digitally by Sub-Divisional Officer within 21 working days."
        ])
      },
      {
        name: "Online Registration and Issuance of Birth Certificate",
        slug: "issuance-of-birth-certificate",
        description: "Official vital statistics registration providing legal proof of birth date and place, issued by Municipal Corporations or Gram Panchayats.",
        eligibility: "Child born within Maharashtra municipal or gram panchayat jurisdiction. Institutional or home births registered within 21 days.",
        fees: "Free within 21 days of birth; nominal late fees of ₹2 to ₹10 for delayed registrations as per Registration of Births and Deaths Act.",
        department_id: deptMap['URB_MH'],
        category: "Municipal Services",
        official_application_url: "https://aaplesarkar.mahaonline.gov.in/",
        official_source_url: "https://crsorgi.gov.in/",
        is_verified: true,
        status: "ACTIVE",
        current_version: 1,
        documents: JSON.stringify([
          "Hospital Discharge Summary / Birth slip (Form 1)",
          "Parents' Identity Proof (Aadhaar Card / Voter ID)",
          "Parents' Marriage Certificate or declaration",
          "Affidavit from local magistrate if birth registration is delayed beyond 1 year"
        ]),
        application_steps: JSON.stringify([
          "Apply via Aaple Sarkar Municipal Services or Civil Registration System (crsorgi.gov.in).",
          "Enter hospital delivery reference, date of birth, child name, and parent details.",
          "Upload discharge slip and parents' ID proofs.",
          "Municipal Health Officer / Registrar reviews and approves the record.",
          "Download digitally certified birth certificate with QR code."
        ])
      },
      {
        name: "Online Registration and Issuance of Death Certificate",
        slug: "issuance-of-death-certificate",
        description: "Statutory civil registration recording the demise of an individual, vital for legal inheritance, insurance claims, and bank settlements.",
        eligibility: "Death occurring within Maharashtra municipal or rural jurisdiction, registered by immediate relatives or hospital authority.",
        fees: "Free if reported within 21 days; small statutory fee for late records or certified duplicate copies.",
        department_id: deptMap['HLTH_MH'],
        category: "Municipal Services",
        official_application_url: "https://aaplesarkar.mahaonline.gov.in/",
        official_source_url: "https://crsorgi.gov.in/",
        is_verified: true,
        status: "ACTIVE",
        current_version: 1,
        documents: JSON.stringify([
          "Medical Certification of Cause of Death (Form 4/4A) from doctor/hospital",
          "Cremation / Burial Ground receipt",
          "Deceased person's Aadhaar or voter identification",
          "Applicant / informant photo ID and relationship proof"
        ]),
        application_steps: JSON.stringify([
          "Visit Aaple Sarkar or local municipal corporation portal (e.g. BMC/PMC/NMC).",
          "Select Health & Vital Statistics -> Death Certificate.",
          "Provide date, place of demise, and cause of death certificate details.",
          "Upload medical certificate and cemetery slip.",
          "Verified by Registrar of Births & Deaths and issued digitally."
        ])
      },
      {
        name: "Application for New Domestic Water Tap Connection",
        slug: "new-domestic-water-tap-connection",
        description: "Citizen utility service providing fresh piped potable water connections to residential houses and apartment complexes under municipal councils and corporations.",
        eligibility: "Owner or authorized tenant of a legal residential property with paid-up property tax receipts.",
        fees: "Application scrutiny fee: ₹100. Connection deposit and road-digging charges vary by municipal council schedule.",
        department_id: deptMap['URB_MH'],
        category: "Water Supply",
        official_application_url: "https://aaplesarkar.mahaonline.gov.in/",
        official_source_url: "https://aaplesarkar.mahaonline.gov.in/",
        is_verified: true,
        status: "ACTIVE",
        current_version: 1,
        documents: JSON.stringify([
          "Property Tax Assessment Bill & latest payment receipt",
          "Ownership proof (7/12 extract / Index-II / Registered Sale Deed / Property Card)",
          "Building Completion Certificate or Sanctioned Layout Plan",
          "Plumber estimation map certified by licensed municipal plumber"
        ]),
        application_steps: JSON.stringify([
          "Log into Aaple Sarkar -> Urban Development -> New Water Tap Connection.",
          "Select municipal corporation or municipal council.",
          "Enter property assessment number and pipe size required (typically 1/2 inch domestic).",
          "Upload property ownership document and latest tax receipt.",
          "Municipal water engineer inspects site; pay connection fee upon approval."
        ])
      },
      {
        name: "Property Tax Online Self-Assessment and Payment",
        slug: "property-tax-assessment-and-payment",
        description: "Integrated municipal revenue service enabling property owners to view annual ratable value, calculate tax demand, apply for rebates, and make secure digital tax payments.",
        eligibility: "Property owners, co-operative housing societies, and commercial establishment holders in municipal limits.",
        fees: "Nil service charge for digital assessment. Tax amount based on built-up area and ready reckoner capital value.",
        department_id: deptMap['URB_MH'],
        category: "Tax and Revenue",
        official_application_url: "https://aaplesarkar.mahaonline.gov.in/",
        official_source_url: "https://aaplesarkar.mahaonline.gov.in/",
        is_verified: true,
        status: "ACTIVE",
        current_version: 1,
        documents: JSON.stringify([
          "Property Index-II or Registered Deed",
          "Previous Property Tax Receipt / Assessment Order",
          "Occupancy Certificate (OC) or approved building plan",
          "Aadhaar card of property owner"
        ]),
        application_steps: JSON.stringify([
          "Navigate to Aaple Sarkar or your specific Municipal Corporation portal.",
          "Input Property Identification Number (PIN / SAC No).",
          "View itemized bill (general tax, tree cess, education cess, water benefit tax).",
          "Select online payment gateway (UPI / NetBanking / Debit Card).",
          "Instantly download municipal digitally signed tax receipt for record."
        ])
      }
    ];

    for (const s of servicesData) {
      const res = await client.query(`
        INSERT INTO services (
          name, slug, description, eligibility, fees, application_steps, documents,
          department_id, category, official_application_url, official_source_url,
          is_verified, status, current_version
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id;
      `, [
        s.name, s.slug, s.description, s.eligibility, s.fees, s.application_steps,
        s.documents, s.department_id, s.category, s.official_application_url,
        s.official_source_url, s.is_verified, s.status, s.current_version
      ]);

      const serviceId = res.rows[0].id;

      // Add version snapshot
      await client.query(`
        INSERT INTO service_versions (
          service_id, version_number, service_snapshot, source_url, verified_at, updated_by
        )
        VALUES ($1, $2, $3, $4, NOW(), 'RTS Verification Cell');
      `, [
        serviceId,
        1,
        JSON.stringify(s),
        s.official_source_url
      ]);
    }

    // 3. Government Schemes (8 verified schemes)
    const schemesData = [
      {
        name: "Mukhyamantri Majhi Ladki Bahin Yojana",
        slug: "mukhyamantri-majhi-ladki-bahin-yojana",
        description: "Flagship women empowerment scheme by the Government of Maharashtra providing direct monthly financial assistance of ₹1,500 into the Aadhaar-linked bank accounts of eligible women aged 21 to 65 years.",
        objectives: "To provide economic independence, nutritional security, and dignity to women in underprivileged families across Maharashtra.",
        benefits: "Direct financial benefit of ₹1,500 per month (₹18,000 annually) transferred directly through DBT.",
        category: "Women & Child Welfare",
        scheme_level: "State",
        state: "Maharashtra",
        beneficiary_group: "Women aged 21 to 65 years",
        eligibility_description: "Resident women of Maharashtra aged 21-65 years whose combined annual family income does not exceed ₹2,50,000. Beneficiary family must not own four-wheeler vehicle (excluding tractor) or have any family member paying income tax.",
        department_id: deptMap['WCD_MH'],
        responsible_department: "Women and Child Development Department, Maharashtra",
        official_application_url: "https://ladkibahin.maharashtra.gov.in/",
        source_url: "https://ladkibahin.maharashtra.gov.in/",
        is_verified: true,
        is_featured: true,
        status: "ACTIVE",
        last_verified_at: new Date('2026-10-31'),
        documents: JSON.stringify([
          "Aadhaar Card with active mobile link",
          "Maharashtra Domicile Certificate or 15-year Ration Card extract",
          "Annual Family Income Certificate (below ₹2.5 Lakh) or Yellow/Orange Ration Card",
          "Bank Passbook showing Aadhaar-seeded active bank account",
          "Self-declaration undertaking not paying income tax"
        ]),
        application_steps: JSON.stringify([
          "Register on the official portal ladkibahin.maharashtra.gov.in or visit the nearest Anganwadi / Setu Kendra.",
          "Verify identity through Aadhaar OTP authentication.",
          "Fill family profile, bank account details (DBT enabled), and ration card number.",
          "Upload photograph, income certificate, and domicile certificate.",
          "Submit form and obtain electronic acknowledgment for tracking."
        ]),
        rules: [
          { rule_type: "GENDER", operator: "==", expected_value: JSON.stringify("Female"), is_mandatory: true, description: "Applicant must be female" },
          { rule_type: "AGE_MIN", operator: ">=", expected_value: JSON.stringify(21), is_mandatory: true, description: "Minimum age requirement: 21 years" },
          { rule_type: "AGE_MAX", operator: "<=", expected_value: JSON.stringify(65), is_mandatory: true, description: "Maximum age requirement: 65 years" },
          { rule_type: "STATE", operator: "==", expected_value: JSON.stringify("Maharashtra"), is_mandatory: true, description: "Permanent domicile of Maharashtra" },
          { rule_type: "ANNUAL_INCOME_MAX", operator: "<=", expected_value: JSON.stringify(250000), is_mandatory: true, description: "Maximum annual family income: ₹2,50,000" }
        ]
      },
      {
        name: "Government of India Post-Matric Scholarship for SC Students - Maharashtra",
        slug: "post-matric-scholarship-sc-students-maharashtra",
        description: "Centrally sponsored scholarship scheme implemented via MahaDBT to provide financial support to Scheduled Caste students pursuing post-matriculation or post-secondary education.",
        objectives: "To reduce dropout rates and encourage higher educational attainment among SC youth through complete tuition coverage and maintenance allowances.",
        benefits: "Full reimbursement of tuition fees, examination fees, and monthly maintenance allowance up to ₹13,500/year depending on course group.",
        category: "Education",
        scheme_level: "State",
        state: "Maharashtra",
        beneficiary_group: "SC Category Post-Matric Students",
        eligibility_description: "Student must belong to Scheduled Caste (SC) or Neo-Buddhist community, resident of Maharashtra, enrolled in a recognized post-matric course, with annual family income up to ₹2,50,000.",
        department_id: deptMap['SOC_MH'],
        responsible_department: "Social Justice and Special Assistance Department, Maharashtra",
        official_application_url: "https://mahadbt.maharashtra.gov.in/",
        source_url: "https://mahadbt.maharashtra.gov.in/SchemeData/SchemeData?str=E9DDFA703C38E51A46AE3C788185C5E6",
        is_verified: true,
        is_featured: true,
        status: "ACTIVE",
        last_verified_at: new Date('2026-10-31'),
        documents: JSON.stringify([
          "Caste Certificate issued by Competent Authority of Maharashtra",
          "Income Certificate from Tehsildar (annual income ≤ ₹2,50,000)",
          "SSC / HSC Marksheet and previous qualification passing certificate",
          "College Fee Receipt & Bonafide Certificate",
          "Domicile Certificate of Maharashtra",
          "Aadhaar-seeded Bank Passbook"
        ]),
        application_steps: JSON.stringify([
          "Create applicant profile on MahaDBT portal (mahadbt.maharashtra.gov.in).",
          "Complete e-KYC using Aadhaar biometric or OTP.",
          "Under 'Social Justice and Special Assistance Department', choose 'Post-Matric Scholarship for SC Students'.",
          "Enter academic details, current college enrolment, and upload documents.",
          "Submit form online; forwarded to college principal and district social welfare officer for verification."
        ]),
        rules: [
          { rule_type: "OCCUPATION", operator: "IN", expected_value: JSON.stringify(["Student"]), is_mandatory: true, description: "Must be currently enrolled as a student" },
          { rule_type: "EDUCATION", operator: "IN", expected_value: JSON.stringify(["Higher Secondary", "Diploma", "Undergraduate", "Postgraduate", "PhD"]), is_mandatory: true, description: "Must be in post-matriculation education" },
          { rule_type: "STATE", operator: "==", expected_value: JSON.stringify("Maharashtra"), is_mandatory: true, description: "Domicile of Maharashtra state" },
          { rule_type: "ANNUAL_INCOME_MAX", operator: "<=", expected_value: JSON.stringify(250000), is_mandatory: true, description: "Annual family income must not exceed ₹2,50,000" },
          { rule_type: "AGE_MIN", operator: ">=", expected_value: JSON.stringify(15), is_mandatory: true, description: "Minimum age of 15 years" }
        ]
      },
      {
        name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (EBC)",
        slug: "rajarshi-shahu-maharaj-ebc-scholarship",
        description: "State-funded educational financial assistance reimbursing 50% tuition and exam fees to Economically Backward Class (EBC) students in recognized professional and general degree courses.",
        objectives: "To facilitate access to higher and technical education for meritorious students from economically weaker sections irrespective of caste.",
        benefits: "50% waiver/reimbursement of tuition fees and exam fees in government-approved higher education colleges.",
        category: "Education",
        scheme_level: "State",
        state: "Maharashtra",
        beneficiary_group: "EBC College Students",
        eligibility_description: "General / Open category student admitted through CAP (Centralized Admission Process) with family annual income up to ₹8,00,000, holding Maharashtra domicile.",
        department_id: deptMap['HED_MH'],
        responsible_department: "Higher and Technical Education Department, Maharashtra",
        official_application_url: "https://mahadbt.maharashtra.gov.in/",
        source_url: "https://mahadbt.maharashtra.gov.in/",
        is_verified: true,
        is_featured: true,
        status: "ACTIVE",
        last_verified_at: new Date('2026-10-31'),
        documents: JSON.stringify([
          "Competent Tehsildar Income Certificate (annual income ≤ ₹8,00,000)",
          "Maharashtra Domicile Certificate",
          "CAP Allotment Letter confirming admission through centralized round",
          "HSC / Diploma Marksheet and College Bonafide",
          "Ration Card showing family members"
        ]),
        application_steps: JSON.stringify([
          "Log into MahaDBT portal and update applicant profile.",
          "Select 'Higher and Technical Education Department' -> 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna'.",
          "Enter CAP application ID, university roll number, and fee receipt details.",
          "Upload mandatory documents and submit.",
          "Funds are disbursed directly to college fee account and student account."
        ]),
        rules: [
          { rule_type: "OCCUPATION", operator: "IN", expected_value: JSON.stringify(["Student"]), is_mandatory: true, description: "Must be a college/university student" },
          { rule_type: "STATE", operator: "==", expected_value: JSON.stringify("Maharashtra"), is_mandatory: true, description: "Domicile of Maharashtra state" },
          { rule_type: "ANNUAL_INCOME_MAX", operator: "<=", expected_value: JSON.stringify(800000), is_mandatory: true, description: "Annual family income must not exceed ₹8,00,000" },
          { rule_type: "EDUCATION", operator: "IN", expected_value: JSON.stringify(["Diploma", "Undergraduate", "Postgraduate"]), is_mandatory: true, description: "Enrolled in higher education degree or diploma" }
        ]
      },
      {
        name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        slug: "pm-kisan-samman-nidhi",
        description: "Central sector welfare scheme by Ministry of Agriculture transferring ₹6,000 per year directly to all landholding farmer families across India in three equal installments of ₹2,000 each.",
        objectives: "To augment income support for agricultural inputs, seeds, fertilizers, and household expenses of small and marginal farmer families.",
        benefits: "₹6,000 per year distributed in three 4-monthly payments of ₹2,000 deposited directly into farmer bank accounts.",
        category: "Agriculture",
        scheme_level: "Central",
        state: "All India",
        beneficiary_group: "Landholding Farmer Families",
        eligibility_description: "All landholder farmer families who possess cultivable landholding in their names. Excludes institutional landholders, income tax payers, retired pensioners with monthly pension ≥ ₹10,000, and constitutional post holders.",
        department_id: deptMap['AGRI_IN'],
        responsible_department: "Department of Agriculture and Farmers Welfare, Govt of India",
        official_application_url: "https://pmkisan.gov.in/",
        source_url: "https://www.myscheme.gov.in/schemes/pm-kisan",
        is_verified: true,
        is_featured: true,
        status: "ACTIVE",
        last_verified_at: new Date('2026-10-31'),
        documents: JSON.stringify([
          "Aadhaar Card of the farmer",
          "Landholding Record (7/12 extract / Khatauni / Land registration papers)",
          "Aadhaar-seeded active bank account details",
          "Self-declaration confirming no family member pays income tax"
        ]),
        application_steps: JSON.stringify([
          "Visit PM-KISAN portal (pmkisan.gov.in) -> Farmers Corner -> 'New Farmer Registration'.",
          "Select Rural or Urban Farmer Registration and enter Aadhaar number with captcha.",
          "Input state, district, block, village, land survey number, and dag/khasra number.",
          "Complete mandatory e-KYC using OTP or biometric CSC verification.",
          "State nodal officer verifies revenue record; payments are scheduled via DBT."
        ]),
        rules: [
          { rule_type: "OCCUPATION", operator: "IN", expected_value: JSON.stringify(["Farmer", "Agriculturalist"]), is_mandatory: true, description: "Must be a farmer or agriculturalist" },
          { rule_type: "AGE_MIN", operator: ">=", expected_value: JSON.stringify(18), is_mandatory: true, description: "Must be at least 18 years old" }
        ]
      },
      {
        name: "Ayushman Bharat - PM Jan Arogya Yojana & Mahatma Jyotirao Phule Jan Arogya Yojana (Integrated)",
        slug: "ayushman-bharat-pmjay-mjpjay",
        description: "World's largest integrated health insurance scheme providing cashless secondary and tertiary medical treatment coverage of up to ₹5,00,000 per family per year across empaneled hospitals.",
        objectives: "To prevent catastrophic out-of-pocket healthcare expenses for vulnerable families requiring hospitalization, surgeries, and critical illness treatments.",
        benefits: "Cashless medical cover up to ₹5,00,000 per family per year covering 1,900+ medical and surgical procedures.",
        category: "Health",
        scheme_level: "Central",
        state: "Maharashtra",
        beneficiary_group: "Low-income and vulnerable families",
        eligibility_description: "Families listed in SECC 2011 database or holding Yellow / Orange Ration Cards in Maharashtra, and all senior citizens aged 70+ under expanded Ayushman Vaya Vandana guidelines.",
        department_id: deptMap['HLTH_MH'],
        responsible_department: "National Health Authority & State Health Assurance Society, Maharashtra",
        official_application_url: "https://beneficiary.nha.gov.in/",
        source_url: "https://www.myscheme.gov.in/schemes/pmjay",
        is_verified: true,
        is_featured: true,
        status: "ACTIVE",
        last_verified_at: new Date('2026-10-31'),
        documents: JSON.stringify([
          "Aadhaar Card of all family members to be enrolled",
          "Ration Card (Yellow or Orange in Maharashtra)",
          "Active mobile number linked with Aadhaar",
          "PMJAY beneficiary family ID if available in SECC survey"
        ]),
        application_steps: JSON.stringify([
          "Check eligibility on beneficiary.nha.gov.in using Aadhaar number or Ration Card number.",
          "Generate Ayushman Card / Arogya Card online through mobile OTP e-KYC.",
          "Alternatively, visit an Arogyamitra at any empaneled government or private hospital.",
          "Produce the digital Ayushman card during hospital admission for cashless pre-authorization."
        ]),
        rules: [
          { rule_type: "ANNUAL_INCOME_MAX", operator: "<=", expected_value: JSON.stringify(100000), is_mandatory: false, description: "Priority for low-income or ration card holder families" }
        ]
      },
      {
        name: "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
        slug: "pradhan-mantri-awas-yojana-urban",
        description: "Comprehensive housing mission providing central interest subsidy and financial assistance to Economically Weaker Section (EWS) and Low Income Group (LIG) families to construct or buy an all-weather pucca house.",
        objectives: "Housing for all in urban areas, ensuring security of tenure, sanitation, and drinking water facilities.",
        benefits: "Direct central financial assistance up to ₹1.5 Lakh to ₹2.5 Lakh or interest subsidy on home loans under Credit Linked Subsidy Scheme (CLSS).",
        category: "Housing",
        scheme_level: "Central",
        state: "All India",
        beneficiary_group: "Urban Homeless / EWS Families",
        eligibility_description: "Beneficiary family must not own a pucca house in their name or any family member's name anywhere in India. Annual household income must be up to ₹3,00,000 for EWS and ₹6,00,000 for LIG.",
        department_id: deptMap['URB_MH'],
        responsible_department: "Ministry of Housing and Urban Affairs, Govt of India",
        official_application_url: "https://pmaymis.gov.in/",
        source_url: "https://www.myscheme.gov.in/schemes/pmay-u",
        is_verified: true,
        is_featured: false,
        status: "ACTIVE",
        last_verified_at: new Date('2026-10-31'),
        documents: JSON.stringify([
          "Aadhaar Cards of all adult family members",
          "Income Certificate / Salary certificate verifying EWS status",
          "Land title deed or leasehold property document (for beneficiary-led construction)",
          "Bank Account details and passbook copy",
          "Notarized affidavit declaring no other pucca house in India"
        ]),
        application_steps: JSON.stringify([
          "Visit official PMAY MIS portal (pmaymis.gov.in) -> Citizen Assessment.",
          "Enter Aadhaar details to verify non-duplication.",
          "Choose appropriate component (In-situ Slum Redevelopment, BLC, AHP, or CLSS).",
          "Fill family income, current address, and municipal ward details.",
          "Save assessment and note application reference for municipal verification."
        ]),
        rules: [
          { rule_type: "ANNUAL_INCOME_MAX", operator: "<=", expected_value: JSON.stringify(300000), is_mandatory: true, description: "Household annual income for EWS up to ₹3,00,000" },
          { rule_type: "AGE_MIN", operator: ">=", expected_value: JSON.stringify(18), is_mandatory: true, description: "Head of household must be 18+ years" }
        ]
      },
      {
        name: "National Apprenticeship Promotion Scheme (NAPS)",
        slug: "national-apprenticeship-promotion-scheme",
        description: "Skill India initiative incentivizing employers to engage apprentices and providing direct stipend support to youth aged 18-35 to enhance on-the-job industrial skills and employability.",
        objectives: "To bridge the gap between formal vocational education and industry demands through hands-on practical apprenticeship training.",
        benefits: "Monthly stipend sharing: 25% of prescribed stipend up to ₹1,500/month paid directly by the Government into apprentice bank accounts, plus industry placement.",
        category: "Employment",
        scheme_level: "Central",
        state: "All India",
        beneficiary_group: "Young Job Seekers & Vocational Graduates",
        eligibility_description: "Youth aged 18 to 35 who have completed minimum 5th, 8th, 10th, 12th, ITI, or Graduate degree and are seeking registered industrial apprenticeship contracts.",
        department_id: deptMap['SKILL_IN'],
        responsible_department: "Ministry of Skill Development and Entrepreneurship, Govt of India",
        official_application_url: "https://www.apprenticeshipindia.gov.in/",
        source_url: "https://www.myscheme.gov.in/schemes/naps",
        is_verified: true,
        is_featured: false,
        status: "ACTIVE",
        last_verified_at: new Date('2026-10-31'),
        documents: JSON.stringify([
          "Aadhaar Card",
          "Educational Certificate (10th/12th/ITI/Diploma/Degree mark sheets)",
          "Resume / Bio-data with vocational trade preference",
          "Aadhaar-linked Bank account for DBT stipend disbursement"
        ]),
        application_steps: JSON.stringify([
          "Register on apprenticeshipindia.gov.in as a candidate.",
          "Complete candidate e-KYC using Aadhaar authentication.",
          "Search and apply for active apprenticeship vacancies by trade and location.",
          "Sign digital apprenticeship contract upon selection by registered enterprise.",
          "Receive government monthly stipend share via DBT."
        ]),
        rules: [
          { rule_type: "AGE_MIN", operator: ">=", expected_value: JSON.stringify(18), is_mandatory: true, description: "Minimum age of 18 years" },
          { rule_type: "AGE_MAX", operator: "<=", expected_value: JSON.stringify(35), is_mandatory: true, description: "Maximum age of 35 years" },
          { rule_type: "OCCUPATION", operator: "IN", expected_value: JSON.stringify(["Unemployed", "Job Seeker", "Student", "Apprentice"]), is_mandatory: true, description: "Must be a job seeker or vocational trainee" }
        ]
      },
      {
        name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        slug: "pradhan-mantri-matru-vandana-yojana",
        description: "Maternity benefit cash incentive program by Ministry of Women and Child Development providing ₹5,000 to ₹6,000 for pregnant women and lactating mothers for health, nutrition, and partial wage compensation.",
        objectives: "Promote health-seeking behavior, institutional delivery, and child immunization among expectant mothers.",
        benefits: "Cash incentive of ₹5,000 in two installments for the first child, and ₹6,000 in single installment if the second child is a girl, transferred via DBT.",
        category: "Women & Child Welfare",
        scheme_level: "Central",
        state: "All India",
        beneficiary_group: "Pregnant and Lactating Mothers",
        eligibility_description: "Pregnant women and lactating mothers aged 19+ for their first/second child belonging to socially and economically disadvantaged sections.",
        department_id: deptMap['WCD_MH'],
        responsible_department: "Ministry of Women and Child Development, Govt of India",
        official_application_url: "https://pmmvy.wcd.gov.in/",
        source_url: "https://www.myscheme.gov.in/schemes/pmmvy",
        is_verified: true,
        is_featured: false,
        status: "ACTIVE",
        last_verified_at: new Date('2026-10-31'),
        documents: JSON.stringify([
          "Mother and Child Protection (MCP) card issued by health center",
          "Aadhaar Cards of mother and husband",
          "Aadhaar-linked bank account of the mother",
          "Child Birth Certificate (for subsequent installments)"
        ]),
        application_steps: JSON.stringify([
          "Register at nearest Anganwadi Centre (AWC) or apply directly at pmmvy.wcd.gov.in.",
          "Fill Form 1A with LMP (Last Menstrual Period) date from MCP card.",
          "Submit ante-natal check-up (ANC) record for 1st installment disbursement.",
          "Submit birth registration and primary vaccination records for final installment."
        ]),
        rules: [
          { rule_type: "GENDER", operator: "==", expected_value: JSON.stringify("Female"), is_mandatory: true, description: "Applicant must be female" },
          { rule_type: "AGE_MIN", operator: ">=", expected_value: JSON.stringify(19), is_mandatory: true, description: "Minimum age of 19 years" }
        ]
      }
    ];

    for (const sc of schemesData) {
      const res = await client.query(`
        INSERT INTO schemes (
          name, slug, description, objectives, benefits, category, scheme_level, state,
          beneficiary_group, eligibility_description, department_id, responsible_department,
          official_application_url, source_url, is_verified, is_featured, status,
          last_verified_at, documents, application_steps
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id;
      `, [
        sc.name, sc.slug, sc.description, sc.objectives, sc.benefits, sc.category,
        sc.scheme_level, sc.state, sc.beneficiary_group, sc.eligibility_description,
        sc.department_id, sc.responsible_department, sc.official_application_url,
        sc.source_url, sc.is_verified, sc.is_featured, sc.status, sc.last_verified_at,
        sc.documents, sc.application_steps
      ]);

      const schemeId = res.rows[0].id;

      if (sc.rules && sc.rules.length > 0) {
        for (const r of sc.rules) {
          await client.query(`
            INSERT INTO scheme_eligibility_rules (
              scheme_id, rule_type, operator, expected_value, is_mandatory, description
            )
            VALUES ($1, $2, $3, $4, $5, $6);
          `, [
            schemeId, r.rule_type, r.operator, r.expected_value, r.is_mandatory, r.description
          ]);
        }
      }
    }

    await client.query("COMMIT");
    console.log("Successfully seeded 8 departments, 8 public services, and 8 government schemes with eligibility rules!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow direct CLI invocation
if (process.argv[1]?.endsWith("seed.js")) {
  initializeDatabase()
    .then(() => runSeeds())
    .then(() => {
      console.log("Database seed complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed script error:", err);
      process.exit(1);
    });
}
