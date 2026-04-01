# Zero8Zero - Project Settings & Configuration

## Dev Settings

| Setting | Value |
|---------|-------|
| Dev Port | **3000** |
| Hostname | **0.0.0.0** (accessible via IP) |
| Framework | Next.js 16.2.1 (App Router) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript (strict) |
| State | Zustand (persisted) |
| Forms | React Hook Form |
| Icons | Lucide React |
| Fonts | Geist Sans + Geist Mono |
| Allowed Dev Origins | 83.136.209.205 |

## API Configuration

| Setting | Value |
|---------|-------|
| Base URL | `https://obd3api.expressivr.com` |
| Auth | Bearer Token (JWT) |
| Reseller Account | Username: `Cloudcentral`, Role: `ROLE_ADMIN` |
| Registration Parent | Uses Cloudcentral credentials to register sub-users |
| Plan ID | `100318` |
| Default Location | Bangalore (locationId: 3) |

## API Endpoints Used

### Authentication
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/login` | POST | All | Login, returns token + userid + role |
| `/api/obd/register` | POST | SUPERADMIN, RESELLER | Register new user |
| `/api/obd/user/profile/{userId}` | GET | All | Get user profile (credits, expiry, plan) |

### Dashboard
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/dashboard/{userId}` | GET | All | Dashboard summary (dbHeader, runningCampaigns, dbTodayCampaigns) |
| `/api/obd/user/statistic/summary` | POST | All | User stats (campaigns, calls, cost) - **slow, loaded in background** |
| `/api/obd/dashboard/totalCalls` | POST | SUPERADMIN, RESELLER | Total calls stats |

### Campaigns
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/campaign/compose` | POST | USERS | Create campaign (Simple IVR=0, Input IVR=1, Call Patch=2) |
| `/api/obd/campaign/{userId}` | GET | USERS | Live/running campaigns |
| `/api/obd/campaign/historical` | POST | USERS | Historical campaigns with full details |
| `/api/obd/campaign/analysis` | POST | RESELLER, USERS | Campaign analysis summary |
| `/api/obd/campaign/schedule/{userId}` | GET | USERS | Scheduled campaigns |
| `/api/obd/campaign/pause` | POST | SUPERADMIN, USERS | Pause campaign |
| `/api/obd/campaign/stop` | POST | USERS | Stop campaign |
| `/api/obd/campaign/resume` | POST | SUPERADMIN, USERS | Resume campaign |
| `/api/obd/campaign/retry` | POST | USERS | Retry campaign |
| `/api/obd/campaign/retry/option/{campaignId}` | GET | USERS | Get retry options |

### Audio / Prompts
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/prompts/{userId}` | GET | All | List audio prompts (status: 0=pending, 1=approved, 2=rejected, 9=deleted) |
| `/api/obd/promptupload` | POST | USERS | Upload voice file (multipart/form-data) |

### Contacts / Base
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/base/{userId}` | GET | USERS | List uploaded contact bases |
| `/api/obd/baseupload` | POST | USERS | Upload contact file (multipart/form-data) |

### Agent Groups
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/group/agent/list/{userId}` | GET | USERS | List agent groups |
| `/api/obd/add/group/agent` | POST | USERS | Create agent group |
| `/api/obd/edit/group/agent` | POST | USERS | Edit agent group |
| `/api/obd/group/agent/{groupId}` | DELETE | USERS | Delete agent group |

### Credits
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/credits/history/user` | POST | USERS | User credit history |
| `/api/obd/credits/history` | POST | All | All credit history |
| `/api/obd/credits/add` | POST | SUPERADMIN, RESELLER | Add credits |
| `/api/obd/credits/remove` | POST | SUPERADMIN, RESELLER | Remove credits |

### Reports
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/report/generate` | POST | All | Generate campaign report |
| `/api/obd/report/download/{userId}` | GET | USERS | List downloadable reports |

