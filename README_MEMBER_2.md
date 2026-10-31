# JanSeva Connect - Member 2 Module
## Public Services & Government Schemes (Citizen Information & Eligibility Module)

### Overview
This module is developed as **Member 2** of the 4-member JanSeva Connect hackathon project. It provides an accessible, responsive, multilingual citizen information discovery and preliminary eligibility assessment system for public services and government welfare schemes across Maharashtra and India.

---

## 1. Ten Frontend Pages Delivered

| # | Page Name | Route | Description & Features |
|---|-----------|-------|------------------------|
| 1 | **Home Page** | `/` | Hero section, dynamic live platform stats from PostgreSQL, unified search, popular services grid, featured schemes, 4-step workflow, why-use benefits, and verified government portals. |
| 2 | **About Us** | `/about` | Platform vision, mission, civic challenges addressed, 4 core pillars, transparency notice, and explicit disclaimer of non-governmental status. |
| 3 | **Public Services Listing** | `/services` | Directory of citizen services with debounced search, category filters, department filters, verification status filters, sorting, and pagination. |
| 4 | **Service Details** | `/services/:id` | In-depth breakdown of individual service: overview, eligibility, required documents checklist, step-by-step RTS application procedure, statutory fees, department contact, official application portal link, and verified version history. |
| 5 | **Government Schemes Listing** | `/schemes` | Catalog of welfare schemes with keyword search, category filter, state filter (Maharashtra / All India), beneficiary filter, sorting, and responsive scheme cards. |
| 6 | **Scheme Details** | `/schemes/:id` | Objectives, financial benefits, statutory rule checklist, required documents, step-by-step procedure, department details, official source link, direct apply link, and link to eligibility checker. |
| 7 | **Eligibility Checker** | `/eligibility-checker` | Privacy-first interactive form collecting minimal inputs (age, state, district, annual income, education, occupation, gender, category). Zero sensitive data requested (no Aadhaar, bank details, or passwords). Validates all inputs with Zod. |
| 8 | **Eligibility Results** | `/eligibility-results` | Classification of schemes into **Likely Eligible**, **Possibly Eligible**, and **Unlikely Eligible** based on PostgreSQL stored rules. Shows satisfied criteria, unmet criteria, unknown conditions, and statutory disclaimer. |
| 9 | **Help & FAQ** | `/help` | 10 comprehensive FAQs covering public services, schemes, eligibility verification, and portal redirection. Includes keyword search and category tabs. |
| 10 | **Contact Us** | `/contact` | Form with Zod validation submitting to backend `/api/contact`, displaying generated ticket references, platform operational hours, and RTI guidance. |

---

## 2. Reusable UI Components

- `Navbar.jsx`: Brand identity, desktop & mobile navigation links, multilingual language selector (EN, HI, MR), and quick eligibility action.
- `Footer.jsx`: Platform mission, quick links, authorized government portals, legal disclaimers, and copyright.
- `PageHeader.jsx`: Semantic title, subtitle, and accessible breadcrumb navigation.
- `SearchBar.jsx`: Instant input with submit trigger and clear icon button.
- `FilterPanel.jsx`: Responsive filter sidebar for categories, departments, state jurisdictions, and verification status.
- `ServiceCard.jsx`: Clean cards displaying category pill, verification badge, description, department, fees, and view action.
- `SchemeCard.jsx`: Displays scheme category, level, target group, financial benefits snippet, and quick eligibility check link.
- `CategoryCard.jsx`: Interactive category tile with dedicated Lucide iconography and listing counters.
- `VerificationBadge.jsx`: "Verified Official" (emerald) or "Demo / Unverified" (amber) badge with date tooltip.
- `SourceInformation.jsx`: Detailed metadata box with verified timestamp, responsible department, and clickable official portal link.
- `EligibilityStatusCard.jsx`: Color-coded status header (Likely, Possibly, Unlikely), analysis reason, criteria checklist, and direct apply link.
- `LoadingSkeleton.jsx`: Animated skeleton loader for cards and lists.
- `EmptyState.jsx`: User-friendly empty state with a "Clear Filters" reset button.
- `ErrorState.jsx`: Accessible alert with a retry button.
- `Pagination.jsx`: Numbered pagination controls with Previous/Next buttons.
- `FAQAccordion.jsx`: Accessible accordion items with smooth expand/collapse.
- `ScrollToTop.jsx`: Automatically scrolls window to top on route navigation.

---

## 3. Multilingual Support (i18next)

Fully localized across 3 languages with persistent language selection in `localStorage`:
- **English (`en`)**: Complete terminology in `locales/en.json`.
- **Hindi (`hi`)**: Natural Hindi phrasing in `locales/hi.json`.
- **Marathi (`mr`)**: High-quality Marathi translation in `locales/mr.json`.

---

## 4. Backend Architecture & REST APIs

Built with Express.js, PostgreSQL (`pg` pool), and Zod validation:

### Public Services
- `GET /api/services`: Paginated services with search, category, department, verification, and sort options.
- `GET /api/services/:id`: Full service details, department details, and version snapshot history.
- `GET /api/services/categories`: List of service categories with listing counts.
- `GET /api/services/departments`: List of departments associated with services.

