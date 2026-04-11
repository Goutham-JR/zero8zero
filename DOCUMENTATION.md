# Zero8Zero - Cloud Telephony Platform

## Complete Technical Documentation

**Version:** 1.0.0
**Last Updated:** April 7, 2026
**Author:** Goutham JR (Cloud Central)
**Domain:** https://zero8zero.co.in
**GSTIN:** 33DCTPK9031D1ZJ

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Configuration](#4-environment-configuration)
5. [Installation & Setup](#5-installation--setup)
6. [Architecture](#6-architecture)
7. [Authentication System](#7-authentication-system)
8. [User Registration Flow](#8-user-registration-flow)
9. [Dashboard (User Panel)](#9-dashboard-user-panel)
10. [Campaign Management](#10-campaign-management)
11. [Audio Library](#11-audio-library)
12. [Text-to-Speech (TTS)](#12-text-to-speech-tts)
13. [Contact Library](#13-contact-library)
14. [Agent Groups](#14-agent-groups)
15. [Reports](#15-reports)
16. [Plans & Pricing](#16-plans--pricing)
17. [Payment Gateway (CCAvenue)](#17-payment-gateway-ccavenue)
18. [Credit System](#18-credit-system)
19. [Admin Panel](#19-admin-panel)
20. [API Routes (Server-Side)](#20-api-routes-server-side)
21. [External API Integration (OBD3)](#21-external-api-integration-obd3)
22. [Services Layer](#22-services-layer)
23. [State Management](#23-state-management)
24. [TypeScript Types](#24-typescript-types)
25. [Shared Components](#25-shared-components)
26. [Theme System](#26-theme-system)
27. [Animations & UI](#27-animations--ui)
28. [Legal Pages](#28-legal-pages)
29. [Security Measures](#29-security-measures)
30. [Deployment](#30-deployment)
31. [Codebase Statistics](#31-codebase-statistics)

---

## 1. Project Overview

Zero8Zero is a modern cloud telephony SaaS platform designed for Indian businesses to send bulk voice calls and manage IVR-based communication campaigns. The platform enables users to:

- Create and manage three types of voice campaigns (Simple IVR, Input IVR, Call Patch)
- Upload and manage audio prompts with an approval workflow
- Upload contact lists (CSV/TXT) or enter numbers manually
- Create and manage agent groups for call routing
- Convert text to speech in 13 Indian languages
- Track campaign performance in real-time
- Generate and download detailed campaign reports
- Purchase plans via CCAvenue payment gateway
- Manage credit balance and transaction history

The platform has two interfaces:
- **User Dashboard** - For end users to create campaigns and manage their account
- **Admin Panel** - For the reseller (Cloudcentral) to manage users, credits, campaigns, and system settings

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Language | TypeScript (strict mode) | 5.x |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| State Management | Zustand (with persist middleware) | 5.0.12 |
| Form Handling | React Hook Form | 7.72.0 |
| Icons | Lucide React | 1.7.0 |
| Fonts | Geist Sans + Geist Mono (Google Fonts) |
| Build Tool | Turbopack (Next.js built-in) |
| Deployment | Vercel (Serverless) |
| Payment Gateway | CCAvenue (AES-128-CBC encryption) |
| Backend API | OBD3 API (expressivr.com) |
| Logging | Google Sheets (via Apps Script webhook) |
| Contact Form | Discord Webhook (server-proxied) |

---

## 3. Project Structure

```
zero8zero/
|-- .env.local                          # Environment variables (secrets)
|-- .gitignore                          # Git ignore rules
|-- package.json                        # Dependencies & scripts
|-- next.config.ts                      # Next.js configuration
|-- tsconfig.json                       # TypeScript configuration
|-- eslint.config.mjs                   # ESLint configuration
|-- postcss.config.mjs                  # PostCSS/Tailwind configuration
|-- DOCUMENTATION.md                    # This file
|-- PROJECT_SETTINGS.md                 # Quick reference settings
|-- README.md                           # Basic readme
|-- README_Zero8Zero.md                 # Detailed project readme
|-- OBD3_API_SPecification (2).docx     # OBD3 API specification document
|
|-- public/
|   |-- LOGO.mp4                        # Intro video (6-second splash)
|   |-- file.svg, globe.svg, etc.       # Static SVG assets
|
|-- src/
    |-- app/
    |   |-- layout.tsx                  # Root layout (ThemeProvider, fonts, metadata)
    |   |-- page.tsx                    # Landing page (/)
    |   |-- globals.css                 # Global styles, CSS variables, animations
    |   |-- not-found.tsx               # Custom 404 page
    |   |
    |   |-- (auth)/                     # Authentication route group
    |   |   |-- login/page.tsx          # Login page (/login)
    |   |   |-- register/page.tsx       # Registration page (/register)
    |   |
    |   |-- (dashboard)/                # User dashboard route group
    |   |   |-- layout.tsx              # Dashboard layout (navbar, sidebar, auth guard)
    |   |   |-- dashboard/
    |   |       |-- page.tsx            # Dashboard home (/dashboard)
    |   |       |-- create-campaign/    # Campaign creation (/dashboard/create-campaign)
    |   |       |-- campaigns/          # Campaign history (/dashboard/campaigns)
    |   |       |-- audio-library/      # Audio management (/dashboard/audio-library)
    |   |       |-- text-to-speech/     # TTS tool (/dashboard/text-to-speech)
    |   |       |-- contact-library/    # Contact lists (/dashboard/contact-library)
    |   |       |-- agent-groups/       # Agent groups (/dashboard/agent-groups)
    |   |       |-- reports/            # Report generation (/dashboard/reports)
    |   |       |-- plans/              # Pricing plans (/dashboard/plans)
    |   |       |-- credits/            # Credit history (/dashboard/credits)
    |   |       |-- profile/            # User profile (/dashboard/profile)
    |   |       |-- payment/            # Payment processing (/dashboard/payment)
    |   |       |   |-- page.tsx        # CCAvenue redirect page
    |   |       |   |-- success/        # Payment success page
    |   |       |   |-- failure/        # Payment failure page
    |   |
    |   |-- (admin)/                    # Admin panel route group
    |   |   |-- admin/
    |   |       |-- layout.tsx          # Admin layout (navbar, admin guard)
    |   |       |-- page.tsx            # Admin dashboard (/admin)
    |   |       |-- users/              # User management (/admin/users)
    |   |       |-- credits/            # Credit history (/admin/credits)
    |   |       |-- campaigns/          # Campaign analysis (/admin/campaigns)
    |   |       |-- audio/              # Audio files (/admin/audio)
    |   |       |-- cli/                # CLI management (/admin/cli)
    |   |       |-- reports/            # Reports (/admin/reports)
    |   |
    |   |-- (pages)/                    # Static/legal pages route group
    |   |   |-- layout.tsx              # Pages layout (navbar + footer)
    |   |   |-- terms-and-conditions/   # Terms & Conditions
    |   |   |-- privacy-policy/         # Privacy Policy
    |   |   |-- refund-policy/          # Refund Policy
    |   |   |-- fair-usage-policy/      # Fair Usage Policy
    |   |   |-- content-policy/         # Content Policy
    |   |   |-- contact-us/             # Contact Us (form + channels)
    |   |
    |   |-- api/                        # Server-side API routes
    |       |-- auth/register/route.ts  # User registration (server-side)
    |       |-- ccavenue/
    |       |   |-- encrypt/route.ts    # Payment encryption
    |       |   |-- response/route.ts   # Payment callback handler
    |       |-- contact/route.ts        # Contact form (Discord proxy)
    |       |-- log-sheet/route.ts      # Google Sheets logging proxy
    |       |-- tts/
    |           |-- generate/route.ts   # Text-to-speech generation
    |           |-- translate/route.ts  # Text translation
    |
    |-- components/
    |   |-- auth-nav-buttons.tsx        # Login/Register or Dashboard button
    |   |-- pagination.tsx              # Shared pagination component
    |   |-- scroll-animate.tsx          # Scroll-triggered animations
    |   |-- theme-provider.tsx          # Dark/light mode provider
    |   |-- theme-toggle.tsx            # Theme toggle button
    |   |-- video-intro.tsx             # 6-second logo video splash
    |
    |-- lib/
    |   |-- ccavenue.ts                 # AES-128-CBC encrypt/decrypt
    |   |-- google-sheet.ts             # Google Sheets webhook helper
    |   |-- order-store.ts              # Payment order tracking (file-based)
    |
    |-- services/
    |   |-- api.ts                      # Base API helpers (GET, POST, FormData)
    |   |-- admin.service.ts            # Admin API functions (20+)
    |   |-- audio.service.ts            # Audio/prompt API functions
    |   |-- campaign.service.ts         # Campaign API functions
    |   |-- user.service.ts             # User profile/stats API functions
    |
    |-- store/
    |   |-- auth-store.ts               # Auth state (Zustand, persisted)
    |   |-- theme-store.ts              # Theme state (Zustand, persisted)
    |
    |-- types/
        |-- index.ts                    # All TypeScript interfaces (30+)
```

**Total Source Files:** 60
**Total Lines of Code:** ~13,000

---

## 4. Environment Configuration

All sensitive values are stored in `.env.local` (not committed to git). Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `CCAVENUE_MERCHANT_ID` | CCAvenue merchant ID | `3680285` |
| `CCAVENUE_ACCESS_CODE` | CCAvenue access code | `AVXQ90ND65AL13QXLA` |
| `CCAVENUE_WORKING_KEY` | CCAvenue encryption key (AES-128) | `30AAE085CD34847F9B49061A620FEA3B` |
| `CCAVENUE_URL` | CCAvenue gateway URL | `https://test.ccavenue.com` |
| `NEXT_PUBLIC_BASE_URL` | Public site URL (used for redirects) | `https://zero8zero.co.in` |
| `RESELLER_USERNAME` | OBD3 reseller account username | `Cloudcentral` |
| `RESELLER_PASSWORD` | OBD3 reseller account password | `Admin@123` |
| `RESELLER_USERID` | OBD3 reseller user ID | `500099` |
| `DISCORD_WEBHOOK_URL` | Discord webhook for contact form | `https://discord.com/api/webhooks/...` |
| `GOOGLE_SHEET_WEBHOOK` | Google Apps Script webhook URL | `https://script.google.com/macros/s/...` |

**Important:** On Vercel, these must be added in **Settings > Environment Variables** since `.env.local` is not deployed.

---

## 5. Installation & Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Local Development

```bash
git clone <repository-url>
cd zero8zero
npm install
npm run dev
```

The dev server starts on **http://localhost:3000** (default) with hostname `0.0.0.0` for LAN access.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev --port 3000 --hostname 0.0.0.0` | Start development server |
| `build` | `next build` | Production build |
| `start` | `next start --port 3000` | Start production server |
| `lint` | `eslint` | Run ESLint |

### Production Build

```bash
npm run build
npm run start
```

---

## 6. Architecture

### High-Level Architecture

```
[Browser] <---> [Next.js App (Vercel)]
                    |
                    |-- Client Components (React + Zustand)
                    |-- Server API Routes (/api/*)
                    |       |
                    |       |-- /api/auth/register     --> OBD3 API
                    |       |-- /api/ccavenue/encrypt   --> CCAvenue
                    |       |-- /api/ccavenue/response  --> OBD3 API + Google Sheets
                    |       |-- /api/contact            --> Discord Webhook
                    |       |-- /api/log-sheet          --> Google Sheets
                    |       |-- /api/tts/generate       --> Google Translate TTS
                    |       |-- /api/tts/translate      --> Google Translate
                    |
                    |-- Client-side API calls
                            |
                            --> OBD3 API (obd3api.expressivr.com)
```

### Design Principles

1. **Server-side secrets** - All credentials and webhook URLs are in environment variables, accessed only by server API routes. No secrets in the browser bundle.
2. **Fast dashboard loading** - Slow API calls (`statistic/summary`, `totalCalls`) fire in background after the page renders with fast data.
3. **Fire-and-close campaign creation** - Campaign compose API fires and the modal closes immediately without waiting for the response.
4. **Wallet balance in navbar** - Fetched via `refreshProfile()` on every dashboard layout mount.
5. **Auto-logout on 401** - If any API call returns 401, the user is automatically logged out.
6. **Pagination everywhere** - Shared `<Pagination>` component used across all 13 paginated views (5 items per page default).

---

## 7. Authentication System

### Login Flow

1. User enters username/password on `/login`
2. Client calls `POST https://obd3api.expressivr.com/api/obd/login`
3. On success, receives `token`, `userid`, `role[]`
4. Zustand auth store saves: `user`, `token`, `roles`, `isAdmin`
5. Profile is fetched in background for wallet balance
6. Redirect: Admin users go to `/admin`, regular users to `/dashboard`

### Auth Store (`src/store/auth-store.ts`)

- Persisted to `localStorage` as `zero8zero-auth`
- State: `user`, `token`, `profile`, `roles`, `isAuthenticated`, `isAdmin`
- Actions: `login()`, `logout()`, `refreshProfile()`
- Error handling: "Something went wrong" = account expired, "Bad credentials" = wrong password

### Auth Guards

- **Dashboard layout** (`(dashboard)/layout.tsx`): Redirects to `/login` if not authenticated
- **Admin layout** (`(admin)/admin/layout.tsx`): Redirects to `/login` if not authenticated OR not admin
- **Login/Register pages**: Redirect to dashboard/admin if already authenticated

### Roles

| Role | Access |
|------|--------|
| `ROLE_ADMIN` | Admin panel + Dashboard |
| `ROLE_SUPERADMIN` | Admin panel + Dashboard |
| Regular user | Dashboard only |

---

## 8. User Registration Flow

### Flow Diagram

```
[User fills form on /register]
        |
        v
[POST /api/auth/register] (Server-side route)
        |
        |-- 1. Validate required fields
        |-- 2. Login as reseller (env vars: RESELLER_USERNAME/PASSWORD)
        |-- 3. Call OBD3 /api/obd/register with:
        |       - User details (username, password, name, email, phone, company, pincode)
        |       - planId: 100318 (Trial)
        |       - expiryDate: 30 days from now
        |       - parent: reseller userid
        |       - groupRows: BLR_ALL (groupId: 34)
        |       - locationRows: Bangalore (locationId: 3)
        |       - moduleId: 1
        |-- 4. Log to Google Sheet ("Users" sheet)
        |-- 5. Return { userId } to client
        |
        v
[Client shows success, redirects to /login after 3 seconds]
```

### Registration Parameters

| Field | Source | Value |
|-------|--------|-------|
| `planId` | Hardcoded | `100318` (Trial plan) |
| `expiryDate` | Computed | 30 days from registration |
| `parent` | Reseller login | Dynamic (reseller userid) |
| `groupRows` | Hardcoded | `BLR_ALL` (groupId: 34) |
| `locationRows` | Hardcoded | `Bangalore` (locationId: 3) |
| `moduleId` | Hardcoded | `1` |
| `accountType` | Hardcoded | `0` (Standard) |
| `userType` | Hardcoded | `user` |
| `planType` | Hardcoded | `0` |

### Validation

- Username: min 4 chars, alphanumeric + underscore only
- Password: min 8 characters
- Email: standard email pattern
- Phone: 10-12 digits
- Pincode: 5-6 digits
- Company: required
- Terms & Conditions: must agree

---

## 9. Dashboard (User Panel)

### Layout (`(dashboard)/layout.tsx`)

- Sticky top navbar with logo, navigation links, wallet balance, theme toggle, user menu
- Mobile-responsive with hamburger menu
- Navigation items: Dashboard, Create Campaign, Campaigns, Audio, TTS, Contacts, Agents, Reports
- User dropdown menu: Profile, Plans & Pricing, Credits, Sign Out
- Footer with legal page links

### Dashboard Home (`/dashboard`)

Displays:
- **Welcome banner** with user's name
- **4 stat cards**: Total Campaigns, Connected Calls, Total Calls, Credits Available
- **Live Summary table**: Real-time campaign status with progress bars, pagination (5 per page)
- **Refresh button**: Manually reload all data

Data loading strategy:
1. Fast load: `fetchDashboardDetails()` + `fetchLiveCampaigns()` (renders immediately)
2. Background: `fetchDashboardStats()` (slow, updates stat cards when done)

### Campaign Status Codes

| Code | Status | Color |
|------|--------|-------|
| 0 | Pending | Amber |
| 1 | Running | Primary |
| 2 | Completed | Green |
| 3 | Paused | Purple |
| 4 | Failed | Red |

---

## 10. Campaign Management

### Campaign Types

| Type | Template ID | Description | Key Features |
|------|-------------|-------------|--------------|
| Simple IVR | 0 | One-way voice broadcast | Upload contacts, select audio, schedule |
| Input IVR | 1 | DTMF interactive menu | Multi-key detection (1-9), menu wait time, re-prompts |
| Call Patch | 2 | Route to live agents | Agent group routing, per-group DTMF, no-agent fallback |

### Create Campaign (`/dashboard/create-campaign`)

1. User selects campaign type (3 cards)
2. Modal opens with campaign form
3. Form loads data from API: approved prompts, contact bases, agent groups, locations, CLIs
4. User configures:
   - Campaign name
   - Contact base
   - Audio files (varies by type)
   - Schedule date/time (format: `YYYY-MM-DD HH:MM:SS`)
   - Retries (0/1/2) and retry interval (0/15/30 min)
   - Type-specific options (DTMF keys, agent groups, etc.)
5. Submit fires `composeCampaign()` and closes modal immediately (fire-and-close)

### Campaign Compose Payloads

#### Simple IVR (Template 0)
```json
{
  "userId": "<userId>",
  "campaignName": "<name>",
  "templateId": "0",
  "dtmf": "",
  "baseId": "<baseId>",
  "welcomePId": "<audioPromptId>",
  "menuPId": "", "noInputPId": "", "wrongInputPId": "", "thanksPId": "",
  "scheduleTime": "YYYY-MM-DD HH:MM:SS",
  "retries": "0", "retryInterval": "0",
  "agentRows": "\"\"",
  "menuWaitTime": "", "rePrompt": "",
  "location": "{\"locationList\":[{\"locationId\":3,\"locationName\":\"Bangalore\"}]}",
  "clis": "",
  "webhook": false, "webhookId": "",
  "callPatchSuccessMessage": "", "callPatchFailMessage": ""
}
```

#### Input IVR (Template 1)
- `dtmf`: Comma-separated keys (e.g., `"1,3,5"`)
- `menuPId`: Main audio (required)
- `menuWaitTime`: `"0"` to `"6"` seconds
- `rePrompt`: `"0"` to `"2"` times

#### Call Patch (Template 2)
- `agentRows`: JSON with `patchList` containing group selections and DTMF assignments
- `noAgentId`: Required audio for when no agent is available
- `menuPId`: Main menu audio

### Campaign History (`/dashboard/campaigns`)

Two tabs:
- **Historical**: Card view with stats (uploaded, connected, DND, pulses, DTMF, retries) + action buttons (Pause/Stop/Resume)
- **Scheduled**: Card view of upcoming campaigns

Date range filter with default 90-day lookback. Pagination (4 cards per page).

### Campaign Actions

| Action | When Available | API |
|--------|---------------|-----|
| Pause | Running | `POST /api/obd/campaign/pause` |
| Stop | Running or Paused | `POST /api/obd/campaign/stop` |
| Resume | Paused | `POST /api/obd/campaign/resume` |
| Retry | Completed | `POST /api/obd/campaign/retry` |

---

## 11. Audio Library

### Page: `/dashboard/audio-library`

Features:
- **Upload form**: Drag-and-drop or browse, WAV/MP3 only
- **Filters**: Search by name, filter by category, filter by status
- **Audio player**: Play/pause/stop with progress bar and duration
- **Download button**: Direct download link
- **Pagination**: 5 items per page

### Audio Statuses

| Code | Status | Description |
|------|--------|-------------|
| 0 | Pending | Uploaded, awaiting approval |
| 1 | Approved | Can be used in campaigns |
| 2 | Rejected | Cannot be used |
| 9 | Deleted | Soft deleted |

### Prompt Categories

`welcome`, `menu`, `noinput`, `wronginput`, `noagent`, `thanks`

### Upload Parameters

| Field | Value |
|-------|-------|
| `waveFile` | File binary (FormData) |
| `userId` | Current user ID |
| `fileName` | User-entered name (spaces replaced with underscores) |
| `promptCategory` | One of the categories above |
| `fileType` | `wav` or `mp3` |

---

## 12. Text-to-Speech (TTS)

### Page: `/dashboard/text-to-speech`

Workflow:
1. Select target language from 13 Indian languages
2. Type message in English
3. (Optional) Click Translate to preview translation
4. Click Preview to hear audio
5. Click Generate Audio to create MP3
6. Name the file and Upload to Audio Library

### Supported Languages

Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, English (Indian), Nepali, Sinhala

### How It Works

- **Translation**: Uses Google Translate API (`translate.googleapis.com/translate_a/single`)
- **Audio Generation**: Uses Google Translate TTS (`translate.google.com/translate_tts`)
- **Text splitting**: Long text is split into ~200-character chunks for TTS, then concatenated
- **Speed**: Normal speed for standard text, 0.24x for slow speed option
- **Upload**: Generated MP3 is uploaded to Audio Library as `welcome` category

### API Routes

- `POST /api/tts/translate` - Translate English text to target language
- `POST /api/tts/generate` - Generate audio (with optional auto-translation)

**Note:** Google's TTS endpoint is undocumented and may be blocked. This is a known limitation.

---

## 13. Contact Library

### Page: `/dashboard/contact-library`

Two upload methods:
1. **File Upload**: CSV or TXT file with phone numbers
2. **Manual Entry**: Paste/type numbers in bulk (uploaded as TXT)

### Number Validation
- Must be exactly 10 digits
- No country code
- Non-numeric characters are stripped automatically
- Spaces in names are replaced with underscores

### Upload API
- Endpoint: `POST /api/obd/baseupload` (multipart/form-data)
- Fields: `baseFile`, `userId`, `baseName`, `contactList` (set to `"null"`)

### Display
- Table with Base ID and List Name
- Search by name or ID
- Pagination (5 per page)
- Sorted by newest first (descending baseId)

---

## 14. Agent Groups

### Page: `/dashboard/agent-groups`

CRUD operations for agent groups used in Call Patch campaigns.

### Create Group
- Group name
- Multiple agents (name + phone + type)
- Agent types: Normal Agent (0) or Call Centre Agent (1)
- Phone validation: 10 digits, numeric only

### Edit Group
- Inline edit mode on the card
- Add/remove agents
- Change group name

### Delete Group
- `DELETE /api/obd/group/agent/{groupId}`
- Refreshes list on completion

### Display
- Card view with agent list per group
- Pagination (4 per page)

---

## 15. Reports

### Page: `/dashboard/reports`

Two sections:
1. **Generate Report**: Searchable campaign dropdown, report type selector (Full / Inbound Full), generate button
2. **Report List**: Table of generated reports with status and download links

### Report Statuses

| Code | Status | Action |
|------|--------|--------|
| 0 | Processing | Wait |
| 1 | Processing | Wait |
| 2 | Ready | Download available |
| 2 (no_data) | Ready | No data to download |
| 3 | Failed | Retry generation |

### Report Generation
- `POST /api/obd/report/generate` with `{ campaignId, reportType }`
- Report list auto-refreshes 3 seconds after generation request

---

## 16. Plans & Pricing

### Page: `/dashboard/plans`

### Plan Tiers

#### Starter Pack
| Calls | Per Call | Validity | Price | Plan ID |
|-------|---------|----------|-------|---------|
| 1,000 | Rs 0.36 | 28 days | Rs 360 | 100498 |
| 3,000 | Rs 0.30 | 28 days | Rs 900 | 100499 |
| 5,000 | Rs 0.24 | 28 days | Rs 1,200 | 100500 |

#### Business Pack
| Calls | Per Call | Validity | Price | Plan ID |
|-------|---------|----------|-------|---------|
| 10,000 | Rs 0.20 | 60 days | Rs 2,000 | 100501 |
| 20,000 | Rs 0.18 | 60 days | Rs 3,600 | 100502 |
| 30,000 | Rs 0.15 | 60 days | Rs 4,500 | 100503 |

#### Enterprise Pack
| Calls | Per Call | Validity | Price | Plan ID |
|-------|---------|----------|-------|---------|
| 50,000 | Rs 0.12 | 180 days | Rs 6,000 | 100504 |
| 1,00,000 | Rs 0.10 | 365 days | Rs 10,000 | 100505 |
| 5,00,000 | Rs 0.08 | 365 days | Rs 40,000 | 100506 |

#### Custom Pack
- Minimum 2,00,000 calls
- Contact support for custom pricing
- Custom call rates, flexible validity, volume discounts

### Pricing Notes
- All prices are exclusive of 18% GST
- Plans are non-refundable
- Switching plans resets credit balance
- Purchasing the same plan adds credits to existing balance

---

## 17. Payment Gateway (CCAvenue)

### Integration Overview

CCAvenue is integrated for processing plan purchases. The integration uses AES-128-CBC encryption for secure communication.

### Payment Flow

```
[User clicks "Buy Now" on Plans page]
        |
        v
[/dashboard/payment] - Collects order details
        |
        v
[POST /api/ccavenue/encrypt] (Server-side)
        |-- 1. Verify user authentication (JWT token validated against OBD3 API)
        |-- 2. Build payment parameters string
        |-- 3. Register order ID in order store
        |-- 4. Encrypt parameters with AES-128-CBC
        |-- 5. Return { encRequest, accessCode, ccavenueUrl }
        |
        v
[Browser auto-submits form to CCAvenue gateway]
        |
        v
[User completes payment on CCAvenue]
        |
        v
[CCAvenue POSTs to /api/ccavenue/response] (Server-side callback)
        |-- 1. Parse encResp from POST body
        |-- 2. Decrypt with AES-128-CBC
        |-- 3. Parse key-value pairs (order_id, status, amount, merchant_params)
        |-- 4. Validate order ID format (must start with "Z8Z_")
        |-- 5. If Success:
        |       a. processCreditsAndPlan() - handles credit logic
        |       b. Log to Google Sheet ("Payments" sheet)
        |       c. Redirect to /dashboard/payment/success
        |-- 6. If Failed:
        |       a. Log to Google Sheet
        |       b. Redirect to /dashboard/payment/failure
```

### Encryption Details (`src/lib/ccavenue.ts`)

- Algorithm: AES-128-CBC
- Key: MD5 hash of `CCAVENUE_WORKING_KEY`
- IV: Fixed 16-byte sequence `[0x00, 0x01, ..., 0x0f]`
- Encoding: UTF-8 input, hexadecimal output

### Order ID Format

`Z8Z_{userId}_{timestamp}`

Example: `Z8Z_500123_1712505600000`

### Merchant Parameters

| Parameter | Content |
|-----------|---------|
| `merchant_param1` | Plan name (e.g., "Starter -- 1,000 Calls") |
| `merchant_param2` | Calls_Days (e.g., "1000_28") |
| `merchant_param3` | User ID |
| `merchant_param4` | Base price (without GST) |
| `merchant_param5` | Plan ID |

### CCAvenue Configuration

| Setting | Value |
|---------|-------|
| Merchant ID | 3680285 |
| Environment | Test (`test.ccavenue.com`) |
| Redirect URL | `{NEXT_PUBLIC_BASE_URL}/api/ccavenue/response` |
| Cancel URL | `{NEXT_PUBLIC_BASE_URL}/api/ccavenue/response` |

---

## 18. Credit System

### Credit Processing Logic (`processCreditsAndPlan`)

When a payment succeeds, the system determines the credit action based on plan comparison:

#### Same Plan Purchase (top-up)
```
1. Add new credits to existing balance
2. Extend expiry date from today + plan days
```

#### Different Plan Purchase (plan change)
```
1. Remove all existing credits (if balance > 0)
2. Update user plan to new planId + new expiry
3. Add new credits
```

### Credit Operations

| Operation | API Endpoint | Parameters |
|-----------|-------------|------------|
| Add Credits | `POST /api/obd/credits/add` | `{ userId, parent, credits }` |
| Remove Credits | `POST /api/obd/credits/remove` | `{ userId, parent, credits }` |
| User Credit History | `POST /api/obd/credits/history/user` | `{ userId, startDate, endDate }` |
| All Credit History | `POST /api/obd/credits/history` | `{ userId, startDate, endDate }` |

### Credits Page (`/dashboard/credits`)

Displays:
- Gradient balance card (available credits, channels, expiry, used)
- Summary cards (total added, total used)
- Transaction history table with date range filter
- Each transaction shows: date, action, campaign, type (addition/deduction), amount, user

---

## 19. Admin Panel

### Access Control

- Only users with `ROLE_ADMIN` or `ROLE_SUPERADMIN` can access `/admin/*`
- Admin layout has a distinct red/amber color scheme (vs purple for user dashboard)

### Admin Dashboard (`/admin`)

- 4 stat cards: Total Users, Total Calls, Connected Calls, Reseller Credits
- User Statistics Summary table (paginated, 5 per page)
- Quick action cards: Manage Users, Manage Credits, View Campaigns

### Admin Pages

| Page | Path | Description |
|------|------|-------------|
| Users | `/admin/users` | Register, edit, toggle account type, add/remove credits per user |
| Credits | `/admin/credits` | View all credit transactions across all users |
| Campaigns | `/admin/campaigns` | Campaign analysis for all users with filters |
| Audio | `/admin/audio` | View all audio files across users with download |
| CLI | `/admin/cli` | CLI number management and allocation |
| Reports | `/admin/reports` | Generate and download reports for any campaign |

### User Management (`/admin/users`)

Features:
- **Register new user**: Full form with plan selection, module selection, expiry date
- **Edit user**: Update profile, plan, expiry, account type
- **Add/Remove credits**: Modal with amount input
- **Toggle account type**: Quick switch between Standard/Premium
- **Search**: Filter users by name, username, or email
- **Stats**: Shows credit usage per user from stats summary API

---

## 20. API Routes (Server-Side)

### `POST /api/auth/register`

Handles user registration server-side to keep reseller credentials secure.

- **Input**: `{ username, password, name, emailid, number, company, address, pincode }`
- **Process**: Login as reseller -> register user -> log to Google Sheet
- **Output**: `{ userId, message }` or `{ error }`
- **Trial expiry**: 30 days from registration

### `POST /api/ccavenue/encrypt`

Encrypts payment data for CCAvenue.

- **Auth**: Requires valid JWT in Authorization header
- **Input**: Order details + billing info + merchant params
- **Process**: Validate token -> build params -> encrypt -> store order ID
- **Output**: `{ encRequest, accessCode, ccavenueUrl }`

### `POST /api/ccavenue/response`

Handles CCAvenue payment callback.

- **Input**: `encResp` (encrypted response from CCAvenue)
- **Process**: Decrypt -> validate order format -> process credits -> log to sheet -> redirect
- **Output**: HTTP 303 redirect to success or failure page

### `POST /api/contact`

Proxies contact form submissions to Discord.

- **Input**: `{ name, number, email, message }`
- **Validation**: All 4 fields required
- **Process**: Build Discord embed -> POST to webhook URL from env
- **Output**: `{ status: "ok" }` or `{ error }`

### `POST /api/log-sheet`

Proxies data to Google Sheets (with validation).

- **Allowed sheets**: `"User Updates"` only (from client)
- **Allowed fields**: Allowlisted set of field names
- **Validation**: Rejects unknown sheets, strips unknown fields, type-checks values

### `POST /api/tts/generate`

Generates TTS audio from text.

- **Input**: `{ text, lang, speed?, translate? }`
- **Process**: Optionally translate -> split into chunks -> fetch Google TTS for each -> concatenate
- **Output**: `audio/mpeg` binary response

### `POST /api/tts/translate`

Translates text between languages.

- **Input**: `{ text, lang }`
- **Process**: Call Google Translate API
- **Output**: `{ translated: "..." }`

---

## 21. External API Integration (OBD3)

### Base URL

`https://obd3api.expressivr.com`

### Authentication

All API calls require `Authorization: Bearer <token>` header. Token is obtained via:

```
POST /api/obd/login
Body: { "username": "...", "password": "..." }
Response: { "token": "...", "userid": "...", "role": [...], "message": "Success" }
```

### API Endpoints

#### Authentication & Users
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/login` | POST | Login |
| `/api/obd/register` | POST | Register new user |
| `/api/obd/user/profile/{userId}` | GET | Get user profile |
| `/api/obd/user/update` | POST | Update user profile |
| `/api/obd/user/{parentUserId}` | GET | List sub-users |
| `/api/obd/change/accountType` | POST | Change account type |

#### Dashboard & Stats
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/dashboard/{userId}` | GET | Dashboard summary |
| `/api/obd/user/statistic/summary` | POST | User statistics (slow) |
| `/api/obd/dashboard/totalCalls` | POST | Total call stats |

#### Campaigns
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/campaign/compose` | POST | Create campaign |
| `/api/obd/campaign/{userId}` | GET | Live campaigns |
| `/api/obd/campaign/historical` | POST | Historical campaigns |
| `/api/obd/campaign/analysis` | POST | Campaign analysis |
| `/api/obd/campaign/schedule/{userId}` | GET | Scheduled campaigns |
| `/api/obd/campaign/pause` | POST | Pause campaign |
| `/api/obd/campaign/stop` | POST | Stop campaign |
| `/api/obd/campaign/resume` | POST | Resume campaign |
| `/api/obd/campaign/retry` | POST | Retry campaign |
| `/api/obd/campaign/retry/option/{campaignId}` | GET | Retry options |

#### Audio / Prompts
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/prompts/{userId}` | GET | List audio prompts |
| `/api/obd/promptupload` | POST | Upload audio (multipart) |

#### Contacts
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/base/{userId}` | GET | List contact bases |
| `/api/obd/baseupload` | POST | Upload contacts (multipart) |

#### Agent Groups
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/group/agent/list/{userId}` | GET | List groups |
| `/api/obd/add/group/agent` | POST | Create group |
| `/api/obd/edit/group/agent` | POST | Edit group |
| `/api/obd/group/agent/{groupId}` | DELETE | Delete group |

#### Credits
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/credits/add` | POST | Add credits |
| `/api/obd/credits/remove` | POST | Remove credits |
| `/api/obd/credits/history/user` | POST | User credit history |
| `/api/obd/credits/history` | POST | All credit history |

#### Reports
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/report/generate` | POST | Generate report |
| `/api/obd/report/download/{userId}` | GET | List reports |

#### Admin / System
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/obd/plans/list/{userId}` | GET | List plans |
| `/api/obd/locations` | GET | List locations |
| `/api/obd/module` | GET | List modules |
| `/api/obd/groups` | GET | List groups |
| `/api/obd/cli/{userId}` | GET | List CLIs |
| `/api/obd/user/locations/{userId}` | GET | User locations |
| `/api/obd/dedicated/cli/allocated/{userId}` | GET | Allocated CLIs |
| `/api/obd/dedicated/cli/allocate` | POST | Allocate CLI |
| `/api/obd/dedicated/remove/cli` | POST | Remove CLI |
| `/api/obd/searchNumber` | POST | Search call records |

---

## 22. Services Layer

### `src/services/api.ts` - Base Helpers

| Function | Description |
|----------|-------------|
| `apiGet<T>(path)` | GET with auth headers |
| `apiPost<T>(path, body)` | POST JSON with auth headers |
| `apiPostForm<T>(path, formData)` | POST FormData with auth header (no Content-Type) |
| `getUserId()` | Get current user ID from auth store |
| `getDefaultDateRange()` | Returns { startDate, endDate } for last 90 days |

Response handling:
- 401 -> auto-logout
- Empty response -> returns `[]`
- JSON parse failure -> returns `[]`

### `src/services/admin.service.ts` - Admin Functions (22 functions)

User management, credit operations, dashboard stats, campaign analysis, audio prompts, CLI management, plans, locations, groups, modules, reports, inbound campaigns, CDR search.

### `src/services/campaign.service.ts` - Campaign Functions (12 functions)

Campaign CRUD, compose, pause/stop/resume/retry, locations, CLIs, scheduled campaigns, dashboard details, call records.

### `src/services/audio.service.ts` - Audio Functions (3 functions)

`fetchPrompts`, `uploadVoiceFile`, `uploadBase`, `fetchBases`

### `src/services/user.service.ts` - User Functions (3 functions)

`fetchProfile`, `fetchDashboardStats`, `fetchCreditHistory`

---

## 23. State Management

### Zustand Stores

#### Auth Store (`src/store/auth-store.ts`)

| Key | Persisted | Storage Key |
|-----|-----------|-------------|
| `zero8zero-auth` | Yes | localStorage |

State:
- `user: User | null` - id, username, email, walletBalance
- `token: string | null` - JWT token
- `profile: UserProfile | null` - Full profile from API
- `roles: string[]` - Array of role strings
- `isAuthenticated: boolean`
- `isAdmin: boolean`

Actions:
- `login(username, password)` - Returns `{ success, error?, isAdmin? }`
- `logout()` - Clears all state
- `refreshProfile()` - Re-fetches profile, updates wallet balance

#### Theme Store (`src/store/theme-store.ts`)

| Key | Persisted | Storage Key |
|-----|-----------|-------------|
| `zero8zero-theme` | Yes | localStorage |

State: `theme: "light" | "dark"`
Actions: `toggleTheme()`, `setTheme(theme)`

---

## 24. TypeScript Types

### Core Types (`src/types/index.ts`)

| Type | Description |
|------|-------------|
| `IVRType` | `"simple" | "input" | "call-patch"` |
| `CampaignStatus` | `"draft" | "running" | "paused" | "completed" | "failed"` |
| `AudioStatus` | `"pending" | "approved" | "rejected"` |
| `User` | Basic user (id, username, email, walletBalance) |
| `UserProfile` | Full profile (30+ fields) |
| `DashboardStats` | Campaign/call/cost summaries |
| `CampaignAnalysis` | Campaign analysis data |
| `HistoricalCampaign` | Historical campaign with full details |
| `Prompt` | Audio prompt (id, category, fileName, status, URL, duration) |
| `BaseItem` | Contact list (baseId, baseName) |
| `CLIItem` | CLI number details |
| `LocationItem` | Location (id, name) |
| `CreditHistoryEntry` | Credit transaction record |
| `AdminUser` | Full admin user (30+ fields) |
| `PlanItem` | Plan (id, name, pulseDuration, price, channels) |
| `GroupItem` | Group (id, name) |
| `ModuleItem` | Module (id, name) |
| `DedicatedCLI` | Dedicated CLI allocation |
| `InboundCampaign` | Inbound campaign details |
| `ReportItem` | Generated report (status, URL, date) |
| `TotalCallsStats` | Total and connected call counts |

---

## 25. Shared Components

### `Pagination` (`src/components/pagination.tsx`)

Reusable pagination component used across 13 pages.

Props:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | number | required | Current active page |
| `totalPages` | number | required | Total number of pages |
| `totalItems` | number | required | Total item count |
| `pageSize` | number | required | Items per page |
| `onPageChange` | (page: number) => void | required | Page change handler |
| `activeClass` | string | `"gradient-bg text-white shadow-lg shadow-primary/25"` | CSS class for active page button |

Features:
- First/Prev/Next/Last buttons
- Ellipsis for large page counts (shows max 7 page buttons)
- "Showing X-Y of Z" text
- Returns null when totalPages <= 1
- Dashboard pages: purple gradient active style
- Admin pages: red/amber gradient active style

### `ThemeProvider` (`src/components/theme-provider.tsx`)

Applies `dark` class to `<html>` based on Zustand theme store.

### `ThemeToggle` (`src/components/theme-toggle.tsx`)

Sun/Moon icon button that toggles theme.

### `AuthNavButtons` (`src/components/auth-nav-buttons.tsx`)

Smart navbar buttons:
- Not logged in: shows Login + Get Started
- Logged in (user): shows "Go to Dashboard"
- Logged in (admin): shows "Go to Admin Panel"
- Handles SSR hydration with mounted state

### `ScrollAnimateInit` (`src/components/scroll-animate.tsx`)

IntersectionObserver that adds `is-visible` class to `.animate-on-scroll` elements when they enter the viewport (threshold: 10%, root margin: -50px).

### `VideoIntro` (`src/components/video-intro.tsx`)

Full-screen video splash that plays `LOGO.mp4` on first visit. Auto-skips after 6 seconds or on video end/error.

---

## 26. Theme System

### CSS Variables (`src/app/globals.css`)

Two theme modes defined via CSS variables on `:root` and `.dark`:

| Variable | Light | Dark |
|----------|-------|------|
| `--background` | #fafbff | #000000 |
| `--foreground` | #0f172a | #fafafa |
| `--primary` | #4A35E0 | #4A35E0 |
| `--secondary` | #8b5cf6 | #8b5cf6 |
| `--accent` | #06b6d4 | #06b6d4 |
| `--accent-warm` | #f59e0b | #f59e0b |
| `--success` | #10b981 | #10b981 |
| `--danger` | #ef4444 | #ef4444 |
| `--muted` | #64748b | #71717a |
| `--border` | #e2e8f0 | #1c1c1c |
| `--card` | #ffffff | #0a0a0a |
| `--surface` | #f1f5f9 | #0f0f0f |
| `--sidebar` | #0f172a | #000000 |

### Tailwind Integration

Variables are mapped to Tailwind colors via `@theme inline` block:
- `bg-background`, `text-foreground`, `bg-card`, `border-border`, etc.
- Font families: `--font-sans` (Geist Sans), `--font-mono` (Geist Mono)

### Gradient Utilities

- `.gradient-text` - Purple gradient text (background-clip)
- `.gradient-bg` - Purple gradient background
- `.gradient-border` - Gradient border using mask-composite
- `.glass` - Backdrop blur (12px)

---

## 27. Animations & UI

### Scroll Animations

Applied via `.animate-on-scroll` class + variants:

| Class | Effect |
|-------|--------|
| `.animate-on-scroll` | Fade up (default) |
| `.from-left` | Slide from left |
| `.from-right` | Slide from right |
| `.scale-in` | Scale from 0.9 |
| `.rotate-in` | Rotate + scale in |
| `.blur-in` | Blur to clear |
| `.flip-up` | Perspective flip |

Delay classes: `.delay-1` through `.delay-5` (0.1s increments)

### Keyframe Animations

| Animation | Description | Duration |
|-----------|-------------|----------|
| `float` | Vertical float | 3s |
| `float-x` | Horizontal float | 4s |
| `pulse-glow` | Box shadow pulse | 2s |
| `slide-up` | Fade + slide up | 0.6s |
| `slide-down` | Fade + slide down | 0.6s |
| `fade-in` | Simple fade | 0.5s |
| `bounce-in` | Scale bounce | 0.6s |
| `shimmer` | Background shimmer | 3s |
| `spin-slow` | Slow rotation | 20s |
| `wiggle` | Left-right wiggle | 2s |
| `gradient-shift` | Moving gradient | 4s |

### Hover Interactions

| Class | Effect |
|-------|--------|
| `.hover-lift` | Translate up 4px + shadow |
| `.hover-grow` | Scale 1.03 |
| `.hover-tilt` | 3D perspective tilt |

### Stagger Children

`.stagger-children` - Auto-staggers child animations (0.1s between each, up to 9 children)

### Responsive

- Mobile table columns hidden via `.hide-mobile` (below 640px)
- Reduced table padding on mobile (below 768px)

---

## 28. Legal Pages

All legal pages are server-rendered (no `"use client"`) under the `(pages)` route group with shared layout.

| Page | Path | Content |
|------|------|---------|
| Terms & Conditions | `/terms-and-conditions` | Service terms, user obligations, liability |
| Privacy Policy | `/privacy-policy` | Data collection, usage, storage, rights |
| Refund Policy | `/refund-policy` | Non-refundable policy, exceptions |
| Fair Usage Policy | `/fair-usage-policy` | Acceptable use, restrictions, enforcement |
| Content Policy | `/content-policy` | Allowed/prohibited content for campaigns |
| Contact Us | `/contact-us` | Contact form + WhatsApp/Telegram/Discord/Email |

### Contact Channels

| Channel | Link |
|---------|------|
| WhatsApp | +91 89515 37972 |
| Telegram | @zero8zero |
| Discord | discord.gg/7sjpRaGPBX |
| Email | cloudcentral24@gmail.com |
| Phone | +91 89515 37972 |
| Address | 45, Kamarajar Street, 1st Cross, KK Pudur, Coimbatore, Tamil Nadu, 641038 |

### Business Hours
- Monday-Saturday: 9:00 AM - 6:00 PM
- Sunday: Closed
- Campaign Hours: 9:00 AM - 9:00 PM

---

## 29. Security Measures

### Implemented Security

1. **Server-side secrets**: All credentials (reseller, CCAvenue, webhooks) stored in environment variables, never in client code.

2. **Server-proxied registration**: Registration goes through `/api/auth/register` so reseller credentials never leave the server.

3. **Payment auth check**: `/api/ccavenue/encrypt` validates the user's JWT before processing. Unauthenticated requests are rejected with 401.

4. **Order ID verification**: Payment callback validates order ID format (`Z8Z_` prefix) to ensure it originated from the system.

5. **Discord webhook proxied**: Contact form posts to `/api/contact` server route, not directly to Discord.

6. **Google Sheets validation**: `/api/log-sheet` only accepts known sheet names (`"User Updates"`) and allowlisted fields from the client.

7. **Auto-logout on 401**: Any API call returning 401 triggers automatic logout.

8. **Form validation**: Client-side validation on all forms (React Hook Form) with server-side checks on API routes.

9. **Trial expiry**: New registrations get 30-day expiry, not unlimited.

10. **Suspense boundaries**: Payment pages use `<Suspense>` for `useSearchParams()` compliance with Next.js 16.

### Security Considerations

- **No rate limiting**: API routes don't implement rate limiting (relies on Vercel's built-in limits)
- **No CSRF tokens**: Relies on Next.js built-in CSRF protections
- **JWT validation**: User tokens are validated against the OBD3 API, not locally
- **Google TTS**: Uses undocumented Google endpoint with spoofed User-Agent

---

## 30. Deployment

### Vercel Deployment

The project is deployed on Vercel. Key considerations:

1. **Environment Variables**: All `.env.local` variables must be added in Vercel Dashboard > Settings > Environment Variables

2. **Serverless Functions**: All `/api/*` routes run as serverless functions with default 10-second timeout

3. **CCAvenue Callback**: The redirect URL must match `NEXT_PUBLIC_BASE_URL` exactly

4. **In-memory state**: The order store (`order-store.ts`) uses file-based persistence, but on Vercel serverless this may not persist across invocations. Order validation falls back to format checking (`Z8Z_` prefix).

### Production Checklist

- [ ] Set all environment variables in Vercel
- [ ] Change `CCAVENUE_URL` from `test.ccavenue.com` to `secure.ccavenue.com` for production
- [ ] Verify `NEXT_PUBLIC_BASE_URL` matches the actual domain
- [ ] Test payment flow end-to-end
- [ ] Verify Google Sheets logging works
- [ ] Test registration flow
- [ ] Check all admin functions

---

## 31. Codebase Statistics

| Metric | Value |
|--------|-------|
| Total source files | 60 |
| Total lines of code | ~13,000 |
| React pages | 32 |
| API routes | 7 |
| Shared components | 6 |
| Service files | 5 |
| Zustand stores | 2 |
| TypeScript types | 30+ |
| Supported languages (TTS) | 13 |
| Pricing plans | 9 + Custom |
| Campaign types | 3 |
| Audio categories | 6 |

### Dependencies

| Package | Purpose |
|---------|---------|
| `next` 16.2.1 | React framework |
| `react` 19.2.4 | UI library |
| `react-dom` 19.2.4 | React DOM renderer |
| `zustand` 5.0.12 | State management |
| `react-hook-form` 7.72.0 | Form handling |
| `lucide-react` 1.7.0 | Icon library |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` 5.x | Type checking |
| `tailwindcss` 4.x | Utility-first CSS |
| `@tailwindcss/postcss` 4.x | Tailwind PostCSS plugin |
| `eslint` 9.x | Linting |
| `eslint-config-next` 16.2.1 | Next.js ESLint rules |

---

*End of Documentation*
