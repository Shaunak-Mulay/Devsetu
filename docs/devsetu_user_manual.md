# 📖 DEVSETU CONNECT — Official User Manual & Operational Documentation

Welcome to the official **DEVSETU CONNECT** User Manual. This document provides a comprehensive operational guide for both **Astrologer Partners** and **System Administrators**, based strictly on the current production codebase.

---

## 📑 Table of Contents
1. [System Architecture & Hosting](#1-system-architecture--hosting)
2. [User Roles & Access Control](#2-user-roles--access-control)
3. [Authentication & Registration Workflows](#3-authentication--registration-workflows)
   - [Astrologer Registration & Account Provisioning](#astrologer-registration--account-provisioning)
   - [Astrologer Login (Mobile + 6-Digit PIN)](#astrologer-login-mobile--6-digit-pin)
   - [Admin-Assisted Forgot PIN Workflow](#admin-assisted-forgot-pin-workflow)
   - [System Administrator Login](#system-administrator-login)
4. [Astrologer Partner Portal Module](#4-astrologer-partner-portal-module)
   - [Pooja Catalog Browsing](#pooja-catalog-browsing)
   - [Booking Creation & Client Details](#booking-creation--client-details)
   - [UPI Payment & UTR Submission](#upi-payment--utr-submission)
   - [My Bookings & Status Tracking](#my-bookings--status-tracking)
   - [Privacy-Isolated Support Desk](#privacy-isolated-support-desk)
5. [System Administrator Control Hub Module](#5-system-administrator-control-hub-module)
   - [Dashboard Metrics & Analytics](#dashboard-metrics--analytics)
   - [Astrologer Directory & Account Validation](#astrologer-directory--account-validation)
   - [Booking Operations & Status Management](#booking-operations--status-management)
   - [Payment Verification Console](#payment-verification-console)
   - [Pooja Catalog & Pricing Management](#pooja-catalog--pricing-management)
   - [Support Console & Chat Desk](#support-console--chat-desk)
   - [Audit Logs, Reports & SMTP Controls](#audit-logs-reports--smtp-controls)
6. [Security & Data Privacy Controls](#6-security--data-privacy-controls)

---

## 1. System Architecture & Hosting

**DEVSETU CONNECT** is built on a modern decoupled architecture:

- **Frontend Framework**: React 18 / 19 SPA powered by Vite 8 with Vanilla CSS design tokens.
- **Mobile Runtime**: Hybrid native packaging via Capacitor 8 (`@capacitor/android`, `@capacitor/ios`).
- **Backend Service**: Node.js with Express (`server/index.js`). Configured for Vercel Serverless environment or standalone Node.js server.
- **Database Layer**:
  - **Primary**: Supabase Cloud PostgreSQL & Storage (`@supabase/supabase-js`).
  - **Fallback 1**: Google Cloud Firestore (Firebase Admin SDK).
  - **Fallback 2**: Local JSON Database (`server/database.json`) for standalone execution.
- **Email Notification Engine**: Nodemailer via Brevo SMTP Relay (`smtp-relay.brevo.com:587`).
- **Production Endpoint**: `https://devsetu-eta.vercel.app`
- **Source Repository**: `Shaunak-Mulay/Devsetu`

---

## 2. User Roles & Access Control

The platform features two distinct user views:

| Feature | Astrologer Partner | System Administrator |
| :--- | :--- | :--- |
| **Interface** | Mobile App View (`#mobile`) | SaaS Control Hub (`#admin`) |
| **Authentication** | Mobile / Email + 6-Digit PIN | Admin Email + Password |
| **Data Scope** | **Strictly Isolated** (Own Data Only) | **Platform-Wide** (Full System Visibility) |
| **Pooja Marketplace** | Browse & Book Poojas | Create, Edit, & Delete Services |
| **Bookings View** | View own booking history & status | Manage & Update ALL booking statuses |
| **Payments** | Submit 12-digit UPI UTRs | Verify UTRs, Approve/Reject payments |
| **Support Desk** | View & chat ONLY in own tickets | View & respond to ALL astrologer tickets |

---

## 3. Authentication & Registration Workflows

### Astrologer Registration & Account Provisioning
1. Astrologers click **"Sign Up"** on the login screen.
2. Enter Full Name, Email Address, Mobile Number, State (*default: Maharashtra*), District, City (*default: Pune*), Experience (*e.g., 5 Years*), Specialization, and a **6-digit Login PIN**.
3. Upon submission, the backend auto-generates a unique Profile ID (e.g., `DEV-AST-XXXXX`) and auto-provisions the user into the database with status `approved`.
4. The newly created Profile ID is displayed to the astrologer for future reference.

### Astrologer Login (Mobile + 6-Digit PIN)
1. Select **"Mobile Login"** or **"Email Login"**.
2. Enter registered Mobile Number / Email and 6-digit Login PIN.
3. The server hashes the submitted PIN using PBKDF2 cryptography (`crypto.pbkdf2Sync`) and compares it with stored credentials.
4. On success, an active session is established.

### Admin-Assisted Forgot PIN Workflow
1. Astrologer clicks **"Forgot Login PIN"** on the login screen.
2. Astrologer inputs Profile ID and registered Mobile Number.
3. The system generates a formatted reset request containing identity details.
4. The request is transmitted to the System Administrator (via WhatsApp/SMS/Support Desk).
5. The Administrator verifies identity in the Admin Control Hub (`/api/admin/pin-resets`) and manually resets or issues a temporary PIN (`[REDACTED]`).

### System Administrator Login
1. Switch to Admin Login View (`#admin`).
2. Enter Admin Email (`devsetuconnect@gmail.com`) and Admin Password (`[REDACTED]`).
3. Upon verification, the Administrator is granted access to the Control Hub.

---

## 4. Astrologer Partner Portal Module

### Pooja Catalog Browsing
- Browse available rituals across categories: *Vedic Rituals, Dosh Nivaran, Graha Shanti, Kuber Rituals, Custom Special Poojas*.
- View package breakdown: Pandit count, duration, items included, starting price, and astrologer commission fee.

### Booking Creation & Client Details
To book a ritual, the astrologer inputs client details:
- **Client Full Name** & **Yajmaan Date of Birth**
- **Client Mobile Number**
- **Pooja Place / Venue Address** (*e.g., Trimbakeshwar Mandap, Nashik*)
- **Performing City** & **Preferred Date**
- **Gotra & Special Instructions**

### UPI Payment & UTR Submission
- **Payment QR Display**: Right above the transaction input, an enlarged high-contrast **Payment QR Code** (`290px`) is displayed.
- **20% Advance Payment**: Astrologer pays advance ritual booking fee via any UPI app (GPay, PhonePe, Paytm, BHIM).
- **12-Digit UTR Submission**: Enter the **12-digit UPI UTR / Transaction Reference Number** and click **"Submit Booking"**.

### My Bookings & Status Tracking
Astrologers monitor their bookings under `My Bookings`. Valid booking statuses include:
- `submitted`: Booking created with UTR submitted; awaiting Admin payment verification.
- `approved`: Admin verified payment UTR and approved booking.
- `scheduled`: Booking scheduled for ritual execution.
- `completed`: Ritual completed by Pandit/Astrologer.
- `rejected`: Admin rejected invalid UTR or unconfirmed payment.
- `cancelled`: Booking cancelled.

### Privacy-Isolated Support Desk
- **Strict Isolation**: Astrologers see **ONLY** support tickets that belong to their own account (`astrologerProfileId`, `email`, `phone`, `name`).
- Astrologers cannot see other astrologers' support tickets or chat messages.
- Create new tickets (*Booking Issues, Payment Verification, PIN Reset, General Queries*).
- Real-time 2-way chat with Administration with file attachment support.

---

## 5. System Administrator Control Hub Module

### Dashboard Metrics & Analytics
Monitors 14 real-time platform metrics:
- Total Astrologers & Active Accounts
- Pending Approvals & Account Statuses
- Total Revenue Generated (10% Platform Fee calculation)
- Total Bookings, Active Bookings, & Completed Rituals
- Open Support Tickets & Open Reset Requests

### Astrologer Directory & Account Validation
- Complete directory listing of all registered astrologers.
- Search by name, mobile, email, or Profile ID.
- Verify partner credentials, update profiles, or suspend accounts.

### Booking Operations & Status Management
- Platform-wide view of all ritual bookings across India.
- Filter by status: `submitted`, `approved`, `scheduled`, `completed`, `rejected`, `cancelled`.
- Update booking status and assign venue details.

### Payment Verification Console
- Review 12-digit UTR numbers submitted by astrologers.
- Compare submitted UTRs with merchant UPI bank deposits.
- Action: **Approve Payment** (transitions booking to `approved`) or **Reject Payment** (transitions to `rejected`).

### Pooja Catalog & Pricing Management
- **Add New Pooja Service**: Multi-lingual title support (English, Hindi, Marathi), starting price, description, duration, and astrologer fee structure.
- **Delete Service**: Remove obsolete rituals from the active marketplace.

### Support Console & Chat Desk
- View all support tickets submitted across the platform.
- Engage in 2-way live chat with astrologers to resolve queries.

### Audit Logs, Reports & SMTP Controls
- **Audit Trails**: Security and state modification logging.
- **Reports Center**: Downloadable financial and booking performance metrics.
- **SMTP Email Controls**: Monitor Brevo email delivery health, view outbox logs, and send test emails.

---

## 6. Security & Data Privacy Controls

- **Secret Handling**: Production passwords, API keys, PINs, and tokens are stored in environment variables (`.env`) and are **never exposed** in public documentation (`[REDACTED]`).
- **Data Scoping**: Astrologer data is strictly partitioned by profile identifier. Cross-account data leakage is blocked at the UI and controller layers.
- **Cryptographic Hashing**: User PINs and passwords are stored as salted PBKDF2 / bcrypt hashes.

---
*DEVSETU CONNECT — User Manual v2.0 (Sanitized & Verified)*