### Government Schemes
- `GET /api/schemes`: Paginated welfare schemes with search, category, state, and beneficiary filters.
- `GET /api/schemes/featured`: Top verified featured schemes for home page and banners.
- `GET /api/schemes/categories`: Scheme categories with listing counts.
- `GET /api/schemes/:id`: Complete scheme details with linked eligibility rules from PostgreSQL.

### Rule-Based Eligibility Engine
- `POST /api/eligibility/check`: Evaluates citizen demographic inputs against PostgreSQL `scheme_eligibility_rules`.
  - Supports rule types: `AGE_MIN`, `AGE_MAX`, `ANNUAL_INCOME_MAX`, `STATE`, `EDUCATION`, `OCCUPATION`, `GENDER`, and `SPECIFIC_CONDITION`.
  - Evaluates rule operators: `>=`, `<=`, `==`, `IN`, `CONTAINS`.
  - Classifies schemes into `LIKELY_ELIGIBLE`, `POSSIBLY_ELIGIBLE`, and `UNLIKELY_ELIGIBLE`.
  - Transparently explains matched, unmet, and unknown criteria with human-readable reasons.

### Contact API
- `POST /api/contact`: Validates name, email, subject, and message; stores record into `contact_messages`; returns confirmation ticket ID.

### Platform Stats API
- `GET /api/stats`: Dynamic counts of services, verified services, schemes, and departments directly queried from PostgreSQL (no hardcoded fake statistics).

---

## 5. Database Schema (PostgreSQL)

Tables created:
1. `departments`: Shared across all team members (`id`, `name`, `code`, `description`, `contact_email`, `website_url`).
2. `services`: Public citizen services (`id`, `name`, `slug`, `description`, `eligibility`, `fees`, `application_steps`, `documents`, `department_id`, `category`, `official_application_url`, `official_source_url`, `is_verified`, `status`, `current_version`).
3. `service_versions`: Historic version audit snapshots (`id`, `service_id`, `version_number`, `service_snapshot`, `source_url`, `verified_at`, `updated_by`).
4. `schemes`: Government welfare schemes (`id`, `name`, `slug`, `description`, `objectives`, `benefits`, `category`, `scheme_level`, `state`, `beneficiary_group`, `eligibility_description`, `documents`, `application_steps`, `responsible_department`, `department_id`, `official_application_url`, `source_url`, `is_verified`, `is_featured`, `status`, `last_verified_at`).
5. `scheme_eligibility_rules`: Concrete machine-evaluable rules (`id`, `scheme_id`, `rule_type`, `operator`, `expected_value`, `is_mandatory`, `description`).
6. `contact_messages`: Feedback and inquiries (`id`, `name`, `email`, `subject`, `message`, `status`, `created_at`).

---

## 6. Verified Authentic Seed Data

Seeded with 8 authentic Maharashtra & Central Government Public Services and 8 Government Welfare Schemes:

### Public Services:
1. Issuance of Income Certificate (Aaple Sarkar, Revenue Department)
2. Issuance of Domicile and Age/Nationality Certificate (Aaple Sarkar, Revenue Department)
3. Issuance of Caste Certificate (Aaple Sarkar, Revenue Department / Social Justice)
4. Issuance of Non-Creamy Layer Certificate (Aaple Sarkar, Revenue Department)
5. Registration and Issuance of Birth Certificate (Civil Registration System / Municipal Administration)
6. Registration and Issuance of Death Certificate (Civil Registration System / Public Health)
7. Application for New Domestic Water Tap Connection (Aaple Sarkar, Urban Development)
8. Property Tax Online Self-Assessment and Payment (Directorate of Municipal Administration)

### Government Welfare Schemes:
1. Mukhyamantri Majhi Ladki Bahin Yojana (Women & Child Development Department, Maharashtra)
2. Post-Matric Scholarship for SC Students - Maharashtra (MahaDBT, Social Justice Department)
3. Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (EBC) (MahaDBT, Higher & Technical Education)
4. Pradhan Mantri Kisan Samman Nidhi - PM-KISAN (Dept of Agriculture, Govt of India)
5. Ayushman Bharat - PM-JAY & Mahatma Jyotirao Phule Jan Arogya Yojana (National Health Authority & Govt of Maharashtra)
6. Pradhan Mantri Awas Yojana - Urban (Ministry of Housing and Urban Affairs)
7. National Apprenticeship Promotion Scheme - NAPS (Ministry of Skill Development & Entrepreneurship)
8. Pradhan Mantri Matru Vandana Yojana - PMMVY (Ministry of Women and Child Development)

---

## 7. Commands to Run & Test

### Backend:
```bash
cd backend
npm install
npm run migrate      # Creates PostgreSQL tables & indexes
npm run seed         # Populates verified services, schemes, & eligibility rules
npm run test         # Runs 38 comprehensive automated integration tests
npm start            # Starts the Express API server on http://localhost:5000
```

### Frontend:
```bash
cd frontend
npm install
npm run lint         # Runs ESLint (0 errors)
npm run build        # Compiles production bundle with Vite
npm run dev          # Starts Vite dev server on http://localhost:5173
```
