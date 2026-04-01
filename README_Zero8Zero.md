# 🚀 Zero8Zero – Cloud Telephony Platform

Zero8Zero is a modern **cloud telephony SaaS platform** designed for businesses to send **bulk voice calls** and manage **IVR-based communication campaigns** efficiently.

It provides powerful tools for creating, managing, and analyzing voice campaigns including **Simple IVR**, **Input IVR**, and **Call Patch IVR**.

---

## 📌 Features

### 🏠 Landing Page
- Professional SaaS-style homepage
- Clear product overview and features
- Pricing preview and call-to-action

### 🔐 Authentication
- User Registration & Login
- Session management using JWT/local storage
- Secure and validated forms

### 📊 Dashboard
- Overview of campaigns and analytics
- Live campaign monitoring
- Downloadable reports
- Wallet balance display (₹)

---

## 📢 Campaign Management

### 1️⃣ Simple IVR
- Upload or manually enter contacts
- Select approved audio files
- Configure schedule, retries, interval
- One-click campaign initiation

### 2️⃣ Input IVR
- DTMF-based interaction (1–9 inputs)
- Multi-audio flow (welcome, wrong input, no input, etc.)
- Menu wait time & re-prompt configuration

### 3️⃣ Call Patch IVR
- Connect users to live agents
- Agent group routing
- Multi-audio handling (including no-agent scenarios)
- Dynamic agent assignment

---

## 🔊 Audio Library
- Upload audio files
- Approval-based system:
  - Pending
  - Approved
  - Rejected
- Only approved audio can be used in campaigns

---

## 👥 Agent Group Management
- Create and manage agent groups
- Add multiple agents (name + phone)
- Approval workflow
- Used in Call Patch IVR campaigns

---

## 💰 Wallet & Billing
- Wallet balance display in header
- Recharge wallet option
- Usage tracking (future scope)

---

## ⚙️ Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- React Hook Form
- Context API / Zustand

### Architecture
- Modular, scalable SaaS structure
- Feature-based organization
- Reusable components
- Service-based API handling

---

## 🏗️ Project Structure

/app
  /(auth)
    login/
    register/
  /(dashboard)
    dashboard/
    create-campaign/
    audio-library/
    agent-groups/

/components
  /ui
  /forms
  /layout
  /campaign

/modules
  /auth
  /campaign
  /audio
  /agent

/services
  api.ts
  auth.service.ts
  campaign.service.ts

/hooks
/store
/utils
/types

---

## 🔄 Workflow Overview

1. User registers and logs in
2. User lands on dashboard
3. Creates a campaign:
   - Select IVR type
   - Upload contacts
   - Configure audio & settings
4. Initiates campaign
5. Tracks live status & downloads reports

---

## 🧪 Mock Features (Development Phase)
- Mock API integration
- Simulated audio approval
- Dummy authentication (admin/admin)
- Static wallet balance

---

## 🚧 Future Enhancements
- Real-time campaign tracking (WebSockets)
- Payment gateway integration
- Role-based access (Admin/User)
- Advanced analytics dashboard
- Voice API integration (Twilio/Exotel-like)
- AI-based call optimization

---

## 📦 Installation & Setup

```bash
git clone https://github.com/your-username/zero8zero.git
cd zero8zero
npm install
npm run dev
```

Open: http://localhost:3005

---

## Dev Settings

| Setting | Value |
|---------|-------|
| Dev Port | **3000** |
| Hostname | **0.0.0.0** (accessible via IP) |
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| State | Zustand |
| Forms | React Hook Form |
| Icons | Lucide React |

> **Note:** Dev server always runs on port 3005. This is configured in `package.json` scripts.

---

## 🔑 Default Credentials (Demo)

Username: admin  
Password: admin  

---

## 🎯 Goal

To build a scalable, production-ready cloud telephony platform with modular architecture.

---

## 👨‍💻 Author

Goutham JR  

---

## 📄 License

This project is for educational and development purposes.
