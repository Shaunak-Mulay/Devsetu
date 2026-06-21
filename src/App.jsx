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
const getApiBase = () => {
  const saved = localStorage.getItem("devsetu_api_base");
  if (saved) return saved;
  const defaultBase = "http://10.198.94.249:5000";
  if (typeof window !== 'undefined') {
    // In Capacitor (native app)
    if (window.Capacitor) {
      return defaultBase;
    }
    // In local web browser
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return "http://localhost:5000";
    }
    // In web browser via custom network hostname/IP
    if (window.location.hostname) {
      return `http://${window.location.hostname}:5000`;
    }
  }
  return defaultBase;
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

export default function App() {
  // Global Shared State
  const [theme, setTheme] = useState(() => localStorage.getItem("devsetu_theme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("devsetu_lang") || "en");

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

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(0); // 0 = off, 1 = enter email, 2 = enter OTP, 3 = enter new password, 4 = success
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState(null);
  const [forgotRemainingAttempts, setForgotRemainingAttempts] = useState(5);

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
  const [loginFormType, setLoginFormType] = useState("email"); // email or mobile
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

  // Admin Login States
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminShowPassword, setAdminShowPassword] = useState(false);

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
        const notifEmail = currentUser?.email || "";
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

  // Derived Admin Statistics
  const stats = useMemo(() => {
    const totalAstro = astrologersList.length;
    const totalBookings = bookings.length;
    const pendingPayments = bookings.filter(b => b.status === "submitted").length;
    const approvedBookings = bookings.filter(b => ["approved", "scheduled", "completed"].includes(b.status)).length;
    const revenue = bookings
      .filter(b => ["approved", "scheduled", "completed"].includes(b.status))
      .reduce((sum, b) => sum + (b.amount * 0.1), 0); // 10% Devsetu platform fee represented
    return { totalAstro, totalBookings, pendingPayments, approvedBookings, revenue };
  }, [bookings, astrologersList]);

  // Handle Login Submit using fetch request
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const payload = {
        loginFormType,
        email: loginEmail,
        phone: loginPhone,
        password: loginPassword
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

    try {
      const payload = {
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        state: signupState,
        city: signupCity,
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
                  <h4 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: "14px" }}>
                    {t.notifTitle}
                  </h4>
                  <button 
                    onClick={() => { clearNotifications(); setShowNotifications(false); }} 
                    style={{ background: "none", border: "none", color: "var(--orange-accent)", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                  >
                    {t.clearAll}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`notification-banner ${n.type}`}
                      style={{ opacity: n.read ? 0.6 : 1 }}
                    >
                      <div>
                        <div style={{ fontWeight: "700" }}>{n.title}</div>
                        <div>{n.body}</div>
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)", marginLeft: "8px" }}>{n.time}</div>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ width: "100%", marginTop: "12px", fontSize: "11px", padding: "6px" }}
                  onClick={() => setShowNotifications(false)}
                >
                  Close
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
                        const newUrl = prompt("Enter backend API base URL:", localStorage.getItem("devsetu_api_base") || "http://10.198.94.249:5000");
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
                        <div className="login-tabs">
                          <button 
                            type="button"
                            onClick={() => { setLoginFormType("email"); setLoginError(null); }}
                            className={`login-tab-btn ${loginFormType === "email" ? "active" : ""}`}
                          >
                            Email
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setLoginFormType("mobile"); setLoginError(null); }}
                            className={`login-tab-btn ${loginFormType === "mobile" ? "active" : ""}`}
                          >
                            Mobile
                          </button>
                        </div>

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
                                      const payload = loginFormType === "email" ? { email: loginEmail } : { phone: loginPhone };
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
                          {loginFormType === "email" ? (
                            <div className="minimal-input-wrapper">
                              <span className="minimal-input-icon">📧</span>
                              <input 
                                type="email" 
                                required
                                placeholder="Email Address" 
                                className="minimal-input"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                              />
                            </div>
                          ) : (
                            <div className="minimal-input-wrapper">
                              <span className="minimal-input-icon">📱</span>
                              <input 
                                type="tel" 
                                required
                                placeholder="Mobile Number" 
                                className="minimal-input"
                                value={loginPhone}
                                onChange={(e) => setLoginPhone(e.target.value)}
                              />
                            </div>
                          )}

                          <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">🔒</span>
                            <input 
                              type={loginShowPassword ? "text" : "password"} 
                              required
                              placeholder="Password" 
                              className="minimal-input"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
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
                            <a href="#" style={{ color: "var(--temple-gold)", textDecoration: "none", fontWeight: "700" }} onClick={(e) => { e.preventDefault(); setForgotStep(1); setForgotError(null); setForgotEmail(loginEmail); }}>
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
                              required
                              placeholder="Email Address" 
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
                              placeholder="Mobile Number" 
                              className="minimal-input"
                              value={signupPhone}
                              onChange={(e) => setSignupPhone(e.target.value)}
                            />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">State</label>
                              <select 
                                value={signupState}
                                onChange={(e) => setSignupState(e.target.value)}
                                className="form-select"
                                style={{ width: "100%", padding: "8px 12px", fontSize: "12px" }}
                              >
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                <option value="Uttarakhand">Uttarakhand</option>
                                <option value="Karnataka">Karnataka</option>
                              </select>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">City</label>
                              <input 
                                type="text"
                                required
                                placeholder="e.g. Pune"
                                className="form-input"
                                value={signupCity}
                                onChange={(e) => setSignupCity(e.target.value)}
                                style={{ padding: "8px 12px", fontSize: "12px" }}
                              />
                            </div>
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Years of Experience</label>
                            <select 
                              value={signupExperience}
                              onChange={(e) => setSignupExperience(e.target.value)}
                              className="form-select"
                              style={{ width: "100%", padding: "8px 12px", fontSize: "12px" }}
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
                              placeholder="Password" 
                              className="minimal-input"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                            />
                          </div>

                          <div className="minimal-input-wrapper">
                            <span className="minimal-input-icon">🔒</span>
                            <input 
                              type="password" 
                              required
                              placeholder="Confirm Password" 
                              className="minimal-input"
                              value={signupConfirmPassword}
                              onChange={(e) => setSignupConfirmPassword(e.target.value)}
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
                  <div className="phone-nav-header">
                    <img 
                      src={theme === "light" 
                        ? "/devsetu_light_logo.png" 
                        : "/devsetu_dark_logo.png"}
                      alt="DevSetu Logo" 
                      style={{ height: "26px", width: "auto" }}
                    />
                    <button 
                      onClick={() => setShowNotifications(true)} 
                      style={{ background: "none", border: "none", position: "relative", cursor: "pointer" }}
                    >
                      <Bell size={20} color="var(--text-main)" />
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          backgroundColor: "var(--error)",
                          color: "white",
                          borderRadius: "50%",
                          width: "14px",
                          height: "14px",
                          fontSize: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifycontent: "center",
                          fontWeight: "800"
                        }}>
                          {notifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  <div className="phone-screen-body">
                    {/* Welcome Header Section */}
                    <div style={{
                      padding: "16px",
                      borderRadius: "20px",
                      background: "linear-gradient(135deg, var(--secondary-brown), var(--primary-brown))",
                      color: "#FFF6E9",
                      border: "1px solid var(--temple-gold)"
                    }}>
                      <div style={{ fontSize: "12px", opacity: 0.8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{t.welcome}</span>
                        <span style={{ fontSize: "10px", fontWeight: "800", opacity: 0.95, fontFamily: "monospace", letterSpacing: "0.5px" }}>
                          ID: {currentUser?.profileId || "DEV-AST-00001"}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--temple-gold)", margin: "4px 0" }}>
                        {currentUser?.name || t.astroName}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", opacity: 0.9, marginTop: "6px" }}>
                        <Award size={14} color="var(--temple-gold)" />
                        <span>{t.certified}</span>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div>
                      <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>
                        {t.todayStatus}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        <div style={{ backgroundColor: "var(--phone-card-bg)", padding: "8px", borderRadius: "10px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)" }}>
                            {bookings.length}
                          </div>
                          <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600" }}>{t.totalBookings}</div>
                        </div>
                        <div style={{ backgroundColor: "var(--phone-card-bg)", padding: "8px", borderRadius: "10px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--warning)" }}>
                            {bookings.filter(b => b.status === "submitted").length}
                          </div>
                          <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600" }}>{t.pendingApprovals}</div>
                        </div>
                        <div style={{ backgroundColor: "var(--phone-card-bg)", padding: "8px", borderRadius: "10px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--success)" }}>
                            {bookings.filter(b => ["approved", "scheduled"].includes(b.status)).length}
                          </div>
                          <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600" }}>{t.approvedBookings}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div>
                      <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>
                        {t.quickActions}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <button onClick={() => handleQuickAction("services")} className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start", cursor: "pointer", border: "1px solid var(--border-color)", background: "var(--phone-card-bg)", textAlign: "left", width: "100%" }}>
                          <Sparkles size={18} color="var(--orange-accent)" />
                          <span style={{ fontSize: "12px", fontWeight: "800" }}>Browse Services</span>
                        </button>
                        <button onClick={() => handleQuickAction("bookings")} className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start", cursor: "pointer", border: "1px solid var(--border-color)", background: "var(--phone-card-bg)", textAlign: "left", width: "100%" }}>
                          <Calendar size={18} color="var(--temple-gold)" />
                          <span style={{ fontSize: "12px", fontWeight: "800" }}>My Bookings</span>
                        </button>
                        <button onClick={() => handleQuickAction("support")} className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start", cursor: "pointer", border: "1px solid var(--border-color)", background: "var(--phone-card-bg)", textAlign: "left", width: "100%" }}>
                          <MessageSquare size={18} color="var(--primary-brown)" />
                          <span style={{ fontSize: "12px", fontWeight: "800" }}>Support Chat</span>
                        </button>
                        <button onClick={() => handleQuickAction("notifications")} className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start", cursor: "pointer", border: "1px solid var(--border-color)", background: "var(--phone-card-bg)", textAlign: "left", width: "100%" }}>
                          <Bell size={18} color="var(--error)" />
                          <span style={{ fontSize: "12px", fontWeight: "800" }}>Notifications</span>
                        </button>
                      </div>
                    </div>

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
                    <div className="phone-nav-title">{t.bookingsTitle}</div>
                    <Calendar size={18} color="var(--text-muted)" />
                  </div>

                  <div className="phone-screen-body">
                    {/* Booking Flow Redirect Check (If user clicked Book Now and has a created booking waiting for payment) */}
                    {(() => {
                      const createdBooking = bookings.find(b => b.status === "created");
                      if (createdBooking && trackingBookingId === createdBooking.id) {
                        return (
                          <div className="premium-card" style={{ borderColor: "var(--orange-accent)", backgroundColor: "rgba(230,126,34,0.02)" }}>
                            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "13px", color: "var(--orange-accent)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                              <Clock size={16} /> Pending Advance Payment
                            </h4>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
                              Booking {createdBooking.id} created. Complete advance payment of <strong>₹{(createdBooking.amount * 0.2).toLocaleString()} (20% Advance)</strong> to submit to Admin.
                            </p>
                            
                            {/* UPI QR Payment section inside App */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                              <div style={{ textAlign: "center" }}>
                                <div style={{
                                  width: "140px",
                                  height: "140px",
                                  margin: "0 auto 8px",
                                  border: "2px solid var(--temple-gold)",
                                  borderRadius: "12px",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#ffffff",
                                  position: "relative"
                                }}>
                                  {/* Stylized QR mockup replaced by user provided PhonePe QR code */}
                                  <img 
                                    src="/payment_qr_2.jpeg" 
                                    onError={(e) => { e.target.src = "/payment_qr_1.jpeg"; }}
                                    alt="Payment QR Code" 
                                    style={{ width: "120px", height: "120px", objectFit: "contain", borderRadius: "8px" }}
                                  />
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-main)", fontWeight: "700" }}>
                                  Scan to Pay: ₹{(createdBooking.amount * 0.2).toLocaleString()}
                                </div>
                              </div>

                              <p style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center", lineHeight: "1.4" }}>
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
                                style={{ width: "100%" }}
                              >
                                {t.submitPayment}
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
                        <div className="bookings-filter-tabs">
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
                              className={`booking-tab-btn ${astroBookingFilter === tab.key ? "active" : ""}`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "12px" }}>
                                  No bookings found in this category.
                                </div>
                              );
                            }

                            return filteredAstroBookings.map(booking => (
                              <div 
                                key={booking.id} 
                                className="premium-card" 
                                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)" }}>
                                    {t.bookingId} {booking.id} | Astrologer ID: {booking.astrologerProfileId || currentUser?.profileId || "DEV-AST-00001"}
                                  </span>
                                  <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                                </div>

                                <h4 style={{ fontSize: "13px", fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
                                  {booking.packageName}
                                </h4>

                                <div style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <div>{t.client} {booking.clientName}</div>
                                  <div>{t.date} {formatDate(booking.date)} | Location: {booking.city}</div>
                                  <div>{t.amount} ₹{booking.amount.toLocaleString()}</div>
                                </div>

                                <button 
                                  onClick={() => setTrackingBookingId(booking.id)}
                                  className="btn-secondary" 
                                  style={{ width: "100%", padding: "6px", fontSize: "10px" }}
                                >
                                  {t.trackStatus}
                                </button>
                              </div>
                            ));
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
                    <div className="phone-nav-title">{showSecurity ? "Security Settings" : t.profileTitle}</div>
                    <Settings size={18} color="var(--text-muted)" />
                  </div>

                  <div className="phone-screen-body">
                    {showSecurity ? (
                      /* Change Password Form View */
                      <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "13px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", margin: 0 }}>
                          Change Password
                        </h4>
                        
                        {securityError && (
                          <div className="alert-danger-box" style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(198, 40, 40, 0.05)", border: "1px solid var(--error)", fontSize: "11px", color: "var(--text-main)" }}>
                            {securityError}
                          </div>
                        )}

                        {securitySuccess && (
                          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(46, 125, 50, 0.05)", border: "1px solid var(--success)", fontSize: "11px", color: "var(--success)" }}>
                            Password updated successfully. Logging out...
                          </div>
                        )}

                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          setSecurityError(null);
                          if (newPassword !== confirmPassword) {
                            setSecurityError("New passwords do not match.");
                            return;
                          }
                          try {
                            const res = await fetch(`${API_BASE}/api/auth/change-password`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: currentUser.email, currentPassword, newPassword })
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              setSecurityError(data.error || "Failed to change password.");
                            } else {
                              setSecuritySuccess(true);
                              setTimeout(() => {
                                setCurrentUser(null);
                                localStorage.removeItem("devsetu_user");
                                setIsLoggedIn(false);
                                setShowSecurity(false);
                              }, 2000);
                            }
                          } catch (err) {
                            setSecurityError("Network error occurred.");
                          }
                        }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Current Password *</label>
                            <input 
                              type="password" 
                              required 
                              className="form-input" 
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">New Password *</label>
                            <input 
                              type="password" 
                              required 
                              className="form-input" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Confirm New Password *</label>
                            <input 
                              type="password" 
                              required 
                              className="form-input" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
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
                            <button type="button" onClick={() => setShowSecurity(false)} className="btn-secondary" style={{ flex: 1 }}>
                              Back
                            </button>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                              Save Password
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <>
                        {/* User Summary Header */}
                        <div className="premium-card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--warm-cream-darker)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", border: "1px solid var(--temple-gold)" }}>
                            🧘
                          </div>
                          <div>
                            <h4 style={{ fontSize: "14px", fontFamily: "var(--font-heading)" }}>{currentUser?.name || "Acharya Shastri"}</h4>
                            <p style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "monospace" }}>ID: {currentUser?.profileId || "DEV-AST-00001"}</p>
                            <p style={{ fontSize: "10px", color: "var(--orange-accent)", fontWeight: "700" }}>⭐ 4.95 Rating (Platinum)</p>
                          </div>
                        </div>

                        {/* Personal Information Card */}
                        <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "12px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", margin: 0 }}>
                            Personal Information
                          </h4>
                          <div style={{ fontSize: "11px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4px" }}>
                            <span style={{ fontWeight: "700" }}>Email:</span>
                            <span>{currentUser?.email || "acharya.shastri@devsetu.com"}</span>
                            
                            <span style={{ fontWeight: "700" }}>Mobile:</span>
                            <span>{currentUser?.phone || "+91 91234 56789"}</span>
                          </div>
                        </div>

                        {/* Professional Information Card */}
                        <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "12px", color: "var(--primary-brown)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", margin: 0 }}>
                            Professional Information
                          </h4>
                          <div style={{ fontSize: "11px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4px" }}>
                            <span style={{ fontWeight: "700" }}>State:</span>
                            <span>{currentUser?.state || "Uttar Pradesh"}</span>
                            
                            <span style={{ fontWeight: "700" }}>City:</span>
                            <span>{currentUser?.city || "Varanasi"}</span>
                            
                            <span style={{ fontWeight: "700" }}>Experience:</span>
                            <span>{currentUser?.experience || "15 Years"}</span>
                            
                            <span style={{ fontWeight: "700" }}>Role:</span>
                            <span>Astrologer (Verified)</span>
                          </div>
                        </div>

                        {/* Quick Setting Options */}
                        <div className="premium-card" style={{ padding: 0 }}>
                          
                          {/* Security Settings Toggle */}
                          <div 
                            onClick={() => { setShowSecurity(true); setSecurityError(null); setSecuritySuccess(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              <span style={{ fontSize: "16px" }}>🔒</span>
                              <span>Security Settings (Change Password)</span>
                            </div>
                            <ChevronRight size={16} color="var(--text-muted)" />
                          </div>

                          {/* Language setting option */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              <Globe size={16} />
                              <span>{t.language}</span>
                            </div>
                            <select 
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="form-select"
                              style={{ padding: "2px 8px", fontSize: "11px" }}
                            >
                              <option value="en">English</option>
                              <option value="hi">हिंदी</option>
                              <option value="mr">मराठी</option>
                            </select>
                          </div>

                          {/* Theme Toggle option */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                              <span>{t.theme}</span>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button 
                                type="button"
                                onClick={() => setTheme("light")} 
                                style={{ 
                                  fontSize: "10px", 
                                  padding: "4px 8px", 
                                  border: "1px solid var(--border-color)", 
                                  borderRadius: "4px",
                                  backgroundColor: theme === "light" ? "var(--primary-brown)" : "transparent",
                                  color: theme === "light" ? "var(--warm-cream)" : "var(--text-main)",
                                  cursor: "pointer"
                                }}
                              >
                                Light
                              </button>
                              <button 
                                type="button"
                                onClick={() => setTheme("dark")} 
                                style={{ 
                                  fontSize: "10px", 
                                  padding: "4px 8px", 
                                  border: "1px solid var(--border-color)", 
                                  borderRadius: "4px",
                                  backgroundColor: theme === "dark" ? "var(--primary-brown)" : "transparent",
                                  color: theme === "dark" ? "var(--warm-cream)" : "var(--text-main)",
                                  cursor: "pointer"
                                }}
                              >
                                Dark
                              </button>
                            </div>
                          </div>

                          {/* Accessibility Mode Toggle */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              <span style={{ fontSize: "16px" }}>♿</span>
                              <span>{localTranslations[language]?.accessibilityToggle || localTranslations.en.accessibilityToggle}</span>
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

                          {/* Enable Alerts option */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              <Bell size={16} />
                              <span>Enable Alerts (Email & SMS)</span>
                            </div>
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                defaultChecked
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          {/* Play Store Release Readiness - About & Version */}
                          <div 
                            onClick={() => setShowAboutModal(true)}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              <span style={{ fontSize: "16px" }}>ℹ️</span>
                              <span>About & App Version</span>
                            </div>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>v1.0.0</span>
                          </div>

                          {/* Play Store Release Readiness - Privacy Policy */}
                          <div 
                            onClick={() => setShowPrivacyModal(true)}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              <span style={{ fontSize: "16px" }}>🛡️</span>
                              <span>Privacy Policy</span>
                            </div>
                            <ChevronRight size={16} color="var(--text-muted)" />
                          </div>

                          {/* Play Store Release Readiness - Terms & Conditions */}
                          <div 
                            onClick={() => setShowTermsModal(true)}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              <span style={{ fontSize: "16px" }}>📄</span>
                              <span>Terms & Conditions</span>
                            </div>
                            <ChevronRight size={16} color="var(--text-muted)" />
                          </div>

                          {/* Play Store Release Readiness - Contact Information */}
                          <div 
                            onClick={() => setShowContactModal(true)}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                              <span style={{ fontSize: "16px" }}>📞</span>
                              <span>Contact Information</span>
                            </div>
                            <ChevronRight size={16} color="var(--text-muted)" />
                          </div>

                          {/* Notification Preferences */}
                          <div style={{ padding: "12px 16px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>
                              {t.notifPref}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                <input type="checkbox" defaultChecked />
                                <span>{t.notifSMS}</span>
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                <input type="checkbox" defaultChecked />
                                <span>{t.notifApp}</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <button 
                          type="button"
                          className="btn-secondary" 
                          style={{ color: "var(--error)", borderColor: "rgba(198,40,40,0.2)", width: "100%" }}
                          onClick={() => {
                            setCurrentUser(null);
                            localStorage.removeItem("devsetu_user");
                            setIsLoggedIn(false);
                            setIsSplash(false);
                          }}
                        >
                          <LogOut size={16} />
                          {t.logout}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
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
                      loginFormType: "email",
                      email: adminUsername,
                      password: adminPassword
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

                  <div className="minimal-input-wrapper">
                    <span className="minimal-input-icon">👤</span>
                    <input 
                      type="text" 
                      required
                      placeholder={localTranslations[language]?.adminUserLabel || localTranslations.en.adminUserLabel} 
                      className="minimal-input"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                    />
                  </div>

                  <div className="minimal-input-wrapper">
                    <span className="minimal-input-icon">🔒</span>
                    <input 
                      type={adminShowPassword ? "text" : "password"} 
                      required
                      placeholder="Password" 
                      className="minimal-input"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
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
                  {/* Statistics Widgets */}
                  <div className="admin-stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon-wrapper">
                        <Users size={22} />
                      </div>
                      <div>
                        <div className="stat-value">{stats.totalAstro}</div>
                        <div className="stat-label">Total Astrologers</div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper bookings">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <div className="stat-value">{stats.totalBookings}</div>
                        <div className="stat-label">Total Bookings</div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper warning">
                        <CreditCard size={22} />
                      </div>
                      <div>
                        <div className="stat-value">{stats.pendingPayments}</div>
                        <div className="stat-label">Pending Payments</div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper success">
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <div className="stat-value">{stats.approvedBookings}</div>
                        <div className="stat-label">Approved Bookings</div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper revenue">
                        <DollarSign size={22} />
                      </div>
                      <div>
                        <div className="stat-value">₹{stats.revenue.toLocaleString()}</div>
                        <div className="stat-label">Plat. Commission (10%)</div>
                      </div>
                    </div>
                  </div>

                  {/* Charts and Tables split */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    
                    {/* Booking Trends Bar Chart (CSS-based) */}
                    <div className="chart-container-box">
                      <div className="chart-header">
                        <h4 className="chart-title">Booking Trends by Location</h4>
                      </div>
                      <div className="bar-chart">
                        {(() => {
                          const cities = ["Varanasi", "Trimbakeshwar", "Ujjain", "Pune", "Haridwar"];
                          const maxVal = 10;
                          return cities.map(city => {
                            const count = bookings.filter(b => b.city === city).length + 2; // pad data for visualization
                            const pct = (count / maxVal) * 100;
                            return (
                              <div key={city} className="bar-column">
                                <div className="bar-pill" style={{ height: `${pct}%` }}>
                                  <div className="bar-value-tooltip">{count}</div>
                                </div>
                                <span className="bar-label">{city.slice(0, 5)}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Popular Services Table */}
                    <div className="chart-container-box">
                      <div className="chart-header">
                        <h4 className="chart-title">Ritual Marketplace Performance</h4>
                      </div>
                      <div className="admin-table-wrapper" style={{ border: "none" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Service Name</th>
                              <th>Pooja Booked</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {servicesData.slice(0, 4).map(service => {
                              const count = bookings.filter(b => b.serviceId === service.id).length;
                              return (
                                <tr key={service.id}>
                                  <td>{service.titleEN}</td>
                                  <td><strong>{count}</strong> bookings</td>
                                  <td>
                                    <span className="status-badge approved" style={{ fontSize: "9px", padding: "2px 8px" }}>Active</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)" }}>Astrologer Directory</h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input type="text" placeholder="Search by name, location..." className="form-input" style={{ width: "240px" }} />
                      <button className="btn-secondary"><Filter size={16} /> Filter</button>
                    </div>
                  </div>

                  {/* Pending Approvals Table Section */}
                  {astrologersList.filter(u => u.accountStatus === "pending").length > 0 && (
                    <div className="chart-container-box" style={{ padding: "20px" }}>
                      <h4 className="chart-title" style={{ color: "var(--warning)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        ⚠️ Pending Registrations Verification Queue
                      </h4>
                      <div className="admin-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Profile ID</th>
                              <th>Name</th>
                              <th>Mobile</th>
                              <th>Email</th>
                              <th>State / City</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {astrologersList.filter(u => u.accountStatus === "pending").map(u => (
                              <tr key={u.id}>
                                <td><strong style={{ fontFamily: "monospace" }}>{u.id}</strong></td>
                                <td>{u.name}</td>
                                <td>{u.phone}</td>
                                <td>{u.email}</td>
                                <td>{u.location}</td>
                                <td>
                                  <span className="status-badge submitted" style={{ fontSize: "9px" }}>Pending Verification</span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button 
                                      onClick={() => handleAdminUpdateUserStatus(u.email, "approved")}
                                      className="btn-primary" 
                                      style={{ padding: "6px 12px", fontSize: "11px", backgroundColor: "var(--success)", borderColor: "var(--success)", color: "white" }}
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleAdminUpdateUserStatus(u.email, "rejected")}
                                      className="btn-secondary" 
                                      style={{ padding: "6px 12px", fontSize: "11px", color: "var(--error)", borderColor: "rgba(198,40,40,0.2)" }}
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
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                    <h4 className="chart-title">Active Astrologer Network</h4>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    {astrologersList.filter(u => u.accountStatus === "approved").map(astro => (
                      <div key={astro.id} className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "var(--bg-card)" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--warm-cream-darker)", display: "flex", alignItems: "center", justifycontent: "center", fontSize: "24px" }}>
                            {astro.avatar}
                          </div>
                          <div>
                            <h4 style={{ fontSize: "15px", fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>{astro.name}</h4>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: {astro.id} | {astro.location}</p>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "10px 0", textAlign: "center", fontSize: "11px" }}>
                          <div>
                            <strong>{astro.rating} ⭐</strong>
                            <div style={{ color: "var(--text-muted)", fontSize: "9px" }}>Rating</div>
                          </div>
                          <div>
                            <strong>{astro.experience}</strong>
                            <div style={{ color: "var(--text-muted)", fontSize: "9px" }}>Experience</div>
                          </div>
                          <div>
                            <strong>{bookings.filter(b => b.astrologerName === astro.name).length + (astro.totalBookings || 0)}</strong>
                            <div style={{ color: "var(--text-muted)", fontSize: "9px" }}>Bookings</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", fontSize: "11px" }}>
                          <button 
                            onClick={() => {
                              setSelectedAdminAstrologer(astro.id);
                              setAdminTab("bookings");
                              setAdminBookingSearch(astro.name);
                            }}
                            className="btn-secondary" 
                            style={{ flex: 1, padding: "8px" }}
                          >
                            Booking Log
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAdminAstrologer(astro.id);
                              setAdminTab("support");
                            }}
                            className="btn-primary" 
                            style={{ flex: 1, padding: "8px" }}
                          >
                            Open Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. PAYMENT VERIFICATION QUEUE */}
              {adminTab === "payments" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-heading)" }}>UPI Payment Verification Queue</h3>
                  
                  {bookings.filter(b => b.status === "submitted").length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", color: "var(--text-muted)" }}>
                      🎉 Excellent! All payments are verified. No pending transactions in queue.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                      
                      {/* Active queue list */}
                      <div className="admin-table-wrapper">
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
                      <div className="chart-container-box" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <h4 className="chart-title">Payment Evidence Review</h4>
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

                              <div className="screenshot-box">
                                {activePayment.screenshot && activePayment.screenshot.startsWith("data:image/") ? (
                                  <img 
                                    src={activePayment.screenshot} 
                                    alt="Payment Evidence Screenshot" 
                                    className="screenshot-img" 
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
                                  style={{ flex: 1, backgroundColor: "var(--success)", borderColor: "var(--success)" }}
                                >
                                  Approve & Book Slot
                                </button>
                                <button 
                                  onClick={() => handleAdminRequestClarification(activePayment.id)} 
                                  className="btn-secondary" 
                                  style={{ color: "var(--warning)", borderColor: "rgba(212,175,55,0.3)" }}
                                >
                                  Request Clarification
                                </button>
                                <button 
                                  onClick={() => handleAdminVerifyPayment(activePayment.id, false)} 
                                  className="btn-secondary" 
                                  style={{ color: "var(--error)", borderColor: "rgba(198,40,40,0.2)" }}
                                >
                                  Reject Payment
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>

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
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
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
                          <th>Paid Amount</th>
                          <th>Current Status</th>
                          <th>Advance Status Controls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b.id}>
                            <td><strong>{b.id}</strong></td>
                            <td>
                              <div>{b.packageName}</div>
                              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Requested by {b.astrologerName} ({b.astrologerProfileId || "DEV-AST-00001"})</span>
                            </td>
                            <td>
                              <strong>{b.clientName}</strong><br/>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>📞 {b.clientMobile} | 📍 {b.city}</span>
                            </td>
                            <td>{b.date}</td>
                            <td>₹{b.amount.toLocaleString()}</td>
                            <td>
                              <span className={`status-badge ${b.status}`}>{b.status}</span>
                            </td>
                            <td>
                              {b.status === "created" && (
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Awaiting Payment</span>
                              )}
                              {b.status === "submitted" && (
                                <button 
                                  onClick={() => handleAdminUpdateStatus(b.id, "verification_pending")}
                                  className="btn-primary" 
                                  style={{ padding: "4px 10px", fontSize: "11px", backgroundColor: "var(--orange-accent)", borderColor: "var(--orange-accent)" }}
                                >
                                  Start Verify
                                </button>
                              )}
                              {b.status === "verification_pending" && (
                                <button 
                                  onClick={() => handleAdminUpdateStatus(b.id, "admin_review")}
                                  className="btn-primary" 
                                  style={{ padding: "4px 10px", fontSize: "11px", backgroundColor: "var(--orange-accent)", borderColor: "var(--orange-accent)" }}
                                >
                                  Move to Review
                                </button>
                              )}
                              {b.status === "admin_review" && (
                                <button 
                                  onClick={() => handleAdminUpdateStatus(b.id, "approved")}
                                  className="btn-primary" 
                                  style={{ padding: "4px 10px", fontSize: "11px", backgroundColor: "var(--success)", borderColor: "var(--success)" }}
                                >
                                  Approve Booking
                                </button>
                              )}
                              {b.status === "approved" && (
                                <button 
                                  onClick={() => handleAdminUpdateStatus(b.id, "scheduled")}
                                  className="btn-primary" 
                                  style={{ padding: "4px 10px", fontSize: "11px" }}
                                >
                                  Mark Scheduled
                                </button>
                              )}
                              {b.status === "scheduled" && (
                                <button 
                                  onClick={() => handleAdminUpdateStatus(b.id, "completed")}
                                  className="btn-primary" 
                                  style={{ padding: "4px 10px", fontSize: "11px", backgroundColor: "var(--success)", borderColor: "var(--success)" }}
                                >
                                  Complete Ritual
                                </button>
                              )}
                              {b.status === "completed" && (
                                <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: "700" }}>✓ Successful</span>
                              )}
                              {(b.status === "cancelled" || b.status === "rejected") && (
                                <span style={{ fontSize: "11px", color: "var(--error)", fontWeight: "700" }}>✖ Cancelled</span>
                              )}
                            </td>
                          </tr>
                        ))}
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

            </div>
          </div>
        </>
      )}
    </section>

      </main>
    </div>
  );
}