### Admin / Users
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/user/{parentUserId}` | GET | SUPERADMIN, RESELLER | List sub-users |
| `/api/obd/user/update` | POST | All | Update user profile |
| `/api/obd/change/accountType` | POST | SUPERADMIN | Change account type |
| `/api/obd/plans/list/{userId}` | GET | All | List plans |
| `/api/obd/locations` | GET | All | List locations |
| `/api/obd/module` | GET | All | List modules |
| `/api/obd/groups` | GET | SUPERADMIN | List groups |

### CLI
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/obd/cli/{userId}` | GET | All | List CLIs |
| `/api/obd/user/locations/{userId}` | GET | All | User locations |
| `/api/obd/dedicated/cli/allocated/{userId}` | GET | All | Allocated dedicated CLIs |
| `/api/obd/dedicated/cli/allocate` | POST | SUPERADMIN, RESELLER | Allocate CLI |
| `/api/obd/dedicated/remove/cli` | POST | SUPERADMIN | Remove CLI |

## Campaign Compose Payload

### Simple IVR (templateId: 0)
```json
{
  "userId": "<userId>",
  "campaignName": "<name>",
  "templateId": "0",
  "dtmf": "",
  "baseId": "<baseId>",
  "welcomePId": "<audioPromptId>",
  "menuPId": "",
  "noInputPId": "",
  "wrongInputPId": "",
  "thanksPId": "",
  "scheduleTime": "YYYY-MM-DD HH:MM:SS",
  "smsSuccessApi": "",
  "smsFailApi": "",
  "smsDtmfApi": "",
  "callDurationSMS": 0,
  "retries": "0",
  "retryInterval": "0",
  "agentRows": "\"\"",
  "menuWaitTime": "",
  "rePrompt": "",
  "location": "{\"locationList\":[{\"locationId\":3,\"locationName\":\"Bangalore\"}]}",
  "clis": "",
  "webhook": false,
  "webhookId": "",
  "callPatchSuccessMessage": "",
  "callPatchFailMessage": ""
}
```

### Input IVR (templateId: 1)
```json
{
  "userId": "<userId>",
  "campaignName": "<name>",
  "templateId": "1",
  "dtmf": "1,3,5",
  "baseId": "<baseId>",
  "welcomePId": "<optional>",
  "menuPId": "<mainAudioId>",
  "noInputPId": "<optional>",
  "wrongInputPId": "<optional>",
  "thanksPId": "<optional>",
  "scheduleTime": "YYYY-MM-DD HH:MM:SS",
  "smsSuccessApi": "",
  "smsFailApi": "",
  "smsDtmfApi": "",
  "callDurationSMS": 0,
  "retries": "0",
  "retryInterval": "0",
  "agentRows": "\"\"",
  "menuWaitTime": "3",
  "rePrompt": "1",
  "location": "{\"locationList\":[...]}",
  "clis": "",
  "webhook": false,
  "webhookId": "",
  "callPatchSuccessMessage": "",
  "callPatchFailMessage": ""
}
```

### Call Patch IVR (templateId: 2)
```json
{
  "userId": "<userId>",
  "campaignName": "<name>",
  "templateId": "2",
  "dtmf": "",
  "baseId": "<baseId>",
  "welcomePId": "<optional>",
  "menuPId": "<mainAudioId>",
  "noInputPId": "<optional>",
  "wrongInputPId": "<optional>",
  "thanksPId": "<optional>",
  "scheduleTime": "YYYY-MM-DD HH:MM:SS",
  "smsSuccessApi": "",
  "smsFailApi": "",
  "smsDtmfApi": "",
  "callDurationSMS": 0,
  "retries": "0",
  "retryInterval": "0",
  "agentRows": "{\"patchList\":[{\"groupId\":\"4\",\"agentDtmf\":\"1\",\"groupName\":\"Sales\"}]}",
  "menuWaitTime": "3",
  "rePrompt": "1",
  "location": "{\"locationList\":[...]}",
  "clis": "",
  "webhook": false,
  "webhookId": "",
  "noAgentId": "<noAgentAudioId>",
  "callPatchSuccessMessage": "",
  "callPatchFailMessage": ""
}
```

## Project Structure

