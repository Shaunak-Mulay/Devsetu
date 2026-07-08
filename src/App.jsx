import React, { useState, useEffect, useMemo } from "react";
import {
  Home,
  BookOpen,
  Calendar,
  MessageSquare,
  User,
  Sparkles,
  Compass,
  ArrowLeft,
  Check,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  LogOut,
  Send,
  Plus,
  Moon,
  Sun,
  Globe,
  Settings,
  Bell,
  Search,
  Filter,
  Users,
  CreditCard,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  HelpCircle,
  Phone,
  Mail,
  Image as ImageIcon
} from "lucide-react";
import { servicesData, translations, sampleScreenshots, mockAstrologers } from "./data";
import { paymentService } from "./services/PaymentService";
const getApiBase = () => {
  const saved = localStorage.getItem("devsetu_api_base");
  if (saved) return saved;
  return "https://devsetu-4wav.onrender.com";
};
const API_BASE = getApiBase();


const localTranslations = {
  en: {
    splashTagline: "Connecting Astrology with Sacred Services",
    splashAwakening: "Awakening",
    loginWelcome: "Welcome Back",
    loginSubtitle: "Connect with spiritual wisdom.",
    loginEmail: "Email Address",
    loginMobile: "Mobile Number",
    loginPassword: "Password",
    loginRemember: "Remember me",
    loginForgot: "Forgot Password?",
    loginSignIn: "Sign In",
    loginSignUpPrompt: "Don't have an account? ",
    loginSignUp: "Sign Up",
    adminSecureLogin: "Secure Login",
    adminSubtitle: "Enter your credentials to access the admin dashboard.",
    adminUserLabel: "Admin ID or Email",
    adminPassLabel: "Password",
    adminAuthBtn: "Authenticate",
    adminSecureConn: "Secure Connection",
    adminAuthOnly: "Authorized personnel only.",
    adminContactSupport: "Contact Support",
    accessibilityToggle: "Accessibility Mode (Large Text & High Contrast)",
    accessibilityDesc: "Enable high-contrast borders and scaled layouts.",
  },
  hi: {
    splashTagline: "ज्योतिष को आध्यात्मिक सेवाओं से जोड़ना",
    splashAwakening: "जागृति",
    loginWelcome: "आपका स्वागत है",
    loginSubtitle: "आध्यात्मिक ज्ञान से जुड़ें।",
    loginEmail: "ईमेल पता",
    loginMobile: "मोबाइल नंबर",
    loginPassword: "पासवर्ड",
    loginRemember: "मुझे याद रखें",
    loginForgot: "पासवर्ड भूल गए?",
    loginSignIn: "साइन इन करें",
    loginSignUpPrompt: "खाता नहीं है? ",
    loginSignUp: "साइन अप करें",
    adminSecureLogin: "सुरक्षित लॉगिन",
    adminSubtitle: "एडमिन डैशबोर्ड तक पहुंचने के लिए क्रेडेंशियल दर्ज करें।",
    adminUserLabel: "एडमिन आईडी या ईमेल",
    adminPassLabel: "पासवर्ड",
    adminAuthBtn: "प्रमाणित करें",
    adminSecureConn: "सुरक्षित कनेक्शन",
    adminAuthOnly: "केवल अधिकृत कर्मियों के लिए।",
    adminContactSupport: "सहायता टीम से संपर्क करें",
    accessibilityToggle: "एक्सेसिबिलिटी मोड (बड़ा टेक्स्ट और उच्च कंट्रास्ट)",
    accessibilityDesc: "उच्च-कंट्रास्ट बॉर्डर और बढ़े हुए लेआउट सक्रिय करें।",
  },
  mr: {
    splashTagline: "ज्योतिष आणि आध्यात्मिक सेवांचे मिलन",
    splashAwakening: "जागृती",
    loginWelcome: "स्वागत आहे",
    loginSubtitle: "आध्यात्मिक ज्ञानाशी जोडा.",
    loginEmail: "ईमेल पत्ता",
    loginMobile: "मोबाईल नंबर",
    loginPassword: "पासवर्ड",
    loginRemember: "लक्षात ठेवा",
    loginForgot: "पासवर्ड विसरलात?",
    loginSignIn: "साइन इन करा",
    loginSignUpPrompt: "खाते नाही? ",
    loginSignUp: "साइन अप करा",
    adminSecureLogin: "सुरक्षित लॉगिन",
    adminSubtitle: "एडमिन डॅशबोर्डवर जाण्यासाठी क्रेडेंशियल प्रविष्ट करा.",
    adminUserLabel: "एडमिन आयडी किंवा ईमेल",
    adminPassLabel: "पासवर्ड",
    adminAuthBtn: "प्रमाणित करा",
    adminSecureConn: "सुरक्षित कनेक्शन",
    adminAuthOnly: "केवळ अधिकृत व्यक्तींसाठी.",
    adminContactSupport: "मदत केंद्राशी संपर्क साधा",
    accessibilityToggle: "ॲक्सेसिबिलिटी मोड (मोठा मजकूर आणि उच्च कंट्रास्ट)",
    accessibilityDesc: "उच्च-कंट्रास्ट बॉर्डर आणि वाढवलेले लेआउट सक्रिय करा.",
  }
};

// Reusable PaymentQRCode Component
// Production Note:
// This placeholder QR is only for repository safety.
// The production QR may later be loaded dynamically
// from the backend without changing the UI.
function PaymentQRCode({ language = "en" }) {
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const qrTranslations = {
    en: {
      loading: "Loading QR...",
      unavailable: "Payment QR is currently unavailable.",
      contactAdmin: "Please contact DEVSETU Administrator.",
      configuredBy: "Payment QR will be configured by DEVSETU Administrator.",
      afterPay: "After completing payment, click \"Payment Completed\".",
      remainPending: "Your booking will remain Pending until the administrator manually verifies payment."
    },
    hi: {
      loading: "क्यूआर लोड हो रहा है...",
      unavailable: "भुगतान क्यूआर वर्तमान में अनुपलब्ध है।",
      contactAdmin: "कृपया देवसेतु प्रशासक से संपर्क करें।",
      configuredBy: "भुगतान क्यूआर देवसेतु प्रशासक द्वारा कॉन्फ़िगर किया जाएगा।",
      afterPay: "भुगतान पूरा करने के बाद, \"भुगतान पूर्ण\" पर क्लिक करें।",
      remainPending: "प्रशासक द्वारा भुगतान को मैन्युअल रूप से सत्यापित करने तक आपकी बुकिंग लंबित रहेगी।"
    },
    mr: {
      loading: "क्यूआर लोड होत आहे...",
      unavailable: "पेमेंट क्यूआर सध्या उपलब्ध नाही.",
      contactAdmin: "कृपया देवसेतू प्रशासकाशी संपर्क साधा.",
      configuredBy: "पेमेंट क्यूआर देवसेतू प्रशासकाद्वारे कॉन्फिगर केले जाईल.",
      afterPay: "पेमेंट पूर्ण केल्यानंतर, \"पेमेंट पूर्ण झाले\" वर क्लिक करा.",
      remainPending: "प्रशासकाद्वारे पेमेंटची मॅन्युअली पडताळणी करेपर्यंत तुमचे बुकिंग प्रलंबित राहील."
    }
  };

  const qrt = qrTranslations[language] || qrTranslations.en;

  useEffect(() => {
    let active = true;
    async function loadQR() {
      try {
        const url = await paymentService.getPaymentQRCodeUrl();
        if (active) {
          setQrUrl(url);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load QR code URL:", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    }
    loadQR();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "140px",
        width: "140px",
        margin: "0 auto",
        borderRadius: "12px",
        border: "1px dashed var(--border-color)",
        backgroundColor: "rgba(212, 175, 55, 0.05)"
      }}>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>{qrt.loading}</div>
      </div>
    );
  }

  if (error || !qrUrl) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        margin: "12px auto",
        borderRadius: "12px",
        border: "2px solid #c0392b",
        backgroundColor: "rgba(192, 57, 43, 0.05)",
        color: "#c0392b",
        textAlign: "center",
        maxWidth: "280px"
      }}>
        <XCircle size={28} style={{ marginBottom: "8px" }} />
        <span style={{ fontSize: "11px", fontWeight: "700", lineHeight: "1.4" }}>
          {qrt.unavailable}
        </span>
        <span style={{ fontSize: "9px", marginTop: "4px", fontWeight: "500" }}>
          {qrt.contactAdmin}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "8px" }}>
      <div style={{
        width: "140px",
        height: "140px",
        margin: "0 auto",
        border: "2px solid var(--temple-gold)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden"
      }}>
        <img 
          src={qrUrl} 
          onError={() => setError(true)}
          alt="Payment QR Code" 
          style={{ width: "120px", height: "120px", objectFit: "contain", borderRadius: "8px" }}
        />
      </div>
      <p style={{ 
        fontSize: "10px", 
        color: "var(--text-muted)", 
        textAlign: "center", 
        lineHeight: "1.4", 
        margin: "4px auto 0",
        maxWidth: "280px",
        backgroundColor: "rgba(212, 175, 55, 0.05)",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid rgba(212, 175, 55, 0.15)",
        fontWeight: "500"
      }}>
        {qrt.configuredBy}
        <br /><br />
        {qrt.afterPay}
        <br /><br />
        {qrt.remainPending}
      </p>
    </div>
  );
}

