# 🔄 DEVSETU CONNECT — System Flow & Technical Architecture Guide

This document details the complete end-to-end technical system workflows and architectural data flows for **DEVSETU CONNECT**, based strictly on the current production codebase.

---

## 📑 Table of Contents
- [A. Overall Architecture](#a-overall-architecture)
- [B. Astrologer Registration Flow](#b-astrologer-registration-flow)
- [C. Astrologer Login Flow](#c-astrologer-login-flow)
- [D. Forgot PIN Flow](#d-forgot-pin-flow)
- [E. Pooja Browsing Flow](#e-pooja-browsing-flow)
- [F. Booking Creation Flow](#f-booking-creation-flow)
- [G. Payment Flow](#g-payment-flow)
- [H. Admin Payment Verification Flow](#h-admin-payment-verification-flow)
- [I. Booking Confirmation Flow](#i-booking-confirmation-flow)
- [J. Booking Completion Flow](#j-booking-completion-flow)
- [K. Support Ticket Flow](#k-support-ticket-flow)
- [L. Admin Management Flow](#l-admin-management-flow)
- [M. Notification Flow](#m-notification-flow)
- [N. SMTP Email Flow](#n-smtp-email-flow)
- [O. Logout/Session Flow](#o-logoutsession-flow)
- [P. Error/Failed-Operation Flows](#p-errorfailed-operation-flows)

---

## A. Overall Architecture

```mermaid
flowchart TD
    subgraph Client Layer
        A1[React 18/19 SPA Client]
        A2[Capacitor Native Android/iOS Wrapper]
    end

    subgraph API & Backend Layer
        B1[Node.js + Express API Server]
        B2[Vercel Serverless / Node Server]
    end

    subgraph Persistence Layer
        C1[Supabase Cloud PostgreSQL]
        C2[Google Cloud Firestore Fallback]
        C3[Local JSON DB Fallback database.json]
    end

    subgraph Third-Party Services
        D1[Brevo SMTP Relay Port 587]
        D2[Merchant UPI Payment Gateway]
    end

    A1 -->|REST HTTP / HTTPS| B1
    A2 -->|REST HTTP / HTTPS| B1
    B1 -->|Query / Mutation| C1
    B1 -.->|Secondary Fallback| C2
    B1 -.->|Local Development| C3
    B1 -->|Nodemailer SMTP| D1
    A1 -->|Display UPI QR| D2
```

---

## B. Astrologer Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor Astrologer
    participant Client as React Client
    participant API as Express API (/api/auth/register)
    participant DB as Supabase PostgreSQL

    Astrologer->>Client: Fills Signup Form (Name, Email, Mobile, State, City, Exp, 6-digit PIN)
    Client->>API: POST /api/auth/register (payload)
    API->>API: Generates Profile ID (DEV-AST-XXXXX) & Hashes PIN via PBKDF2
    API->>DB: Upserts profile into public.profiles (account_status: approved)
    DB-->>API: Profile Created
    API-->>Client: Returns Profile Object & Credentials
    Client-->>Astrologer: Displays Profile ID & Redirects to Login
```

---

## C. Astrologer Login Flow

```mermaid
sequenceDiagram
    autonumber
    actor Astrologer
    participant Client as React Client
    participant API as Express API (/api/auth/login)
    participant DB as Supabase PostgreSQL

    Astrologer->>Client: Enters Mobile/Email + 6-digit Login PIN
    Client->>API: POST /api/auth/login
    API->>DB: Queries user record by Mobile or Email
    DB-->>API: User Data (stored hash & salt)
    API->>API: Re-hashes input PIN with salt & compares PBKDF2 hashes
    API-->>Client: 200 OK (User Profile & Session token)
    Client->>Client: Stores devsetu_user in localStorage & sets isLoggedIn=true
```

---

## D. Forgot PIN Flow

```mermaid
sequenceDiagram
    autonumber
    actor Astrologer
    participant Client as React Client
    participant Admin as System Administrator
    participant API as Express API (/api/admin/pin-resets)

    Astrologer->>Client: Clicks "Forgot Login PIN"
    Astrologer->>Client: Enters Profile ID & Registered Mobile Number
    Client->>Client: Formats identity reset payload
    Astrologer->>Admin: Transmits Request to Admin Desk (WhatsApp/SMS/Support)
    Admin->>API: GET /api/admin/pin-resets
    API-->>Admin: List of Pending PIN Reset Requests
    Admin->>API: POST /api/admin/reset-pin (Updates PIN hash in DB)
    Admin-->>Astrologer: Communicates New Temporary PIN ([REDACTED])
```

---

## E. Pooja Browsing Flow

1. Client fetches available services from `/api/services`.
2. Services catalog rendered by categories (*Vedic Rituals, Dosh Nivaran, Graha Shanti, Kuber Rituals, Custom Poojas*).
3. Clicking a Pooja card opens package details (Pandit count, items included, duration, starting price, astrologer fee).

---

## F. Booking Creation Flow

```mermaid
flowchart LR
    A[Select Pooja Service & Package] --> B[Input Client Full Name & Yajmaan DOB]
    B --> C[Input Client Mobile & Performing City]
    C --> D[Input Venue Address & Gotra/Notes]
    D --> E[Proceed to Payment Screen]
```

---

## G. Payment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Astrologer
    participant Client as React Client
    participant API as Express API (/api/bookings)
    participant DB as Supabase PostgreSQL

    Client->>Client: Displays Merchant UPI Payment QR Code (290px card)
    Astrologer->>Astrologer: Pays 20% Advance via GPay/PhonePe/Paytm
    Astrologer->>Client: Inputs 12-Digit UPI UTR / Transaction ID
    Client->>API: POST /api/bookings (status: "submitted", UTR details)
    API->>DB: Saves Booking Record
    DB-->>API: Saved
    API-->>Client: Booking Created (Status: "submitted")
```

---

## H. Admin Payment Verification Flow

1. Administrator logs into Control Hub (`#admin`).
2. Navigates to **Payment Verification Console** (`adminTab === "payments"`).
3. Reviews submitted 12-digit UTR against merchant UPI bank statements.
4. Action:
   - **Approve Payment**: Updates status to `approved`.
   - **Reject Payment**: Updates status to `rejected`.

---

## I. Booking Confirmation Flow

1. Admin approval updates booking status from `submitted` to `approved` or `scheduled`.
2. Server triggers automated transaction confirmation event.
3. Nodemailer sends confirmation email via Brevo SMTP Relay.
4. Astrologer sees booking status updated to `approved` in **My Bookings**.

---

## J. Booking Completion Flow

1. Ritual is physically performed by the Pandit / Astrologer at the designated temple or mandap.
2. Astrologer or Admin marks ritual status as `completed`.
3. System updates revenue statistics and logs completion in audit history.

---

## K. Support Ticket Flow

```mermaid
sequenceDiagram
    autonumber
    actor Astrologer
    participant Client as Astrologer App
    participant API as Express API (/api/tickets & /api/chats)
    participant AdminDesk as Admin Control Hub

    Astrologer->>Client: Opens Support Desk (Filtered by User Profile ID)
    Astrologer->>Client: Creates New Support Ticket
    Client->>API: POST /api/tickets (tagged with astrologerProfileId)
    API-->>Client: Ticket Created
    Astrologer->>Client: Sends Live Chat Message
    Client->>API: POST /api/chats (ticketId)
    AdminDesk->>API: GET /api/chats
    AdminDesk-->>API: Admin Replies to Ticket Message
    API-->>Client: Real-Time Chat Message Delivered
```

> **Privacy Control**: Astrologer queries are strictly filtered by `astrologerProfileId`. Astrologer A cannot view Astrologer B's tickets.

---

## L. Admin Management Flow

Administrator manages platform operations via 8 core sections:
1. **Dashboard Home**: 14 key platform metrics and trend charts.
2. **Astrologer Directory**: Account approvals, profile edits, PIN resets, suspensions.
3. **Payment Verification**: Review UTRs and confirm payments.
4. **Booking Operations**: Status management (`submitted`, `approved`, `scheduled`, `completed`, `rejected`, `cancelled`).
5. **Pooja Catalog**: Add new Poojas (EN/HI/MR multi-lingual) & delete obsolete services.
6. **Support Console**: Platform-wide ticket management.
7. **Audit Trails & Reports**: Financial reporting and audit logs.
8. **SMTP Email Controls**: Brevo delivery logs and health checks.

---

## M. Notification Flow

1. System event occurs (e.g., *Booking Created, Payment Verified, Ticket Replied*).
2. Notification object formatted with recipient ID, title, and message text.
3. Saved to `notifications` array / database collection.
4. Client polls `/api/debug/outbox` or `/api/notifications` and displays toast alert.

---

## N. SMTP Email Flow

```mermaid
flowchart TD
    A[System Event Trigger] --> B[Email Controller formatEmail]
    B --> C[Nodemailer Transporter]
    C -->|SMTP Port 587 TLS| D[Brevo SMTP Relay smtp-relay.brevo.com]
    D --> E[Recipient Inbox]
    C --> F[Logged in Outbox / email_logs Store]
```

---

## O. Logout / Session Flow

1. User clicks **"Log Out"**.
2. App executes `localStorage.removeItem("devsetu_user")` or `localStorage.removeItem("devsetu_admin_user")`.
3. Application resets active state variables to `null` and redirects to Login Screen.

---

## P. Error & Failed-Operation Flows

- **Invalid Login PIN**: Returns HTTP 401 `"Invalid Mobile Number or 6-digit Login PIN"`.
- **Missing Required Fields**: Client displays validation banner before form submission.
- **Database Connection Offline**: Automatically falls back to Firestore or `database.json`.
- **SMTP Transport Error**: Email failures logged cleanly in `email_logs` outbox without crashing server process.

---
*DEVSETU CONNECT — System Flow & Technical Architecture Guide v2.0 (Sanitized & Verified)*