```
zero8zero/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (ThemeProvider, fonts, metadata)
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Tailwind + CSS variables (light/dark themes)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # Login (username/password -> JWT)
│   │   │   └── register/page.tsx   # Registration (creates sub-user under Cloudcentral)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Sidebar nav, wallet balance, auth guard
│   │   │   └── dashboard/
│   │   │       ├── page.tsx              # Home - Live Summary + stats (paginated, 5/page)
│   │   │       ├── create-campaign/      # 3 IVR type cards -> modal form (API compose)
│   │   │       ├── campaigns/            # Historical cards + Scheduled cards (paginated)
│   │   │       ├── audio-library/        # Upload/play/download audio (paginated, 5/page)
│   │   │       ├── contact-library/      # Upload CSV/TXT/manual, list from API
│   │   │       ├── agent-groups/         # CRUD agent groups with edit/delete
│   │   │       ├── reports/              # Generate & download campaign reports
│   │   │       ├── plans/                # Pricing tiers (Starter/Business/Enterprise)
│   │   │       ├── credits/              # Balance card + transaction history
│   │   │       └── profile/              # Account info + plan details
│   │   └── (admin)/
│   │       └── admin/
│   │           ├── layout.tsx            # Admin sidebar, auth+admin guard
│   │           ├── page.tsx              # Admin dashboard (fast load, bg stats, paginated 5/page)
│   │           ├── users/                # User management (register, edit, credits)
│   │           ├── credits/              # All credit history
│   │           ├── campaigns/            # Campaign analysis for all users
│   │           ├── audio/                # Audio files with download button
│   │           ├── cli/                  # CLI management
│   │           └── reports/              # Reports for all campaigns
│   ├── components/
│   │   ├── theme-provider.tsx      # Dark/light mode via class toggle
│   │   └── theme-toggle.tsx        # Sun/Moon toggle button
│   ├── services/
│   │   ├── api.ts                  # Base fetch helpers (GET, POST, FormData) + auth headers
│   │   ├── admin.service.ts        # Admin API functions
│   │   ├── audio.service.ts        # Prompts, base upload/list
│   │   ├── campaign.service.ts     # Campaign CRUD, compose, pause/stop/resume/retry
│   │   └── user.service.ts         # Profile, stats, credit history
│   ├── store/
│   │   ├── auth-store.ts           # Zustand persisted (login, logout, profile, roles)
│   │   ├── campaign-store.ts       # Local mock campaign/audio/agent data
│   │   └── theme-store.ts          # Zustand persisted (light/dark)
│   └── types/
│       └── index.ts                # All TypeScript interfaces (30+ types)
├── package.json                    # Dependencies + scripts
├── next.config.ts                  # allowedDevOrigins
├── tsconfig.json                   # Compiler options + path aliases
├── eslint.config.mjs               # ESLint config
├── postcss.config.mjs              # Tailwind PostCSS plugin
└── PROJECT_SETTINGS.md             # This file
```

## Key Design Decisions

1. **Fast dashboard loading** - Slow APIs (`statistic/summary`, `totalCalls`, `userStatsSummary`) fire in background after page renders
2. **Fire-and-close campaign creation** - `composeCampaign` fires API call and closes modal immediately without waiting for response
3. **Wallet balance** - Fetched fresh via `refreshProfile()` on every layout mount
4. **Contact Library** - Uses `GET /api/obd/base/{userId}` to list uploaded contacts (USERS role only)
5. **Audio Library** - Download button added alongside play button
6. **Pagination** - 5 items per page on dashboard live summary, admin user stats, audio library
7. **Call Patch payload** - `clis` sent as empty string `""`, each agent group has its own DTMF key
8. **Contact names** - Spaces replaced with underscores automatically
9. **Phone numbers** - 10 digits only, no country code
10. **Theme** - CSS variable-based light/dark, persisted in localStorage as `zero8zero-theme`
11. **Auth** - JWT persisted in localStorage as `zero8zero-auth`, auto-logout on 401

## Running the Project

```bash
cd zero8zero
npm install
npm run dev
```

Open: http://localhost:3000 or http://<server-ip>:3000