export default function App() {
  // Global Shared State
  const [theme, setTheme] = useState(() => localStorage.getItem("devsetu_theme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("devsetu_lang") || "en");
  const [activeRoleSelection, setActiveRoleSelection] = useState(() => {
    if (localStorage.getItem("devsetu_user")) return "astrologer";
    if (localStorage.getItem("devsetu_admin_user")) return "admin";
    return null;
  }); // 'astrologer', 'admin', or null

  // Current User (Astrologer) Profile
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("devsetu_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Accessibility & Missing Page States
  const [isSplash, setIsSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("devsetu_user"));
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("devsetu_admin_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => !!localStorage.getItem("devsetu_admin_user"));
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [profileAccordion, setProfileAccordion] = useState("personal");

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(0); // 0 = off, 1 = enter email, 2 = enter OTP, 3 = enter new password, 4 = success
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState(null);
  const [forgotRemainingAttempts, setForgotRemainingAttempts] = useState(5);

  // Astrologer Forgot PIN states
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const [forgotPinProfileId, setForgotPinProfileId] = useState("");
  const [forgotPinMobile, setForgotPinMobile] = useState("");
  const [forgotPinResponse, setForgotPinResponse] = useState(null);
  const [forgotPinError, setForgotPinError] = useState(null);
  const [forgotPinSubmitting, setForgotPinSubmitting] = useState(false);

  // Admin PIN Reset Requests & Temp PIN States
  const [pinResetRequests, setPinResetRequests] = useState([]);
  const [showTempPinModal, setShowTempPinModal] = useState(false);
  const [tempPinValue, setTempPinValue] = useState("");

  // Astrologer Side Menu Drawer State
  const [showAstroMenu, setShowAstroMenu] = useState(false);

  // Admin User Profile Modal States
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const [modalActiveTab, setModalActiveTab] = useState("personal");

  // Admin Edit User Modal States
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Admin Directory table state
  const [adminAstroSearch, setAdminAstroSearch] = useState("");
  const [adminAstroFilterStatus, setAdminAstroFilterStatus] = useState("all");
  const [adminAstroSortKey, setAdminAstroSortKey] = useState("name");

  // Admin Payment & PIN Reset sub-tab state
  const [paymentSubTab, setPaymentSubTab] = useState("payments");

  // Admin audit logs state
  const [auditLogs, setAuditLogs] = useState([]);

  // Admin SMTP & Email Logs state
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailLogSearch, setEmailLogSearch] = useState("");
  const [emailLogStatusFilter, setEmailLogStatusFilter] = useState("All");
  const [emailLogTemplateFilter, setEmailLogTemplateFilter] = useState("All");
  const [smtpHealth, setSmtpHealth] = useState(null);
  const [smtpSettings, setSmtpSettings] = useState(null);
  const [testEmailTarget, setTestEmailTarget] = useState("");
  const [isCheckingSmtpHealth, setIsCheckingSmtpHealth] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [resendingLogId, setResendingLogId] = useState(null);

  // Login OTP States (for pending account auto-approval verification)
  const [showLoginOtp, setShowLoginOtp] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginOtpError, setLoginOtpError] = useState(null);
  const [loginOtpEmail, setLoginOtpEmail] = useState("");

  // Play Store Release Readiness Modal States
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Astrologer Change Password States
  const [showSecurity, setShowSecurity] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityError, setSecurityError] = useState(null);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  // Admin Change Password States
  const [showAdminSecurityModal, setShowAdminSecurityModal] = useState(false);
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminSecurityError, setAdminSecurityError] = useState(null);

  // Login Form States
  const [loginFormType, setLoginFormType] = useState("mobile"); // email or mobile
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  // Signup Form States
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredProfileId, setRegisteredProfileId] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupState, setSignupState] = useState("Maharashtra");
  const [signupCity, setSignupCity] = useState("Pune");
  const [signupExperience, setSignupExperience] = useState("5 Years");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupDistrict, setSignupDistrict] = useState("");
  const [signupSpecialization, setSignupSpecialization] = useState("Vedic Pooja");

  // Admin Login States
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminShowPassword, setAdminShowPassword] = useState(false);
  const [adminLoginFormType, setAdminLoginFormType] = useState("email"); // email or mobile

  // Auto Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Tab Management
  const [astroTab, setAstroTab] = useState("home"); // home, services, bookings, support, profile
  const [adminTab, setAdminTab] = useState("home"); // home, astrologers, payments, bookings, support
  const [simulatorView, setSimulatorView] = useState(() => window.location.hash === "#admin" ? "admin" : "mobile");

  useEffect(() => {
    const handleHashChange = () => {
      setSimulatorView(window.location.hash === "#admin" ? "admin" : "mobile");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Navigation stack in Mobile App
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingFlow, setIsBookingFlow] = useState(null); // stores active package
  const [trackingBookingId, setTrackingBookingId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  // Active bookings list
  const [bookings, setBookings] = useState([]);

  // State for incoming real-time mock SMS/Email toast alerts
  const [activeToast, setActiveToast] = useState(null);

  // Poll mock outbox messages for real-time notification toasts
  useEffect(() => {
    let initialized = false;
    let lastMsgId = null;

    const pollOutbox = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/debug/outbox`);
        if (!res.ok) return;
        const messages = await res.json();
        if (messages && messages.length > 0) {
          const newest = messages[0];
          
          if (!initialized) {
            // First run: just capture the latest message ID without toasting
            lastMsgId = newest.id;
            initialized = true;
          } else if (newest.id !== lastMsgId) {
            lastMsgId = newest.id;
            
            // Trigger toast
            setActiveToast({
              id: newest.id,
              type: newest.type,
              recipient: newest.recipient,
              subject: newest.subject,
              message: newest.message,
              timestamp: newest.timestamp
            });
          }
        } else {
          initialized = true;
        }
      } catch (err) {
        console.warn("Failed to poll mock outbox:", err);
      }
    };

    pollOutbox();
    const interval = setInterval(pollOutbox, 3000);
    return () => clearInterval(interval);
  }, []);

  // Active Chats (Shared between Mobile & Admin)
  const [chats, setChats] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // Form Inputs - Mobile App
  const [bookingForm, setBookingForm] = useState({
    clientName: "",
    clientMobile: "",
    city: "Varanasi",
    preferredDate: "",
    notes: ""
  });

  // Payment Inputs - Mobile App
  const [paymentTxnId, setPaymentTxnId] = useState("");
  const [selectedMockScreenshot, setSelectedMockScreenshot] = useState("gpay");
  const [uploadedScreenshot, setUploadedScreenshot] = useState(null);

  // Chat Inputs
  const [astroChatMsg, setAstroChatMsg] = useState("");
  const [astroChatCategory, setAstroChatCategory] = useState("General Queries");
  const [attachedFile, setAttachedFile] = useState(null); // mock file attachment state

  // Support Ticket States
  const [tickets, setTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState("TK-9402");
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ category: "General Queries", subject: "" });

  // Astrologer Bookings Filter Tab State
  const [astroBookingFilter, setAstroBookingFilter] = useState("all");

  const [adminChatMsg, setAdminChatMsg] = useState("");
  const [adminTyping, setAdminTyping] = useState(false);
  const [selectedAdminAstrologer, setSelectedAdminAstrologer] = useState("ASTRO01");
  const [adminBookingSearch, setAdminBookingSearch] = useState("");
  const [adminBookingFilter, setAdminBookingFilter] = useState("all");
  const [broadcastText, setBroadcastText] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Admin Notification Broadcast & History States
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastTargetRole, setBroadcastTargetRole] = useState("astrologer");
  const [broadcastType, setBroadcastType] = useState("admin");
  const [adminHistory, setAdminHistory] = useState([]);
  const [adminHistorySearch, setAdminHistorySearch] = useState("");
  const [adminHistoryFilterStatus, setAdminHistoryFilterStatus] = useState("all");
  const [adminHistoryFilterChannel, setAdminHistoryFilterChannel] = useState("all");

  // Master Control Panel Action States
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionModalUser, setRejectionModalUser] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({ title: "", message: "", onConfirm: () => {} });
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentViewerFile, setDocumentViewerFile] = useState(null);
  const [showAssignAstroModal, setShowAssignAstroModal] = useState(false);
  const [assignAstroBookingId, setAssignAstroBookingId] = useState("");
  const [assignAstroSelectedId, setAssignAstroSelectedId] = useState("");
  const [showCustomNotificationModal, setShowCustomNotificationModal] = useState(false);
  const [customNotificationUser, setCustomNotificationUser] = useState(null);
  const [customNotificationTitle, setCustomNotificationTitle] = useState("");
  const [customNotificationBody, setCustomNotificationBody] = useState("");
  const [customNotificationChannel, setCustomNotificationChannel] = useState("push");
  const [auditLogSearch, setAuditLogSearch] = useState("");
  const [auditLogActionFilter, setAuditLogActionFilter] = useState("all");
  const [auditLogPage, setAuditLogPage] = useState(1);
  const [bookingOperationPage, setBookingOperationPage] = useState(1);
  const [astroDirectoryPage, setAstroDirectoryPage] = useState(1);
  const [reportsAstroFilter, setReportsAstroFilter] = useState("all");
  const [reportsDateRange, setReportsDateRange] = useState("all");
  
  // Notification Preferences States (Astrologer settings)
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefPush, setPrefPush] = useState(true);
  const [prefSms, setPrefSms] = useState(false);
  const [prefBooking, setPrefBooking] = useState(true);
  const [prefMembership, setPrefMembership] = useState(true);
  const [prefChat, setPrefChat] = useState(true);

  // Push Permission Dialog State
  const [showPushPermissionModal, setShowPushPermissionModal] = useState(false);

  // Polling useEffect (5-second interval) to fetch from backend and sync with fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRes = await fetch(`${API_BASE}/api/bookings`);
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data);
          localStorage.setItem("devsetu_bookings", JSON.stringify(data));
        } else {
          throw new Error("HTTP error");
        }
      } catch (err) {
        console.warn("Using local bookings fallback.");
        const saved = localStorage.getItem("devsetu_bookings");
        if (saved) setBookings(JSON.parse(saved));
      }

      try {
        const ticketsRes = await fetch(`${API_BASE}/api/tickets`);
        if (ticketsRes.ok) {
          const data = await ticketsRes.json();
          setTickets(data);
          localStorage.setItem("devsetu_tickets", JSON.stringify(data));
        } else {
          throw new Error("HTTP error");
        }
      } catch (err) {
        console.warn("Using local tickets fallback.");
        const saved = localStorage.getItem("devsetu_tickets");
        if (saved) setTickets(JSON.parse(saved));
      }

      try {
        const chatsRes = await fetch(`${API_BASE}/api/chats`);
        if (chatsRes.ok) {
          const data = await chatsRes.json();
          setChats(data);
          localStorage.setItem("devsetu_chats", JSON.stringify(data));
        } else {
          throw new Error("HTTP error");
        }
      } catch (err) {
        console.warn("Using local chats fallback.");
        const saved = localStorage.getItem("devsetu_chats");
        if (saved) setChats(JSON.parse(saved));
      }

      try {
        const notifEmail = currentUser?.email || currentUser?.phone || currentUser?.mobile || "";
        const notifUrl = notifEmail ? `${API_BASE}/api/notifications?email=${encodeURIComponent(notifEmail)}` : `${API_BASE}/api/notifications`;
        const notificationsRes = await fetch(notifUrl);
        if (notificationsRes.ok) {
          const data = await notificationsRes.json();
          setNotifications(data);
        } else {
          throw new Error("HTTP error");
        }
      } catch (err) {
        console.warn("Using local notifications fallback.");
      }

      if (adminUser) {
        try {
          const historyRes = await fetch(`${API_BASE}/api/notifications/admin-history`);
          if (historyRes.ok) {
            setAdminHistory(await historyRes.json());
          }
        } catch (e) {
          console.warn("Failed to check admin notifications history");
        }
        try {
          const pinResetsRes = await fetch(`${API_BASE}/api/admin/pin-resets`);
          if (pinResetsRes.ok) {
            setPinResetRequests(await pinResetsRes.json());
          }
        } catch (e) {
          console.warn("Failed to check admin PIN reset requests");
        }
        try {
          const auditRes = await fetch(`${API_BASE}/api/admin/audit-logs`);
          if (auditRes.ok) {
            setAuditLogs(await auditRes.json());
          }
        } catch (e) {
          console.warn("Failed to fetch admin audit logs");
        }
        try {
          const emailLogsRes = await fetch(`${API_BASE}/api/admin/email-logs`);
          if (emailLogsRes.ok) {
            setEmailLogs(await emailLogsRes.json());
          }
        } catch (e) {
          console.warn("Failed to fetch email logs");
        }
        try {
          const smtpSetRes = await fetch(`${API_BASE}/api/admin/smtp/settings`);
          if (smtpSetRes.ok) {
            setSmtpSettings(await smtpSetRes.json());
          }
        } catch (e) {
          console.warn("Failed to fetch SMTP settings");
        }
        try {
          const smtpHealthRes = await fetch(`${API_BASE}/api/admin/smtp/health`);
          if (smtpHealthRes.ok) {
            setSmtpHealth(await smtpHealthRes.json());
          }
        } catch (e) {
          console.warn("Failed to fetch SMTP health status");
        }
      }

      if (currentUser && currentUser.email) {
        try {
          const sessionRes = await fetch(`${API_BASE}/api/auth/session-status?email=${encodeURIComponent(currentUser.email)}&sessionVersion=${currentUser.sessionVersion || 1}`);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.active === false) {
              setCurrentUser(null);
              localStorage.removeItem("devsetu_user");
              setIsLoggedIn(false);
              alert("Your session has expired due to a password change. Please login again.");
            }
          }
        } catch (e) {
          console.warn("Failed to check session status");
        }
      }

      if (adminUser && adminUser.email) {
        try {
          const sessionRes = await fetch(`${API_BASE}/api/auth/session-status?email=${encodeURIComponent(adminUser.email)}&sessionVersion=${adminUser.sessionVersion || 1}`);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.active === false) {
              setAdminUser(null);
              localStorage.removeItem("devsetu_admin_user");
              setIsAdminLoggedIn(false);
              alert("Admin session has expired due to a password change. Please login again.");
            }
          }
        } catch (e) {
          console.warn("Failed to check admin session status");
        }
      }

      try {
        const usersRes = await fetch(`${API_BASE}/api/users`);
        if (usersRes.ok) {
          const data = await usersRes.json();
          setRegisteredUsers(data);
        } else {
          throw new Error("HTTP error");
        }
      } catch (err) {
        console.warn("Using local users fallback.");
      }
    };

    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const registerPushToken = async (user) => {
    try {
      const email = user.email || user.phone;
      const deviceToken = "FCM-TOKEN-" + Math.floor(100000 + Math.random() * 900000);
      const res = await fetch(`${API_BASE}/api/notifications/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, deviceToken })
      });
      if (res.ok) {
        console.log("Registered simulated FCM device token successfully!");
        localStorage.setItem("devsetu_push_permission", "granted");
        localStorage.setItem("devsetu_device_token", deviceToken);
      }
    } catch (err) {
      console.warn("Failed to register simulated FCM token:", err);
    }
  };

  const savePreferences = async () => {
    try {
      const email = currentUser?.email || currentUser?.phone;
      if (!email) return;
      const res = await fetch(`${API_BASE}/api/users/notification-preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          preferences: {
            email: prefEmail,
            push: prefPush,
            sms: prefSms,
            booking: prefBooking,
            membership: prefMembership,
            chat: prefChat
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...currentUser, notificationPreferences: data.preferences };
        setCurrentUser(updatedUser);
        localStorage.setItem("devsetu_user", JSON.stringify(updatedUser));
        alert("Notification preferences saved successfully!");
      } else {
        alert("Failed to save preferences.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving preferences.");
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const permission = localStorage.getItem("devsetu_push_permission");
      if (permission === "granted") {
        registerPushToken(currentUser);
      } else if (permission !== "denied") {
        setShowPushPermissionModal(true);
      }
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    if (currentUser) {
      const p = currentUser.notificationPreferences || {};
      setPrefEmail(p.email !== false);
      setPrefPush(p.push !== false);
      setPrefSms(p.sms === true);
      setPrefBooking(p.booking !== false);
      setPrefMembership(p.membership !== false);
      setPrefChat(p.chat !== false);
    }
  }, [currentUser]);

  // Toast Auto-Hide effect
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Sync theme to local storage
  useEffect(() => {
    localStorage.setItem("devsetu_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark-theme");
    } else {
      root.classList.remove("dark-theme");
    }
  }, [theme]);

  // Sync language to local storage
  useEffect(() => {
    localStorage.setItem("devsetu_lang", language);
  }, [language]);

  // Localized dictionary shorthand
  const t = translations[language] || translations.en;

  // Localized date formatter helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString(language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "mr-IN", {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Merge mockAstrologers with registeredUsers mapped to look like astrologers
  const astrologersList = useMemo(() => {
    const usersMapped = registeredUsers.map((u, idx) => ({
      id: u.profileId || `DEV-AST-REG-${idx + 1}`,
      name: u.name,
      email: u.email,
      phone: u.phone,
      state: u.state || "Maharashtra",
      city: u.city || "Pune",
      location: `${u.city || "Pune"}, ${u.state || "Maharashtra"}`,
      rating: "5.0",
      avatar: "🧘",
      joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "New",
      experience: u.experience || "5 Years",
      accountStatus: u.accountStatus || "pending",
      totalBookings: bookings.filter(b => b.astrologerName === u.name).length
    }));
    
    const mockNames = mockAstrologers.map(m => m.name.toLowerCase());
    const filteredUsers = usersMapped.filter(u => !mockNames.includes(u.name.toLowerCase()));
    
    const approvedMock = mockAstrologers.map(m => ({ ...m, accountStatus: "approved" }));
    
    return [...approvedMock, ...filteredUsers];
  }, [registeredUsers, bookings]);

  // Derived Admin Statistics (14 key metrics)
  const stats = useMemo(() => {
    const totalAstro = astrologersList.length;
    const pendingApprovals = astrologersList.filter(u => u.accountStatus === "pending").length;
    const approvedAstro = astrologersList.filter(u => u.accountStatus === "approved").length;
    const activeAstro = approvedAstro;
    const blockedAstro = astrologersList.filter(u => u.accountStatus === "suspended" || u.accountStatus === "rejected").length;
    
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => ["approved", "scheduled"].includes(b.status)).length;
    const completedBookings = bookings.filter(b => b.status === "completed").length;
    const pendingPayments = bookings.filter(b => b.status === "submitted").length;
    
    const revenue = bookings
      .filter(b => ["approved", "scheduled", "completed"].includes(b.status))
      .reduce((sum, b) => sum + (b.amount * 0.1), 0);
      
    const openTickets = tickets.filter(t => t.status === "Open").length;
    const systemNotifsSent = adminHistory.length;
    const openResets = pinResetRequests.filter(r => r.status === "pending" || r.status === "in_review").length;

    // Simulated/calculated metrics for release readiness
    const smsSuccessRate = "98.6%";
    const pushDeliveryRate = "99.2%";
    const hashedPinCoverage = registeredUsers.length > 0
      ? `${Math.round((registeredUsers.filter(u => u.salt).length / registeredUsers.length) * 100)}%`
      : "100%";
    const activeSessionsCount = registeredUsers.reduce((sum, u) => sum + (u.sessionVersion ? 1 : 0), 0) + 1;

    return {
      totalAstro,
      pendingApprovals,
      approvedAstro,
      activeAstro,
      blockedAstro,
      totalBookings,
      activeBookings,
      completedBookings,
      revenue,
      pendingPayments,
      openTickets,
      systemNotifsSent,
      smsSuccessRate,
      pushDeliveryRate,
      hashedPinCoverage,
      activeSessionsCount,
      openResets
    };
  }, [bookings, astrologersList, tickets, adminHistory, pinResetRequests, registeredUsers]);

  // Handle Login Submit using fetch request
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    if (!/^\d{6}$/.test(loginPassword)) {
      setLoginError({ type: "general", message: "PIN must be exactly 6 digits numeric!" });
      return;
    }
    try {
      const payload = {
        loginFormType: "phone",
        phone: loginPhone,
        password: loginPassword,
        role: "astrologer"
      };

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.profileId) {
          setLoginError({ type: "pending", profileId: data.profileId, message: data.error });
        } else {
          setLoginError({ type: "general", message: data.error || "Login failed." });
        }
        return;
      }

      setCurrentUser(data.user);
      localStorage.setItem("devsetu_user", JSON.stringify(data.user));
      setIsLoggedIn(true);

      // Reset form fields
      setLoginEmail("");
      setLoginPhone("");
      setLoginPassword("");
    } catch (err) {
      console.error(err);
      setLoginError({ type: "general", message: "Network error occurred during login." });
    }
  };

  // Handle Signup Submit using fetch request
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    if (signupPassword !== signupConfirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!/^\d{6}$/.test(signupPassword)) {
      alert("PIN must be exactly 6 digits numeric!");
      return;
    }

    try {
      const payload = {
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        state: signupState,
        city: signupCity,
        district: signupDistrict,
        specialization: signupSpecialization,
        experience: signupExperience
      };

      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Registration failed.");
        return;
      }

      // Show success screen with generated profile ID
      setRegisteredProfileId(data.user.profileId);

      // Clear sign-up form fields
      setSignupName("");
      setSignupEmail("");
      setSignupPhone("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setSignupDistrict("");
      setSignupSpecialization("Vedic Pooja");
    } catch (err) {
      console.error(err);
      alert("Network error occurred during registration.");
    }
  };

  // Handle Astrologer Booking Form Submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.clientName || !bookingForm.clientMobile || !bookingForm.preferredDate) {
      alert("Please fill all required fields.");
      return;
    }
    
    try {
      const payload = {
        astrologerName: currentUser?.name || "Acharya Shastri",
        astrologerProfileId: currentUser?.profileId || "DEV-AST-00001",
        serviceId: selectedService.id,
        packageName: isBookingFlow.name[language] || isBookingFlow.name.en,
        amount: isBookingFlow.price,
        astroFee: isBookingFlow.astroFee,
        clientName: bookingForm.clientName,
        clientMobile: bookingForm.clientMobile,
        city: bookingForm.city,
        date: bookingForm.preferredDate,
        notes: bookingForm.notes
      };

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create booking.");
        return;
      }

      setBookings(prev => [data, ...prev]);
      setIsBookingFlow(null); // Close form
      setTrackingBookingId(data.id);
      setAstroTab("bookings");
      
      // Clear Form
      setBookingForm({
        clientName: "",
        clientMobile: "",
        city: "Varanasi",
        preferredDate: "",
        notes: ""
      });
    } catch (err) {
      console.error(err);
      alert("Network error occurred during booking creation.");
    }
  };

  // Submit payment details for booking
  const handlePaymentSubmit = async (bookingId) => {
    if (!paymentTxnId || paymentTxnId.trim().length < 8) {
      alert("Please enter a valid 12-digit transaction ID.");
      return;
    }

    try {
      const payload = {
        txnId: paymentTxnId,
        screenshot: uploadedScreenshot || selectedMockScreenshot
      };

      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit payment details.");
        return;
      }

      setBookings(prev => prev.map(b => (b.id === bookingId ? data : b)));

      // Send automated message in chat
      const chatPayload = {
        ticketId: activeTicketId || "TK-9402",
        sender: "astrologer",
        text: `Submitted payment for booking ${bookingId}. Txn ID: ${paymentTxnId}. Please approve.`,
        category: "Payment Issues"
      };

      await fetch(`${API_BASE}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload)
      });

      setPaymentTxnId("");
      setUploadedScreenshot(null);
    } catch (err) {
      console.error(err);
      alert("Network error occurred during payment submission.");
    }
  };

  // Admin verifies payment
  const handleAdminVerifyPayment = async (bookingId, isApproved) => {
    try {
      const nextStatus = isApproved ? "admin_review" : "cancelled";
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update payment status.");
        return;
      }

      setBookings(prev => prev.map(b => (b.id === bookingId ? data : b)));

      // Admin replies in support chat
      const replyText = isApproved 
        ? `We have verified transaction details for Booking ${bookingId}. The payment is approved. The booking has moved to Admin Review for scheduling and assignment of pandits.`
        : `Transaction details for Booking ${bookingId} could not be verified. Please review the screenshot and try again.`;

      const chatPayload = {
        ticketId: activeTicketId || "TK-9402",
        sender: "admin",
        text: replyText,
        category: "Payment Issues"
      };

      await fetch(`${API_BASE}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload)
      });
    } catch (err) {
      console.error(err);
      alert("Network error occurred during payment verification.");
    }
  };

  // Admin requests clarification on payment
  const handleAdminRequestClarification = async (bookingId) => {
    const replyText = `Regarding Booking ${bookingId}, the transaction ref ID does not match our bank ledger logs. Please upload a clearer payment screenshot or confirm the Transaction ID.`;
    
    try {
      const chatPayload = {
        ticketId: activeTicketId || "TK-9402",
        sender: "admin",
        text: replyText,
        category: "Payment Issues"
      };

      await fetch(`${API_BASE}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload)
      });

      alert("Clarification request sent to the astrologer in support chat.");
    } catch (err) {
      console.error(err);
      alert("Network error occurred during clarification request.");
    }
  };

  // Admin updates booking status
  const handleAdminUpdateStatus = async (bookingId, nextStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update booking status.");
        return;
      }

      setBookings(prev => prev.map(b => (b.id === bookingId ? data : b)));
    } catch (err) {
      console.error(err);
      alert("Network error occurred during status update.");
    }
  };

  // Admin updates astrologer registration status
  const handleAdminUpdateUserStatus = async (email, nextStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(email)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: nextStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update user status.");
        return;
      }

      // Update registeredUsers list state
      setRegisteredUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? data : u));
      alert(`Astrologer account status has been updated to ${nextStatus}.`);
    } catch (err) {
      console.error(err);
      alert("Network error occurred during user status update.");
    }
  };

  // Admin edits user profile
  const handleAdminEditUser = async (email, updateData) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update user profile.");
        return;
      }
      setRegisteredUsers(prev => prev.map(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email ? data : u));
      alert("Profile updated successfully.");
      setShowEditUserModal(false);
    } catch (err) {
      console.error(err);
      alert("Network error updating user.");
    }
  };

  const handleAdminDeleteUser = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(email)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user.");
        return;
      }
      setRegisteredUsers(prev => prev.filter(u => u.email !== email && u.phone !== email && u.mobile !== email));
      alert("User deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Network error deleting user.");
    }
  };

  const handleAdminDeleteBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete booking.");
        return;
      }
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      alert("Booking deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Network error deleting booking.");
    }
  };

  const handleAdminAssignAstrologer = async (bookingId, astroProfileId) => {
    try {
      const astro = astrologersList.find(a => a.id === astroProfileId);
      if (!astro) {
        alert("Selected astrologer not found.");
        return;
      }
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologerName: astro.name,
          astrologerProfileId: astro.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to assign astrologer.");
        return;
      }
      setBookings(prev => prev.map(b => b.id === bookingId ? data : b));
      alert(`Astrologer ${astro.name} assigned to booking ${bookingId}.`);
    } catch (err) {
      console.error(err);
      alert("Network error assigning astrologer.");
    }
  };

  const handleAdminSendCustomNotification = async (targetUserId, title, body, channel) => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: adminUser?.adminId || adminUser?.profileId || "ADM00001",
          targetUserIds: [targetUserId],
          title,
          body,
          type: "admin",
          channel
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send notification.");
        return;
      }
      alert("Notification sent successfully.");
      const historyRes = await fetch(`${API_BASE}/api/notifications/admin-history`);
      if (historyRes.ok) setAdminHistory(await historyRes.json());
    } catch (err) {
      console.error(err);
      alert("Network error sending notification.");
    }
  };

  // Astrologer sends support message
  const handleAstroSendMessage = async (attachedFileData = null) => {
    if (!astroChatMsg.trim() && !attachedFileData) return;

    try {
      const chatPayload = {
        ticketId: activeTicketId || "TK-9402",
        sender: "astrologer",
        text: astroChatMsg,
        category: astroChatCategory,
        attachment: attachedFileData
      };

      const res = await fetch(`${API_BASE}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send message.");
        return;
      }

      setChats(prev => [...prev, data]);
      setAstroChatMsg("");
      setAttachedFile(null);
    } catch (err) {
      console.error(err);
      alert("Network error occurred during message send.");
    }
  };

  // Admin sends support message
  const handleAdminSendMessage = async () => {
    if (!adminChatMsg.trim()) return;

    try {
      const chatPayload = {
        ticketId: activeTicketId || "TK-9402",
        sender: "admin",
        text: adminChatMsg,
        category: "General Queries"
      };

      const res = await fetch(`${API_BASE}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send message.");
        return;
      }

      setChats(prev => [...prev, data]);
      setAdminChatMsg("");
    } catch (err) {
      console.error(err);
      alert("Network error occurred during message send.");
    }
  };

  // Admin broadcasts system announcement
  const handleBroadcastAnnouncement = async () => {
    if (!broadcastText.trim()) {
      alert("Please enter announcement text.");
      return;
    }
    try {
      const newNotif = {
        id: Date.now(),
        title: "System Announcement",
        body: broadcastText,
        time: "Just now",
        type: "warning",
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      setBroadcastText("");
      alert("Broadcast announcement sent to astrologers.");
    } catch (err) {
      console.error(err);
    }
  };

  // Clear unread notifications
  const clearNotifications = async () => {
    try {
      const email = currentUser?.email || "";
      if (email) {
        await fetch(`${API_BASE}/api/notifications/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Bookings on Admin panel
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = b.clientName.toLowerCase().includes(adminBookingSearch.toLowerCase()) ||
                          b.id.toLowerCase().includes(adminBookingSearch.toLowerCase());
      const matchFilter = adminBookingFilter === "all" || b.status === adminBookingFilter;
      return matchSearch && matchFilter;
    });
  }, [bookings, adminBookingSearch, adminBookingFilter]);

  // Quick Action Buttons Helper
  const handleQuickAction = (action) => {
    if (action === "services") {
      setAstroTab("services");
      setSelectedService(null);
      setIsBookingFlow(null);
    } else if (action === "bookings") {
      setAstroTab("bookings");
      setTrackingBookingId(null);
    } else if (action === "support") {
      setAstroTab("support");
    } else if (action === "notifications") {
      setShowNotifications(true);
    }
  };

  const accessibilityClass = isAccessibilityMode ? "accessibility-large-text" : "";

  return (
    <div className={`devsetu-workspace ${theme === "dark" ? "dark-theme" : ""} ${accessibilityClass}`}>
      {/* Workspace Header */}
      <header className="workspace-header">
        <div className="brand-section">
          <img 
            src={theme === "light" 
              ? "/devsetu_light_logo.png" 
              : "/devsetu_dark_logo.png"}
            alt="DevSetu Logo" 
            className="brand-logo-img"
          />
        </div>

        {/* Real-time Mock SMS/Email Toast Banner */}
        {activeToast && (
          <div 
            className="fade-in"
            style={{
              position: "fixed",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "90%",
              maxWidth: "400px",
              backgroundColor: "rgba(43, 27, 18, 0.95)",
              color: "#FFF6E9",
              borderLeft: activeToast.type === "sms" ? "4px solid var(--temple-gold)" : "4px solid var(--orange-accent)",
              borderRadius: "8px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
              padding: "14px 16px",
              zIndex: 10000,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              backdropFilter: "blur(8px)",
              fontFamily: "var(--font-body)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "var(--temple-gold)", display: "flex", alignItems: "center", gap: "6px" }}>
                {activeToast.type === "sms" ? "💬 New SMS Notification" : "✉️ New Email Notification"}
              </span>
              <button 
                onClick={() => setActiveToast(null)}
                style={{ background: "none", border: "none", color: "#FFF6E9", opacity: 0.7, cursor: "pointer", fontSize: "12px", fontWeight: "800" }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ fontSize: "10px", opacity: 0.8, fontWeight: "600" }}>
              To: {activeToast.recipient}
            </div>
            
            {activeToast.type === "email" && (
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#FFF" }}>
                Subject: {activeToast.subject}
              </div>
            )}
            
            <div style={{ 
              fontSize: "11px", 
              lineHeight: "1.4", 
              backgroundColor: "rgba(255,255,255,0.06)", 
              padding: "8px 10px", 
              borderRadius: "4px",
              whiteSpace: "pre-line",
              maxHeight: "120px",
              overflowY: "auto",
              margin: "4px 0"
            }}>
              {activeToast.message}
            </div>

            {/* Quick Copy Profile ID / OTP helper */}
            {(() => {
              const otpMatch = activeToast.message.match(/\b\d{6}\b/);
              const idMatch = activeToast.message.match(/DEV-AST-\d{5}/);
              
              if (otpMatch || idMatch) {
                return (
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "2px" }}>
                    {idMatch && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(idMatch[0]);
                          alert(`Copied Profile ID: ${idMatch[0]}`);
                        }}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "10px", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                      >
                        📋 Copy ID: {idMatch[0]}
                      </button>
                    )}
                    {otpMatch && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(otpMatch[0]);
                          alert(`Copied OTP: ${otpMatch[0]}`);
                        }}
                        className="btn-primary"
                        style={{ padding: "4px 8px", fontSize: "10px" }}
                      >
                        📋 Copy OTP: {otpMatch[0]}
                      </button>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {/* View Switchers & Translation Toggles */}
        <div className="header-controls">
          {/* Theme Switcher */}
          <button 
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="btn-secondary"
            style={{ borderRadius: "50%", width: "36px", height: "36px", padding: 0 }}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* View Mode Switcher Toggle */}
          <button 
            onClick={() => setSimulatorView(simulatorView === "mobile" ? "admin" : "mobile")}
            className="btn-secondary"
            style={{ 
              borderRadius: "18px", 
              height: "36px", 
              padding: "0 14px", 
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              border: "1px solid var(--temple-gold)",
              color: "var(--temple-gold)",
              fontWeight: "700",
              fontSize: "11px",
              background: "transparent",
              cursor: "pointer"
            }}
            title={simulatorView === "mobile" ? "Switch to Admin Dashboard" : "Switch to Astrologer Mobile"}
          >
            <ShieldCheck size={14} />
            <span>{simulatorView === "mobile" ? "Admin Panel" : "Astro App"}</span>
          </button>

          {/* Language Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Globe size={16} />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-select"
              style={{ padding: "4px 8px", fontSize: "12px", fontWeight: "600" }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Workspace split panel */}
      {activeRoleSelection === null ? (
        <div className="role-selection-container fade-in">
          <div className="role-selection-header">
            <div className="role-selection-logo">
              <img 
                src={theme === "light" ? "/devsetu_light_logo.png" : "/devsetu_dark_logo.png"} 
                alt="DevSetu Logo" 
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h1 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: "28px", margin: "0 0 8px 0" }}>DEVSETU</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Select Login Type</p>
          </div>

          <div className="role-selection-cards">
            <div className="role-card" onClick={() => { setActiveRoleSelection("astrologer"); setSimulatorView("mobile"); }}>
              <div className="role-card-icon">🔮</div>
              <h2 className="role-card-title">Astrologer Login</h2>
              <p className="role-card-desc">
                Login as a registered DEVSETU Astrologer to manage pooja bookings, view notifications, communicate with the administrator, and access your professional dashboard.
              </p>
              <button className="btn-primary role-card-btn" type="button">
                Continue as Astrologer
              </button>
            </div>

            <div className="role-card" onClick={() => { setActiveRoleSelection("admin"); setSimulatorView("admin"); }}>
              <div className="role-card-icon">🛡️</div>
              <h2 className="role-card-title">Administrator Login</h2>
              <p className="role-card-desc">
                Login as DEVSETU Administrator to manage astrologers, approve registrations, verify payments, monitor bookings, and control the platform.
              </p>
              <button className="btn-primary role-card-btn" type="button">
                Continue as Administrator
              </button>
            </div>
          </div>
        </div>
      ) : (
        <main className={`workspace-body show-${simulatorView}`}>
        
        {/* =========================================================================
            ASTROLOGER MOBILE APP COLUMN (Left Panel)
            ========================================================================= */}
        <section className="phone-column">
          <div className="phone-simulator">
            {/* Phone Notch & Camera Bezel */}
            <div className="phone-notch">
              <div className="phone-speaker"></div>
              <div className="phone-camera"></div>
            </div>

            {/* Status Bar */}
            <div className="phone-status-bar">
              <div>04:30 PM</div>
              <div className="phone-status-right">
                <span>5G</span>
                <span>📶</span>
                <span>🔋 88%</span>
              </div>
            </div>

            {/* Notification Dropdown Overlay */}
            {showNotifications && (
              <div 
                className="fade-in"
                style={{
                  position: "absolute",
                  top: "44px",
                  left: "12px",
                  right: "12px",
                  backgroundColor: "var(--phone-card-bg)",
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-lg)",
                  padding: "16px",
                  zIndex: 2000,
                  border: "1px solid var(--temple-gold)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: "14px", margin: 0 }}>
                    🔔 Notification Center
                  </h4>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      onClick={async () => {
                        const email = currentUser?.email || currentUser?.phone;
                        if (!email) return;
                        await fetch(`${API_BASE}/api/notifications/clear`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email })
                        });
                        const notifRes = await fetch(`${API_BASE}/api/notifications?email=${encodeURIComponent(email)}`);
                        if (notifRes.ok) setNotifications(await notifRes.json());
                      }} 
                      style={{ background: "none", border: "none", color: "var(--temple-gold)", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Read All
                    </button>
                    <button 
                      onClick={async () => {
                        const email = currentUser?.email || currentUser?.phone;
                        if (!email) return;
                        await fetch(`${API_BASE}/api/notifications/all?email=${encodeURIComponent(email)}`, {
                          method: "DELETE"
                        });
                        setNotifications([]);
                      }} 
                      style={{ background: "none", border: "none", color: "var(--status-danger)", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="bell-dropdown-list" style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => {
                      const badgeClass = n.type || "admin";
                      const isUnread = !n.read;
                      
                      return (
                        <div 
                          key={n.id} 
                          className={`bell-item ${isUnread ? 'unread' : ''}`}
                          style={{
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            padding: "10px",
                            backgroundColor: isUnread ? "rgba(200, 155, 60, 0.05)" : "transparent",
                            borderLeft: isUnread ? "3px solid var(--temple-gold)" : "1px solid var(--border-color)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px"
                          }}
                          onClick={async () => {
                            if (isUnread) {
                              const email = currentUser?.email || currentUser?.phone;
                              await fetch(`${API_BASE}/api/notifications/mark-read`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email, notificationId: n.id })
                              });
                              setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                            }
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)" }}>
                              {n.title}
                            </span>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                const email = currentUser?.email || currentUser?.phone;
                                await fetch(`${API_BASE}/api/notifications/${n.id}?email=${encodeURIComponent(email)}`, {
                                  method: "DELETE"
                                });
                                setNotifications(prev => prev.filter(item => item.id !== n.id));
                              }}
                              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px" }}
                            >
                              🗑️
                            </button>
                          </div>
                          
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                            {n.message || n.body}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                            <span className={`bell-item-badge ${badgeClass}`} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase" }}>
                              {badgeClass}
                            </span>
                            
                            <div style={{ display: "flex", gap: "6px" }}>
                              {n.relatedBookingId && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAstroTab("bookings");
                                    setTrackingBookingId(n.relatedBookingId);
                                    setShowNotifications(false);
                                  }}
                                  style={{
                                    fontSize: "9px",
                                    padding: "2px 8px",
                                    backgroundColor: "var(--temple-gold)",
                                    border: "none",
                                    borderRadius: "4px",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                    fontWeight: "700"
                                  }}
                                >
                                  View Booking
                                </button>
                              )}
                              
                              {badgeClass === "chat" && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAstroTab("support");
                                    setShowNotifications(false);
                                  }}
                                  style={{
                                    fontSize: "9px",
                                    padding: "2px 8px",
                                    backgroundColor: "var(--temple-gold)",
                                    border: "none",
                                    borderRadius: "4px",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                    fontWeight: "700"
                                  }}
                                >
                                  Chat Now
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ width: "100%", marginTop: "12px", fontSize: "11px", padding: "6px" }}
                  onClick={() => setShowNotifications(false)}
                >
                  Close Panel
                </button>
              </div>
            )}

            {/* Mobile App Canvas */}
            <div className="phone-content">
              {isSplash ? (
                /* 0. SPLASH SCREEN */
                <div className="phone-screen-body fade-in" style={{ justifyContent: "center", alignItems: "center", textAlign: "center", position: "relative", height: "100%", padding: "24px" }}>
                  <button 
                    onClick={() => setIsSplash(false)}
                    className="btn-secondary"
                    style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 8px", fontSize: "10px", borderRadius: "12px", border: "1px solid var(--border-color)", zIndex: 10 }}
                  >
                    Skip
                  </button>
                  <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="absolute inset-0 rounded-full bg-secondary-container/20 pulse-ring" style={{ width: "100%", height: "100%", position: "absolute" }}></div>
                    <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "var(--phone-card-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", overflow: "hidden", padding: "12px", zIndex: 1 }}>
                      <img 
                        src={theme === "light" 
                          ? "/devsetu_light_logo.png" 
                          : "/devsetu_dark_logo.png"}
                        alt="DevSetu Logo" 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </div>
                  
                  <h1 className="shimmer-text" style={{ fontFamily: "var(--font-heading)", fontSize: "28px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>
                    DEVSETU
                  </h1>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "180px", margin: "0 auto 16px" }}>
                    <div style={{ height: "1px", backgroundColor: "var(--border-color)", flex: 1 }}></div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2px", fontWeight: "700", color: "var(--temple-gold)" }}>CONNECT</span>
                    <div style={{ height: "1px", backgroundColor: "var(--border-color)", flex: 1 }}></div>
                  </div>
                  
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "220px", lineHeight: "1.5", marginBottom: "40px" }}>
                    {localTranslations[language]?.splashTagline || localTranslations.en.splashTagline}
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <div className="bounce-dot"></div>
                      <div className="bounce-dot"></div>
                      <div className="bounce-dot"></div>
                    </div>
                    <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--text-muted)", fontWeight: "700" }}>
                      {localTranslations[language]?.splashAwakening || localTranslations.en.splashAwakening}...
                    </span>
                  </div>
                </div>
              ) : !isLoggedIn ? (
                /* 0b. LOGIN SCREEN */
                <div className="phone-screen-body fade-in" style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "32px", width: "100%" }}>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="form-select"
                      style={{ padding: "4px 8px", fontSize: "11px", height: "28px", borderRadius: "14px" }}
                    >
                      <option value="en">EN</option>
                      <option value="hi">HI</option>
                      <option value="mr">MR</option>
                    </select>
                    <button 
                      type="button"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      className="btn-secondary"
                      style={{ width: "28px", height: "28px", padding: 0, borderRadius: "50%", border: "1px solid var(--border-color)" }}
                    >
                      {theme === "light" ? <Moon size={12} /> : <Sun size={12} />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const newUrl = prompt("Enter backend API base URL:", localStorage.getItem("devsetu_api_base") || "https://devsetu-4wav.onrender.com");
                        if (newUrl !== null) {
                          localStorage.setItem("devsetu_api_base", newUrl.trim());
                          alert("API URL updated! Reloading app...");
                          window.location.reload();
                        }
                      }}
                      className="btn-secondary"
                      style={{ width: "28px", height: "28px", padding: 0, borderRadius: "50%", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Set API Base URL"
                    >
                      <Settings size={12} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--phone-card-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", marginBottom: "12px", padding: "8px" }}>
                      <img 
                        src={theme === "light" 
                          ? "/devsetu_light_logo.png" 
                          : "/devsetu_dark_logo.png"}
                        alt="DevSetu Logo" 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", color: "var(--text-main)" }}>
                      {localTranslations[language]?.loginWelcome || localTranslations.en.loginWelcome}
                    </h2>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {localTranslations[language]?.loginSubtitle || localTranslations.en.loginSubtitle}
                    </p>
                  </div>

                  <div className="premium-card" style={{ padding: "20px" }}>
                    {forgotStep !== 0 ? (
                      <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: 0, textAlign: "center" }}>
                          Reset Password
                        </h3>
                        {forgotError && (
                          <div className="alert-danger-box" style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(198, 40, 40, 0.05)", border: "1px solid var(--error)", fontSize: "11px", color: "var(--text-main)" }}>
                            {forgotError}
                          </div>
                        )}
                        
                        {forgotStep === 1 && (
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            setForgotError(null);
                            try {
                              const res = await fetch(`${API_BASE}/api/auth/forgot-password/request`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: forgotEmail })
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                setForgotError(data.error || "Failed to send reset code.");
                              } else {
                                setForgotStep(2);
                                setForgotRemainingAttempts(5);
                              }
                            } catch (err) {
                              setForgotError("Network error occurred.");
                            }
                          }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                              Enter your registered email address to receive a secure 6-digit verification code.
                            </p>
                            <div className="minimal-input-wrapper">
                              <span className="minimal-input-icon">📧</span>
                              <input 
                                type="email" 
                                required 
                                placeholder="Registered Email" 
                                className="minimal-input"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                              />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                              Request Verification Code
                            </button>
                            <button type="button" onClick={() => setForgotStep(0)} className="btn-secondary" style={{ width: "100%", padding: "10px" }}>
                              Cancel
                            </button>
                          </form>
                        )}

                        {forgotStep === 2 && (
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            setForgotError(null);
                            try {
                              const res = await fetch(`${API_BASE}/api/auth/forgot-password/verify`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: forgotEmail, code: forgotOtp })
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                setForgotError(data.error || "Verification failed.");
                                if (data.error && data.error.includes("expired")) {
                                  setForgotStep(1);
                                } else {
                                  setForgotRemainingAttempts(prev => Math.max(0, prev - 1));
                                }
                              } else {
                                setForgotStep(3);
                              }
                            } catch (err) {
                              setForgotError("Network error occurred.");
                            }
                          }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                              We have sent a 6-digit OTP code to <strong>{forgotEmail}</strong>. Enter it below to proceed.
                            </p>
                            <div className="minimal-input-wrapper">
                              <span className="minimal-input-icon">🔑</span>
                              <input 
                                type="text" 
                                required 
                                maxLength={6}
                                placeholder="6-Digit Code" 
                                className="minimal-input"
                                value={forgotOtp}
                                onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                style={{ fontFamily: "monospace", letterSpacing: "4px", fontSize: "14px", textAlign: "center" }}
                              />
                            </div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center" }}>
                              Attempts remaining: <span style={{ color: "var(--error)", fontWeight: "800" }}>{forgotRemainingAttempts}</span>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                              Verify Code
                            </button>
                            <button type="button" onClick={() => setForgotStep(1)} className="btn-secondary" style={{ width: "100%", padding: "10px" }}>
                              Back
                            </button>
                          </form>
                        )}

                        {forgotStep === 3 && (
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            setForgotError(null);
                            if (forgotNewPassword !== forgotConfirmPassword) {
                              setForgotError("Passwords do not match.");
                              return;
                            }
                            try {
                              const res = await fetch(`${API_BASE}/api/auth/forgot-password/reset`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: forgotEmail, code: forgotOtp, newPassword: forgotNewPassword })
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                setForgotError(data.error || "Failed to reset password.");
                              } else {
                                setForgotStep(4);
                              }
                            } catch (err) {
                              setForgotError("Network error occurred.");
                            }
                          }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                              Enter your new password below.
                            </p>
                            
                            <div className="minimal-input-wrapper">
                              <span className="minimal-input-icon">🔒</span>
                              <input 
                                type="password" 
                                required 
                                placeholder="New Password" 
                                className="minimal-input"
                                value={forgotNewPassword}
                                onChange={(e) => setForgotNewPassword(e.target.value)}
                              />
                            </div>

                            <div className="minimal-input-wrapper">
                              <span className="minimal-input-icon">🔒</span>
                              <input 
                                type="password" 
                                required 
                                placeholder="Confirm New Password" 
                                className="minimal-input"
                                value={forgotConfirmPassword}
                                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                              />
                            </div>
                            
                            <div style={{
                              fontSize: "10px",
                              backgroundColor: "var(--warm-cream-darker)",
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid var(--border-color)",
                              lineHeight: "1.4"
                            }}>
                              <strong style={{ color: "var(--primary-brown)" }}>Password Strength Rules:</strong>
                              <ul style={{ margin: "4px 0 0 12px", padding: 0 }}>
                                <li>At least 8 characters</li>
                                <li>Uppercase & lowercase letters</li>
                                <li>At least 1 number</li>
                                <li>At least 1 special character</li>
                              </ul>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                              Reset Password
                            </button>
                            <button type="button" onClick={() => setForgotStep(2)} className="btn-secondary" style={{ width: "100%", padding: "10px" }}>
                              Back
                            </button>
                          </form>
                        )}

                        {forgotStep === 4 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center" }}>
                            <div style={{ fontSize: "36px", color: "var(--success)" }}>✓</div>
                            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: 0 }}>
                              Password Reset Successful!
                            </h4>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                              Your password has been updated. You can now log in with your new password.
                            </p>
                            <button type="button" onClick={() => {
                              setForgotStep(0);
                              setForgotEmail("");
                              setForgotOtp("");
                              setForgotNewPassword("");
                              setForgotConfirmPassword("");
                              setForgotError(null);
                            }} className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                              Proceed to Login
                            </button>
                          </div>
                        )}
                      </div>
                    ) : registeredProfileId ? (
                      <div className="fade-in text-center" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "12px 0", alignItems: "center" }}>
                        <div style={{ fontSize: "40px", color: "var(--success)" }}>✓</div>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--text-main)", margin: 0 }}>Registration Received!</h3>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                          Thank you for registering with DEVSETU CONNECT. Your astrologer account has been received and is currently pending verification.
                        </p>
                        
                        <div style={{
                          padding: "16px",
                          borderRadius: "12px",
                          backgroundColor: "var(--warm-cream-darker)",
                          border: "1px solid var(--temple-gold)",
                          width: "100%",
                          boxSizing: "border-box"
                        }}>
                          <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Your Unique Profile ID</div>
                          <div style={{ fontSize: "20px", fontWeight: "900", color: "var(--primary-brown)", fontFamily: "monospace", margin: "6px 0" }}>
                            {registeredProfileId}
                          </div>
                          <span style={{ fontSize: "9px", padding: "2px 8px", backgroundColor: "var(--warning)", color: "var(--primary-brown)", borderRadius: "10px", fontWeight: "800", display: "inline-block" }}>
                            PENDING VERIFICATION
                          </span>
                        </div>

                        <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                          An Email and SMS confirmation has been sent to your registered contact. Please wait for the admin to verify and approve your account.
                        </p>

                        <button 
                          onClick={() => {
                            setRegisteredProfileId(null);
                            setIsRegistering(false);
                            setLoginError(null);
                          }}
                          className="btn-primary"
                          style={{ width: "100%", padding: "10px" }}
                        >
                          Proceed to Login
                        </button>
                      </div>
                    ) : !isRegistering ? (
                      showLoginOtp ? (
                        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: 0, textAlign: "center" }}>
                            Verify OTP to Login
                          </h3>
                          {loginOtpError && (
                            <div className="alert-danger-box" style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(198, 40, 40, 0.05)", border: "1px solid var(--error)", fontSize: "11px", color: "var(--text-main)" }}>
                              {loginOtpError}
                            </div>
                          )}
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            setLoginOtpError(null);
                            try {
                              const res = await fetch(`${API_BASE}/api/auth/login-otp/verify`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: loginOtpEmail, code: loginOtpCode })
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                setLoginOtpError(data.error || "Verification failed.");
                              } else {
                                setCurrentUser(data.user);
                                localStorage.setItem("devsetu_user", JSON.stringify(data.user));
                                setIsLoggedIn(true);
                                setShowLoginOtp(false);
                                setLoginOtpCode("");
                                setLoginOtpEmail("");
                                setLoginError(null);
                              }
                            } catch (err) {
                              setLoginOtpError("Network error occurred.");
                            }
                          }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                              We have sent a 6-digit OTP code to <strong>{loginOtpEmail}</strong>. Enter it below to proceed.
                            </p>
                            <div className="minimal-input-wrapper">
                              <span className="minimal-input-icon">🔑</span>
                              <input 
                                type="text" 
                                required 
                                maxLength={6}
                                placeholder="6-Digit Code" 
                                className="minimal-input"
                                value={loginOtpCode}
                                onChange={(e) => setLoginOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                style={{ fontFamily: "monospace", letterSpacing: "4px", fontSize: "14px", textAlign: "center" }}
                              />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                              Verify & Log In
                            </button>
                            <button type="button" onClick={() => { setShowLoginOtp(false); setLoginError(null); }} className="btn-secondary" style={{ width: "100%", padding: "10px" }}>
                              Cancel
                            </button>
                          </form>
                        </div>
                      ) : (
                        <>
                        {loginError && (
                          <div className="alert-danger-box" style={{
                            padding: "12px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(198, 40, 40, 0.05)",
                            border: "1px solid var(--error)",
                            fontSize: "12px",
                            color: "var(--text-main)",
                            marginBottom: "16px",
                            lineHeight: "1.4"
                          }}>
                            {loginError.type === "pending" ? (
                              <>
                                <strong style={{ color: "var(--error)" }}>Your account is under verification.</strong>
                                <div style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "11px" }}>
                                  Profile ID: <span style={{ color: "var(--temple-gold)", fontWeight: "800" }}>{loginError.profileId}</span>
                                </div>
                                <div style={{ marginTop: "4px" }}>Please wait for admin approval.</div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const payload = { phone: loginPhone };
                                      const res = await fetch(`${API_BASE}/api/auth/login-otp/request`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(payload)
                                      });
                                      const data = await res.json();
                                      if (!res.ok) {
                                        setLoginError({ type: "general", message: data.error || "Failed to send login OTP." });
                                      } else {
                                        setLoginOtpEmail(data.email);
                                        setShowLoginOtp(true);
                                        setLoginOtpError(null);
                                        setLoginOtpCode("");
                                      }
                                    } catch (err) {
                                      setLoginError({ type: "general", message: "Network error occurred." });
                                    }
                                  }}
                                  className="btn-primary"
                                  style={{ marginTop: "10px", width: "100%", padding: "8px 12px", fontSize: "12px" }}
                                >
                                  Verify via OTP to Auto-Approve & Log In
                                </button>
                              </>
                            ) : (
                              loginError.message
                            )}
                          </div>
                        )}

                        <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">📱</span>
                            <input 
                              type="tel" 
                              required
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Mobile Number" 
                              className="minimal-input"
                              value={loginPhone}
                              onChange={(e) => setLoginPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                          </div>

                          <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">🔒</span>
                            <input 
                              type={loginShowPassword ? "text" : "password"} 
                              required
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              placeholder="6-Digit Login PIN" 
                              className="minimal-input"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value.replace(/[^0-9]/g, ''))}
                              style={{ paddingRight: "36px" }}
                            />
                            <button 
                              type="button"
                              onClick={() => setLoginShowPassword(!loginShowPassword)}
                              style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--text-muted)" }}
                            >
                              {loginShowPassword ? "👁️" : "🙈"}
                            </button>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginTop: "4px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                              <input type="checkbox" style={{ accentColor: "var(--temple-gold)" }} />
                              <span>{localTranslations[language]?.loginRemember || localTranslations.en.loginRemember}</span>
                            </label>
                            <a href="#" style={{ color: "var(--temple-gold)", textDecoration: "none", fontWeight: "700" }} onClick={(e) => { e.preventDefault(); setShowForgotPinModal(true); setForgotPinProfileId(""); setForgotPinMobile(loginPhone); setForgotPinResponse(null); setForgotPinError(null); }}>
                              {localTranslations[language]?.loginForgot || localTranslations.en.loginForgot}
                            </a>
                          </div>

                          <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ width: "100%", marginTop: "12px", padding: "12px" }}
                          >
                            {localTranslations[language]?.loginSignIn || localTranslations.en.loginSignIn}
                          </button>
                        </form>

                        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "var(--text-muted)" }}>
                          {localTranslations[language]?.loginSignUpPrompt || localTranslations.en.loginSignUpPrompt}
                          <a href="#" style={{ color: "var(--primary-brown)", fontWeight: "800", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); setIsRegistering(true); }}>
                            {localTranslations[language]?.loginSignUp || localTranslations.en.loginSignUp}
                          </a>
                        </div>

                        <div style={{ textAlign: "center", marginTop: "16px" }}>
                          <button 
                            type="button"
                            onClick={() => { setActiveRoleSelection(null); setLoginError(null); }}
                            className="back-to-selection-link"
                          >
                            ← Back to Selection
                          </button>
                        </div>
                      </>
                    )
                  ) : (
                      <>
                        <h3 style={{ fontSize: "16px", fontFamily: "var(--font-heading)", textAlign: "center", marginBottom: "16px" }}>Astrologer Registration</h3>
                        <form onSubmit={handleSignUpSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">👤</span>
                            <input 
                              type="text" 
                              required
                              placeholder="Full Name" 
                              className="minimal-input"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                            />
                          </div>

                           <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">📧</span>
                            <input 
                              type="email" 
                              placeholder="Email Address (Optional)" 
                              className="minimal-input"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                            />
                          </div>

                          <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">📱</span>
                            <input 
                              type="tel" 
                              required
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Mobile Number" 
                              className="minimal-input"
                              value={signupPhone}
                              onChange={(e) => setSignupPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">State</label>
                            <select 
                              value={signupState}
                              onChange={(e) => setSignupState(e.target.value)}
                              className="form-select"
                              style={{ width: "100%", padding: "12px", fontSize: "14px", height: "48px" }}
                            >
                              <option value="Maharashtra">Maharashtra</option>
                              <option value="Uttar Pradesh">Uttar Pradesh</option>
                              <option value="Madhya Pradesh">Madhya Pradesh</option>
                              <option value="Uttarakhand">Uttarakhand</option>
                              <option value="Karnataka">Karnataka</option>
                            </select>
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">District</label>
                            <input 
                              type="text"
                              required
                              placeholder="e.g. Pune"
                              className="form-input"
                              value={signupDistrict}
                              onChange={(e) => setSignupDistrict(e.target.value)}
                              style={{ padding: "12px", fontSize: "14px", height: "48px" }}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">City</label>
                            <input 
                              type="text"
                              required
                              placeholder="e.g. Varanasi"
                              className="form-input"
                              value={signupCity}
                              onChange={(e) => setSignupCity(e.target.value)}
                              style={{ padding: "12px", fontSize: "14px", height: "48px" }}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Specialization</label>
                            <select 
                              value={signupSpecialization}
                              onChange={(e) => setSignupSpecialization(e.target.value)}
                              className="form-select"
                              style={{ width: "100%", padding: "12px", fontSize: "14px", height: "48px" }}
                            >
                              <option value="Vedic Pooja">Vedic Pooja</option>
                              <option value="Horoscope Reading">Horoscope Reading</option>
                              <option value="Vastu Shastra">Vastu Shastra</option>
                              <option value="Numerology">Numerology</option>
                              <option value="Palmistry">Palmistry</option>
                            </select>
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Years of Experience</label>
                            <select 
                              value={signupExperience}
                              onChange={(e) => setSignupExperience(e.target.value)}
                              className="form-select"
                              style={{ width: "100%", padding: "12px", fontSize: "14px", height: "48px" }}
                            >
                              <option value="3 Years">3 Years</option>
                              <option value="5 Years">5 Years</option>
                              <option value="7 Years">7 Years</option>
                              <option value="10 Years">10 Years</option>
                              <option value="15+ Years">15+ Years</option>
                            </select>
                          </div>

                          <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">🔒</span>
                            <input 
                              type="password" 
                              required
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              placeholder="6-Digit Login PIN" 
                              className="minimal-input"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                          </div>

                          <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">🔒</span>
                            <input 
                              type="password" 
                              required
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              placeholder="Confirm 6-Digit PIN" 
                              className="minimal-input"
                              value={signupConfirmPassword}
                              onChange={(e) => setSignupConfirmPassword(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                          </div>

                          <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ width: "100%", marginTop: "8px", padding: "12px" }}
                          >
                            Sign Up
                          </button>
                        </form>

                        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "var(--text-muted)" }}>
                          Already have an account?{" "}
                          <a href="#" style={{ color: "var(--primary-brown)", fontWeight: "800", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); setIsRegistering(false); }}>
                            Sign In
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
              {astroTab === "home" && (
                <>
                  <div className="phone-nav-header" style={{ padding: "0 12px", height: "56px" }}>
                    <button 
                      onClick={() => setShowAstroMenu(true)} 
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      <span style={{ fontSize: "24px", color: "var(--text-main)" }}>☰</span>
                    </button>
                    <img 
                      src={theme === "light" 
                        ? "/devsetu_light_logo.png" 
                        : "/devsetu_dark_logo.png"}
                      alt="DevSetu Logo" 
                      style={{ height: "34px", width: "auto" }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button 
                        onClick={() => setShowNotifications(true)} 
                        style={{ background: "none", border: "none", position: "relative", cursor: "pointer", padding: "4px" }}
                      >
                        <Bell size={22} color="var(--text-main)" />
                        {notifications.filter(n => !n.read).length > 0 && (
                          <span style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-2px",
                            backgroundColor: "var(--error)",
                            color: "white",
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px",
                            fontSize: "9px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "850"
                          }}>
                            {notifications.filter(n => !n.read).length}
                          </span>
                        )}
                      </button>
                      <button 
                        onClick={() => setAstroTab("profile")} 
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                        title="My Profile"
                      >
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--warm-cream-darker)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", border: "2.5px solid var(--temple-gold)" }}>🧘</div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="phone-screen-body">
                    {/* Welcome Header Section */}
                    <div className="premium-card" style={{
                      padding: "20px",
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, var(--secondary-brown), var(--primary-brown))",
                      color: "#FFF6E9",
                      border: "2px solid var(--temple-gold)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <div style={{ fontSize: "14px", opacity: 0.9, fontWeight: "700", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Namaste & Welcome,</span>
                        <span className="status-badge approved" style={{ fontSize: "11px", padding: "4px 8px" }}>Active</span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", color: "var(--temple-gold)", margin: "0" }}>
                        {currentUser?.name || "Acharya Shastri"}
                      </h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(255,255,255,0.2)", paddingTop: "8px", marginTop: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", fontFamily: "monospace" }}>
                          ID: {currentUser?.profileId || "DEV-AST-00001"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", opacity: 0.9 }}>
                          <Award size={16} color="var(--temple-gold)" />
                          <span>Platinum Partner</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div>
                      <div style={{ fontSize: "14px", textTransform: "uppercase", fontWeight: "800", color: "var(--text-muted)", marginBottom: "8px" }}>
                        {t.todayStatus}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        <div style={{ backgroundColor: "var(--phone-card-bg)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)" }}>
                            {bookings.length}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700" }}>{t.totalBookings}</div>
                        </div>
                        <div style={{ backgroundColor: "var(--phone-card-bg)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--warning)" }}>
                            {bookings.filter(b => b.status === "submitted").length}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700" }}>{t.pendingApprovals}</div>
                        </div>
                        <div style={{ backgroundColor: "var(--phone-card-bg)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--success)" }}>
                            {bookings.filter(b => ["approved", "scheduled"].includes(b.status)).length}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700" }}>{t.approvedBookings}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div>
                      <div style={{ fontSize: "14px", textTransform: "uppercase", fontWeight: "800", color: "var(--text-muted)", marginBottom: "12px" }}>
                        {t.quickActions}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <button 
                          onClick={() => handleQuickAction("services")} 
                          className="premium-card" 
                          style={{ minHeight: "88px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid var(--border-color)", background: "var(--phone-card-bg)", width: "100%", borderRadius: "16px", padding: "12px" }}
                        >
                          <Sparkles size={26} color="var(--orange-accent)" />
                          <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>Book Pooja</span>
                        </button>
                        <button 
                          onClick={() => handleQuickAction("bookings")} 
                          className="premium-card" 
                          style={{ minHeight: "88px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid var(--border-color)", background: "var(--phone-card-bg)", width: "100%", borderRadius: "16px", padding: "12px" }}
                        >
                          <Calendar size={26} color="var(--temple-gold)" />
                          <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>My Bookings</span>
                        </button>
                        <button 
                          onClick={() => handleQuickAction("support")} 
                          className="premium-card" 
                          style={{ minHeight: "88px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid var(--border-color)", background: "var(--phone-card-bg)", width: "100%", borderRadius: "16px", padding: "12px" }}
                        >
                          <MessageSquare size={26} color="var(--primary-brown)" />
                          <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>Support Chat</span>
                        </button>
                        <button 
                          onClick={() => handleQuickAction("notifications")} 
                          className="premium-card" 
                          style={{ minHeight: "88px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid var(--border-color)", background: "var(--phone-card-bg)", width: "100%", borderRadius: "16px", padding: "12px" }}
                        >
                          <Bell size={26} color="var(--error)" />
                          <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>Notifications</span>
                        </button>
                      </div>
                    </div>

                    {/* Book Pooja Floating Action Button (FAB) */}
                    <button 
                      onClick={() => { setAstroTab("services"); setSelectedService(null); setIsBookingFlow(null); }}
                      className="md3-fab"
                      title="Book Pooja"
                    >
                      <Sparkles size={24} />
                    </button>

                    {/* Featured Banners */}
                    <div>
                      <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>
                        {t.featuredServices}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {servicesData.slice(0, 2).map(service => (
                          <div 
                            key={service.id} 
                            onClick={() => { setSelectedService(service); setAstroTab("services"); }}
                            className="premium-card" 
                            style={{ cursor: "pointer", padding: "12px", display: "flex", gap: "12px" }}
                          >
                            <div className={`service-card-image ${service.pattern}`} style={{ width: "80px", height: "80px", margin: 0, flexShrink: 0 }}></div>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                              <h4 style={{ fontSize: "14px", fontFamily: "var(--font-heading)" }}>{language === "en" ? service.titleEN : service.title}</h4>
                              <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {language === "en" ? service.descriptionEN : service.descriptionHI}
                              </p>
                              <div style={{ fontSize: "11px", color: "var(--orange-accent)", fontWeight: "800", marginTop: "4px" }}>
                                ₹{service.startingPrice.toLocaleString()} {t.startingFrom}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Us Section */}
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>
                        {t.contactUsTitle}
                      </div>
                      <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "var(--phone-card-bg)", borderColor: "var(--border-color)" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                          {t.contactUsDesc}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
                          <a href="tel:+918047096888" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--text-main)", fontSize: "11px", fontWeight: "700" }}>
                            <Phone size={14} color="var(--temple-gold)" />
                            <span>+91 80 4709 6888</span>
                          </a>
                          <a href="mailto:support@devsetu.com" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--text-main)", fontSize: "11px", fontWeight: "700" }}>
                            <Mail size={14} color="var(--temple-gold)" />
                            <span>support@devsetu.com</span>
                          </a>
                        </div>
                        <button 
                          onClick={() => setAstroTab("support")} 
                          className="btn-secondary" 
                          style={{ width: "100%", fontSize: "11px", padding: "6px", marginTop: "4px" }}
                        >
                          Open Live Support Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 2. SERVICES MARKETPLACE SCREEN */}
              {astroTab === "services" && !selectedService && (
                <>
                  <div className="phone-nav-header">
                    <button 
                      onClick={() => setShowAstroMenu(true)} 
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      <span style={{ fontSize: "20px", color: "var(--text-main)" }}>☰</span>
                    </button>
                    <div className="phone-nav-title">{t.marketplaceTitle}</div>
                    <Compass size={18} color="var(--text-muted)" />
                  </div>
                  
                  <div className="phone-screen-body">
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
                      {t.marketplaceSubtitle}
                    </p>

                    {/* Search Mock */}
                    <div style={{ position: "relative" }}>
                      <input 
                        type="text" 
                        placeholder={t.categorySearch} 
                        className="form-input" 
                        style={{ width: "100%", paddingLeft: "36px" }} 
                      />
                      <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
                    </div>

                    {/* Full Grid of Services */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
                      {servicesData.map(service => (
                        <div 
                          key={service.id} 
                          className="premium-card" 
                          style={{ padding: 0 }}
                        >
                          <div className={`service-card-image ${service.pattern}`}>
                            <div className="service-card-title">
                              {language === "en" ? service.titleEN : language === "hi" ? service.titleHI : service.titleMR}
                            </div>
                          </div>
                          <div style={{ padding: "14px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
                              {language === "en" ? service.descriptionEN : language === "hi" ? service.descriptionHI : service.descriptionMR}
                            </p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--orange-accent)" }}>
                                ₹{service.startingPrice.toLocaleString()} {t.startingFrom}
                              </div>
                              <button 
                                onClick={() => setSelectedService(service)}
                                className="btn-primary" 
                                style={{ padding: "6px 12px", fontSize: "11px" }}
                              >
                                {t.viewPackages}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 2b. SERVICES DETAIL SCREEN */}
              {astroTab === "services" && selectedService && !isBookingFlow && (
                <>
                  <div className="phone-nav-header">
                    <button 
                      onClick={() => setSelectedService(null)} 
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <ArrowLeft size={18} color="var(--text-main)" />
                    </button>
                    <div className="phone-nav-title">
                      {language === "en" ? selectedService.titleEN : language === "hi" ? selectedService.titleHI : selectedService.titleMR}
                    </div>
                    <div style={{ width: "18px" }}></div>
                  </div>

                  <div className="phone-screen-body">
                    {/* Hero Banner Pattern */}
                    <div 
                      className={`service-card-image ${selectedService.pattern}`} 
                      style={{ height: "100px", borderRadius: "12px" }}
                    >
                      <div className="service-card-title">
                        {language === "en" ? selectedService.titleEN : language === "hi" ? selectedService.titleHI : selectedService.titleMR}
                      </div>
                    </div>

                    {/* Benefits Section */}
                    <div>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "13px", marginBottom: "8px" }}>
                        {t.benefitsTitle}
                      </h4>
                      <ul style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "16px" }}>
                        {(selectedService.benefits[language] || selectedService.benefits.en).map((b, idx) => (
                          <li key={idx} style={{ fontSize: "11px", color: "var(--text-main)" }}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Packages Grid */}
                    <div>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "13px", marginBottom: "10px" }}>
                        {t.packagesTitle}
                      </h4>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {selectedService.packages.map(pkg => (
                          <div 
                            key={pkg.id} 
                            className="premium-card" 
                            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <h5 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main)" }}>
                                {pkg.name[language] || pkg.name.en}
                              </h5>
                              <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--secondary-brown)" }}>
                                ₹{pkg.price.toLocaleString()}
                              </div>
                            </div>
                            
                            <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                              {pkg.details[language] || pkg.details.en}
                            </p>

                            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-muted)", fontWeight: "700" }}>
                              <div>{t.durationLabel} {pkg.duration[language] || pkg.duration.en}</div>
                              <div style={{ color: "var(--success)" }}>Commission: ₹{pkg.astroFee}</div>
                            </div>

                            <button 
                              onClick={() => setIsBookingFlow(pkg)}
                              className="btn-primary" 
                              style={{ width: "100%", marginTop: "6px", padding: "8px", fontSize: "11px" }}
                            >
                              {t.bookNow}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 2c. BOOKING FORM SCREEN */}
              {astroTab === "services" && selectedService && isBookingFlow && (
                <>
                  <div className="phone-nav-header">
                    <button 
                      onClick={() => setIsBookingFlow(null)} 
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <ArrowLeft size={18} color="var(--text-main)" />
                    </button>
                    <div className="phone-nav-title">{t.bookingFormTitle}</div>
                    <div style={{ width: "18px" }}></div>
                  </div>

                  <div className="phone-screen-body">
                    <div style={{ fontSize: "11px", backgroundColor: "var(--warm-cream-darker)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      <span style={{ fontWeight: "700" }}>Service Selected:</span> {language === "en" ? selectedService.titleEN : selectedService.title} <br/>
                      <span style={{ fontWeight: "700" }}>Package:</span> {isBookingFlow.name[language] || isBookingFlow.name.en} (₹{isBookingFlow.price.toLocaleString()})
                    </div>

                    <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="form-group">
                        <label className="form-label">{t.clientName} *</label>
                        <input 
                          type="text" 
                          required
                          value={bookingForm.clientName}
                          onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                          placeholder="e.g. Rajesh Malhotra" 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t.clientMobile} *</label>
                        <input 
                          type="tel" 
                          required
                          value={bookingForm.clientMobile}
                          onChange={(e) => setBookingForm({ ...bookingForm, clientMobile: e.target.value })}
                          placeholder="10-digit mobile number" 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t.city} *</label>
                        <select 
                          value={bookingForm.city}
                          onChange={(e) => setBookingForm({ ...bookingForm, city: e.target.value })}
                          className="form-select"
                        >
                          <option value="Varanasi">Varanasi</option>
                          <option value="Trimbakeshwar">Trimbakeshwar (Nashik)</option>
                          <option value="Ujjain">Ujjain</option>
                          <option value="Pune">Pune</option>
                          <option value="Haridwar">Haridwar</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t.preferredDate} *</label>
                        <input 
                          type="date" 
                          required
                          value={bookingForm.preferredDate}
                          onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t.notes}</label>
                        <textarea 
                          rows="3"
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                          placeholder="Any specific family name, gotra details..." 
                          className="form-input"
                          style={{ resize: "none" }}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ width: "100%", marginTop: "10px" }}
                      >
                        {t.proceedPayment}
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* 3. MY BOOKINGS SCREEN */}
              {astroTab === "bookings" && (
                <>
                  <div className="phone-nav-header">
                    <button 
                      onClick={() => setShowAstroMenu(true)} 
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      <span style={{ fontSize: "20px", color: "var(--text-main)" }}>☰</span>
                    </button>
                    <div className="phone-nav-title">{t.bookingsTitle}</div>
                    <Calendar size={18} color="var(--text-muted)" />
                  </div>

                  <div className="phone-screen-body">
                    {/* Booking Flow Redirect Check (If user clicked Book Now and has a created booking waiting for payment) */}
                    {(() => {
                      const createdBooking = bookings.find(b => b.status === "created");
                      if (createdBooking && trackingBookingId === createdBooking.id) {
                        return (
                          <div className="premium-card" style={{ 
                            borderColor: "var(--orange-accent)", 
                            backgroundColor: "var(--phone-card-bg)",
                            boxShadow: "var(--shadow-md)",
                            borderRadius: "16px",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "var(--warning-bg)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--orange-accent)"
                              }}>
                                <Clock size={16} />
                              </div>
                              <div>
                                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", margin: 0, fontWeight: "700" }}>
                                  {language === "hi" ? "अग्रिम भुगतान लंबित" : language === "mr" ? "अग्रिम पेमेंट प्रलंबित" : "Pending Advance Payment"}
                                </h4>
                                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                                  {language === "hi" ? "ऑर्डर सत्यापन के लिए 20% अग्रिम आवश्यक है" : language === "mr" ? "ऑर्डर पडताळणीसाठी 20% ॲडव्हान्स आवश्यक" : "20% Advance required for order verification"}
                                </span>
                              </div>
                            </div>

                            {/* Booking Details Subcard (Material Design 3 style) */}
                            <div style={{
                              backgroundColor: "rgba(43, 27, 18, 0.03)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "12px",
                              padding: "12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                                <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>
                                  {language === "hi" ? "बुकिंग आईडी" : language === "mr" ? "बुकिंग आयडी" : "Booking ID"}
                                </span>
                                <strong style={{ color: "var(--primary-brown)" }}>{createdBooking.id}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                                <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>
                                  {language === "hi" ? "पूजा का नाम" : language === "mr" ? "पूजेचे नाव" : "Pooja Name"}
                                </span>
                                <strong style={{ color: "var(--primary-brown)", textAlign: "right" }}>{createdBooking.packageName}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                                <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>
                                  {language === "hi" ? "कुल शुल्क" : language === "mr" ? "एकूण शुल्क" : "Total Amount"}
                                </span>
                                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>₹{createdBooking.amount.toLocaleString()}</span>
                              </div>
                              <div style={{ borderTop: "1px dashed var(--border-color)", margin: "4px 0" }}></div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                                <span style={{ color: "var(--primary-brown)", fontWeight: "700" }}>
                                  {language === "hi" ? "अग्रिम भुगतान (20%)" : language === "mr" ? "अग्रिम पेमेंट (20%)" : "Advance Pay (20%)"}
                                </span>
                                <strong style={{ color: "var(--orange-accent)", fontSize: "13px" }}>₹{(createdBooking.amount * 0.2).toLocaleString()}</strong>
                              </div>
                            </div>

                            {/* Reusable Payment QR Component */}
                            <PaymentQRCode language={language} />

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                              <p style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center", lineHeight: "1.4", margin: 0 }}>
                                {t.paymentInstructions}
                              </p>

                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">{t.transactionId} *</label>
                                <input 
                                  type="text" 
                                  required
                                  maxLength={12}
                                  placeholder="Enter 12-Digit Ref No"
                                  className="form-input" 
                                  value={paymentTxnId}
                                  onChange={(e) => setPaymentTxnId(e.target.value.replace(/[^0-9]/g, ''))}
                                />
                              </div>

                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Upload Real Screenshot (Optional)</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="form-input" 
                                  style={{ padding: "6px 10px", fontSize: "11px" }}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setUploadedScreenshot(reader.result);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </div>

                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Or Choose Mock Screenshot</label>
                                <select 
                                  value={selectedMockScreenshot}
                                  onChange={(e) => setSelectedMockScreenshot(e.target.value)}
                                  className="form-select"
                                  disabled={!!uploadedScreenshot}
                                >
                                  {sampleScreenshots.map(s => (
                                    <option key={s.id} value={s.url}>{s.name}</option>
                                  ))}
                                </select>
                                {uploadedScreenshot && (
                                  <span style={{ fontSize: "9px", color: "var(--success)", marginTop: "4px", fontWeight: "700" }}>
                                    ✓ Real screenshot loaded. Ready to submit!
                                  </span>
                                )}
                              </div>

                              <button 
                                onClick={() => handlePaymentSubmit(createdBooking.id)}
                                className="btn-primary" 
                                style={{ 
                                  width: "100%", 
                                  padding: "12px", 
                                  borderRadius: "12px", 
                                  fontWeight: "700",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  fontSize: "12px",
                                  boxShadow: "0 4px 12px rgba(230, 126, 34, 0.2)"
                                }}
                              >
                                {language === "hi" ? "भुगतान पूर्ण (जमा करें)" : language === "mr" ? "पेमेंट पूर्ण झाले (जमा करा)" : "Payment Completed (Submit)"}
                              </button>
                            </div>
                          </div>
                        );
                      }
                    })()}

                    {/* Booking Tracking View (if a booking is actively selected for tracking) */}
                    {trackingBookingId && trackingBookingId !== bookings.find(b => b.status === "created")?.id && (() => {
                      const booking = bookings.find(b => b.id === trackingBookingId);
                      if (!booking) return null;
                      
                      const timelineStages = [
                        { key: "created", title: t.stageCreated, desc: t.stageCreatedDesc, icon: <Plus size={14} /> },
                        { key: "submitted", title: t.stagePaid, desc: t.stagePaidDesc, icon: <Upload size={14} /> },
                        { key: "verification_pending", title: t.stagePending, desc: t.stagePendingDesc, icon: <Clock size={14} /> },
                        { key: "admin_review", title: t.stageAdmin, desc: t.stageAdminDesc, icon: <Search size={14} /> },
                        { key: "approved", title: t.stageApproved, desc: t.stageApprovedDesc, icon: <ShieldCheck size={14} /> },
                        { key: "scheduled", title: t.stageScheduled, desc: t.stageScheduledDesc, icon: <Calendar size={14} /> },
                        { key: "completed", title: t.stageCompleted, desc: t.stageCompletedDesc, icon: <CheckCircle size={14} /> }
                      ];

                      const getActiveStageIndex = (status) => {
                        const statusMap = {
                          "created": 0,
                          "submitted": 1,
                          "verification_pending": 2,
                          "admin_review": 3,
                          "approved": 4,
                          "scheduled": 5,
                          "completed": 6,
                          "cancelled": 0,
                          "rejected": 0
                        };
                        return statusMap[status] !== undefined ? statusMap[status] : 0;
                      };

                      const currentIdx = getActiveStageIndex(booking.status);

                      return (
                        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <button 
                              onClick={() => setTrackingBookingId(null)} 
                              className="btn-secondary" 
                              style={{ padding: "4px 8px", fontSize: "10px" }}
                            >
                              <ArrowLeft size={12} /> Back to List
                            </button>
                            <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                          </div>

                          <div className="premium-card">
                            <div style={{ fontSize: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "8px" }}>
                              <strong>{booking.id}</strong> | {booking.packageName} | ID: {booking.astrologerProfileId || currentUser?.profileId || "DEV-AST-00001"}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div><strong>Client:</strong> {booking.clientName} ({booking.clientMobile})</div>
                              <div><strong>Date:</strong> {formatDate(booking.date)}</div>
                              <div><strong>City:</strong> {booking.city}</div>
                              {booking.txnId && <div><strong>Txn ID:</strong> {booking.txnId}</div>}
                            </div>
                          </div>

                          {/* 7-Stage Timeline */}
                          <div className="premium-card">
                            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "12px", marginBottom: "12px" }}>
                              {t.trackingTitle}
                            </h4>
                            <div className="timeline">
                              {timelineStages.map((stage, idx) => {
                                const isCompleted = currentIdx > idx || (booking.status === "completed" && idx === 6);
                                const isActive = currentIdx === idx && booking.status !== "cancelled" && booking.status !== "rejected";
                                return (
                                  <div 
                                    key={stage.key} 
                                    className={`timeline-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                                  >
                                    <div className="timeline-dot">
                                      {isCompleted ? <Check size={14} /> : stage.icon}
                                    </div>
                                    <div className="timeline-content">
                                      <div className="timeline-title">{stage.title}</div>
                                      <div className="timeline-desc">{stage.desc}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Standard Bookings List View */}
                    {!trackingBookingId && (
                      <>
                        {/* Bookings Status Tabs */}
                        <div className="horizontal-chips">
                          {[
                            { key: "all", label: t.tabAll },
                            { key: "pending", label: t.tabPending },
                            { key: "approved", label: t.tabApproved },
                            { key: "completed", label: t.tabCompleted },
                            { key: "cancelled", label: t.tabCancelled }
                          ].map(tab => (
                            <button
                              key={tab.key}
                              onClick={() => setAstroBookingFilter(tab.key)}
                              className={`chip-btn ${astroBookingFilter === tab.key ? "active" : ""}`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {(() => {
                            const filteredAstroBookings = bookings.filter(b => {
                              if (astroBookingFilter === "all") return true;
                              if (astroBookingFilter === "pending") return ["created", "submitted", "verification_pending", "admin_review"].includes(b.status);
                              if (astroBookingFilter === "approved") return ["approved", "scheduled"].includes(b.status);
                              if (astroBookingFilter === "completed") return b.status === "completed";
                              if (astroBookingFilter === "cancelled") return ["cancelled", "rejected"].includes(b.status);
                              return true;
                            });

                            if (filteredAstroBookings.length === 0) {
                              return (
                                <div className="premium-card" style={{ textAlign: "center", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", borderRadius: "16px" }}>
                                  <svg viewBox="0 0 100 100" width="80" height="80" style={{ opacity: 0.8 }}>
                                    <path d="M50 20 C60 35 65 45 50 80 C35 45 40 35 50 20 Z" fill="var(--temple-gold)" />
                                    <path d="M50 40 C70 50 75 60 50 80 C25 60 30 50 50 40 Z" fill="var(--orange-accent)" opacity="0.8" />
                                    <circle cx="50" cy="80" r="4" fill="var(--primary-brown)" />
                                  </svg>
                                  <div>
                                    <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                                      {language === "hi" ? "कोई बुकिंग नहीं मिली" : language === "mr" ? "एकही बुकिंग आढळली नाही" : "No Bookings Found"}
                                    </h4>
                                    <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                                      {language === "hi" ? "आपके पास इस श्रेणी में कोई बुकिंग नहीं है।" : language === "mr" ? "तुम्च्याकडे या श्रेणीत एकही बुकिंग नाही." : "You do not have any bookings in this category yet."}
                                    </p>
                                  </div>
                                  <button 
                                    onClick={() => { setAstroTab("services"); setSelectedService(null); setIsBookingFlow(null); }}
                                    className="btn-primary"
                                    style={{ width: "100%", padding: "12px 20px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                  >
                                    <Sparkles size={16} /> {language === "hi" ? "पहली पूजा बुक करें" : language === "mr" ? "पहिली पूजा बुक करा" : "Book Your First Pooja"}
                                  </button>
                                </div>
                              );
                            }

                            return filteredAstroBookings.map(booking => {
                              const totalAmt = booking.amount || 0;
                              const advanceAmt = totalAmt * 0.2;
                              const astrologerName = booking.astrologerName || "Unassigned";

                              return (
                                <div 
                                  key={booking.id} 
                                  className="premium-card" 
                                  style={{ display: "flex", flexDirection: "column", gap: "12px", border: "2px solid var(--border-color)", padding: "20px", borderRadius: "16px" }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                      ID: {booking.id}
                                    </span>
                                    <span className={`status-badge ${booking.status}`} style={{ fontSize: "12px", padding: "4px 8px" }}>{booking.status}</span>
                                  </div>

                                  <h4 style={{ fontSize: "18px", fontFamily: "var(--font-heading)", color: "var(--text-main)", margin: "4px 0" }}>
                                    {booking.packageName}
                                  </h4>

                                  <div style={{ fontSize: "14px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <div>👤 <strong>Client:</strong> {booking.clientName} ({booking.clientMobile})</div>
                                    <div>📅 <strong>Date:</strong> {formatDate(booking.date)} | 📍 <strong>City:</strong> {booking.city}</div>
                                    <div>💰 <strong>Total Amount:</strong> ₹{totalAmt.toLocaleString()} (20% Advance: ₹{advanceAmt.toLocaleString()})</div>
                                    <div>🕉️ <strong>Assigned Pandit:</strong> {astrologerName}</div>
                                  </div>

                                  {/* Visual Progress Stepper timeline on Card */}
                                  <div className="md3-stepper">
                                    <div className="md3-step completed">
                                      <div className="md3-step-dot">1</div>
                                      <div className="md3-step-label">Created</div>
                                    </div>
                                    <div className={`md3-step ${['submitted', 'verification_pending', 'admin_review', 'approved', 'scheduled', 'completed'].includes(booking.status) ? 'completed' : ''} ${booking.status === 'created' ? 'active' : ''}`}>
                                      <div className="md3-step-dot">2</div>
                                      <div className="md3-step-label">Paid</div>
                                    </div>
                                    <div className={`md3-step ${['approved', 'scheduled', 'completed'].includes(booking.status) ? 'completed' : ''} ${['submitted', 'verification_pending', 'admin_review'].includes(booking.status) ? 'active' : ''}`}>
                                      <div className="md3-step-dot">3</div>
                                      <div className="md3-step-label">Verified</div>
                                    </div>
                                    <div className={`md3-step ${booking.status === 'completed' ? 'completed' : ''} ${['approved', 'scheduled'].includes(booking.status) ? 'active' : ''}`}>
                                      <div className="md3-step-dot">4</div>
                                      <div className="md3-step-label">Done</div>
                                    </div>
                                  </div>

                                  <button 
                                    onClick={() => setTrackingBookingId(booking.id)}
                                    className="btn-primary" 
                                    style={{ width: "100%", padding: "12px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px" }}
                                  >
                                    🔍 Track Booking Status Details
                                  </button>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* 4. SUPPORT CENTER SCREEN */}
              {astroTab === "support" && (
                <>
                  <div className="phone-nav-header">
                    <button 
                      onClick={() => setShowAstroMenu(true)} 
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      <span style={{ fontSize: "20px", color: "var(--text-main)" }}>☰</span>
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--success)" }}></div>
                      <div className="phone-nav-title">{t.supportTitle}</div>
                    </div>
                    {activeTicketId && (
                      <button 
                        onClick={() => setActiveTicketId(null)}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "10px", height: "24px" }}
                      >
                        Tickets
                      </button>
                    )}
                    <span style={{ fontSize: "10px", color: "var(--success)", fontWeight: "700" }}>{t.online}</span>
                  </div>

                  <div className="phone-screen-body" style={{ padding: activeTicketId ? 0 : "16px", gap: activeTicketId ? 0 : "12px", justifyContent: activeTicketId ? "space-between" : "flex-start", height: "calc(100% - 52px)", overflowY: "auto" }}>
                    
                    {!activeTicketId ? (
                      /* Ticket List View */
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h4 className="tickets-header">Support Tickets</h4>
                          <button 
                            onClick={() => setShowCreateTicketModal(true)}
                            className="btn-primary" 
                            style={{ padding: "6px 12px", fontSize: "11px" }}
                          >
                            New Ticket
                          </button>
                        </div>

                        {showCreateTicketModal && (
                          <div className="premium-card" style={{ borderColor: "var(--temple-gold)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                              <h5 style={{ fontSize: "12px", fontWeight: "800" }}>Create Support Ticket</h5>
                              <button 
                                onClick={() => setShowCreateTicketModal(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}
                              >
                                ✕
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Category</label>
                                <select 
                                  value={newTicketForm.category}
                                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                                  className="form-select"
                                  style={{ padding: "6px 10px", fontSize: "11px" }}
                                >
                                  <option value="Booking Issues">Booking Issues</option>
                                  <option value="Payment Issues">Payment Issues</option>
                                  <option value="Technical Support">Technical Support</option>
                                  <option value="General Queries">General Queries</option>
                                </select>
                              </div>

                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Describe Query</label>
                                <input 
                                  type="text"
                                  placeholder="What do you need help with?"
                                  value={newTicketForm.subject}
                                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                                  className="form-input"
                                  style={{ padding: "6px 10px", fontSize: "11px" }}
                                />
                              </div>

                              <button 
                                onClick={() => {
                                  if (!newTicketForm.subject.trim()) {
                                    alert("Please describe your query.");
                                    return;
                                  }
                                  const newId = "TK-" + Math.floor(1000 + Math.random() * 9000);
                                  const newTicket = {
                                    id: newId,
                                    category: newTicketForm.category,
                                    status: "Open",
                                    subject: newTicketForm.subject,
                                    lastUpdate: "Just now"
                                  };
                                  setTickets([newTicket, ...tickets]);
                                  
                                  // Send initial system message
                                  const systemMsg = {
                                    id: Date.now(),
                                    ticketId: newId,
                                    sender: "admin",
                                    text: `Namaste Shastri Ji, we have opened Ticket ${newId} for "${newTicketForm.category}". How can we assist you with: "${newTicketForm.subject}"?`,
                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    category: newTicketForm.category,
                                    read: true
                                  };
                                  setChats(prev => [...prev, systemMsg]);

                                  setActiveTicketId(newId);
                                  setShowCreateTicketModal(false);
                                  setNewTicketForm({ category: "General Queries", subject: "" });
                                }}
                                className="btn-primary"
                                style={{ width: "100%", padding: "8px", fontSize: "11px" }}
                              >
                                Open Ticket
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="tickets-container">
                          {tickets.map(ticket => (
                            <div 
                              key={ticket.id}
                              onClick={() => {
                                setActiveTicketId(ticket.id);
                                setAstroChatCategory(ticket.category);
                              }}
                              className={`ticket-item ${activeTicketId === ticket.id ? "active" : ""}`}
                            >
                              <div>
                                <span className="ticket-id">{ticket.id}</span>
                                <div style={{ fontSize: "11px", fontWeight: "700", marginTop: "2px" }}>{ticket.subject}</div>
                                <div className="ticket-meta">{ticket.category} • Updated {ticket.lastUpdate} • ID: {currentUser?.profileId || "DEV-AST-00001"}</div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                                <span className={`status-badge ${ticket.status === "Open" ? "submitted" : "completed"}`} style={{ fontSize: "8px", padding: "2px 6px" }}>
                                  {ticket.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* AI Assistant Coming Soon Banner */}
                        <div style={{
                          padding: "16px",
                          borderRadius: "12px",
                          border: "1px dashed var(--temple-gold)",
                          backgroundColor: "rgba(212,175,55,0.04)",
                          textAlign: "center",
                          marginTop: "auto"
                        }}>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--temple-gold)", marginBottom: "4px" }}>
                            🕉️ Devsetu AI Assistant
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            AI Assistant Coming Soon
                          </p>
                          <span style={{ display: "inline-block", marginTop: "8px", fontSize: "8px", padding: "2px 8px", backgroundColor: "var(--temple-gold)", color: "var(--primary-brown)", borderRadius: "10px", fontWeight: "800" }}>
                            UNDER DEVELOPMENT
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Live Chat view for Selected Ticket */
                      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", justifyContent: "space-between" }}>
                        {/* Ticket Topic Banner */}
                        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--warm-cream-darker)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--temple-gold)" }}>{activeTicketId} | ID: {currentUser?.profileId || "DEV-AST-00001"}</span>
                            <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-main)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {tickets.find(tk => tk.id === activeTicketId)?.subject}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              // Resolve ticket mock action
                              setTickets(prev => prev.map(tk => {
                                if (tk.id === activeTicketId) {
                                  return { ...tk, status: "Resolved" };
                                }
                                return tk;
                              }));
                              setActiveTicketId(null);
                            }}
                            className="btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "9px", height: "22px", borderColor: "rgba(46, 125, 50, 0.2)", color: "var(--success)" }}
                          >
                            Resolve
                          </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="chat-messages" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "12px", gap: "10px" }}>
                          {chats.filter(msg => msg.ticketId === activeTicketId).map(msg => (
                            <div key={msg.id} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                              <div className={`chat-bubble ${msg.sender === "astrologer" ? "sent" : "received"}`}>
                                {msg.text}
                                {msg.attachment && (
                                  <div className="attachment-badge">
                                    <span>📎 {msg.attachment.name}</span>
                                    {msg.attachment.type === "image" && (
                                      <div style={{ marginTop: "4px" }}>
                                        {msg.attachment.url === "gpay" && (
                                          <div style={{ padding: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #1A73E8, #0D47A1)", color: "white", fontSize: "10px", textAlign: "center" }}>GPay Success Receipt</div>
                                        )}
                                        {msg.attachment.url === "phonepe" && (
                                          <div style={{ padding: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #5F259F, #3F1B6B)", color: "white", fontSize: "10px", textAlign: "center" }}>PhonePe Success Receipt</div>
                                        )}
                                        {msg.attachment.url === "paytm" && (
                                          <div style={{ padding: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #00B9F5, #FFF)", color: "#002970", border: "1px solid #ddd", fontSize: "10px", textAlign: "center" }}>Paytm Success Receipt</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div className={`chat-meta ${msg.sender === "admin" ? "received" : ""}`}>
                                  {msg.timestamp} {msg.sender === "astrologer" && "✓✓"}
                                </div>
                              </div>
                            </div>
                          ))}

                          {adminTyping && (
                            <div className="typing-indicator">
                              <div className="typing-dot"></div>
                              <div className="typing-dot"></div>
                              <div className="typing-dot"></div>
                            </div>
                          )}
                        </div>

                        {/* File Upload / Attachment preview container */}
                        {attachedFile && (
                          <div className="chat-attachment-preview-box">
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              📄 {attachedFile.name} ({attachedFile.type === "image" ? "Image" : "Document"})
                            </span>
                            <button 
                              onClick={() => setAttachedFile(null)}
                              style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", fontWeight: "800" }}
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {/* Chat Input Console with Attachment button */}
                        <div className="chat-input-area" style={{ borderTop: "1px solid var(--border-color)", padding: "8px 12px" }}>
                          {/* Attachment Paperclip Button */}
                          <button 
                            type="button"
                            onClick={() => {
                              // Trigger mock file upload selection
                              const mockFiles = [
                                { name: "payment_receipt.png", type: "image", url: "phonepe" },
                                { name: "gpay_screenshot.jpg", type: "image", url: "gpay" },
                                { name: "kundali_chart.pdf", type: "file", url: "" }
                              ];
                              const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
                              setAttachedFile(randomFile);
                            }}
                            className="chat-attachment-btn"
                            title="Attach File/Image"
                          >
                            📎
                          </button>
                          
                          <input 
                            type="text" 
                            placeholder={t.chatPlaceholder} 
                            className="form-input" 
                            style={{ flex: 1, borderRadius: "20px", fontSize: "11px", padding: "6px 14px", height: "34px" }}
                            value={astroChatMsg}
                            onChange={(e) => setAstroChatMsg(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAstroSendMessage(attachedFile)}
                          />
                          <button 
                            onClick={() => handleAstroSendMessage(attachedFile)}
                            className="btn-primary" 
                            style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0 }}
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 5. PROFILE SCREEN */}
              {astroTab === "profile" && (
                <>
                  <div className="phone-nav-header">
                    <button 
                      onClick={() => setShowAstroMenu(true)} 
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      <span style={{ fontSize: "20px", color: "var(--text-main)" }}>☰</span>
                    </button>
                    <div className="phone-nav-title">{t.profileTitle}</div>
                    <Settings size={18} color="var(--text-muted)" />
                  </div>

                  <div className="phone-screen-body">
                    {/* User Summary Header */}
                        <div className="premium-card" style={{ display: "flex", gap: "12px", alignItems: "center", borderRadius: "16px", border: "2px solid var(--temple-gold)" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "var(--warm-cream-darker)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", border: "2px solid var(--temple-gold)" }}>
                            🧘
                          </div>
                          <div>
                            <h4 style={{ fontSize: "16px", fontFamily: "var(--font-heading)" }}>{currentUser?.name || "Acharya Shastri"}</h4>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>ID: {currentUser?.profileId || "DEV-AST-00001"}</p>
                            <p style={{ fontSize: "12px", color: "var(--orange-accent)", fontWeight: "800" }}>⭐ 4.95 Rating (Platinum Partner)</p>
                          </div>
                        </div>

                        {/* Accordion 1: Personal & Professional Details */}
                        <div className="premium-card" style={{ padding: 0, overflow: "hidden", borderRadius: "16px" }}>
                          <div 
                            onClick={() => setProfileAccordion(profileAccordion === "personal" ? "" : "personal")}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", cursor: "pointer", backgroundColor: "var(--warm-cream-darker)", borderBottom: profileAccordion === "personal" ? "1px solid var(--border-color)" : "none" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "800" }}>
                              <span>🧘</span>
                              <span>Personal & Professional Details</span>
                            </div>
                            <span style={{ transform: profileAccordion === "personal" ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▶</span>
                          </div>
                          {profileAccordion === "personal" && (
                            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                              <div style={{ fontSize: "14px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px" }}>
                                <strong>Name:</strong> <span>{currentUser?.name || "Acharya Shastri"}</span>
                                <strong>Profile ID:</strong> <span>{currentUser?.profileId || "DEV-AST-00001"}</span>
                                <strong>Email:</strong> <span>{currentUser?.email || "Not Provided"}</span>
                                <strong>Mobile:</strong> <span>{currentUser?.phone || "+91 91234 56789"}</span>
                                <strong>State:</strong> <span>{currentUser?.state || "Uttar Pradesh"}</span>
                                <strong>District:</strong> <span>{currentUser?.district || "Not Provided"}</span>
                                <strong>City:</strong> <span>{currentUser?.city || "Varanasi"}</span>
                                <strong>Specialization:</strong> <span>{currentUser?.specialization || "Vedic Pooja"}</span>
                                <strong>Experience:</strong> <span>{currentUser?.experience || "15 Years"}</span>
                                <strong>Status:</strong> <span style={{ color: "var(--success)", fontWeight: "700" }}>Verified & Active</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Accordion 2: Application Settings */}
                        <div className="premium-card" style={{ padding: 0, overflow: "hidden", borderRadius: "16px" }}>
                          <div 
                            onClick={() => setProfileAccordion(profileAccordion === "app" ? "" : "app")}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", cursor: "pointer", backgroundColor: "var(--warm-cream-darker)", borderBottom: profileAccordion === "app" ? "1px solid var(--border-color)" : "none" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "800" }}>
                              <span>⚙️</span>
                              <span>Application Settings</span>
                            </div>
                            <span style={{ transform: profileAccordion === "app" ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▶</span>
                          </div>
                          {profileAccordion === "app" && (
                            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                              {/* Language */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "14px", fontWeight: "700" }}>Language</span>
                                <select 
                                  value={language}
                                  onChange={(e) => setLanguage(e.target.value)}
                                  className="form-select"
                                  style={{ padding: "6px 12px", fontSize: "13px" }}
                                >
                                  <option value="en">English</option>
                                  <option value="hi">हिंदी</option>
                                  <option value="mr">मराठी</option>
                                </select>
                              </div>

                              {/* Theme */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "14px", fontWeight: "700" }}>Theme</span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button 
                                    type="button"
                                    onClick={() => setTheme("light")} 
                                    className="btn-secondary"
                                    style={{ 
                                      fontSize: "12px", 
                                      padding: "6px 12px",
                                      backgroundColor: theme === "light" ? "var(--primary-brown)" : "transparent",
                                      color: theme === "light" ? "var(--warm-cream)" : "var(--text-main)",
                                    }}
                                  >
                                    Light
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setTheme("dark")} 
                                    className="btn-secondary"
                                    style={{ 
                                      fontSize: "12px", 
                                      padding: "6px 12px",
                                      backgroundColor: theme === "dark" ? "var(--primary-brown)" : "transparent",
                                      color: theme === "dark" ? "var(--warm-cream)" : "var(--text-main)",
                                    }}
                                  >
                                    Dark
                                  </button>
                                </div>
                              </div>

                              {/* Accessibility Mode Toggle */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "14px", fontWeight: "700" }}>♿ Accessibility Mode (+4px Font Size)</span>
                                <label className="toggle-switch">
                                  <input 
                                    type="checkbox" 
                                    checked={isAccessibilityMode}
                                    onChange={(e) => setIsAccessibilityMode(e.target.checked)}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Accordion 3: Notification Settings */}
                        <div className="premium-card" style={{ padding: 0, overflow: "hidden", borderRadius: "16px" }}>
                          <div 
                            onClick={() => setProfileAccordion(profileAccordion === "notifications" ? "" : "notifications")}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", cursor: "pointer", backgroundColor: "var(--warm-cream-darker)", borderBottom: profileAccordion === "notifications" ? "1px solid var(--border-color)" : "none" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "800" }}>
                              <span>🔔</span>
                              <span>Notification Preferences</span>
                            </div>
                            <span style={{ transform: profileAccordion === "notifications" ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▶</span>
                          </div>
                          {profileAccordion === "notifications" && (
                            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                              <div className="pref-switch-group">
                                <div className="pref-switch-label">
                                  <span className="pref-switch-title">Email Notifications</span>
                                  <span className="pref-switch-desc">Receive transaction invoices & records</span>
                                </div>
                                <label className="pref-toggle-container">
                                  <input 
                                    type="checkbox" 
                                    className="pref-toggle-input" 
                                    checked={prefEmail} 
                                    onChange={(e) => setPrefEmail(e.target.checked)} 
                                  />
                                  <span className="pref-toggle-slider"></span>
                                </label>
                              </div>

                              <div className="pref-switch-group">
                                <div className="pref-switch-label">
                                  <span className="pref-switch-title">Push Notifications</span>
                                  <span className="pref-switch-desc">Enable real-time foreground alerts</span>
                                </div>
                                <label className="pref-toggle-container">
                                  <input 
                                    type="checkbox" 
                                    className="pref-toggle-input" 
                                    checked={prefPush} 
                                    onChange={(e) => setPrefPush(e.target.checked)} 
                                  />
                                  <span className="pref-toggle-slider"></span>
                                </label>
                              </div>

                              <div className="pref-switch-group">
                                <div className="pref-switch-label">
                                  <span className="pref-switch-title">SMS Notifications (Future)</span>
                                  <span className="pref-switch-desc">Receive alerts on mobile carrier</span>
                                </div>
                                <label className="pref-toggle-container">
                                  <input 
                                    type="checkbox" 
                                    className="pref-toggle-input" 
                                    checked={prefSms} 
                                    onChange={(e) => setPrefSms(e.target.checked)} 
                                  />
                                  <span className="pref-toggle-slider"></span>
                                </label>
                              </div>

                              <div className="pref-switch-group">
                                <div className="pref-switch-label">
                                  <span className="pref-switch-title">Booking Notifications</span>
                                  <span className="pref-switch-desc">Receive alerts on new booking updates</span>
                                </div>
                                <label className="pref-toggle-container">
                                  <input 
                                    type="checkbox" 
                                    className="pref-toggle-input" 
                                    checked={prefBooking} 
                                    onChange={(e) => setPrefBooking(e.target.checked)} 
                                  />
                                  <span className="pref-toggle-slider"></span>
                                </label>
                              </div>

                              <div className="pref-switch-group">
                                <div className="pref-switch-label">
                                  <span className="pref-switch-title">Membership Notifications</span>
                                  <span className="pref-switch-desc">Receive reminders & activations</span>
                                </div>
                                <label className="pref-toggle-container">
                                  <input 
                                    type="checkbox" 
                                    className="pref-toggle-input" 
                                    checked={prefMembership} 
                                    onChange={(e) => setPrefMembership(e.target.checked)} 
                                  />
                                  <span className="pref-toggle-slider"></span>
                                </label>
                              </div>

                              <div className="pref-switch-group">
                                <div className="pref-switch-label">
                                  <span className="pref-switch-title">Chat Notifications</span>
                                  <span className="pref-switch-desc">Receive messages from Administrator</span>
                                </div>
                                <label className="pref-toggle-container">
                                  <input 
                                    type="checkbox" 
                                    className="pref-toggle-input" 
                                    checked={prefChat} 
                                    onChange={(e) => setPrefChat(e.target.checked)} 
                                  />
                                  <span className="pref-toggle-slider"></span>
                                </label>
                              </div>

                              <button 
                                onClick={savePreferences} 
                                className="btn-primary" 
                                style={{ width: "100%", padding: "12px", fontSize: "14px", marginTop: "10px" }}
                              >
                                Save Settings
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Accordion 4: Legal & About */}
                        <div className="premium-card" style={{ padding: 0, overflow: "hidden", borderRadius: "16px" }}>
                          <div 
                            onClick={() => setProfileAccordion(profileAccordion === "legal" ? "" : "legal")}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", cursor: "pointer", backgroundColor: "var(--warm-cream-darker)", borderBottom: profileAccordion === "legal" ? "1px solid var(--border-color)" : "none" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "800" }}>
                              <span>🛡️</span>
                              <span>Legal & About Information</span>
                            </div>
                            <span style={{ transform: profileAccordion === "legal" ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▶</span>
                          </div>
                          {profileAccordion === "legal" && (
                            <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column" }}>
                              <div onClick={() => setShowAboutModal(true)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-color)", cursor: "pointer", fontSize: "13px" }}>
                                <span>ℹ️ About & Version</span>
                                <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>v1.0.0</span>
                              </div>
                              <div onClick={() => setShowPrivacyModal(true)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-color)", cursor: "pointer", fontSize: "13px" }}>
                                <span>🛡️ Privacy Policy</span>
                                <span>▶</span>
                              </div>
                              <div onClick={() => setShowTermsModal(true)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-color)", cursor: "pointer", fontSize: "13px" }}>
                                <span>📄 Terms & Conditions</span>
                                <span>▶</span>
                              </div>
                              <div onClick={() => setShowContactModal(true)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", cursor: "pointer", fontSize: "13px" }}>
                                <span>📞 Contact Support Info</span>
                                <span>▶</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Accordion 5: Login PIN Info */}
                        <div className="premium-card" style={{ padding: 0, overflow: "hidden", borderRadius: "16px" }}>
                          <div 
                            onClick={() => setProfileAccordion(profileAccordion === "pin" ? "" : "pin")}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", cursor: "pointer", backgroundColor: "var(--warm-cream-darker)", borderBottom: profileAccordion === "pin" ? "1px solid var(--border-color)" : "none" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "800" }}>
                              <span>🔑</span>
                              <span>Login PIN Information</span>
                            </div>
                            <span style={{ transform: profileAccordion === "pin" ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▶</span>
                          </div>
                          {profileAccordion === "pin" && (
                            <div style={{ padding: "16px", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                              Your account is secured using a 6-digit Login PIN. To request a PIN reset, please contact the DEVSETU Support/Admin desk.
                            </div>
                          )}
                        </div>

                        {/* Logout Button */}
                        <button 
                          type="button"
                          className="btn-secondary" 
                          style={{ color: "var(--error)", borderColor: "rgba(198,40,40,0.3)", width: "100%", padding: "14px", borderRadius: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px", fontWeight: "800", marginTop: "16px" }}
                          onClick={() => {
                            setCurrentUser(null);
                            localStorage.removeItem("devsetu_user");
                            setIsLoggedIn(false);
                            setIsSplash(false);
                          }}
                        >
                          <LogOut size={18} />
                          {t.logout}
                        </button>
                      </div>
                    </>
                  )}

              {/* 6. HELP & GUIDE SCREEN */}
              {astroTab === "help" && (
                <>
                  <div className="phone-nav-header">
                    <button 
                      onClick={() => setShowAstroMenu(true)} 
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      <span style={{ fontSize: "20px", color: "var(--text-main)" }}>☰</span>
                    </button>
                    <div className="phone-nav-title">Help & Guide</div>
                    <HelpCircle size={18} color="var(--text-muted)" />
                  </div>
                  
                  <div className="phone-screen-body" style={{ display: "flex", flexDirection: "column", gap: "14px", height: "calc(100% - 52px)", overflowY: "auto" }}>
                    <div style={{
                      padding: "16px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.02))",
                      border: "1px solid var(--temple-gold)"
                    }}>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", margin: "0 0 6px 0" }}>Namaste Shastri Ji</h4>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                        Welcome to the DEVSETU Partner Support System. Find quick answers to common queries below or connect directly with our support team.
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="premium-card" style={{ padding: "12px" }}>
                        <h5 style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 4px 0" }}>🔑 How to reset my PIN?</h5>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                          Click 'Forgot PIN' on the sign-in screen, submit your details, copy the generated template, and WhatsApp/SMS it to Devsetu Administration.
                        </p>
                      </div>

                      <div className="premium-card" style={{ padding: "12px" }}>
                        <h5 style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 4px 0" }}>💰 How to get bookings approved?</h5>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                          Once a booking is created, copy the payment QR, pay the 20% advance amount, and submit the 12-digit transaction UTR number with a screenshot.
                        </p>
                      </div>

                      <div className="premium-card" style={{ padding: "12px" }}>
                        <h5 style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 4px 0" }}>🕉️ Platform Service Fee</h5>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                          Devsetu charges a flat 10% platform commission on completed rituals, which covers SMS delivery, cloud servers, and payment gateway costs.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setAstroTab("support")} 
                      className="btn-primary"
                      style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "auto" }}
                    >
                      <MessageSquare size={16} /> Open Support Chat
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Slide-out Drawer for Astrologer Menu */}
          {showAstroMenu && (
            <div 
              className="fade-in"
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 2500,
                display: "flex",
                borderRadius: "24px",
                overflow: "hidden"
              }}
              onClick={() => setShowAstroMenu(false)}
            >
              <div 
                style={{
                  width: "240px",
                  height: "100%",
                  backgroundColor: "var(--phone-card-bg)",
                  borderRight: "1px solid var(--temple-gold)",
                  display: "flex",
                  flexDirection: "column",
                  padding: "20px 16px",
                  gap: "20px",
                  boxShadow: "var(--shadow-lg)"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>🔮</span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--primary-brown)" }}>DEVSETU</div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600" }}>Astrologer Portal</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowAstroMenu(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  <button 
                    onClick={() => { setAstroTab("home"); setTrackingBookingId(null); setShowAstroMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: astroTab === "home" ? "rgba(212,175,55,0.1)" : "transparent",
                      color: astroTab === "home" ? "var(--temple-gold)" : "var(--text-main)",
                      fontWeight: "700",
                      fontSize: "12px",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    <Home size={16} /> Home
                  </button>

                  <button 
                    onClick={() => { setAstroTab("profile"); setShowAstroMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: astroTab === "profile" ? "rgba(212,175,55,0.1)" : "transparent",
                      color: astroTab === "profile" ? "var(--temple-gold)" : "var(--text-main)",
                      fontWeight: "700",
                      fontSize: "12px",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    <User size={16} /> My Profile
                  </button>

                  <button 
                    onClick={() => { setAstroTab("services"); setSelectedService(null); setIsBookingFlow(null); setShowAstroMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: astroTab === "services" ? "rgba(212,175,55,0.1)" : "transparent",
                      color: astroTab === "services" ? "var(--temple-gold)" : "var(--text-main)",
                      fontWeight: "700",
                      fontSize: "12px",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    <BookOpen size={16} /> Book Pooja
                  </button>

                  <button 
                    onClick={() => { setAstroTab("bookings"); setTrackingBookingId(null); setShowAstroMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: astroTab === "bookings" ? "rgba(212,175,55,0.1)" : "transparent",
                      color: astroTab === "bookings" ? "var(--temple-gold)" : "var(--text-main)",
                      fontWeight: "700",
                      fontSize: "12px",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    <Calendar size={16} /> Bookings
                  </button>

                  <button 
                    onClick={() => { setAstroTab("support"); setShowAstroMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: astroTab === "support" ? "rgba(212,175,55,0.1)" : "transparent",
                      color: astroTab === "support" ? "var(--temple-gold)" : "var(--text-main)",
                      fontWeight: "700",
                      fontSize: "12px",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    <MessageSquare size={16} /> Support
                  </button>

                  <button 
                    onClick={() => { setAstroTab("help"); setShowAstroMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: astroTab === "help" ? "rgba(212,175,55,0.1)" : "transparent",
                      color: astroTab === "help" ? "var(--temple-gold)" : "var(--text-main)",
                      fontWeight: "700",
                      fontSize: "12px",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    <HelpCircle size={16} /> Help & Guide
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    localStorage.removeItem("devsetu_user");
                    setIsLoggedIn(false);
                    setShowAstroMenu(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--error)",
                    fontWeight: "700",
                    fontSize: "12px",
                    textAlign: "left",
                    cursor: "pointer",
                    width: "100%",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "12px"
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}

          {/* Forgot PIN Modal for Astrologer */}
          {showForgotPinModal && (
            <div 
              className="fade-in"
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3000,
                padding: "16px",
                borderRadius: "24px"
              }}
            >
              <div 
                className="premium-card" 
                style={{
                  backgroundColor: "var(--phone-card-bg)",
                  border: "1px solid var(--temple-gold)",
                  width: "100%",
                  maxHeight: "90%",
                  overflowY: "auto",
                  padding: "20px",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  boxShadow: "var(--shadow-lg)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", margin: 0, color: "var(--primary-brown)" }}>Forgot Login PIN</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotPinModal(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                  >
                    ✕
                  </button>
                </div>

                {!forgotPinResponse ? (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!forgotPinProfileId || !forgotPinMobile) {
                        setForgotPinError("Please enter Profile ID and Mobile Number.");
                        return;
                      }
                      setForgotPinSubmitting(true);
                      setForgotPinError(null);
                      try {
                        const res = await fetch(`${API_BASE}/api/auth/forgot-pin/request`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ profileId: forgotPinProfileId, mobile: forgotPinMobile })
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setForgotPinError(data.error || "Failed to submit request.");
                        } else {
                          setForgotPinResponse(data.request || data);
                        }
                      } catch (err) {
                        setForgotPinError("Network error occurred.");
                      } finally {
                        setForgotPinSubmitting(false);
                      }
                    }}
                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                  >
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                      Submit your registered Profile ID and Mobile Number. A manual reset request will be dispatched to Devsetu Administration.
                    </p>

                    {forgotPinError && (
                      <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(198, 40, 40, 0.05)", border: "1px solid var(--error)", fontSize: "11px", color: "var(--error)" }}>
                        {forgotPinError}
                      </div>
                    )}

                    <div className="minimal-input-wrapper">
                      <span className="minimal-input-icon">👤</span>
                      <input 
                        type="text"
                        required
                        placeholder="Profile ID (e.g. DEV-AST-000001)"
                        className="minimal-input"
                        value={forgotPinProfileId}
                        onChange={(e) => setForgotPinProfileId(e.target.value.trim().toUpperCase())}
                      />
                    </div>

                    <div className="minimal-input-wrapper">
                      <span className="minimal-input-icon">📱</span>
                      <input 
                        type="tel"
                        required
                        placeholder="Registered Mobile Number"
                        className="minimal-input"
                        value={forgotPinMobile}
                        onChange={(e) => setForgotPinMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={forgotPinSubmitting} 
                      className="btn-primary" 
                      style={{ width: "100%", padding: "10px", marginTop: "6px" }}
                    >
                      {forgotPinSubmitting ? "Submitting..." : "Submit Reset Request"}
                    </button>
                  </form>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(46, 125, 50, 0.05)", border: "1px solid var(--success)", color: "var(--success)", fontSize: "11px", textAlign: "center" }}>
                      ✓ Request Submitted Successfully to Administrator
                    </div>

                    <div style={{
                      backgroundColor: "rgba(43, 27, 18, 0.03)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      padding: "10px",
                      fontSize: "11px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}>
                      <div><strong>Request ID:</strong> <span style={{ fontFamily: "monospace" }}>{forgotPinResponse.id || "REQ-XXXX"}</span></div>
                      <div><strong>Date:</strong> {formatDate(forgotPinResponse.requestDate || new Date())}</div>
                      <div><strong>Status:</strong> <span style={{ color: "var(--warning)", fontWeight: "800" }}>{forgotPinResponse.status || "pending"}</span></div>
                    </div>

                    <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                      Copy the template below and send it to Devsetu Administration via WhatsApp or SMS for faster verification:
                    </p>

                    <div style={{
                      backgroundColor: "var(--bg-app)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      padding: "10px",
                      fontFamily: "monospace",
                      fontSize: "10px",
                      whiteSpace: "pre-wrap",
                      color: "var(--text-main)",
                      lineHeight: "1.3"
                    }}>
                      {`Namaste Devsetu Admin, I have submitted a PIN Reset Request. Details:
- ID: ${forgotPinResponse.id}
- Profile ID: ${forgotPinResponse.profileId}
- Mobile: ${forgotPinResponse.phone}
Please generate a temporary PIN. Thank you.`}
                    </div>

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        const text = `Namaste Devsetu Admin, I have submitted a PIN Reset Request. Details:\n- ID: ${forgotPinResponse.id}\n- Profile ID: ${forgotPinResponse.profileId}\n- Mobile: ${forgotPinResponse.phone}\nPlease generate a temporary PIN. Thank you.`;
                        navigator.clipboard.writeText(text);
                        alert("Request template copied to clipboard!");
                      }}
                      style={{ width: "100%", padding: "10px" }}
                    >
                      Copy Request Template
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowForgotPinModal(false)}
                      style={{ width: "100%", padding: "10px" }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

            {/* Bottom Navigation Menu */}
            {isLoggedIn && (
              <nav className="phone-bottom-nav">
                <button onClick={() => { setAstroTab("home"); setTrackingBookingId(null); }} className={`phone-nav-item ${astroTab === "home" ? "active" : ""}`}>
                  <Home />
                  <span>{t.navHome}</span>
                </button>
                
                <button onClick={() => { setAstroTab("services"); setSelectedService(null); setIsBookingFlow(null); }} className={`phone-nav-item ${astroTab === "services" ? "active" : ""}`}>
                  <BookOpen />
                  <span>{t.navServices}</span>
                </button>
                
                <button onClick={() => { setAstroTab("bookings"); setTrackingBookingId(null); }} className={`phone-nav-item ${astroTab === "bookings" ? "active" : ""}`}>
                  <Calendar />
                  <span>{t.navBookings}</span>
                </button>
                
                <button onClick={() => { setAstroTab("support"); }} className={`phone-nav-item ${astroTab === "support" ? "active" : ""}`}>
                  <MessageSquare />
                  <span>{t.navSupport}</span>
                </button>
                
                <button onClick={() => { setAstroTab("profile"); }} className={`phone-nav-item ${astroTab === "profile" ? "active" : ""}`}>
                  <User />
                  <span>{t.navProfile}</span>
                </button>
              </nav>
            )}
          </div>
        </section>

        {/* =========================================================================
            ADMIN DASHBOARD COLUMN (Right Panel)
            ========================================================================= */}
        <section className="dashboard-column">
          {!isAdminLoggedIn ? (
            /* ADMIN LOGIN PORTAL */
            <div className="fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", padding: "40px", backgroundColor: "var(--warm-cream)" }}>
              <div className="premium-card" style={{ display: "flex", flexDirection: "row", width: "100%", maxWidth: "800px", padding: 0, overflow: "hidden", minHeight: "450px" }}>
                {/* Left Visual Branding */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px", background: "linear-gradient(135deg, var(--primary-brown), var(--secondary-brown))", color: "#fff8f0", width: "40%", position: "relative" }} className="admin-login-visual">
                  <div className="bg-drift-pattern" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}></div>
                  <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, padding: "20px" }}>
                    <img 
                      src="/devsetu_dark_logo.png"
                      alt="DevSetu Logo" 
                      style={{ maxWidth: "160px", height: "auto", objectFit: "contain" }}
                    />
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "20px", position: "relative", zIndex: 2 }}>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", color: "var(--temple-gold)", margin: 0 }}>DEVSETU</h2>
                    <p style={{ fontSize: "10px", margin: "4px 0 0 0", color: "#e8e2d9", opacity: 0.9 }}>Administrative Portal</p>
                    <p style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1px", margin: "8px 0 0 0", color: "#dfd9d0" }}>Connecting Astrologers to Spiritual Solutions</p>
                  </div>
                </div>
                
                 {/* Right Form */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const payload = {
                      loginFormType: adminLoginFormType,
                      email: adminLoginFormType === "email" ? adminUsername : "",
                      phone: adminLoginFormType === "mobile" ? adminUsername : "",
                      password: adminPassword,
                      role: "admin"
                    };
                    const res = await fetch(`${API_BASE}/api/auth/login`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      alert(data.error || "Admin authentication failed.");
                      return;
                    }
                    if (data.user.role !== "admin") {
                      alert("Access denied. Admin privileges required.");
                      return;
                    }
                    setAdminUser(data.user);
                    localStorage.setItem("devsetu_admin_user", JSON.stringify(data.user));
                    setIsAdminLoggedIn(true);
                  } catch (err) {
                    alert("Network error during admin authentication.");
                  }
                }} style={{ padding: "40px", width: "60%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", color: "var(--text-main)", marginBottom: "4px" }}>
                      {localTranslations[language]?.adminSecureLogin || localTranslations.en.adminSecureLogin}
                    </h2>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {localTranslations[language]?.adminSubtitle || localTranslations.en.adminSubtitle}
                    </p>
                  </div>

                  <div className="login-tabs" style={{ marginBottom: "8px" }}>
                    <button 
                      type="button"
                      onClick={() => { setAdminLoginFormType("email"); setAdminUsername(""); }}
                      className={`login-tab-btn ${adminLoginFormType === "email" ? "active" : ""}`}
                    >
                      Email
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setAdminLoginFormType("mobile"); setAdminUsername(""); }}
                      className={`login-tab-btn ${adminLoginFormType === "mobile" ? "active" : ""}`}
                    >
                      Mobile
                    </button>
                  </div>

                  {adminLoginFormType === "email" ? (
                    <div className="minimal-input-wrapper">
                      <span className="minimal-input-icon">📧</span>
                      <input 
                        type="email" 
                        required
                        placeholder="Admin Email Address" 
                        className="minimal-input"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="minimal-input-wrapper">
                      <span className="minimal-input-icon">📱</span>
                      <input 
                        type="tel" 
                        required
                        placeholder="Admin Mobile Number" 
                        className="minimal-input"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>
                  )}

                  <div className="minimal-input-wrapper">
                    <span className="minimal-input-icon">🔒</span>
                    <input 
                      type={adminShowPassword ? "text" : "password"} 
                      required
                      maxLength={6}
                      placeholder="6-Digit Admin PIN" 
                      className="minimal-input"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value.replace(/[^0-9]/g, ''))}
                      style={{ paddingRight: "36px" }}
                    />
                    <button 
                      type="button"
                      onClick={() => setAdminShowPassword(!adminShowPassword)}
                      style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--text-muted)" }}
                    >
                      {adminShowPassword ? "👁️" : "🙈"}
                    </button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input type="checkbox" style={{ accentColor: "var(--temple-gold)" }} />
                      <span>Remember me</span>
                    </label>
                    <a href="#" style={{ color: "var(--temple-gold)", textDecoration: "none", fontWeight: "700" }} onClick={(e) => {
                      e.preventDefault();
                      setSimulatorView("mobile");
                      setForgotStep(1);
                      setForgotEmail("devsetuconnect@gmail.com");
                    }}>
                      Forgot password?
                    </a>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: "100%", marginTop: "8px", padding: "12px" }}
                  >
                    {localTranslations[language]?.adminAuthBtn || localTranslations.en.adminAuthBtn} ➔
                  </button>

                  <div style={{ textAlign: "center", marginTop: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      🛡️ {localTranslations[language]?.adminSecureConn || localTranslations.en.adminSecureConn}
                    </span>
                    <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                      {localTranslations[language]?.adminAuthOnly || localTranslations.en.adminAuthOnly} <a href="#" style={{ color: "var(--temple-gold)", textDecoration: "underline" }} onClick={(e) => e.preventDefault()}>{localTranslations[language]?.adminContactSupport || localTranslations.en.adminContactSupport}</a>
                    </p>
                  </div>

                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <button 
                      type="button"
                      onClick={() => { setActiveRoleSelection(null); }}
                      className="back-to-selection-link"
                    >
                      ← Back to Selection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Admin Navigation Bar */}
              <div className="admin-navbar">
                <div className="admin-nav-title">
                  <img 
                    src={theme === "light" 
                      ? "/devsetu_light_logo.png" 
                      : "/devsetu_dark_logo.png"}
                    alt="DevSetu Logo" 
                    style={{ height: "30px", width: "auto" }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: "700", marginLeft: "8px", fontFamily: "var(--font-heading)" }}>Control Hub</span>
                </div>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", fontWeight: "800" }}>System Administrator</div>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                      <span style={{ fontSize: "9px", color: "var(--success)", fontWeight: "700" }}>● Active</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setAdminUser(null);
                          localStorage.removeItem("devsetu_admin_user");
                          setIsAdminLoggedIn(false);
                        }}
                        style={{ background: "none", border: "none", color: "var(--error)", fontSize: "9px", fontWeight: "700", cursor: "pointer", padding: 0 }}
                      >
                        Log Out
                      </button>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>|</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowAdminSecurityModal(true);
                          setAdminSecurityError(null);
                          setAdminCurrentPassword("");
                          setAdminNewPassword("");
                          setAdminConfirmPassword("");
                        }}
                        style={{ background: "none", border: "none", color: "var(--primary-brown)", fontSize: "9px", fontWeight: "700", cursor: "pointer", padding: 0 }}
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--primary-brown)", display: "flex", alignItems: "center", justifycontent: "center", color: "var(--temple-gold)", cursor: "pointer" }} onClick={() => {
                    setShowAdminSecurityModal(true);
                    setAdminSecurityError(null);
                    setAdminCurrentPassword("");
                    setAdminNewPassword("");
                    setAdminConfirmPassword("");
                  }}>
                    ⚙️
                  </div>
                </div>
              </div>

          <div className="admin-body">
            {/* Dashboard Sidebar */}
            <aside className="admin-sidebar">
              <div style={{ padding: "0 24px 16px", borderBottom: "1px solid var(--border-color)", marginBottom: "16px" }}>
                <img 
                  src={theme === "light" 
                    ? "/devsetu_light_logo.png" 
                    : "/devsetu_dark_logo.png"}
                  alt="DevSetu Logo" 
                  style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "40px" }}
                />
              </div>
              <button 
                onClick={() => setAdminTab("home")} 
                className={`admin-sidebar-item ${adminTab === "home" ? "active" : ""}`}
              >
                <TrendingUp size={16} />
                <span>Dashboard Home</span>
              </button>

              <button 
                onClick={() => setAdminTab("astrologers")} 
                className={`admin-sidebar-item ${adminTab === "astrologers" ? "active" : ""}`}
              >
                <Users size={16} />
                <span>Astrologer Directory</span>
              </button>

              <button 
                onClick={() => setAdminTab("payments")} 
                className={`admin-sidebar-item ${adminTab === "payments" ? "active" : ""}`}
                style={{ position: "relative" }}
              >
                <CreditCard size={16} />
                <span>Payment Verification</span>
                {bookings.filter(b => b.status === "submitted").length > 0 && (
                  <span style={{
                    position: "absolute",
                    right: "16px",
                    backgroundColor: "var(--warning)",
                    color: "var(--primary-brown)",
                    borderRadius: "10px",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontWeight: "800"
                  }}>
                    {bookings.filter(b => b.status === "submitted").length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setAdminTab("bookings")} 
                className={`admin-sidebar-item ${adminTab === "bookings" ? "active" : ""}`}
              >
                <Calendar size={16} />
                <span>Booking Operations</span>
              </button>

              <button 
                onClick={() => setAdminTab("support")} 
                className={`admin-sidebar-item ${adminTab === "support" ? "active" : ""}`}
              >
                <MessageSquare size={16} />
                <span>Support Console</span>
              </button>

              <button 
                onClick={() => setAdminTab("notifications")} 
                className={`admin-sidebar-item ${adminTab === "notifications" ? "active" : ""}`}
              >
                <Bell size={16} />
                <span>Notifications Panel</span>
              </button>

              <button 
                onClick={() => setAdminTab("reports")} 
                className={`admin-sidebar-item ${adminTab === "reports" ? "active" : ""}`}
              >
                <span style={{ fontSize: "16px", marginRight: "8px" }}>📊</span>
                <span>Reports Center</span>
              </button>

              <button 
                onClick={() => setAdminTab("audit")} 
                className={`admin-sidebar-item ${adminTab === "audit" ? "active" : ""}`}
              >
                <span style={{ fontSize: "16px", marginRight: "8px" }}>📋</span>
                <span>Audit Trails Log</span>
              </button>

              <button 
                onClick={() => {
                  setAdminTab("email-logs");
                  fetch(`${API_BASE}/api/admin/email-logs`)
                    .then(res => res.json())
                    .then(data => setEmailLogs(data))
                    .catch(e => console.warn(e));
                }} 
                className={`admin-sidebar-item ${adminTab === "email-logs" ? "active" : ""}`}
              >
                <span style={{ fontSize: "16px", marginRight: "8px" }}>✉️</span>
                <span>SMTP Email Logs</span>
              </button>

              <button 
                onClick={() => {
                  setAdminTab("email-settings");
                  // Fetch settings & health immediately
                  fetch(`${API_BASE}/api/admin/smtp/settings`)
                    .then(res => res.json())
                    .then(data => setSmtpSettings(data))
                    .catch(e => console.warn(e));
                  fetch(`${API_BASE}/api/admin/smtp/health`)
                    .then(res => res.json())
                    .then(data => setSmtpHealth(data))
                    .catch(e => console.warn(e));
                }} 
                className={`admin-sidebar-item ${adminTab === "email-settings" ? "active" : ""}`}
              >
                <span style={{ fontSize: "16px", marginRight: "8px" }}>⚙️</span>
                <span>SMTP & Notification Settings</span>
              </button>

              <div style={{ marginTop: "auto", padding: "16px 24px", borderTop: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                    <span style={{ fontSize: "16px" }}>♿</span>
                    <span>Accessibility Mode</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={isAccessibilityMode}
                      onChange={(e) => setIsAccessibilityMode(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Dashboard Main Workspace */}
            <div className="admin-main-content">

              {/* 1. ADMIN HOME */}
              {adminTab === "home" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Admin Profile Details Card */}
                  <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--temple-gold)" }}>
                    <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      🛡️ Administrator Profile Details
                    </h4>
                    <div style={{ fontSize: "12px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px 20px", maxWidth: "600px" }}>
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Admin ID:</span>
                      <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{adminUser?.adminId || adminUser?.profileId || "ADM00001"}</span>
                      
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Full Name:</span>
                      <span>{adminUser?.name || "System Administrator"}</span>
                      
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Mobile Number:</span>
                      <span>{adminUser?.phone || adminUser?.mobile || "9999999999"}</span>
                      
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Email Address:</span>
                      <span>{adminUser?.email || "admin@devsetu.com"}</span>
                      
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>System Role:</span>
                      <span style={{ textTransform: "capitalize", fontWeight: "700", color: "var(--orange-accent)" }}>{adminUser?.role || "admin"}</span>
                      
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Last Login Session:</span>
                      <span>{adminUser?.lastLogin || new Date().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Statistics Widgets (14 key metrics) */}
                  <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>👥</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.totalAstro}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Total Astrologers</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>⏳</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.pendingApprovals}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Pending Approvals</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>✅</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.approvedAstro}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Approved Partner Accounts</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>⚡</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.activeAstro}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Active Accounts</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>🚫</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.blockedAstro}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Suspended/Blocked</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>🕉️</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.totalBookings}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Total Bookings</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>📅</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.activeBookings}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Active Bookings</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>🌸</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.completedBookings}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Completed Bookings</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>💰</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>₹{stats.revenue.toLocaleString()}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Revenue Generated (10% Fee)</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>💳</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.pendingPayments}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Pending Verification Payments</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>🎫</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.openTickets}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Open Support Tickets</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>📢</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.systemNotifsSent}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Notifications Sent</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>🔑</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "20px", fontWeight: "800" }}>{stats.openResets}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Open Reset Requests</div>
                      </div>
                    </div>
                    <div className="stat-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <div style={{ fontSize: "24px" }}>🔒</div>
                      <div>
                        <div className="stat-value" style={{ fontSize: "16px", fontWeight: "800" }}>{stats.hashedPinCoverage}</div>
                        <div className="stat-label" style={{ fontSize: "10px", color: "var(--text-muted)" }}>Hashed PIN Coverage</div>
                      </div>
                    </div>
                  </div>

                  {/* Inline SVG Charts Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                    
                    {/* 1. Daily Bookings Bar Chart */}
                    <div className="chart-container-box" style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <h4 className="chart-title" style={{ fontSize: "12px", color: "var(--primary-brown)", margin: "0 0 12px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>📅 Daily Bookings Trend (Last 7 Days)</h4>
                      <svg viewBox="0 0 300 160" width="100%" height="130">
                        <line x1="30" y1="130" x2="280" y2="130" stroke="var(--text-muted)" strokeWidth="1" />
                        <line x1="30" y1="20" x2="30" y2="130" stroke="var(--text-muted)" strokeWidth="0.5" />
                        {/* Grid lines */}
                        <line x1="30" y1="75" x2="280" y2="75" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="30" y1="20" x2="280" y2="20" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
                        {/* Bars */}
                        {[2, 4, 3, 5, 8, 6, 7].map((val, idx) => {
                          const barH = val * 12;
                          const x = 45 + idx * 32;
                          const y = 130 - barH;
                          return (
                            <g key={idx}>
                              <rect x={x} y={y} width="16" height={barH} fill="url(#goldGrad)" rx="2" />
                              <text x={x + 8} y={y - 4} fontSize="8" fontWeight="bold" textAnchor="middle" fill="var(--text-main)">{val}</text>
                              <text x={x + 8} y="142" fontSize="7" fill="var(--text-muted)" textAnchor="middle">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}</text>
                            </g>
                          );
                        })}
                        <defs>
                          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#d4af37" />
                            <stop offset="100%" stopColor="#8b6508" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* 2. Monthly Bookings Area Chart */}
                    <div className="chart-container-box" style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <h4 className="chart-title" style={{ fontSize: "12px", color: "var(--primary-brown)", margin: "0 0 12px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>📈 Monthly Bookings Trend</h4>
                      <svg viewBox="0 0 300 160" width="100%" height="130">
                        {/* Area path */}
                        <path d="M40 130 L40 90 L80 110 L120 70 L160 85 L200 40 L240 55 L280 20 L280 130 Z" fill="rgba(212,175,55,0.15)" />
                        {/* Line path */}
                        <path d="M40 90 L80 110 L120 70 L160 85 L200 40 L240 55 L280 20" fill="none" stroke="var(--temple-gold)" strokeWidth="2" />
                        <line x1="30" y1="130" x2="290" y2="130" stroke="var(--text-muted)" strokeWidth="1" />
                        {/* Grid lines */}
                        <line x1="30" y1="75" x2="290" y2="75" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
                        {/* X Labels */}
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, idx) => (
                          <text key={idx} x={40 + idx * 40} y="142" fontSize="7" fill="var(--text-muted)" textAnchor="middle">{m}</text>
                        ))}
                        {/* Dot markers */}
                        {[[40,90], [80,110], [120,70], [160,85], [200,40], [240,55], [280,20]].map(([x,y], idx) => (
                          <circle key={idx} cx={x} cy={y} r="3" fill="var(--primary-brown)" stroke="var(--temple-gold)" strokeWidth="1" />
                        ))}
                      </svg>
                    </div>

                    {/* 3. Revenue Trend Line Chart */}
                    <div className="chart-container-box" style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <h4 className="chart-title" style={{ fontSize: "12px", color: "var(--primary-brown)", margin: "0 0 12px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>💰 Revenue Trend (₹ Thousands)</h4>
                      <svg viewBox="0 0 300 160" width="100%" height="130">
                        {/* Grid lines */}
                        <line x1="30" y1="20" x2="290" y2="20" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="30" y1="75" x2="290" y2="75" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="30" y1="130" x2="290" y2="130" stroke="var(--text-muted)" strokeWidth="1" />
                        {/* Line path */}
                        <path d="M40 120 L80 100 L120 110 L160 60 L200 70 L240 30 L280 40" fill="none" stroke="var(--primary-brown)" strokeWidth="2.5" />
                        {/* Dot markers */}
                        {[[40,120], [80,100], [120,110], [160,60], [200,70], [240,30], [280,40]].map(([x,y], idx) => (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="3" fill="#fff" stroke="var(--primary-brown)" strokeWidth="2" />
                            <text x={x} y={y - 6} fontSize="7" fontWeight="bold" fill="var(--text-main)" textAnchor="middle">₹{120 - y}</text>
                          </g>
                        ))}
                        {/* Labels */}
                        {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'].map((w, idx) => (
                          <text key={idx} x={40 + idx * 40} y="142" fontSize="7" fill="var(--text-muted)" textAnchor="middle">{w}</text>
                        ))}
                      </svg>
                    </div>

                    {/* 4. Registration Trend Scatter/Step Plot */}
                    <div className="chart-container-box" style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <h4 className="chart-title" style={{ fontSize: "12px", color: "var(--primary-brown)", margin: "0 0 12px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>👥 Registration Trend (Cumulative Astrologers)</h4>
                      <svg viewBox="0 0 300 160" width="100%" height="130">
                        <line x1="30" y1="130" x2="290" y2="130" stroke="var(--text-muted)" strokeWidth="1" />
                        {/* Step line */}
                        <path d="M30 130 H 70 V 110 H 110 V 90 H 150 V 80 H 190 V 50 H 230 V 40 H 270 V 20" fill="none" stroke="var(--temple-gold)" strokeWidth="2" />
                        {/* Scatter points */}
                        {[[70,110], [110,90], [150,80], [190,50], [230,40], [270,20]].map(([x, y], idx) => (
                          <circle key={idx} cx={x} cy={y} r="4.5" fill="var(--primary-brown)" stroke="#fff" strokeWidth="1" />
                        ))}
                        {/* Axis markers */}
                        {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, idx) => (
                          <text key={idx} x={70 + idx * 40} y="142" fontSize="7" fill="var(--text-muted)" textAnchor="middle">{m}</text>
                        ))}
                      </svg>
                    </div>

                    {/* 5. Payment Trend Donut/Pie Chart */}
                    <div className="chart-container-box" style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                      <h4 className="chart-title" style={{ fontSize: "12px", color: "var(--primary-brown)", margin: "0 0 12px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>💳 Payment Verification Donut</h4>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <svg viewBox="0 0 160 160" width="100" height="100" style={{ flexShrink: 0 }}>
                          <circle cx="80" cy="80" r="55" fill="none" stroke="var(--border-color)" strokeWidth="14" />
                          <circle cx="80" cy="80" r="55" fill="none" stroke="var(--success)" strokeWidth="14" strokeDasharray="180 345" strokeDashoffset="0" />
                          <circle cx="80" cy="80" r="55" fill="none" stroke="var(--warning)" strokeWidth="14" strokeDasharray="90 345" strokeDashoffset="-180" />
                          <circle cx="80" cy="80" r="55" fill="none" stroke="var(--error)" strokeWidth="14" strokeDasharray="40 345" strokeDashoffset="-270" />
                          <circle cx="80" cy="80" r="38" fill="var(--card-bg)" />
                          <text x="80" y="84" fontSize="9" fontWeight="bold" textAnchor="middle" fill="var(--text-main)">PAYMENTS</text>
                        </svg>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "10px", flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "8px", height: "8px", backgroundColor: "var(--success)", borderRadius: "50%" }}></span>
                            <span>Verified (60%)</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "8px", height: "8px", backgroundColor: "var(--warning)", borderRadius: "50%" }}></span>
                            <span>Pending (30%)</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "8px", height: "8px", backgroundColor: "var(--error)", borderRadius: "50%" }}></span>
                            <span>Rejected (10%)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Broadcast System Announcement Card */}
                  <div className="chart-container-box" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 className="chart-title">Broadcast System Announcement</h4>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Send an important platform announcement to all astrologers. This will appear instantly in their Notifications Hub.
                    </p>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                      <textarea
                        rows={2}
                        value={broadcastText}
                        onChange={(e) => setBroadcastText(e.target.value)}
                        placeholder="Type announcement details (e.g., Scheduled maintenance on 24th June, or Special Temple Pooja slots open)..."
                        className="form-input"
                        style={{ flex: 1, resize: "none", fontSize: "12px" }}
                      />
                      <button
                        onClick={handleBroadcastAnnouncement}
                        className="btn-primary"
                        style={{ padding: "10px 20px", height: "fit-content" }}
                      >
                        Broadcast Now
                      </button>
                    </div>
                  </div>

                  {/* Recent Bookings Live Log */}
                  <div className="chart-container-box">
                    <h4 className="chart-title" style={{ marginBottom: "16px" }}>Recent Activity Stream</h4>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Booking ID</th>
                            <th>Astrologer</th>
                            <th>Client</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.slice(0, 4).map(b => (
                            <tr key={b.id}>
                              <td><strong>{b.id}</strong></td>
                              <td>{b.astrologerName}</td>
                              <td>{b.clientName}</td>
                              <td>{b.date}</td>
                              <td>₹{b.amount.toLocaleString()}</td>
                              <td>
                                <span className={`status-badge ${b.status}`}>{b.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ASTROLOGER DIRECTORY */}
              {adminTab === "astrologers" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>Astrologer Directory</h3>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input 
                        type="text" 
                        placeholder="Search by name, ID, phone..." 
                        className="form-input" 
                        value={adminAstroSearch}
                        onChange={(e) => setAdminAstroSearch(e.target.value)}
                        style={{ width: "240px", fontSize: "12px", padding: "8px 12px" }} 
                      />
                      
                      <select
                        value={adminAstroFilterStatus}
                        onChange={(e) => setAdminAstroFilterStatus(e.target.value)}
                        className="form-select"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Verification</option>
                        <option value="approved">Approved / Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <select
                        value={adminAstroSortKey}
                        onChange={(e) => setAdminAstroSortKey(e.target.value)}
                        className="form-select"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        <option value="name">Sort by Name</option>
                        <option value="id">Sort by Profile ID</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-table-wrapper" style={{ padding: "10px", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)" }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Profile ID</th>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Joined</th>
                          <th>Status</th>
                          <th>Verification</th>
                          <th>Subscription</th>
                          <th>Session</th>
                          <th>Operations Action Center</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filtered = astrologersList.filter(astro => {
                            const matchesSearch = 
                              (astro.name && astro.name.toLowerCase().includes(adminAstroSearch.toLowerCase())) ||
                              (astro.id && astro.id.toLowerCase().includes(adminAstroSearch.toLowerCase())) ||
                              (astro.phone && astro.phone.includes(adminAstroSearch)) ||
                              (astro.email && astro.email.toLowerCase().includes(adminAstroSearch.toLowerCase()));
                            
                            const matchesStatus = adminAstroFilterStatus === "all" || astro.accountStatus === adminAstroFilterStatus;
                            return matchesSearch && matchesStatus;
                          });

                          const sorted = [...filtered].sort((a, b) => {
                            if (adminAstroSortKey === "name") {
                              return (a.name || "").localeCompare(b.name || "");
                            } else {
                              return (a.id || "").localeCompare(b.id || "");
                            }
                          });

                          if (sorted.length === 0) {
                            return (
                              <tr>
                                <td colSpan="9" style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                  No registered astrologers match the current filters.
                               </td>
                              </tr>
                            );
                          }

                          const itemsPerPage = 5;
                          const totalPages = Math.ceil(sorted.length / itemsPerPage);
                          const page = Math.min(astroDirectoryPage, totalPages || 1);
                          const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

                          return (
                            <>
                              {paginated.map(astro => {
                                const isOnline = Math.random() > 0.5; // Simulate login session status
                                const isSubscribed = astro.accountStatus === "approved"; // Simulate subscription status
                                return (
                                  <tr key={astro.id}>
                                    <td>
                                      <strong style={{ fontFamily: "monospace", color: "var(--temple-gold)" }}>{astro.id}</strong>
                                    </td>
                                    <td>
                                      <div><strong>{astro.name}</strong></div>
                                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{astro.email || "No Email"}</span>
                                    </td>
                                    <td>{astro.phone || astro.mobile}</td>
                                    <td>{astro.joined || "New"}</td>
                                    <td>
                                      <span className={`status-badge ${astro.accountStatus === 'approved' ? 'approved' : astro.accountStatus === 'pending' ? 'submitted' : 'rejected'}`}>
                                        {astro.accountStatus === 'approved' ? 'Active' : astro.accountStatus === 'pending' ? 'Pending' : astro.accountStatus}
                                      </span>
                                    </td>
                                    <td>
                                      <span style={{ color: astro.accountStatus === 'approved' ? 'var(--success)' : 'var(--warning)', fontWeight: "700", fontSize: "11px" }}>
                                        {astro.accountStatus === 'approved' ? '✓ Verified' : '⏳ Pending'}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`status-badge ${isSubscribed ? 'approved' : 'rejected'}`} style={{ fontSize: "9px" }}>
                                        {isSubscribed ? 'Paid / Active' : 'Unpaid / Expired'}
                                      </span>
                                    </td>
                                    <td>
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: isOnline ? "var(--success)" : "var(--text-muted)" }}>
                                        <span style={{ width: "8px", height: "8px", backgroundColor: isOnline ? "var(--success)" : "#aaa", borderRadius: "50%" }}></span>
                                        {isOnline ? "Online" : "Offline"}
                                      </span>
                                    </td>
                                    <td>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "420px" }}>
                                        <button 
                                          title="View full profiles"
                                          onClick={() => {
                                            setSelectedUserForModal(astro);
                                            setModalActiveTab("personal");
                                            setShowUserProfileModal(true);
                                          }}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 6px", fontSize: "10px" }}
                                        >
                                          👁️ View
                                        </button>
                                        <button 
                                          title="Edit Partner details"
                                          onClick={() => {
                                            setUserToEdit(astro);
                                            setShowEditUserModal(true);
                                          }}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 6px", fontSize: "10px" }}
                                        >
                                          ✏️ Edit
                                        </button>
                                        <button 
                                          title="Verify Documents"
                                          onClick={() => {
                                            setDocumentViewerFile({ name: "Aadhaar Card Proof", url: "/payment_qr_placeholder.jpeg" });
                                            setShowDocumentViewer(true);
                                          }}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 6px", fontSize: "10px", color: "var(--orange-accent)" }}
                                        >
                                          🪪 Docs
                                        </button>
                                        {astro.accountStatus !== "approved" && (
                                          <button 
                                            title="Approve Registration"
                                            onClick={() => {
                                              setConfirmDialogConfig({
                                                title: "Approve Astrologer Partner",
                                                message: `Are you sure you want to approve registration for ${astro.name}? This will enable their app dashboard access immediately.`,
                                                confirmLabel: "Approve",
                                                onConfirm: () => handleAdminUpdateUserStatus(astro.email || astro.phone, "approved")
                                              });
                                              setShowConfirmDialog(true);
                                            }}
                                            className="btn-primary" 
                                            style={{ padding: "4px 6px", fontSize: "10px", backgroundColor: "var(--success)", borderColor: "var(--success)" }}
                                          >
                                            ✅ Approve
                                          </button>
                                        )}
                                        {astro.accountStatus !== "rejected" && astro.accountStatus !== "approved" && (
                                          <button 
                                            title="Reject Registration"
                                            onClick={() => {
                                              setRejectionModalUser(astro);
                                              setShowRejectionModal(true);
                                            }}
                                            className="btn-primary" 
                                            style={{ padding: "4px 6px", fontSize: "10px", backgroundColor: "var(--error)", borderColor: "var(--error)" }}
                                          >
                                            ❌ Reject
                                          </button>
                                        )}
                                        {astro.accountStatus !== "pending" && (
                                          <button 
                                            title="Keep application Pending"
                                            onClick={() => {
                                              setConfirmDialogConfig({
                                                title: "Set Status back to Pending",
                                                message: `Are you sure you want to change status back to pending for ${astro.name}?`,
                                                confirmLabel: "Mark Pending",
                                                onConfirm: () => handleAdminUpdateUserStatus(astro.email || astro.phone, "pending")
                                              });
                                              setShowConfirmDialog(true);
                                            }}
                                            className="btn-secondary" 
                                            style={{ padding: "4px 6px", fontSize: "10px" }}
                                          >
                                            ⏳ Pend
                                          </button>
                                        )}
                                        <button 
                                          title={astro.accountStatus === "suspended" ? "Activate Account" : "Suspend Account"}
                                          onClick={() => {
                                            const nextSt = astro.accountStatus === "suspended" ? "approved" : "suspended";
                                            setConfirmDialogConfig({
                                              title: nextSt === "approved" ? "Activate Astrologer Account" : "Suspend Astrologer Account",
                                              message: `Are you sure you want to ${nextSt === "approved" ? "activate" : "suspend"} ${astro.name}'s account?`,
                                              confirmLabel: nextSt === "approved" ? "Activate" : "Suspend",
                                              onConfirm: () => handleAdminUpdateUserStatus(astro.email || astro.phone, nextSt)
                                            });
                                            setShowConfirmDialog(true);
                                          }}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 6px", fontSize: "10px", color: astro.accountStatus === "suspended" ? "var(--success)" : "var(--error)" }}
                                        >
                                          {astro.accountStatus === "suspended" ? "🔓 Activate" : "🚫 Suspend"}
                                        </button>
                                        <button 
                                          title="Reset Credentials PIN"
                                          onClick={async () => {
                                            try {
                                              const res = await fetch(`${API_BASE}/api/admin/pin-resets/temp/generate`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ profileId: astro.id })
                                              });
                                              const resData = await res.json();
                                              setTempPinValue(resData.tempPin || "840294");
                                              setShowTempPinModal(true);
                                            } catch (e) {
                                              setTempPinValue("840294");
                                              setShowTempPinModal(true);
                                            }
                                          }}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 6px", fontSize: "10px", color: "var(--temple-gold)" }}
                                        >
                                          🔑 PIN Reset
                                        </button>
                                        <button 
                                          title="Send transactional notification"
                                          onClick={() => {
                                            setCustomNotificationUser(astro);
                                            setShowCustomNotificationModal(true);
                                          }}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 6px", fontSize: "10px" }}
                                        >
                                          📢 Notify
                                        </button>
                                        <button 
                                          title="Delete Partner Registry entry"
                                          onClick={() => {
                                            setConfirmDialogConfig({
                                              title: "Permanently Delete Partner",
                                              message: `Are you sure you want to permanently delete the profile of ${astro.name}? This action cannot be undone.`,
                                              confirmLabel: "Delete User",
                                              onConfirm: () => handleAdminDeleteUser(astro.email || astro.phone)
                                            });
                                            setShowConfirmDialog(true);
                                          }}
                                          className="btn-primary" 
                                          style={{ padding: "4px 6px", fontSize: "10px", backgroundColor: "var(--error)", borderColor: "var(--error)" }}
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              
                              {/* Pagination Buttons */}
                              {totalPages > 1 && (
                                <tr>
                                  <td colSpan="9" style={{ padding: "12px", borderTop: "1px solid var(--border-color)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <button 
                                          disabled={page <= 1}
                                          onClick={() => setAstroDirectoryPage(p => Math.max(1, p - 1))}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 10px", fontSize: "11px" }}
                                        >
                                          Prev
                                        </button>
                                        <button 
                                          disabled={page >= totalPages}
                                          onClick={() => setAstroDirectoryPage(p => Math.min(totalPages, p + 1))}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 10px", fontSize: "11px" }}
                                        >
                                          Next
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}               {/* 3. PAYMENT VERIFICATION QUEUE */}
              {adminTab === "payments" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>Payment & Reset Verification Control</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => setPaymentSubTab("payments")}
                        className={`btn-secondary ${paymentSubTab === 'payments' ? 'active' : ''}`}
                        style={{ padding: "8px 16px", fontSize: "12px", border: "1px solid var(--border-color)", background: paymentSubTab === 'payments' ? 'var(--primary-brown)' : 'transparent', color: paymentSubTab === 'payments' ? '#fff8f0' : 'var(--text-main)', fontWeight: "700" }}
                      >
                        Pending Payments Verification
                      </button>
                      <button 
                        onClick={() => setPaymentSubTab("pin_resets")}
                        className={`btn-secondary ${paymentSubTab === 'pin_resets' ? 'active' : ''}`}
                        style={{ padding: "8px 16px", fontSize: "12px", border: "1px solid var(--border-color)", background: paymentSubTab === 'pin_resets' ? 'var(--primary-brown)' : 'transparent', color: paymentSubTab === 'pin_resets' ? '#fff8f0' : 'var(--text-main)', fontWeight: "700" }}
                      >
                        PIN Reset Requests Queue
                      </button>
                    </div>
                  </div>

                  {paymentSubTab === "payments" ? (
                    /* PENDING PAYMENTS TAB */
                    bookings.filter(b => b.status === "submitted").length === 0 ? (
                      <div style={{ textAlign: "center", padding: "60px 0", backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "12px", color: "var(--text-muted)" }}>
                        🎉 Excellent! All payments are verified. No pending transactions in queue.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                        
                        {/* Active queue list */}
                        <div className="admin-table-wrapper" style={{ border: "1px solid var(--border-color)", padding: "10px", borderRadius: "12px", backgroundColor: "var(--card-bg)" }}>
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Booking ID</th>
                                <th>Service / Package</th>
                                <th>Astrologer Fee</th>
                                <th>Txn ID</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bookings.filter(b => b.status === "submitted").map(b => (
                                <tr key={b.id}>
                                  <td>
                                    <strong>{b.id}</strong><br/>
                                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{b.clientName}</span>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: "12px" }}>{b.packageName}</span><br/>
                                    <span style={{ fontSize: "11px", color: "var(--orange-accent)" }}>₹{b.amount.toLocaleString()}</span>
                                  </td>
                                  <td style={{ color: "var(--success)", fontWeight: "700" }}>
                                    ₹{(b.astroFee || 0).toLocaleString()}
                                  </td>
                                  <td>
                                    <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{b.txnId}</span>
                                  </td>
                                  <td>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <button 
                                        onClick={() => handleAdminVerifyPayment(b.id, true)}
                                        className="btn-primary" 
                                        style={{ padding: "6px 10px", fontSize: "11px", backgroundColor: "var(--success)", borderColor: "var(--success)", color: "white" }}
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleAdminRequestClarification(b.id)}
                                        className="btn-secondary" 
                                        style={{ padding: "6px 10px", fontSize: "11px", color: "var(--warning)", borderColor: "rgba(212,175,55,0.3)" }}
                                      >
                                        Clarify
                                      </button>
                                      <button 
                                        onClick={() => handleAdminVerifyPayment(b.id, false)}
                                        className="btn-secondary" 
                                        style={{ padding: "6px 10px", fontSize: "11px", color: "var(--error)", borderColor: "rgba(198,40,40,0.2)" }}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Payment Screenshot Verification Panel */}
                        <div className="chart-container-box" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)" }}>
                          <h4 className="chart-title" style={{ fontSize: "13px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>Payment Evidence Review</h4>
                          {(() => {
                            const activePayment = bookings.find(b => b.status === "submitted");
                            if (!activePayment) return null;
                            return (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                                  <div><strong>Client Name:</strong> {activePayment.clientName}</div>
                                  <div><strong>Txn ID:</strong> {activePayment.txnId}</div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                                  <div><strong>Amount:</strong> ₹{activePayment.amount.toLocaleString()}</div>
                                  <div><strong>Advance Received:</strong> ₹{(activePayment.amount * 0.2).toLocaleString()}</div>
                                </div>

                                <div className="screenshot-box" style={{ width: "100%", height: "200px", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.03)", border: "1px dashed var(--border-color)" }}>
                                  {activePayment.screenshot && activePayment.screenshot.startsWith("data:image/") ? (
                                    <img 
                                      src={activePayment.screenshot} 
                                      alt="Payment Evidence Screenshot" 
                                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                    />
                                  ) : (
                                    <>
                                      {activePayment.screenshot === "gpay" && (
                                        <div style={{ padding: "20px", textAlign: "center", color: "#FFF6E9", background: "linear-gradient(135deg, #1A73E8, #0D47A1)", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                          <div style={{ fontSize: "24px", fontWeight: "800" }}>Google Pay</div>
                                          <div style={{ fontSize: "12px", opacity: 0.9, margin: "6px 0" }}>Payment Successful to Devsetu Services</div>
                                          <div style={{ fontSize: "18px", fontWeight: "900" }}>₹{(activePayment.amount * 0.2).toLocaleString()}</div>
                                          <div style={{ fontSize: "9px", opacity: 0.7, marginTop: "8px" }}>UPI Ref: {activePayment.txnId}</div>
                                        </div>
                                      )}
                                      {activePayment.screenshot === "phonepe" && (
                                        <div style={{ padding: "20px", textAlign: "center", color: "#FFF6E9", background: "linear-gradient(135deg, #5F259F, #3F1B6B)", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                          <div style={{ fontSize: "24px", fontWeight: "800" }}>PhonePe</div>
                                          <div style={{ fontSize: "12px", opacity: 0.9, margin: "6px 0" }}>Transaction Completed Successfully</div>
                                          <div style={{ fontSize: "18px", fontWeight: "900" }}>₹{(activePayment.amount * 0.2).toLocaleString()}</div>
                                          <div style={{ fontSize: "9px", opacity: 0.7, marginTop: "8px" }}>Txn ID: T260617{activePayment.txnId}</div>
                                        </div>
                                      )}
                                      {activePayment.screenshot === "paytm" && (
                                        <div style={{ padding: "20px", textAlign: "center", color: "#2B1B12", background: "linear-gradient(135deg, #00B9F5, #FFF)", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", border: "1px solid var(--border-color)" }}>
                                          <div style={{ fontSize: "24px", fontWeight: "800", color: "#002970" }}>Paytm</div>
                                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#2E7D32", margin: "6px 0" }}>✓ Success: Paid to DEVSETU</div>
                                          <div style={{ fontSize: "18px", fontWeight: "900", color: "#002970" }}>₹{(activePayment.amount * 0.2).toLocaleString()}</div>
                                          <div style={{ fontSize: "9px", color: "#555", marginTop: "8px" }}>Ref No: {activePayment.txnId}</div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                  <button 
                                    onClick={() => handleAdminVerifyPayment(activePayment.id, true)} 
                                    className="btn-primary" 
                                    style={{ flex: 1, backgroundColor: "var(--success)", borderColor: "var(--success)", padding: "10px" }}
                                  >
                                    Approve & Book Slot
                                  </button>
                                  <button 
                                    onClick={() => handleAdminRequestClarification(activePayment.id)} 
                                    className="btn-secondary" 
                                    style={{ color: "var(--warning)", borderColor: "rgba(212,175,55,0.3)", padding: "10px" }}
                                  >
                                    Request Clarification
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setConfirmDialogConfig({
                                        title: "Reject Payment Evidence",
                                        message: `Are you sure you want to reject the payment evidence for booking ${activePayment.id}? This will cancel the booking.`,
                                        confirmLabel: "Reject Payment",
                                        onConfirm: () => handleAdminVerifyPayment(activePayment.id, false)
                                      });
                                      setShowConfirmDialog(true);
                                    }}
                                    className="btn-secondary" 
                                    style={{ color: "var(--error)", borderColor: "rgba(198,40,40,0.2)", padding: "10px" }}
                                  >
                                    Reject Payment
                                  </button>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                      </div>
                    )
                  ) : (
                    /* PIN RESET REQUESTS TAB */
                    <div className="admin-table-wrapper" style={{ padding: "10px", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)" }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Request ID</th>
                            <th>Astrologer Name</th>
                            <th>Profile ID</th>
                            <th>Registered Mobile</th>
                            <th>Request Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pinResetRequests.length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                No PIN reset requests in queue.
                              </td>
                            </tr>
                          ) : (
                            pinResetRequests.map(req => (
                              <tr key={req.id}>
                                <td><strong style={{ fontFamily: "monospace" }}>{req.id}</strong></td>
                                <td>{req.name}</td>
                                <td><strong style={{ fontFamily: "monospace" }}>{req.profileId}</strong></td>
                                <td>{req.phone}</td>
                                <td>{formatDate(req.requestDate)}</td>
                                <td>
                                  <span className={`status-badge ${req.status === 'pin_reset' ? 'approved' : 'submitted'}`}>
                                    {req.status === 'pin_reset' ? 'Reset Completed' : req.status}
                                  </span>
                                </td>
                                <td>
                                  {req.status !== 'pin_reset' ? (
                                    <button 
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(`${API_BASE}/api/admin/pin-resets/${req.id}/reset`, {
                                            method: "POST"
                                          });
                                          const data = await res.json();
                                          if (!res.ok) {
                                            alert(data.error || "Failed to generate temporary PIN.");
                                            return;
                                          }
                                          setTempPinValue(data.tempPin);
                                          setShowTempPinModal(true);
                                          // Refresh requests list
                                          const requestsRes = await fetch(`${API_BASE}/api/admin/pin-resets`);
                                          if (requestsRes.ok) {
                                            setPinResetRequests(await requestsRes.json());
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          alert("Network error occurred resetting PIN.");
                                        }
                                      }}
                                      className="btn-primary"
                                      style={{ padding: "6px 12px", fontSize: "11px", backgroundColor: "var(--temple-gold)", borderColor: "var(--temple-gold)", color: "var(--primary-brown)", fontWeight: "700" }}
                                    >
                                      Generate Temp PIN
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>None (Resolved)</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. BOOKING OPERATIONS */}
              {adminTab === "bookings" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)" }}>Booking Operations Manager</h3>
                    
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input 
                        type="text" 
                        placeholder="Search Client or Booking ID..." 
                        className="form-input" 
                        value={adminBookingSearch}
                        onChange={(e) => setAdminBookingSearch(e.target.value)}
                        style={{ width: "220px" }}
                      />
                      
                      <select 
                        value={adminBookingFilter}
                        onChange={(e) => setAdminBookingFilter(e.target.value)}
                        className="form-select"
                        style={{ fontSize: "12px" }}
                      >
                        <option value="all">All Statuses</option>
                        <option value="created">Created</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Service Package</th>
                          <th>Client Details</th>
                          <th>Preferred Date</th>
                          <th>Assigned Astro</th>
                          <th>Paid Amount</th>
                          <th>Current Status</th>
                          <th>Operations Action Center</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const totalItems = filteredBookings.length;
                          const itemsPerPage = 5;
                          const totalPages = Math.ceil(totalItems / itemsPerPage);
                          const page = Math.min(bookingOperationPage, totalPages || 1);
                          const paginated = filteredBookings.slice((page - 1) * itemsPerPage, page * itemsPerPage);

                          if (totalItems === 0) {
                            return (
                              <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                  No bookings found matching current filters.
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <>
                              {paginated.map(b => {
                                const handlePrintInvoiceLocal = () => {
                                  const printWindow = window.open("", "_blank");
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>DEVSETU INVOICE - ${b.id}</title>
                                        <style>
                                          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                                          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
                                          h2 { color: #8b6508; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                                          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
                                          .section-title { font-weight: bold; color: #8b6508; margin-top: 20px; }
                                          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                          th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                                          th { background-color: #fff8f0; }
                                          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="invoice-box">
                                          <h2>DEVSETU SACRED SERVICES INVOICE</h2>
                                          <div class="grid">
                                            <div>
                                              <div class="section-title">Client Details</div>
                                              <div>Name: ${b.clientName}</div>
                                              <div>Phone: ${b.clientMobile}</div>
                                              <div>Location: ${b.city}</div>
                                            </div>
                                            <div>
                                              <div class="section-title">Booking Details</div>
                                              <div>Booking ID: ${b.id}</div>
                                              <div>Date: ${b.date}</div>
                                              <div>Status: ${b.status.toUpperCase()}</div>
                                            </div>
                                          </div>
                                          <div class="section-title">Ritual & Package Details</div>
                                          <table>
                                            <thead>
                                              <tr>
                                                <th>Service Description</th>
                                                <th>Assigned Astrologer</th>
                                                <th>Amount Paid</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr>
                                                <td>${b.packageName}</td>
                                                <td>${b.astrologerName || "Unassigned"}</td>
                                                <td>₹${b.amount.toLocaleString()}</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <div class="footer">
                                            Thank you for booking with DEVSETU. May spiritual blessings and peace be with you.<br/>
                                            DEVSETU CONNECT Administrator Console Report. Generated on ${new Date().toLocaleString()}
                                          </div>
                                        </div>
                                        <script>window.print();</script>
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                };

                                return (
                                  <tr key={b.id}>
                                    <td><strong>{b.id}</strong></td>
                                    <td>
                                      <div>{b.packageName}</div>
                                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                                        Requested via {b.astrologerName} ({b.astrologerProfileId || "DEV-AST-00001"})
                                      </span>
                                    </td>
                                    <td>
                                      <strong>{b.clientName}</strong><br/>
                                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        📞 {b.clientMobile} | 📍 {b.city}
                                      </span>
                                    </td>
                                    <td>{b.date}</td>
                                    <td>
                                      {b.astrologerName ? (
                                        <div>
                                          <div><strong>{b.astrologerName}</strong></div>
                                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {b.astrologerProfileId}</span>
                                        </div>
                                      ) : (
                                        <span style={{ color: "var(--error)", fontSize: "11px" }}>⚠️ Unassigned</span>
                                      )}
                                    </td>
                                    <td>₹{b.amount.toLocaleString()}</td>
                                    <td>
                                      <span className={`status-badge ${b.status}`}>{b.status}</span>
                                    </td>
                                    <td>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "360px" }}>
                                        {/* Status Transition buttons */}
                                        {b.status !== "approved" && b.status !== "completed" && b.status !== "cancelled" && (
                                          <button
                                            title="Confirm and Approve Booking"
                                            onClick={() => {
                                              setConfirmDialogConfig({
                                                title: "Confirm Booking Status",
                                                message: `Confirm that Booking ${b.id} is approved and scheduled?`,
                                                confirmLabel: "Approve Booking",
                                                onConfirm: () => handleAdminUpdateStatus(b.id, "approved")
                                              });
                                              setShowConfirmDialog(true);
                                            }}
                                            className="btn-secondary"
                                            style={{ padding: "4px 6px", fontSize: "10px", color: "var(--success)" }}
                                          >
                                            ✔️ Confirm
                                          </button>
                                        )}
                                        {b.status !== "rejected" && b.status !== "completed" && b.status !== "cancelled" && (
                                          <button
                                            title="Reject Booking"
                                            onClick={() => {
                                              setConfirmDialogConfig({
                                                title: "Reject Booking",
                                                message: `Are you sure you want to reject booking ${b.id}?`,
                                                confirmLabel: "Reject",
                                                onConfirm: () => handleAdminUpdateStatus(b.id, "rejected")
                                              });
                                              setShowConfirmDialog(true);
                                            }}
                                            className="btn-secondary"
                                            style={{ padding: "4px 6px", fontSize: "10px", color: "var(--error)" }}
                                          >
                                            ❌ Reject
                                          </button>
                                        )}
                                        <button
                                          title="Assign/Reassign Astrologer"
                                          onClick={() => {
                                            setAssignAstroBookingId(b.id);
                                            setAssignAstroSelectedId(b.astrologerProfileId || "");
                                            setShowAssignAstroModal(true);
                                          }}
                                          className="btn-secondary"
                                          style={{ padding: "4px 6px", fontSize: "10px" }}
                                        >
                                          🔮 Assign
                                        </button>
                                        {b.status === "approved" && (
                                          <button
                                            title="Start Booking Ritual"
                                            onClick={() => handleAdminUpdateStatus(b.id, "in_progress")}
                                            className="btn-secondary"
                                            style={{ padding: "4px 6px", fontSize: "10px", color: "var(--orange-accent)" }}
                                          >
                                            ▶️ Start
                                          </button>
                                        )}
                                        {b.status === "in_progress" && (
                                          <button
                                            title="Put Ritual on Hold"
                                            onClick={() => handleAdminUpdateStatus(b.id, "on_hold")}
                                            className="btn-secondary"
                                            style={{ padding: "4px 6px", fontSize: "10px", color: "var(--warning)" }}
                                          >
                                            ⏸️ Hold
                                          </button>
                                        )}
                                        {b.status === "on_hold" && (
                                          <button
                                            title="Resume Ritual"
                                            onClick={() => handleAdminUpdateStatus(b.id, "in_progress")}
                                            className="btn-secondary"
                                            style={{ padding: "4px 6px", fontSize: "10px", color: "var(--success)" }}
                                          >
                                            ▶️ Resume
                                          </button>
                                        )}
                                        {(b.status === "in_progress" || b.status === "approved" || b.status === "scheduled") && (
                                          <button
                                            title="Mark Ritual Completed"
                                            onClick={() => handleAdminUpdateStatus(b.id, "completed")}
                                            className="btn-primary"
                                            style={{ padding: "4px 6px", fontSize: "10px", backgroundColor: "var(--success)", borderColor: "var(--success)" }}
                                          >
                                            🌸 Complete
                                          </button>
                                        )}
                                        {b.status !== "cancelled" && b.status !== "completed" && (
                                          <button
                                            title="Cancel Booking"
                                            onClick={() => {
                                              setConfirmDialogConfig({
                                                title: "Cancel Booking",
                                                message: `Are you sure you want to cancel booking ${b.id}?`,
                                                confirmLabel: "Cancel Booking",
                                                onConfirm: () => handleAdminUpdateStatus(b.id, "cancelled")
                                              });
                                              setShowConfirmDialog(true);
                                            }}
                                            className="btn-secondary"
                                            style={{ padding: "4px 6px", fontSize: "10px", color: "var(--error)" }}
                                          >
                                            🚫 Cancel
                                          </button>
                                        )}
                                        {(b.status === "cancelled" || b.status === "rejected" || b.status === "completed") && (
                                          <button
                                            title="Reopen Booking"
                                            onClick={() => handleAdminUpdateStatus(b.id, "created")}
                                            className="btn-secondary"
                                            style={{ padding: "4px 6px", fontSize: "10px" }}
                                          >
                                            🔄 Reopen
                                          </button>
                                        )}
                                        <button
                                          title="Print Receipt Invoice"
                                          onClick={handlePrintInvoiceLocal}
                                          className="btn-secondary"
                                          style={{ padding: "4px 6px", fontSize: "10px" }}
                                        >
                                          🖨️ Print
                                        </button>
                                        <button
                                          title="Send customer SMS alert"
                                          onClick={() => {
                                            const clientUser = {
                                              name: b.clientName,
                                              phone: b.clientMobile,
                                              email: ""
                                            };
                                            setCustomNotificationUser(clientUser);
                                            setCustomNotificationTitle(`DEVSETU Update - Booking ${b.id}`);
                                            setCustomNotificationBody(`Hari Om ${b.clientName}, your booking status for ${b.packageName} has changed to ${b.status}.`);
                                            setShowCustomNotificationModal(true);
                                          }}
                                          className="btn-secondary"
                                          style={{ padding: "4px 6px", fontSize: "10px" }}
                                        >
                                          📢 Alert
                                        </button>
                                        <button
                                          title="Delete Booking Record"
                                          onClick={() => {
                                            setConfirmDialogConfig({
                                              title: "Permanently Delete Booking",
                                              message: `Are you sure you want to delete Booking ID ${b.id}? This will remove all associated transactions.`,
                                              confirmLabel: "Delete Booking",
                                              onConfirm: () => handleAdminDeleteBooking(b.id)
                                            });
                                            setShowConfirmDialog(true);
                                          }}
                                          className="btn-primary"
                                          style={{ padding: "4px 6px", fontSize: "10px", backgroundColor: "var(--error)", borderColor: "var(--error)" }}
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              {totalPages > 1 && (
                                <tr>
                                  <td colSpan="8" style={{ padding: "12px", borderTop: "1px solid var(--border-color)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <button 
                                          disabled={page <= 1}
                                          onClick={() => setBookingOperationPage(p => Math.max(1, p - 1))}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 10px", fontSize: "11px" }}
                                        >
                                          Prev
                                        </button>
                                        <button 
                                          disabled={page >= totalPages}
                                          onClick={() => setBookingOperationPage(p => Math.min(totalPages, p + 1))}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 10px", fontSize: "11px" }}
                                        >
                                          Next
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. SUPPORT CONSOLE */}
              {adminTab === "support" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-heading)" }}>Admin Support Center Console</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", border: "1px solid var(--border-color)", borderRadius: "12px", height: "450px", backgroundColor: "var(--bg-card)", overflow: "hidden" }}>
                    
                    {/* Active Conversation Sidebar */}
                    <div style={{ borderRight: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
                      <div style={{ padding: "14px", borderBottom: "1px solid var(--border-color)", fontWeight: "800", fontSize: "13px" }}>
                        Support Tickets / Chats
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", flex: 1 }}>
                        {tickets.map(ticket => (
                          <div 
                            key={ticket.id}
                            onClick={() => {
                              setActiveTicketId(ticket.id);
                              setAstroChatCategory(ticket.category);
                            }}
                            style={{
                              padding: "12px 16px",
                              backgroundColor: activeTicketId === ticket.id ? "var(--warm-cream-darker)" : "transparent",
                              borderLeft: activeTicketId === ticket.id ? "3px solid var(--temple-gold)" : "3px solid transparent",
                              borderBottom: "1px solid var(--border-color)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                              cursor: "pointer"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-main)" }}>{ticket.id}</span>
                              <span className={`status-badge ${ticket.status === "Open" ? "submitted" : "completed"}`} style={{ fontSize: "8px", padding: "1px 4px" }}>
                                {ticket.status}
                              </span>
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {ticket.subject}
                            </div>
                            <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                              {ticket.category} • {ticket.lastUpdate}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat Interaction Window */}
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                      {/* Chat Header */}
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "13px", fontWeight: "800" }}>
                          {activeTicketId ? `Ticket Thread: ${activeTicketId}` : "Select a Support Ticket"}
                        </div>
                        {activeTicketId && (
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "8px", backgroundColor: tickets.find(tk => tk.id === activeTicketId)?.status === "Open" ? "rgba(212,175,55,0.1)" : "rgba(46,125,50,0.1)", color: tickets.find(tk => tk.id === activeTicketId)?.status === "Open" ? "var(--warning)" : "var(--success)" }}>
                              Status: {tickets.find(tk => tk.id === activeTicketId)?.status}
                            </span>
                            {tickets.find(tk => tk.id === activeTicketId)?.status === "Open" && (
                              <button
                                onClick={() => {
                                  setTickets(prev => prev.map(tk => {
                                    if (tk.id === activeTicketId) {
                                      return { ...tk, status: "Resolved", lastUpdate: "Just now" };
                                    }
                                    return tk;
                                  }));
                                }}
                                className="btn-secondary"
                                style={{ padding: "2px 8px", fontSize: "10px", color: "var(--success)", borderColor: "rgba(46, 125, 50, 0.3)" }}
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Chat Logs */}
                      <div className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: "16px", gap: "10px" }}>
                        {chats.filter(msg => msg.ticketId === activeTicketId).map(msg => (
                          <div 
                            key={msg.id} 
                            style={{ 
                              display: "flex", 
                              flexDirection: "column", 
                              alignItems: msg.sender === "admin" ? "flex-end" : "flex-start",
                              width: "100%" 
                            }}
                          >
                            <div 
                              className={`chat-bubble ${msg.sender === "admin" ? "sent" : "received"}`}
                              style={{
                                backgroundColor: msg.sender === "admin" ? "var(--primary-brown)" : "var(--warm-cream-darker)",
                                color: msg.sender === "admin" ? "var(--warm-cream)" : "var(--text-main)"
                              }}
                            >
                              {msg.sender === "astrologer" && msg.category && (
                                <span className="chat-category-tag" style={{ border: "1px solid", marginBottom: "4px", display: "inline-block" }}>{msg.category}</span>
                              )}
                              <div>{msg.text}</div>
                              {msg.attachment && (
                                <div className="attachment-badge">
                                  <span>📎 {msg.attachment.name}</span>
                                  {msg.attachment.type === "image" && (
                                    <div style={{ marginTop: "4px" }}>
                                      {msg.attachment.url === "gpay" && (
                                        <div style={{ padding: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #1A73E8, #0D47A1)", color: "white", fontSize: "10px", textAlign: "center" }}>GPay Success Receipt</div>
                                      )}
                                      {msg.attachment.url === "phonepe" && (
                                        <div style={{ padding: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #5F259F, #3F1B6B)", color: "white", fontSize: "10px", textAlign: "center" }}>PhonePe Success Receipt</div>
                                      )}
                                      {msg.attachment.url === "paytm" && (
                                        <div style={{ padding: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #00B9F5, #FFF)", color: "#002970", border: "1px solid #ddd", fontSize: "10px", textAlign: "center" }}>Paytm Success Receipt</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="chat-meta" style={{ color: msg.sender === "admin" ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}>
                                {msg.timestamp}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input Console */}
                      <div className="chat-input-area" style={{ backgroundColor: "var(--bg-app)" }}>
                        <input 
                          type="text" 
                          placeholder="Type response to Astrologer..." 
                          className="form-input" 
                          style={{ flex: 1, borderRadius: "8px" }}
                          value={adminChatMsg}
                          onChange={(e) => setAdminChatMsg(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAdminSendMessage()}
                        />
                        <button 
                          onClick={handleAdminSendMessage}
                          className="btn-primary" 
                          style={{ padding: "10px 16px" }}
                        >
                          <Send size={14} /> Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. ADMIN NOTIFICATIONS OPERATIONS PANEL */}
              {adminTab === "notifications" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-heading)" }}>Notification Operations Center</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
                    
                    {/* Left: Dispatch Form */}
                    <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>
                        📢 Broadcast Push / Email Alerts
                      </h4>
                      
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!broadcastTitle || !broadcastBody) {
                          alert("Please fill out both title and message body.");
                          return;
                        }
                        try {
                          const res = await fetch(`${API_BASE}/api/notifications/broadcast`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: broadcastTitle,
                              body: broadcastBody,
                              target: broadcastTargetRole,
                              type: broadcastType
                            })
                          });
                          if (res.ok) {
                            alert("Broadcast successfully dispatched!");
                            setBroadcastTitle("");
                            setBroadcastBody("");
                            const historyRes = await fetch(`${API_BASE}/api/notifications/admin-history`);
                            if (historyRes.ok) setAdminHistory(await historyRes.json());
                          } else {
                            const errData = await res.json();
                            alert("Failed to send broadcast: " + (errData.error || "Unknown error"));
                          }
                        } catch (err) {
                          alert("Network error dispatching broadcast.");
                        }
                      }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Broadcast Target Group</label>
                          <select 
                            value={broadcastTargetRole}
                            onChange={(e) => setBroadcastTargetRole(e.target.value)}
                            className="form-select"
                          >
                            <option value="astrologer">Astrologers Only (Verified & Pending)</option>
                            <option value="all">All Registered Users</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Notification Category</label>
                          <select 
                            value={broadcastType}
                            onChange={(e) => setBroadcastType(e.target.value)}
                            className="form-select"
                          >
                            <option value="admin">System Alert (Admin)</option>
                            <option value="registration">Onboarding / Registration</option>
                            <option value="booking">Bookings Updates</option>
                            <option value="payment">Payments / Receipts</option>
                            <option value="membership">Membership Operations</option>
                            <option value="chat">Direct Chat</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Title *</label>
                          <input 
                            type="text" 
                            required 
                            className="form-input" 
                            placeholder="e.g. Server Maintenance or App Update"
                            value={broadcastTitle}
                            onChange={(e) => setBroadcastTitle(e.target.value)}
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Message Body *</label>
                          <textarea 
                            required 
                            className="form-input" 
                            rows={4}
                            placeholder="Type broadcast message details here..."
                            value={broadcastBody}
                            onChange={(e) => setBroadcastBody(e.target.value)}
                            style={{ resize: "vertical", fontFamily: "inherit" }}
                          />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", marginTop: "6px" }}>
                          🚀 Dispatch Broadcast Alert
                        </button>
                      </form>
                    </div>

                    {/* Right: History Log */}
                    <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>
                        📋 Delivery Logs & Audit Trail
                      </h4>

                      <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                        <input 
                          type="text" 
                          placeholder="Search logs by email, phone, or title..." 
                          className="form-input" 
                          value={adminHistorySearch}
                          onChange={(e) => setAdminHistorySearch(e.target.value)}
                          style={{ fontSize: "11px", padding: "6px 10px" }}
                        />
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                          <select 
                            value={adminHistoryFilterStatus} 
                            onChange={(e) => setAdminHistoryFilterStatus(e.target.value)} 
                            className="form-select"
                            style={{ fontSize: "10px", padding: "4px" }}
                          >
                            <option value="all">Status: All</option>
                            <option value="Sent">Status: Sent</option>
                            <option value="Failed">Status: Failed</option>
                            <option value="Bypassed">Status: Bypassed</option>
                          </select>
                          <select 
                            value={adminHistoryFilterChannel} 
                            onChange={(e) => setAdminHistoryFilterChannel(e.target.value)} 
                            className="form-select"
                            style={{ fontSize: "10px", padding: "4px" }}
                          >
                            <option value="all">Channel: All</option>
                            <option value="email">Channel: Email</option>
                            <option value="sms">Channel: SMS</option>
                            <option value="push">Channel: Push</option>
                            <option value="in-app">Channel: In-App</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-history-table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {(() => {
                          const filtered = adminHistory.filter(h => {
                            const matchSearch = !adminHistorySearch || 
                              (h.recipient && h.recipient.toLowerCase().includes(adminHistorySearch.toLowerCase())) ||
                              (h.title && h.title.toLowerCase().includes(adminHistorySearch.toLowerCase())) ||
                              (h.type && h.type.toLowerCase().includes(adminHistorySearch.toLowerCase()));
                            const matchStatus = adminHistoryFilterStatus === "all" || h.status === adminHistoryFilterStatus;
                            const matchChannel = adminHistoryFilterChannel === "all" || h.channel === adminHistoryFilterChannel;
                            return matchSearch && matchStatus && matchChannel;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>
                                No delivery logs matching filters.
                              </div>
                            );
                          }

                          return (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                                  <th style={{ padding: "8px 4px" }}>Recipient</th>
                                  <th style={{ padding: "8px 4px" }}>Notification / channel</th>
                                  <th style={{ padding: "8px 4px" }}>Status</th>
                                  <th style={{ padding: "8px 4px" }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filtered.map(h => (
                                  <tr key={h.id} style={{ borderBottom: "1px dotted var(--border-color)" }}>
                                    <td style={{ padding: "8px 4px", maxWidth: "120px", wordBreak: "break-all" }}>
                                      <div style={{ fontWeight: "700" }}>{h.recipient}</div>
                                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{h.timestamp}</div>
                                    </td>
                                    <td style={{ padding: "8px 4px" }}>
                                      <div style={{ fontWeight: "600" }}>{h.title}</div>
                                      <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
                                        <span className={`channel-badge ${h.channel}`} style={{ fontSize: "8px", padding: "1px 4px", borderRadius: "3px", textTransform: "uppercase", fontWeight: "700" }}>
                                          {h.channel}
                                        </span>
                                        <span className={`type-badge ${h.type || 'admin'}`} style={{ fontSize: "8px", padding: "1px 4px", borderRadius: "3px", textTransform: "uppercase", fontWeight: "700" }}>
                                          {h.type || 'admin'}
                                        </span>
                                      </div>
                                    </td>
                                    <td style={{ padding: "8px 4px" }}>
                                      <span className={`status-badge ${h.status.toLowerCase()}`} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                        {h.status}
                                      </span>
                                    </td>
                                    <td style={{ padding: "8px 4px" }}>
                                      <button 
                                        onClick={async () => {
                                          try {
                                            const res = await fetch(`${API_BASE}/api/notifications/resend`, {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ logId: h.id })
                                            });
                                            if (res.ok) {
                                              alert("Resend request dispatched successfully!");
                                              const historyRes = await fetch(`${API_BASE}/api/notifications/admin-history`);
                                              if (historyRes.ok) setAdminHistory(await historyRes.json());
                                            } else {
                                              alert("Failed to resend notification.");
                                            }
                                          } catch (e) {
                                            alert("Error occurred resending notification.");
                                          }
                                        }}
                                        className="btn-secondary"
                                        style={{ padding: "2px 6px", fontSize: "9px" }}
                                      >
                                        Resend
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 7. REPORTS CENTER PANEL */}
              {adminTab === "reports" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>📊 Performance Reports Center</h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <select 
                        value={reportsAstroFilter} 
                        onChange={(e) => setReportsAstroFilter(e.target.value)} 
                        className="form-select"
                        style={{ fontSize: "12px", padding: "8px 12px" }}
                      >
                        <option value="all">All Astrologers</option>
                        {astrologersList.map(a => (
                          <option key={a.id} value={a.name}>{a.name}</option>
                        ))}
                      </select>
                      <select 
                        value={reportsDateRange} 
                        onChange={(e) => setReportsDateRange(e.target.value)} 
                        className="form-select"
                        style={{ fontSize: "12px", padding: "8px 12px" }}
                      >
                        <option value="all">All-Time Data</option>
                        <option value="today">Today Only</option>
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    
                    {/* Left: Export CSV / Excel controls */}
                    <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>
                        💾 Raw Data Exporters (CSV / Excel format)
                      </h4>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                        Download complete system collections directly in spreadsheet-ready CSV or XML formats. No backend dependencies, downloads execute instantly in browser.
                      </p>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dotted var(--border-color)", paddingBottom: "8px" }}>
                          <div>
                            <strong style={{ fontSize: "12px" }}>Astrologer Partner Directory</strong>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Export all registered, approved, and suspended profiles.</div>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button 
                              type="button" 
                              onClick={() => {
                                let headers = ["Profile ID", "Name", "Mobile", "Email", "Specialization", "Joined", "Status"];
                                let rows = astrologersList.map(a => [
                                  a.id, a.name, a.phone || a.mobile, a.email || "N/A", a.specialization || "Vedic Pooja", a.joined, a.accountStatus
                                ]);
                                const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", "devsetu_astrologers_directory.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="btn-primary" 
                              style={{ padding: "6px 12px", fontSize: "11px" }}
                            >
                              CSV
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                let headers = ["Profile ID", "Name", "Mobile", "Email", "Specialization", "Joined", "Status"];
                                let rows = astrologersList.map(a => [
                                  a.id, a.name, a.phone || a.mobile, a.email || "N/A", a.specialization || "Vedic Pooja", a.joined, a.accountStatus
                                ]);
                                const csvContent = "data:application/vnd.ms-excel;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", "devsetu_astrologers_directory.xls");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="btn-secondary" 
                              style={{ padding: "6px 12px", fontSize: "11px" }}
                            >
                              Excel
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dotted var(--border-color)", paddingBottom: "8px" }}>
                          <div>
                            <strong style={{ fontSize: "12px" }}>Sacred Ritual Bookings Ledger</strong>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Export booking records, schedules, amounts, and statuses.</div>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button 
                              type="button" 
                              onClick={() => {
                                let headers = ["Booking ID", "Client Name", "Client Mobile", "City", "Service Package", "Astrologer Name", "Amount", "Status", "Date"];
                                let rows = bookings.map(b => [
                                  b.id, b.clientName, b.clientMobile, b.city, b.packageName, b.astrologerName || "Unassigned", b.amount, b.status, b.date
                                ]);
                                const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", "devsetu_bookings_ledger.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="btn-primary" 
                              style={{ padding: "6px 12px", fontSize: "11px" }}
                            >
                              CSV
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                let headers = ["Booking ID", "Client Name", "Client Mobile", "City", "Service Package", "Astrologer Name", "Amount", "Status", "Date"];
                                let rows = bookings.map(b => [
                                  b.id, b.clientName, b.clientMobile, b.city, b.packageName, b.astrologerName || "Unassigned", b.amount, b.status, b.date
                                ]);
                                const csvContent = "data:application/vnd.ms-excel;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", "devsetu_bookings_ledger.xls");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="btn-secondary" 
                              style={{ padding: "6px 12px", fontSize: "11px" }}
                            >
                              Excel
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px" }}>
                          <div>
                            <strong style={{ fontSize: "12px" }}>Financial Ledger & Revenue Report</strong>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Export platform commissions (10% fee) and payouts breakdown.</div>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button 
                              type="button" 
                              onClick={() => {
                                let headers = ["Metric Description", "Value"];
                                let rows = [
                                  ["Total Platform Bookings", stats.totalBookings],
                                  ["Total Collected Amount", stats.revenue * 10],
                                  ["Platform Commission (10%)", stats.revenue],
                                  ["Pandit Payouts (90%)", stats.revenue * 9],
                                  ["Pending Verification Payments", stats.pendingPayments]
                                ];
                                const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", "devsetu_financial_revenue_report.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="btn-primary" 
                              style={{ padding: "6px 12px", fontSize: "11px" }}
                            >
                              CSV
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                let headers = ["Metric Description", "Value"];
                                let rows = [
                                  ["Total Platform Bookings", stats.totalBookings],
                                  ["Total Collected Amount", stats.revenue * 10],
                                  ["Platform Commission (10%)", stats.revenue],
                                  ["Pandit Payouts (90%)", stats.revenue * 9],
                                  ["Pending Verification Payments", stats.pendingPayments]
                                ];
                                const csvContent = "data:application/vnd.ms-excel;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", "devsetu_financial_revenue_report.xls");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="btn-secondary" 
                              style={{ padding: "6px 12px", fontSize: "11px" }}
                            >
                              Excel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: PDF Summary Generators */}
                    <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>
                        🖨️ Printable Summary PDF Reports
                      </h4>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                        Generate gorgeous, properly styled PDF reports and invoices utilizing high-quality printing styles. Reports open in a print preview window.
                      </p>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
                        <button 
                          type="button" 
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>DEVSETU DAILY REPORT</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 40px; }
                                    h2 { color: #8b6508; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                                    .metric { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
                                    .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #888; }
                                  </style>
                                </head>
                                <body>
                                  <h2>DEVSETU DAILY PLATFORM REPORT</h2>
                                  <p>Generated: ${new Date().toLocaleString()}</p>
                                  <div class="metric">Total Active Partners: ${stats.activeAstro}</div>
                                  <div class="metric">Awaiting Onboarding: ${stats.pendingApprovals}</div>
                                  <div class="metric">Today's Bookings: ${bookings.length}</div>
                                  <div class="metric">Revenue Share (10%): ₹${stats.revenue.toLocaleString()}</div>
                                  <div class="footer">DevSetu Connect Master Control Panel Ledger</div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="btn-secondary" 
                          style={{ padding: "10px", fontSize: "11px" }}
                        >
                          📋 Daily Overview PDF
                        </button>

                        <button 
                          type="button" 
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>DEVSETU WEEKLY REPORT</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 40px; }
                                    h2 { color: #8b6508; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                                    .metric { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
                                    .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #888; }
                                  </style>
                                </head>
                                <body>
                                  <h2>DEVSETU WEEKLY PERFORMANCE REPORT</h2>
                                  <p>Generated: ${new Date().toLocaleString()}</p>
                                  <div class="metric">Week Bookings Count: ${stats.totalBookings}</div>
                                  <div class="metric">Week Active Bookings: ${stats.activeBookings}</div>
                                  <div class="metric">Completed Rituals: ${stats.completedBookings}</div>
                                  <div class="metric">Total Commission: ₹${stats.revenue.toLocaleString()}</div>
                                  <div class="footer">DevSetu Connect Master Control Panel Ledger</div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="btn-secondary" 
                          style={{ padding: "10px", fontSize: "11px" }}
                        >
                          📅 Weekly Stats PDF
                        </button>

                        <button 
                          type="button" 
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>DEVSETU MONTHLY REPORT</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 40px; }
                                    h2 { color: #8b6508; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                                    .metric { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
                                    .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #888; }
                                  </style>
                                </head>
                                <body>
                                  <h2>DEVSETU MONTHLY LEDGER REPORT</h2>
                                  <p>Generated: ${new Date().toLocaleString()}</p>
                                  <div class="metric">Month Total Bookings: ${stats.totalBookings}</div>
                                  <div class="metric">Month Platform Fees: ₹${stats.revenue.toLocaleString()}</div>
                                  <div class="metric">Approved Pandit Listings: ${stats.approvedAstro}</div>
                                  <div class="metric">Hashed PIN Security Coverage: ${stats.hashedPinCoverage}</div>
                                  <div class="footer">DevSetu Connect Master Control Panel Ledger</div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="btn-secondary" 
                          style={{ padding: "10px", fontSize: "11px" }}
                        >
                          📆 Monthly Report PDF
                        </button>

                        <button 
                          type="button" 
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>DEVSETU REVENUE REPORT</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 40px; }
                                    h2 { color: #8b6508; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                                    .metric { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
                                    .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #888; }
                                  </style>
                                </head>
                                <body>
                                  <h2>DEVSETU CUMULATIVE REVENUE SHARE REPORT</h2>
                                  <p>Generated: ${new Date().toLocaleString()}</p>
                                  <div class="metric">Gross Platform Value: ₹${(stats.revenue * 10).toLocaleString()}</div>
                                  <div class="metric">Platform Fee Collected (10%): ₹${stats.revenue.toLocaleString()}</div>
                                  <div class="metric">Pandit Shares Dispatched (90%): ₹${(stats.revenue * 9).toLocaleString()}</div>
                                  <div class="metric">Awaiting Verification Escrow: ₹${(stats.pendingPayments * 200).toLocaleString()}</div>
                                  <div class="footer">DevSetu Connect Master Control Panel Ledger</div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="btn-secondary" 
                          style={{ padding: "10px", fontSize: "11px" }}
                        >
                          💰 Revenue Share PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. AUDIT TRAILS LOG PANEL */}
              {adminTab === "audit" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>🛡️ Security Audit & Logs Panel</h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input 
                        type="text" 
                        placeholder="Search logs by Action or User..." 
                        className="form-input" 
                        value={auditLogSearch}
                        onChange={(e) => setAuditLogSearch(e.target.value)}
                        style={{ width: "240px", fontSize: "12px", padding: "8px 12px" }} 
                      />
                      <select 
                        value={auditLogActionFilter} 
                        onChange={(e) => setAuditLogActionFilter(e.target.value)} 
                        className="form-select"
                        style={{ fontSize: "12px", padding: "8px 12px" }}
                      >
                        <option value="all">All Actions</option>
                        <option value="Status">Account Status Update</option>
                        <option value="Booking">Booking Operation</option>
                        <option value="PIN">PIN Reset Request</option>
                        <option value="Profile">Profile Modification</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-table-wrapper" style={{ padding: "10px", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)" }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Log ID</th>
                          <th>Timestamp</th>
                          <th>Administrator / User</th>
                          <th>Action Triggered</th>
                          <th>Details / Metadata Logs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filtered = auditLogs.filter(log => {
                            const matchSearch = !auditLogSearch || 
                              (log.action && log.action.toLowerCase().includes(auditLogSearch.toLowerCase())) ||
                              (log.event && log.event.toLowerCase().includes(auditLogSearch.toLowerCase())) ||
                              (log.userId && log.userId.toLowerCase().includes(auditLogSearch.toLowerCase())) ||
                              (log.user && log.user.toLowerCase().includes(auditLogSearch.toLowerCase()));
                            
                            let matchAction = true;
                            if (auditLogActionFilter !== "all") {
                              const act = (log.action || log.event || "").toLowerCase();
                              matchAction = act.includes(auditLogActionFilter.toLowerCase());
                            }
                            return matchSearch && matchAction;
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                  No audit events recorded matching the current logs query filters.
                                </td>
                              </tr>
                            );
                          }

                          const itemsPerPage = 5;
                          const totalPages = Math.ceil(filtered.length / itemsPerPage);
                          const page = Math.min(auditLogPage, totalPages || 1);
                          const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

                          return (
                            <>
                              {paginated.map(log => (
                                <tr key={log.id}>
                                  <td><strong style={{ fontFamily: "monospace" }}>{log.id}</strong></td>
                                  <td>{formatDate(log.timestamp)}</td>
                                  <td>
                                    <strong>{log.adminName || "System Administrator"}</strong>
                                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {log.adminId || log.userId || log.user || "ADM00001"}</div>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: "700", color: "var(--primary-brown)" }}>
                                      {log.action || log.event || "Action"}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                      {log.bookingId && <div>Booking ID: {log.bookingId}</div>}
                                      {log.profileId && <div>Profile ID: {log.profileId}</div>}
                                      {log.prevStatus && <div>Prev Status: {log.prevStatus}</div>}
                                      {log.newStatus && <div>New Status: {log.newStatus}</div>}
                                      {!log.bookingId && !log.profileId && <div>{log.action || log.event}</div>}
                                    </div>
                                  </td>
                                </tr>
                              ))}

                              {/* Audit Pagination */}
                              {totalPages > 1 && (
                                <tr>
                                  <td colSpan="5" style={{ padding: "12px", borderTop: "1px solid var(--border-color)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <button 
                                          disabled={page <= 1}
                                          onClick={() => setAuditLogPage(p => Math.max(1, p - 1))}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 10px", fontSize: "11px" }}
                                        >
                                          Prev
                                        </button>
                                        <button 
                                          disabled={page >= totalPages}
                                          onClick={() => setAuditLogPage(p => Math.min(totalPages, p + 1))}
                                          className="btn-secondary" 
                                          style={{ padding: "4px 10px", fontSize: "11px" }}
                                        >
                                          Next
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SMTP EMAIL LOGS PANEL */}
              {adminTab === "email-logs" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>✉️ SMTP Email Logs</h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <input 
                        type="text" 
                        placeholder="Search by Recipient or Subject..." 
                        className="form-input" 
                        value={emailLogSearch}
                        onChange={(e) => setEmailLogSearch(e.target.value)}
                        style={{ width: "220px", fontSize: "12px", padding: "8px 12px" }} 
                      />
                      <select 
                        value={emailLogTemplateFilter} 
                        onChange={(e) => setEmailLogTemplateFilter(e.target.value)} 
                        className="form-select"
                        style={{ fontSize: "12px", padding: "8px 12px" }}
                      >
                        <option value="All">All Templates</option>
                        <option value="registration_received">Welcome Registration</option>
                        <option value="registration_approved">Registration Approved</option>
                        <option value="registration_rejected">Registration Rejected</option>
                        <option value="booking_confirmed">Booking Confirmed</option>
                        <option value="payment_received">Payment Received</option>
                        <option value="payment_verified">Payment Verified</option>
                        <option value="booking_completed">Booking Completed</option>
                        <option value="support_reply">Support Console Reply</option>
                        <option value="generic">Generic Alert</option>
                      </select>
                      <select 
                        value={emailLogStatusFilter} 
                        onChange={(e) => setEmailLogStatusFilter(e.target.value)} 
                        className="form-select"
                        style={{ fontSize: "12px", padding: "8px 12px" }}
                      >
                        <option value="All">All Statuses</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                      </select>
                      <button 
                        onClick={async () => {
                          const res = await fetch(`${API_BASE}/api/admin/email-logs`);
                          if (res.ok) setEmailLogs(await res.json());
                        }}
                        className="btn-secondary"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        🔄 Refresh
                      </button>
                    </div>
                  </div>

                  <div className="admin-table-wrapper" style={{ padding: "10px", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)" }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Log ID</th>
                          <th>Timestamp</th>
                          <th>Recipient</th>
                          <th>Subject / Template</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filtered = emailLogs.filter(log => {
                            const matchSearch = !emailLogSearch || 
                              (log.recipient && log.recipient.toLowerCase().includes(emailLogSearch.toLowerCase())) ||
                              (log.subject && log.subject.toLowerCase().includes(emailLogSearch.toLowerCase()));
                            
                            const matchTemplate = emailLogTemplateFilter === "All" || log.template === emailLogTemplateFilter;
                            const matchStatus = emailLogStatusFilter === "All" || log.status === emailLogStatusFilter;

                            return matchSearch && matchTemplate && matchStatus;
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                  No email transmission logs matching the current criteria.
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map(log => (
                            <tr key={log.id}>
                              <td><strong style={{ fontFamily: "monospace" }}>{log.id}</strong></td>
                              <td>{formatDate(log.createdAt)}</td>
                              <td><strong>{log.recipient}</strong></td>
                              <td>
                                <div style={{ fontWeight: "700" }}>{log.subject}</div>
                                <span style={{ fontSize: "10px", backgroundColor: "var(--warm-cream-darker)", padding: "2px 6px", borderRadius: "4px", color: "var(--primary-brown)", fontFamily: "monospace" }}>
                                  {log.template}
                                </span>
                              </td>
                              <td>
                                {log.status === "sent" ? (
                                  <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", border: "1px solid #c8e6c9" }}>
                                    ✓ Sent
                                  </span>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", border: "1px solid #ffcdd2", width: "fit-content" }}>
                                      ⚠ Failed
                                    </span>
                                    {log.errorMessage && (
                                      <span style={{ fontSize: "9px", color: "var(--error)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.errorMessage}>
                                        {log.errorMessage}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td>
                                <button 
                                  disabled={resendingLogId === log.id}
                                  onClick={async () => {
                                    setResendingLogId(log.id);
                                    try {
                                      const res = await fetch(`${API_BASE}/api/admin/email-logs/${log.id}/resend`, {
                                        method: "POST"
                                      });
                                      const data = await res.json();
                                      if (res.ok) {
                                        alert("Email successfully resent!");
                                        const logsRes = await fetch(`${API_BASE}/api/admin/email-logs`);
                                        if (logsRes.ok) setEmailLogs(await logsRes.json());
                                      } else {
                                        alert("Resend failed: " + (data.error || "Unknown error"));
                                      }
                                    } catch (e) {
                                      alert("Resend failed: " + e.message);
                                    } finally {
                                      setResendingLogId(null);
                                    }
                                  }}
                                  className="btn-primary"
                                  style={{ padding: "6px 12px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                                >
                                  {resendingLogId === log.id ? "Resending..." : "🔁 Resend"}
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SMTP & NOTIFICATION SETTINGS PANEL */}
              {adminTab === "email-settings" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-heading)" }}>⚙️ SMTP & Notification Settings</h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
                    
                    {/* Left Panel: SMTP Health & Settings Toggle */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      
                      {/* Health Check Card */}
                      <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>
                          🩺 SMTP Relays Health Check
                        </h4>
                        
                        {smtpHealth ? (
                          <div style={{
                            padding: "16px",
                            borderRadius: "12px",
                            backgroundColor: smtpHealth.status === "healthy" ? "rgba(46,125,50,0.05)" : "rgba(198,40,40,0.05)",
                            border: `1px solid ${smtpHealth.status === "healthy" ? "var(--success)" : "var(--error)"}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                              <span style={{ fontSize: "18px" }}>{smtpHealth.status === "healthy" ? "🟢" : "🔴"}</span>
                              <span>SMTP Gateway: {smtpHealth.status === "healthy" ? "CONNECTED" : "OFFLINE / ERROR"}</span>
                            </div>
                            <p style={{ fontSize: "12px", margin: 0, color: "var(--text-muted)", lineHeight: "1.4" }}>
                              {smtpHealth.message}
                            </p>
                          </div>
                        ) : (
                          <div style={{ padding: "12px", border: "1px dashed var(--border-color)", borderRadius: "8px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                            No health check run yet. Click verify below to query connection.
                          </div>
                        )}

                        <button 
                          disabled={isCheckingSmtpHealth}
                          onClick={async () => {
                            setIsCheckingSmtpHealth(true);
                            try {
                              const res = await fetch(`${API_BASE}/api/admin/smtp/health`);
                              if (res.ok) setSmtpHealth(await res.json());
                            } catch (e) {
                              setSmtpHealth({ status: 'unhealthy', message: e.message });
                            } finally {
                              setIsCheckingSmtpHealth(false);
                            }
                          }}
                          className="btn-secondary"
                          style={{ padding: "10px", fontSize: "13px", fontWeight: "700" }}
                        >
                          {isCheckingSmtpHealth ? "Verifying connection..." : "🔍 Run SMTP Health Check"}
                        </button>
                      </div>

                      {/* Enable/Disable Toggle Card */}
                      <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>
                          📢 Email Alerts Toggle Control
                        </h4>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                          <div>
                            <strong style={{ fontSize: "14px" }}>Enable Global Emails</strong>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                              Toggle to allow/bypass all outgoing SMTP mail relays
                            </p>
                          </div>
                          <label className="pref-toggle-container">
                            <input 
                              type="checkbox" 
                              className="pref-toggle-input" 
                              checked={!!(smtpSettings && smtpSettings.enabled)} 
                              onChange={async (e) => {
                                const nextVal = e.target.checked;
                                try {
                                  const res = await fetch(`${API_BASE}/api/admin/smtp/settings`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ enabled: nextVal })
                                  });
                                  if (res.ok) {
                                    setSmtpSettings({ id: 'email_settings', enabled: nextVal });
                                  }
                                } catch (err) {
                                  console.warn("Failed to toggle settings:", err);
                                }
                              }} 
                            />
                            <span className="pref-toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Send Test Email */}
                    <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>
                        ✈️ Dispatch SMTP Test Email
                      </h4>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                        Send an instant test email containing DEVSETU HTML branding structure to verify your SMTP relay configurations are working properly.
                      </p>
                      
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!testEmailTarget) return;
                        setIsSendingTestEmail(true);
                        try {
                          const res = await fetch(`${API_BASE}/api/admin/smtp/test`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ to: testEmailTarget })
                          });
                          const data = await res.json();
                          if (res.ok) {
                            alert("Test email dispatched successfully! Status: Sent");
                            setTestEmailTarget("");
                            // Reload logs
                            const logsRes = await fetch(`${API_BASE}/api/admin/email-logs`);
                            if (logsRes.ok) setEmailLogs(await logsRes.json());
                          } else {
                            alert("Failed to send test email: " + (data.error || "Unknown error"));
                          }
                        } catch (err) {
                          alert("Failed: " + err.message);
                        } finally {
                          setIsSendingTestEmail(false);
                        }
                      }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Recipient Email Address *</label>
                          <input 
                            type="email" 
                            required 
                            placeholder="e.g. shastri@devsetu.in" 
                            className="form-input" 
                            value={testEmailTarget}
                            onChange={(e) => setTestEmailTarget(e.target.value)}
                            style={{ fontSize: "13px" }}
                          />
                        </div>
                        
                        <button 
                          type="submit" 
                          disabled={isSendingTestEmail || !testEmailTarget}
                          className="btn-primary"
                          style={{ padding: "10px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        >
                          {isSendingTestEmail ? "Sending test mail..." : "🚀 Dispatch Test Email"}
                        </button>
                      </form>
                    </div>

                  </div>
                </div>
              )}

              {showAdminSecurityModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  backdropFilter: "blur(4px)"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "24px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: 0 }}>
                        Admin Security Settings
                      </h3>
                      <button 
                        onClick={() => setShowAdminSecurityModal(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                      >
                        ✕
                      </button>
                    </div>

                    {adminSecurityError && (
                      <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(198, 40, 40, 0.05)", border: "1px solid var(--error)", fontSize: "11px", color: "var(--error)" }}>
                        {adminSecurityError}
                      </div>
                    )}

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setAdminSecurityError(null);
                      if (adminNewPassword !== adminConfirmPassword) {
                        setAdminSecurityError("Passwords do not match.");
                        return;
                      }
                      try {
                        const res = await fetch(`${API_BASE}/api/auth/change-password`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: adminUser.email, currentPassword: adminCurrentPassword, newPassword: adminNewPassword })
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setAdminSecurityError(data.error || "Failed to change admin password.");
                        } else {
                          // Change successful, reload session
                          alert("Admin password changed successfully. Logging out...");
                          setAdminUser(null);
                          localStorage.removeItem("devsetu_admin_user");
                          setIsAdminLoggedIn(false);
                          setShowAdminSecurityModal(false);
                        }
                      } catch (err) {
                        setAdminSecurityError("Network error occurred.");
                      }
                    }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Current Password *</label>
                        <input 
                          type="password" 
                          required 
                          className="form-input" 
                          value={adminCurrentPassword}
                          onChange={(e) => setAdminCurrentPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">New Password *</label>
                        <input 
                          type="password" 
                          required 
                          className="form-input" 
                          value={adminNewPassword}
                          onChange={(e) => setAdminNewPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Confirm New Password *</label>
                        <input 
                          type="password" 
                          required 
                          className="form-input" 
                          value={adminConfirmPassword}
                          onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        />
                      </div>

                      <div style={{
                        fontSize: "10px",
                        backgroundColor: "var(--warm-cream-darker)",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        lineHeight: "1.4"
                      }}>
                        <strong style={{ color: "var(--primary-brown)" }}>Password Strength Rules:</strong>
                        <ul style={{ margin: "4px 0 0 12px", padding: 0 }}>
                          <li>At least 8 characters</li>
                          <li>Uppercase & lowercase letters</li>
                          <li>At least 1 number</li>
                          <li>At least 1 special character</li>
                        </ul>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                        <button type="button" onClick={() => setShowAdminSecurityModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                          Save Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Push Permission Dialog */}
              {showPushPermissionModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10000,
                  backdropFilter: "blur(5px)"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "340px",
                    padding: "24px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "40px" }}>🔔</div>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: "0 0 8px 0" }}>
                        Enable Push Notifications?
                      </h3>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                        DEVSETU CONNECT wants to send you push alerts. This is required for real-time Pooja bookings, client chat updates, and system broadcasts.
                      </p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => {
                          localStorage.setItem("devsetu_push_permission", "denied");
                          setShowPushPermissionModal(false);
                        }}
                        className="btn-secondary" 
                        style={{ flex: 1, padding: "10px", fontSize: "12px" }}
                      >
                        Don't Allow
                      </button>
                      <button 
                        onClick={() => {
                          registerPushToken(currentUser);
                          setShowPushPermissionModal(false);
                        }}
                        className="btn-primary" 
                        style={{ flex: 1, padding: "10px", fontSize: "12px" }}
                      >
                        Allow Alerts
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Foreground Simulated Push / SMS / Email Toast Alert Banner */}
              {activeToast && (
                <div className="toast-container">
                  <div className="push-toast" onClick={() => setActiveToast(null)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span className="push-toast-title">
                        {activeToast.type === 'email' ? "📧 Simulated Email Outbox" : activeToast.type === 'sms' ? "💬 Simulated SMS Outbox" : "🔔 Simulated Foreground Push"}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveToast(null); }}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px" }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: "700", marginBottom: "4px" }}>Recipient: {activeToast.recipient}</div>
                    {activeToast.subject && <div style={{ fontSize: "10px", color: "var(--temple-gold)", marginBottom: "4px" }}>Subject: {activeToast.subject}</div>}
                    <div className="push-toast-body">
                      {activeToast.message}
                    </div>
                  </div>
                </div>
              )}

              {/* Play Store Release Readiness Modals */}
              {showAboutModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  backdropFilter: "blur(4px)"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "24px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: 0 }}>
                        About DEVSETU CONNECT
                      </h3>
                      <button 
                        onClick={() => setShowAboutModal(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-main)", lineHeight: "1.6" }}>
                      <p><strong>App Name:</strong> DEVSETU CONNECT</p>
                      <p><strong>App Version:</strong> v1.0.0 (Release-Ready)</p>
                      <p><strong>Description:</strong> A premium, secure marketplace connecting verified Vedic Astrologers directly with sacred pooja rituals and clients.</p>
                      <p><strong>Developer:</strong> DEVSETU Developer Team</p>
                    </div>
                    <button type="button" onClick={() => setShowAboutModal(false)} className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                      Close
                    </button>
                  </div>
                </div>
              )}

              {showPrivacyModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  backdropFilter: "blur(4px)"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "420px",
                    padding: "24px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: 0 }}>
                        Privacy Policy
                      </h3>
                      <button 
                        onClick={() => setShowPrivacyModal(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-main)", lineHeight: "1.5", maxHeight: "250px", overflowY: "auto", paddingRight: "8px" }}>
                      <p>We respect your privacy and protect your personal information. This Privacy Policy details how we handle the collection, storage, and processing of your details.</p>
                      <p><strong>1. Information Collection:</strong> We collect details during registration (Name, Email, Mobile Number, State, City, Experience) to verify your credentials and match you with ritual services.</p>
                      <p><strong>2. Data Encryption:</strong> Your account password is hashed securely using high-iteration PBKDF2 cryptography with unique random salts. Plaintext passwords are never stored.</p>
                      <p><strong>3. Third-party Sharing:</strong> We do not share your contact details, client info, or transaction screenshots with external parties. They are used exclusively for verification and support desk chats.</p>
                    </div>
                    <button type="button" onClick={() => setShowPrivacyModal(false)} className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                      I Accept
                    </button>
                  </div>
                </div>
              )}

              {showTermsModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  backdropFilter: "blur(4px)"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "420px",
                    padding: "24px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: 0 }}>
                        Terms & Conditions
                      </h3>
                      <button 
                        onClick={() => setShowTermsModal(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-main)", lineHeight: "1.5", maxHeight: "250px", overflowY: "auto", paddingRight: "8px" }}>
                      <p>Please read these Terms & Conditions carefully before using DEVSETU CONNECT services.</p>
                      <p><strong>1. Astrologer eligibility:</strong> By registering, you confirm that you are a qualified astrologer and will behave ethically in organizing spiritual services.</p>
                      <p><strong>2. Pooja Booking Payments:</strong> All booking advance payments submitted with screenshots must match bank statements. Any fraudulent transaction ID upload will lead to immediate account ban.</p>
                      <p><strong>3. Commision (Astro Fee):</strong> Commision rates are outlined for each package. The app acts as an escrow platform ensuring payouts are completed securely.</p>
                    </div>
                    <button type="button" onClick={() => setShowTermsModal(false)} className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                      I Agree
                    </button>
                  </div>
                </div>
              )}

              {showContactModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  backdropFilter: "blur(4px)"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "24px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--text-main)", margin: 0 }}>
                        Contact Information
                      </h3>
                      <button 
                        onClick={() => setShowContactModal(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-main)", lineHeight: "1.6" }}>
                      <p>For immediate support regarding slot scheduling, payment approval, or app queries, reach out below:</p>
                      <p><strong>📧 Support Email:</strong> support@devsetu.com</p>
                      <p><strong>📞 Admin Hotline:</strong> +91 9999999999</p>
                      <p><strong>⏰ Help Desk Hours:</strong> 9:00 AM - 6:00 PM IST (Mon-Sat)</p>
                    </div>
                    <button type="button" onClick={() => setShowContactModal(false)} className="btn-primary" style={{ width: "100%", padding: "10px" }}>
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Detailed User Profile Tabbed Modal */}
              {showUserProfileModal && selectedUserForModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9000,
                  backdropFilter: "blur(4px)",
                  padding: "20px"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "800px",
                    height: "80vh",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    padding: 0,
                    overflow: "hidden"
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid var(--border-color)", background: "linear-gradient(135deg, var(--secondary-brown), var(--primary-brown))", color: "#fff8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "24px" }}>{selectedUserForModal.avatar || "🧘"}</span>
                        <div>
                          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--temple-gold)", margin: 0 }}>{selectedUserForModal.name}</h3>
                          <p style={{ fontSize: "11px", color: "#e8e2d9", margin: 0 }}>Partner Profile Details — {selectedUserForModal.id}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowUserProfileModal(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#fff8f0" }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Tab Navigation */}
                    <div style={{ display: "flex", backgroundColor: "var(--bg-app)", borderBottom: "1px solid var(--border-color)", overflowX: "auto", whiteSpace: "nowrap" }}>
                      {[
                        { id: "personal", label: "Personal Details" },
                        { id: "bookings", label: "Booking History" },
                        { id: "payments", label: "Payment History" },
                        { id: "documents", label: "Documents" },
                        { id: "notifications", label: "Notifications Feed" },
                        { id: "support", label: "Support Tickets" },
                        { id: "audit", label: "Audit Logs" },
                        { id: "registration", label: "Registration Info" },
                        { id: "sessions", label: "Login History" },
                        { id: "pin_resets", label: "PIN Resets" }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModalActiveTab(tab.id)}
                          style={{
                            padding: "12px 18px",
                            border: "none",
                            background: modalActiveTab === tab.id ? "var(--bg-card)" : "transparent",
                            color: modalActiveTab === tab.id ? "var(--temple-gold)" : "var(--text-muted)",
                            borderBottom: modalActiveTab === tab.id ? "2px solid var(--temple-gold)" : "none",
                            fontWeight: modalActiveTab === tab.id ? "700" : "500",
                            cursor: "pointer",
                            fontSize: "11px"
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Scrollable Tab Content Container */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                      {modalActiveTab === "personal" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", fontSize: "12px" }}>
                          <div><strong>Full Name:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>{selectedUserForModal.name}</p></div>
                          <div><strong>Profile ID:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)", fontFamily: "monospace" }}>{selectedUserForModal.id}</p></div>
                          <div><strong>Mobile Number:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>{selectedUserForModal.phone}</p></div>
                          <div><strong>Email Address:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>{selectedUserForModal.email || "N/A"}</p></div>
                          <div><strong>Specialization:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>{selectedUserForModal.specialization || "Vedic Pooja"}</p></div>
                          <div><strong>Experience:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>{selectedUserForModal.experience || "5 Years"}</p></div>
                          <div><strong>Location:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>{selectedUserForModal.location}</p></div>
                          <div><strong>Account Status:</strong> <span className={`status-badge ${selectedUserForModal.accountStatus === 'approved' ? 'approved' : 'rejected'}`} style={{ marginTop: "4px", display: "inline-block" }}>{selectedUserForModal.accountStatus}</span></div>
                        </div>
                      )}

                      {modalActiveTab === "bookings" && (
                        <div className="admin-table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Booking ID</th>
                                <th>Client Name</th>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const userBookings = bookings.filter(b => b.astrologerName === selectedUserForModal.name);
                                if (userBookings.length === 0) {
                                  return <tr><td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)" }}>No booking history found.</td></tr>;
                                }
                                return userBookings.map(b => (
                                  <tr key={b.id}>
                                    <td><strong>{b.id}</strong></td>
                                    <td>{b.clientName}</td>
                                    <td>{b.packageName}</td>
                                    <td>{b.date}</td>
                                    <td>₹{b.amount.toLocaleString()}</td>
                                    <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {modalActiveTab === "payments" && (
                        <div className="admin-table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Booking ID</th>
                                <th>Payment Type</th>
                                <th>Advance Required</th>
                                <th>UTR / Txn ID</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const userBookings = bookings.filter(b => b.astrologerName === selectedUserForModal.name);
                                if (userBookings.length === 0) {
                                  return <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)" }}>No transactions found.</td></tr>;
                                }
                                return userBookings.map(b => (
                                  <tr key={b.id}>
                                    <td><strong>{b.id}</strong></td>
                                    <td>UPI / QR Pay</td>
                                    <td>₹{(b.amount * 0.2).toLocaleString()}</td>
                                    <td><span style={{ fontFamily: "monospace" }}>{b.txnId || "N/A"}</span></td>
                                    <td><span className={`status-badge ${b.status === 'submitted' ? 'submitted' : ['approved', 'scheduled', 'completed'].includes(b.status) ? 'approved' : 'rejected'}`}>{b.status === 'submitted' ? 'Pending' : ['approved', 'scheduled', 'completed'].includes(b.status) ? 'Verified' : b.status}</span></td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {modalActiveTab === "documents" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          <div style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🪪</div>
                            <strong>Government ID Proof</strong>
                            <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Aadhaar Card Verification Done</p>
                            <span style={{ fontSize: "11px", color: "var(--success)" }}>✓ VERIFIED</span>
                          </div>
                          <div style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📜</div>
                            <strong>Shastri / Acharya Certificate</strong>
                            <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Spiritual Ritual Qualification</p>
                            <span style={{ fontSize: "11px", color: "var(--success)" }}>✓ VERIFIED</span>
                          </div>
                        </div>
                      )}

                      {modalActiveTab === "notifications" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {(() => {
                            const userNotifs = notifications.filter(n => n.relatedProfileId === selectedUserForModal.id);
                            if (userNotifs.length === 0) {
                              return <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>No recent notification history.</p>;
                            }
                            return userNotifs.map(n => (
                              <div key={n.id} style={{ border: "1px solid var(--border-color)", padding: "10px 14px", borderRadius: "8px", fontSize: "11px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", marginBottom: "4px" }}>
                                  <span>{n.title}</span>
                                  <span style={{ color: "var(--text-muted)", fontSize: "9px" }}>{formatDate(n.createdAt)}</span>
                                </div>
                                <p style={{ color: "var(--text-muted)", margin: 0 }}>{n.body}</p>
                              </div>
                            ));
                          })()}
                        </div>
                      )}

                      {modalActiveTab === "support" && (
                        <div className="admin-table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Ticket ID</th>
                                <th>Category</th>
                                <th>Subject</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const userTickets = tickets.filter(t => t.user === selectedUserForModal.email || t.user === selectedUserForModal.phone);
                                if (userTickets.length === 0) {
                                  return <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>No support tickets found.</td></tr>;
                                }
                                return userTickets.map(t => (
                                  <tr key={t.id}>
                                    <td><strong>{t.id}</strong></td>
                                    <td>{t.category}</td>
                                    <td>{t.subject}</td>
                                    <td><span className={`status-badge ${t.status === 'Open' ? 'submitted' : 'approved'}`}>{t.status}</span></td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {modalActiveTab === "audit" && (
                        <div className="admin-table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Timestamp</th>
                                <th>Action Performed</th>
                                <th>User Account</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const userLogs = auditLogs.filter(log => log.user === selectedUserForModal.email || log.user === selectedUserForModal.phone || log.user === selectedUserForModal.id);
                                if (userLogs.length === 0) {
                                  return <tr><td colSpan="3" style={{ textAlign: "center", color: "var(--text-muted)" }}>No audit events recorded for this user.</td></tr>;
                                }
                                return userLogs.map((log, index) => (
                                  <tr key={index}>
                                    <td>{formatDate(log.timestamp)}</td>
                                    <td>{log.action}</td>
                                    <td style={{ fontFamily: "monospace" }}>{log.user}</td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {modalActiveTab === "registration" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "12px" }}>
                          <div><strong>Registration Date:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>{selectedUserForModal.joined || "N/A"}</p></div>
                          <div><strong>Approver:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>devsetuconnect@gmail.com (System)</p></div>
                          <div><strong>Account Level:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>Astrologer Partner MVP Tier</p></div>
                          <div><strong>IP Registered:</strong> <p style={{ margin: "4px 0", color: "var(--text-muted)", fontFamily: "monospace" }}>192.168.1.144</p></div>
                        </div>
                      )}

                      {modalActiveTab === "sessions" && (
                        <div className="admin-table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Date/Time</th>
                                <th>IP Address</th>
                                <th>User Agent</th>
                                <th>Session Version</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{new Date().toLocaleString()}</td>
                                <td style={{ fontFamily: "monospace" }}>122.170.82.15</td>
                                <td>Mozilla/5.0 (Android; Phone) Chrome/104.0.0</td>
                                <td style={{ fontFamily: "monospace" }}>Version 1</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {modalActiveTab === "pin_resets" && (
                        <div className="admin-table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Request ID</th>
                                <th>Request Date</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const userResets = pinResetRequests.filter(r => r.profileId === selectedUserForModal.id);
                                if (userResets.length === 0) {
                                  return <tr><td colSpan="3" style={{ textAlign: "center", color: "var(--text-muted)" }}>No PIN reset requests submitted.</td></tr>;
                                }
                                return userResets.map(r => (
                                  <tr key={r.id}>
                                    <td><strong style={{ fontFamily: "monospace" }}>{r.id}</strong></td>
                                    <td>{formatDate(r.requestDate)}</td>
                                    <td><span className={`status-badge ${r.status === 'pin_reset' ? 'approved' : 'submitted'}`}>{r.status}</span></td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px", borderTop: "1px solid var(--border-color)", background: "var(--bg-app)" }}>
                      <button
                        type="button"
                        onClick={() => setShowUserProfileModal(false)}
                        className="btn-secondary"
                        style={{ padding: "10px 20px" }}
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Edit User Details Modal */}
              {showEditUserModal && userToEdit && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9100,
                  backdropFilter: "blur(4px)",
                  padding: "20px"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "500px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    borderRadius: "16px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", margin: 0, color: "var(--primary-brown)" }}>Edit Partner Details</h3>
                      <button 
                        type="button"
                        onClick={() => setShowEditUserModal(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)" }}
                      >
                        ✕
                      </button>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = {
                          name: e.target.elements.editName.value,
                          phone: e.target.elements.editPhone.value,
                          email: e.target.elements.editEmail.value,
                          state: e.target.elements.editState.value,
                          city: e.target.elements.editCity.value,
                          district: e.target.elements.editDistrict.value,
                          specialization: e.target.elements.editSpecialization.value,
                          experience: e.target.elements.editExperience.value
                        };
                        handleAdminEditUser(userToEdit.email || userToEdit.phone, formData);
                      }}
                      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                    >
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "11px" }}>Full Name</label>
                        <input name="editName" type="text" required defaultValue={userToEdit.name} className="form-input" style={{ padding: "8px 12px" }} />
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "11px" }}>Mobile Phone</label>
                          <input name="editPhone" type="tel" required defaultValue={userToEdit.phone || userToEdit.mobile} className="form-input" style={{ padding: "8px 12px" }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "11px" }}>Email Address</label>
                          <input name="editEmail" type="email" defaultValue={userToEdit.email} className="form-input" style={{ padding: "8px 12px" }} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "11px" }}>State</label>
                          <input name="editState" type="text" defaultValue={userToEdit.state || "Maharashtra"} className="form-input" style={{ padding: "8px 12px" }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "11px" }}>District</label>
                          <input name="editDistrict" type="text" defaultValue={userToEdit.district} className="form-input" style={{ padding: "8px 12px" }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "11px" }}>City</label>
                          <input name="editCity" type="text" defaultValue={userToEdit.city || userToEdit.location} className="form-input" style={{ padding: "8px 12px" }} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "11px" }}>Specialization</label>
                          <select name="editSpecialization" defaultValue={userToEdit.specialization || "Vedic Pooja"} className="form-select" style={{ padding: "8px 12px" }}>
                            <option value="Vedic Pooja">Vedic Pooja</option>
                            <option value="Horoscope Reading">Horoscope Reading</option>
                            <option value="Vastu Shastra">Vastu Shastra</option>
                            <option value="Numerology">Numerology</option>
                            <option value="Palmistry">Palmistry</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "11px" }}>Experience</label>
                          <input name="editExperience" type="text" defaultValue={userToEdit.experience || "5 Years"} className="form-input" style={{ padding: "8px 12px" }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: "10px" }}>
                          Save Changes
                        </button>
                        <button type="button" onClick={() => setShowEditUserModal(false)} className="btn-secondary" style={{ padding: "10px" }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Temporary PIN Dialog Box Modal */}
              {showTempPinModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9500,
                  backdropFilter: "blur(4px)",
                  padding: "20px"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%",
                    maxWidth: "440px",
                    backgroundColor: "var(--bg-card)",
                    border: "2px solid var(--temple-gold)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    borderRadius: "16px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.4)"
                  }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--success)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      ✓ Temporary PIN Generated
                    </h3>
                    
                    <p style={{ fontSize: "12px", color: "var(--text-main)", lineHeight: "1.5", margin: 0 }}>
                      The login PIN for the partner has been reset successfully. Provide them with the temporary credentials below:
                    </p>

                    <div style={{
                      backgroundColor: "rgba(212,175,55,0.08)",
                      border: "1px solid var(--temple-gold)",
                      padding: "16px",
                      borderRadius: "8px",
                      textAlign: "center"
                    }}>
                      <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)" }}>Temporary Password / PIN</span>
                      <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--primary-brown)", letterSpacing: "6px", margin: "6px 0", fontFamily: "monospace" }}>
                        {tempPinValue}
                      </div>
                      <span style={{ fontSize: "9px", color: "var(--error)", fontWeight: "600" }}>⚠️ Valid for first login only. Forced PIN change is active.</span>
                    </div>

                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                      Copy this ready-to-send WhatsApp / SMS notification template for the partner:
                    </p>

                    <div style={{
                      backgroundColor: "var(--bg-app)",
                      border: "1px solid var(--border-color)",
                      padding: "12px",
                      borderRadius: "8px",
                      fontFamily: "monospace",
                      fontSize: "10px",
                      color: "var(--text-main)",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.4"
                    }}>
                      {`Namaste Shastri Ji,\nYour DEVSETU CONNECT account PIN reset request has been processed.\n- Temporary PIN: ${tempPinValue}\nPlease login using this PIN and change it immediately for safety.`}
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          const msg = `Namaste Shastri Ji,\nYour DEVSETU CONNECT account PIN reset request has been processed.\n- Temporary PIN: ${tempPinValue}\nPlease login using this PIN and change it immediately for safety.`;
                          navigator.clipboard.writeText(msg);
                          alert("SMS template copied to clipboard!");
                        }}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        Copy Template
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowTempPinModal(false)}
                        style={{ padding: "10px" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason Modal */}
              {showRejectionModal && rejectionModalUser && (
                <div style={{
                  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
                  display: "flex", alignItems: "center", justifyContext: "center",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 9350, backdropFilter: "blur(4px)", padding: "20px"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%", maxWidth: "440px", backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)", padding: "24px",
                    display: "flex", flexDirection: "column", gap: "16px", borderRadius: "16px"
                  }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--error)", margin: 0 }}>
                      ✖ Reject Astrologer Registration
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-main)", margin: 0 }}>
                      Please specify the reason for rejecting <strong>{rejectionModalUser.name}</strong>'s registration application:
                    </p>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "11px" }}>Rejection Reason *</label>
                      <textarea
                        required
                        className="form-input"
                        rows={3}
                        placeholder="e.g., Certificates could not be verified, or invalid profile information."
                        value={rejectionReasonText}
                        onChange={(e) => setRejectionReasonText(e.target.value)}
                        style={{ padding: "8px 12px", resize: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={async () => {
                          if (!rejectionReasonText.trim()) {
                            alert("Please provide a rejection reason.");
                            return;
                          }
                          await handleAdminEditUser(rejectionModalUser.email || rejectionModalUser.phone, {
                            rejectionReason: rejectionReasonText
                          });
                          await handleAdminUpdateUserStatus(rejectionModalUser.email || rejectionModalUser.phone, "rejected");
                          setShowRejectionModal(false);
                          setRejectionReasonText("");
                        }}
                        style={{ flex: 1, padding: "10px", backgroundColor: "var(--error)", borderColor: "var(--error)", color: "white" }}
                      >
                        Confirm Rejection
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setShowRejectionModal(false);
                          setRejectionReasonText("");
                        }}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Dialog Modal */}
              {showConfirmDialog && (
                <div style={{
                  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 9600, backdropFilter: "blur(4px)", padding: "20px"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%", maxWidth: "400px", backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)", padding: "24px",
                    display: "flex", flexDirection: "column", gap: "16px", borderRadius: "16px"
                  }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--primary-brown)", margin: 0 }}>
                      ⚠️ {confirmDialogConfig.title || "Confirm Action"}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-main)", margin: 0, lineHeight: "1.5" }}>
                      {confirmDialogConfig.message}
                    </p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          confirmDialogConfig.onConfirm();
                          setShowConfirmDialog(false);
                        }}
                        style={{ flex: 1, padding: "10px", backgroundColor: "var(--error)", borderColor: "var(--error)", color: "white" }}
                      >
                        {confirmDialogConfig.confirmLabel || "Confirm"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowConfirmDialog(false)}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Notification Modal */}
              {showCustomNotificationModal && customNotificationUser && (
                <div style={{
                  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 9400, backdropFilter: "blur(4px)", padding: "20px"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%", maxWidth: "500px", backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)", padding: "24px",
                    display: "flex", flexDirection: "column", gap: "16px", borderRadius: "16px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", margin: 0, color: "var(--primary-brown)" }}>
                        Send Custom Notification
                      </h3>
                      <button type="button" onClick={() => setShowCustomNotificationModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Recipient: <strong>{customNotificationUser.name}</strong> ({customNotificationUser.email || customNotificationUser.phone})
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "11px" }}>Delivery Channel</label>
                      <select 
                        value={customNotificationChannel} 
                        onChange={(e) => setCustomNotificationChannel(e.target.value)} 
                        className="form-select"
                        style={{ padding: "8px 12px" }}
                      >
                        <option value="push">Push Notification (In-App)</option>
                        <option value="sms">SMS text alert</option>
                        <option value="email">Direct Email message</option>
                        <option value="whatsapp">WhatsApp Business API</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "11px" }}>Subject / Title *</label>
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        placeholder="Notification Title" 
                        value={customNotificationTitle} 
                        onChange={(e) => setCustomNotificationTitle(e.target.value)}
                        style={{ padding: "8px 12px" }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "11px" }}>Message Body *</label>
                      <textarea 
                        required 
                        className="form-input" 
                        rows={3} 
                        placeholder="Type notification message here..." 
                        value={customNotificationBody} 
                        onChange={(e) => setCustomNotificationBody(e.target.value)}
                        style={{ padding: "8px 12px", resize: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          if (!customNotificationTitle.trim() || !customNotificationBody.trim()) {
                            alert("Title and message body are required.");
                            return;
                          }
                          handleAdminSendCustomNotification(
                            customNotificationUser.email || customNotificationUser.phone,
                            customNotificationTitle,
                            customNotificationBody,
                            customNotificationChannel
                          );
                          setShowCustomNotificationModal(false);
                          setCustomNotificationTitle("");
                          setCustomNotificationBody("");
                        }}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        Send Message
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowCustomNotificationModal(false)}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Viewer Modal */}
              {showDocumentViewer && documentViewerFile && (
                <div style={{
                  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 9700, backdropFilter: "blur(6px)", padding: "20px"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%", maxWidth: "600px", backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)", padding: 0, overflow: "hidden",
                    display: "flex", flexDirection: "column", borderRadius: "16px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-app)" }}>
                      <h4 style={{ fontFamily: "var(--font-heading)", margin: 0, color: "var(--primary-brown)" }}>
                        👁 Document Viewer: {documentViewerFile.name}
                      </h4>
                      <button type="button" onClick={() => setShowDocumentViewer(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
                    </div>
                    <div style={{ padding: "20px", display: "flex", justifyContent: "center", backgroundColor: "#1e1e1e", minHeight: "300px", alignItems: "center" }}>
                      <img 
                        src={documentViewerFile.url} 
                        alt={documentViewerFile.name} 
                        style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "8px", border: "2px solid #333" }} 
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--bg-app)" }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          alert(`Downloading file: ${documentViewerFile.name}...`);
                          const link = document.createElement("a");
                          link.href = documentViewerFile.url;
                          link.download = documentViewerFile.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        style={{ padding: "8px 16px" }}
                      >
                        📥 Download File
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowDocumentViewer(false)}
                        style={{ padding: "8px 16px" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Astrologer Assignment Modal */}
              {showAssignAstroModal && (
                <div style={{
                  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 9300, backdropFilter: "blur(4px)", padding: "20px"
                }} className="fade-in">
                  <div className="premium-card" style={{
                    width: "100%", maxWidth: "400px", backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--temple-gold)", padding: "24px",
                    display: "flex", flexDirection: "column", gap: "16px", borderRadius: "16px"
                  }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", color: "var(--primary-brown)", margin: 0 }}>
                      🔮 Assign Approved Astrologer
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-main)", margin: 0 }}>
                      Select an approved/active astrologer to assign to Booking ID: <strong>{assignAstroBookingId}</strong>:
                    </p>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "11px" }}>Astrologer Partner *</label>
                      <select
                        value={assignAstroSelectedId}
                        onChange={(e) => setAssignAstroSelectedId(e.target.value)}
                        className="form-select"
                        style={{ padding: "8px 12px" }}
                      >
                        <option value="">-- Choose Partner --</option>
                        {astrologersList.filter(a => a.accountStatus === "approved").map(astro => (
                          <option key={astro.id} value={astro.id}>
                            {astro.name} ({astro.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          if (!assignAstroSelectedId) {
                            alert("Please select an astrologer.");
                            return;
                          }
                          handleAdminAssignAstrologer(assignAstroBookingId, assignAstroSelectedId);
                          setShowAssignAstroModal(false);
                          setAssignAstroBookingId("");
                          setAssignAstroSelectedId("");
                        }}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        Assign Partner
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setShowAssignAstroModal(false);
                          setAssignAstroBookingId("");
                          setAssignAstroSelectedId("");
                        }}
                        style={{ flex: 1, padding: "10px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>

      </main>
      )}
    </div>
  );
}
