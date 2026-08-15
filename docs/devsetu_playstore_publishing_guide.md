# DEVSETU CONNECT — Google Play Store Publishing & Release Guide

Official step-by-step guide and submission details for publishing **DEVSETU CONNECT** on the Google Play Console.

---

## 1. APP IDENTITY & METADATA

- **App Name:** DEVSETU CONNECT
- **Short Description (80 chars max):** Digital platform for Vedic Astrologers to manage Pooja services & bookings.
- **Full Description:**
  DEVSETU CONNECT is a digital platform designed for verified Vedic astrologers and spiritual-service partners. Easily manage sacred Pooja services, track ritual bookings, manage Yajmaan/client details, process advance payment UTRs, and communicate directly with DEVSETU Administration.
- **Application ID / Package Name:** `com.devsetu.connect`
- **Default Language:** English (en-US)
- **App Category:** Lifestyle / Productivity / Spiritual Services

---

## 2. MANDATORY PLAY CONSOLE URLS

- **Privacy Policy URL:** `https://devsetu-eta.vercel.app/#privacy`
- **Account Deletion / Data Safety URL:** `https://devsetu-eta.vercel.app/#delete-account`
- **Support Email:** `devsetuconnect@gmail.com`
- **Support Hotline / Phone:** `+91 9763147067`
- **Official Website:** `https://devsetu-eta.vercel.app`

---

## 3. PLAY CONSOLE COMPLIANCE & DECLARATIONS

### Data Safety Section
- **Data Collected:**
  - **Personal Info:** Name, Email address, Phone number (for partner registration & authentication).
  - **Location Data:** City & Performing Venue (voluntarily provided for ritual logistics).
- **Data Security:**
  - Encrypted in transit via HTTPS/TLS.
  - Hashed authentication credentials (PBKDF2 salted PIN).
- **Data Deletion:**
  - Users can delete their account directly within the app (Profile ➔ Delete Account) or online at `https://devsetu-eta.vercel.app/#delete-account`.

### Target Audience & Content Rating
- **Target Age Group:** 18 and over (Adult partners)
- **Content Rating Questionnaire:** Fill out standard rating questionnaire (IARC). Rating will be **3+ / Everyone**.
- **Financial Services & Financial Disclaimers:**
  - DEVSETU CONNECT facilitates ritual booking advance payments via standard UPI QR codes.
  - The app does **NOT** collect, store, or process raw banking passwords, credit/debit card numbers, or UPI PINs.

---

## 4. ANDROID BUILD INSTRUCTIONS (APK / AAB)

To generate the production release bundle (`.aab`) for Google Play Console:

### Step 1: Build Latest Web Assets & Sync Capacitor
```bash
npm run build
npx cap sync android
```

### Step 2: Open Project in Android Studio
```bash
npx cap open android
```

### Step 3: Generate Signed App Bundle (.aab)
1. In Android Studio, go to **Build** ➔ **Generate Signed Bundle / APK...**
2. Select **Android App Bundle (.aab)** and click **Next**.
3. Create or choose your **Key store path** (Keep your `.keystore` file and passwords safe!).
4. Select **release** build variant and click **Create**.
5. Locate your generated `.aab` file at `android/app/release/app-release.aab`.

---

## 5. GOOGLE PLAY CONSOLE SUBMISSION STEPS

1. Log into your [Google Play Console](https://play.google.com/console).
2. Click **Create App** ➔ Enter App Name: **DEVSETU CONNECT**, Language: **English**, App Type: **App**, Free.
3. Complete **App Content** tasks (Privacy Policy, App Access, Target Audience, Data Safety, Government Apps).
4. Fill out **Store Listing** (Short description, Full description, App icon 512x512, Feature graphic 1024x500, Phone screenshots).
5. Go to **Testing ➔ Production** ➔ Create new release ➔ Upload `app-release.aab`.
6. Review release and click **Start rollout to Production**.

---

*DEVSETU CONNECT Release v1.0.0 — Ready for Play Store Submission!*
