# JanSeva Connect - API Documentation
## Member 2: Public Services & Government Schemes

Base URL: `http://localhost:5000/api`

---

## 1. Public Services Endpoints

### 1.1 List Public Services
- **Endpoint**: `GET /services`
- **Query Parameters**:
  - `page` (number, default: 1): Page number.
  - `limit` (number, default: 10, max: 100): Records per page.
  - `search` (string, optional): Search across service name, description, and category.
  - `category` (string, optional): Exact category filter (e.g. `Certificates`, `Water Supply`).
  - `department_id` (number, optional): Filter by department ID.
  - `is_verified` (string: `true` | `false` | `all`, optional): Verification status.
  - `sort` (string: `latest` | `name_asc` | `name_desc` | `popular`, default: `latest`).
- **Response** (`200 OK`):
```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "name": "Issuance of Income Certificate",
      "slug": "issuance-of-income-certificate",
      "description": "Official certificate issued by the Revenue Department...",
      "category": "Certificates",
      "fees": "₹33.60 standard citizen service charge...",
      "is_verified": true,
      "department_name": "Revenue and Forest Department, Maharashtra",
      "official_application_url": "https://aaplesarkar.mahaonline.gov.in/",
      "official_source_url": "https://aaplesarkar.mahaonline.gov.in/"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 1.2 Get Service Details
- **Endpoint**: `GET /services/:id`
- **Parameters**: `id` can be either the numeric database ID or the string slug.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "service": {
    "id": 1,
    "name": "Issuance of Income Certificate",
    "slug": "issuance-of-income-certificate",
    "description": "...",
    "eligibility": "Resident of Maharashtra having verifiable family income proofs...",
    "fees": "₹33.60 standard citizen service charge...",
    "documents": ["Identity Proof", "Address Proof", "Income Proof"],
    "application_steps": ["Log in to Aaple Sarkar...", "Fill details..."],
    "department_name": "Revenue and Forest Department, Maharashtra",
    "department_email": "helpdesk.rev@maharashtra.gov.in",
    "official_application_url": "https://aaplesarkar.mahaonline.gov.in/",
    "official_source_url": "https://aaplesarkar.mahaonline.gov.in/",
    "is_verified": true,
    "current_version": 1,
    "versions": [
      {
        "id": 1,
        "version_number": 1,
        "source_url": "https://aaplesarkar.mahaonline.gov.in/",
        "verified_at": "2026-10-31T07:18:21.000Z",
        "updated_by": "RTS Verification Cell"
      }
    ]
  }
}
```

### 1.3 Service Categories
- **Endpoint**: `GET /services/categories`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "categories": [
    { "category": "Certificates", "count": 4 },
    { "category": "Municipal Services", "count": 2 },
    { "category": "Water Supply", "count": 1 },
    { "category": "Tax and Revenue", "count": 1 }
  ]
}
```

### 1.4 Service Departments
- **Endpoint**: `GET /services/departments`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "departments": [
    { "id": 1, "name": "Revenue and Forest Department, Maharashtra", "code": "REV_MH", "service_count": 4 },
    { "id": 7, "name": "Urban Development & Municipal Administration Department", "code": "URB_MH", "service_count": 3 },
    { "id": 5, "name": "Public Health and Family Welfare Department", "code": "HLTH_MH", "service_count": 1 }
  ]
}
```

---

## 2. Government Schemes Endpoints

### 2.1 List Government Schemes
- **Endpoint**: `GET /schemes`
- **Query Parameters**:
  - `page`, `limit`, `search`, `category`, `state`, `beneficiary_group`, `is_verified`, `sort` (`featured`, `latest`, `name_asc`, `name_desc`).
- **Response** (`200 OK`): Paginated scheme records including category, level, state, beneficiary group, and rules count.

### 2.2 Featured Schemes
- **Endpoint**: `GET /schemes/featured?limit=4`
- **Response** (`200 OK`): Returns top verified schemes flagged for home page presentation.

### 2.3 Scheme Details
- **Endpoint**: `GET /schemes/:id`
- **Response** (`200 OK`): Complete scheme data, objectives, benefits, documents, application steps, and linked rule checklist from `scheme_eligibility_rules`.

---

## 3. Eligibility Engine API

### 3.1 Check Eligibility
- **Endpoint**: `POST /eligibility/check`
- **Request Body**:
```json
{
  "age": 24,
  "state": "Maharashtra",
  "district": "Nagpur",
  "annualIncome": 120000,
  "education": "Undergraduate",
  "occupation": "Student",
  "gender": "Female",
  "category": "SC"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "disclaimer": "These results are preliminary informational matches based on the information provided. Final eligibility and approval are determined by the responsible government authority.",
  "evaluatedCount": 8,
  "counts": {
    "likely": 6,
    "possibly": 1,
    "unlikely": 1
  },
  "results": [
    {
      "schemeId": 1,
      "schemeName": "Mukhyamantri Majhi Ladki Bahin Yojana",
      "slug": "mukhyamantri-majhi-ladki-bahin-yojana",
      "category": "Women & Child Welfare",
      "status": "LIKELY_ELIGIBLE",
      "matchedCriteria": [
        "State requirement met: Maharashtra",
        "Gender requirement met: Female",
        "Minimum age requirement met: ≥ 21 years (Citizen is 24)",
        "Maximum age requirement met: ≤ 65 years (Citizen is 24)",
        "State domicile criteria met: Maharashtra",
        "Income criteria met: Annual income ₹1,20,000 is within the limit of ₹2,50,000"
      ],
      "unmatchedCriteria": [],
      "unknownCriteria": [],
      "reason": "All checked criteria (6 rules) match the official guidelines.",
      "officialApplicationUrl": "https://ladkibahin.maharashtra.gov.in/"
    }
  ]
}
```

---

## 4. Contact & Support API

### 4.1 Submit Message
- **Endpoint**: `POST /contact`
- **Request Body**:
```json
{
  "name": "Citizen Name",
  "email": "citizen@example.com",
  "subject": "Inquiry regarding Scheme Criteria",
  "message": "Detailed message description..."
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Thank you for contacting JanSeva Connect. Your message has been received.",
  "ticketId": 2,
  "submittedAt": "2026-10-31T07:41:00.000Z"
}
```

---

## 5. Platform Stats API

### 5.1 Dynamic Platform Overview
- **Endpoint**: `GET /stats`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "stats": {
    "totalServices": 8,
    "verifiedServices": 8,
    "totalSchemes": 8,
    "verifiedSchemes": 8,
    "totalDepartments": 8,
    "totalCategories": 8
  }
}
```
