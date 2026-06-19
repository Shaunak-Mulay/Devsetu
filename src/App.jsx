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
  
  // Accessibility & Missing Page States
  const [isSplash, setIsSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  
  // Login Form States
  const [loginFormType, setLoginFormType] = useState("email"); // email or mobile
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  
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
  const [simulatorView, setSimulatorView] = useState("both"); // both, mobile, admin
  
  // Navigation stack in Mobile App
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingFlow, setIsBookingFlow] = useState(null); // stores active package
  const [trackingBookingId, setTrackingBookingId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Active bookings list
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("devsetu_bookings");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "BK-5431",
        astrologerName: "Acharya K. N. Shastri",
        serviceId: "mahamrityunjaya",
        packageName: "Pancha Shanti (3 Pandits)",
        amount: 11000,
        astroFee: 1200,
        clientName: "Sunita Sharma",
        clientMobile: "9123456789",
        city: "Varanasi",
        date: "2026-06-18",
        status: "submitted", // submitted / verification pending
        txnId: "TXN8491023849",
        screenshot: "phonepe",
        notes: "Client is extremely weak, please prioritize health blessings.",
        createdAt: "2026-06-17T11:00:00Z"
      },
      {
        id: "BK-9082",
        astrologerName: "Acharya K. N. Shastri",
        serviceId: "kaalsarp",
        packageName: "Trimbakeshwar Special Vidhi",
        amount: 9500,
        astroFee: 1000,
        clientName: "Rajesh Malhotra",
        clientMobile: "9876543210",
        city: "Nashik",
        date: "2026-06-20",
        status: "approved",
        txnId: "TXN9832710321",
        screenshot: "gpay",
        notes: "Please arrange black sesame seeds.",
        createdAt: "2026-06-16T09:15:00Z"
      },
      {
        id: "BK-1204",
        astrologerName: "Acharya K. N. Shastri",
        serviceId: "rudrabhishek",
        packageName: "Jal & Panchamrut Abhishek",
        amount: 3800,
        astroFee: 350,
        clientName: "Amit Deshmukh",
        clientMobile: "9988776655",
        city: "Pune",
        date: "2026-06-10",
        status: "completed",
        txnId: "TXN1029384756",
        screenshot: "paytm",
        notes: "Monday morning standard pooja schedule.",
        createdAt: "2026-06-09T08:30:00Z"
      }
    ];
  });

  // Active Chats (Shared between Mobile & Admin)
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("devsetu_chats");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        sender: "admin",
        text: "Namaste Acharya Ji, how can we assist you with your pooja bookings today?",
        timestamp: "04:12 PM",
        category: "General Help",
        read: true
      },
      {
        id: 2,
        sender: "astrologer",
        text: "Pranam, I have submitted a booking for Mahamrityunjaya Pooja. Client has sent the payment. Please verify it.",
        timestamp: "04:15 PM",
        category: "Payment Issues",
        read: true
      },
      {
        id: 3,
        sender: "admin",
        text: "Sure Shastri Ji, please upload the screenshot and Txn ID. I will verify it within 5 minutes.",
        timestamp: "04:17 PM",
        category: "Payment Issues",
        read: true
      }
    ];
  });

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Booking Approved",
      body: "Kaalsarp Dosh Nivaran for Rajesh Malhotra has been approved by admin.",
      time: "2 hrs ago",
      type: "approved",
      read: false
    },
    {
      id: 2,
      title: "Payment Received",
      body: "Advance for Rudrabhishek Pooja (Amit Deshmukh) has been successfully verified.",
      time: "1 day ago",
      type: "verified",
      read: true
    }
  ]);

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
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem("devsetu_tickets");
    if (saved) return JSON.parse(saved);
    return [
      { id: "TK-9402", category: "Payment Issues", status: "Open", subject: "Verify payment for Mahamrityunjaya Pooja BK-5431", lastUpdate: "10 mins ago" },
      { id: "TK-1082", category: "Booking Issues", status: "Resolved", subject: "Slot availability at Trimbakeshwar for Rajesh Malhotra", lastUpdate: "2 days ago" }
    ];
  });
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

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("devsetu_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("devsetu_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("devsetu_tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem("devsetu_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark-theme");
    } else {
      root.classList.remove("dark-theme");
    }
  }, [theme]);

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

  // Derived Admin Statistics
  const stats = useMemo(() => {
    const totalAstro = mockAstrologers.length;
    const totalBookings = bookings.length;
    const pendingPayments = bookings.filter(b => b.status === "submitted").length;
    const approvedBookings = bookings.filter(b => ["approved", "scheduled", "completed"].includes(b.status)).length;
    const revenue = bookings
      .filter(b => ["approved", "scheduled", "completed"].includes(b.status))
      .reduce((sum, b) => sum + (b.amount * 0.1), 0); // 10% Devsetu platform fee represented
    return { totalAstro, totalBookings, pendingPayments, approvedBookings, revenue };
  }, [bookings]);

  // Handle Astrologer Booking Form Submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.clientName || !bookingForm.clientMobile || !bookingForm.preferredDate) {
      alert("Please fill all required fields.");
      return;
    }
    
    // Create new temporary booking in "created" state
    const newBookingId = "BK-" + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: newBookingId,
      astrologerName: "Acharya K. N. Shastri",
      serviceId: selectedService.id,
      packageName: isBookingFlow.name[language] || isBookingFlow.name.en,
      amount: isBookingFlow.price,
      astroFee: isBookingFlow.astroFee,
      clientName: bookingForm.clientName,
      clientMobile: bookingForm.clientMobile,
      city: bookingForm.city,
      date: bookingForm.preferredDate,
      status: "created",
      notes: bookingForm.notes,
      createdAt: new Date().toISOString()
    };

    setBookings([newBooking, ...bookings]);
    setIsBookingFlow(null); // Close form
    setTrackingBookingId(newBookingId);
    setAstroTab("bookings");
    
    // Clear Form
    setBookingForm({
      clientName: "",
      clientMobile: "",
      city: "Varanasi",
      preferredDate: "",
      notes: ""
    });
  };

  // Submit payment details for booking
  const handlePaymentSubmit = (bookingId) => {
    if (!paymentTxnId || paymentTxnId.trim().length < 8) {
      alert("Please enter a valid 12-digit transaction ID.");
      return;
    }

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: "submitted",
          txnId: paymentTxnId,
          screenshot: uploadedScreenshot || selectedMockScreenshot
        };
      }
      return b;
    }));

    // Trigger Notification for Admin
    const notifyMsg = {
      id: Date.now(),
      title: "New Payment Submitted",
      body: `Payment submitted for Booking ${bookingId} (₹${bookings.find(b => b.id === bookingId).amount})`,
      time: "Just now",
      type: "warning",
      read: false
    };
    setNotifications([notifyMsg, ...notifications]);

    // Send automated message in chat
    const chatMsg = {
      id: Date.now(),
      ticketId: activeTicketId || "TK-9402",
      sender: "astrologer",
      text: `Submitted payment for booking ${bookingId}. Txn ID: ${paymentTxnId}. Please approve.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "Payment Issues",
      read: false
    };
    setChats(prev => [...prev, chatMsg]);

    setPaymentTxnId("");
    setUploadedScreenshot(null);
  };

  // Admin verifies payment
  const handleAdminVerifyPayment = (bookingId, isApproved) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: isApproved ? "admin_review" : "cancelled"
        };
      }
      return b;
    }));

    // Add notification to Astrologer
    const newNotif = {
      id: Date.now(),
      title: isApproved ? "Payment Verified" : "Payment Rejected",
      body: isApproved 
        ? `Payment for booking ${bookingId} has been verified. Ritual slot allocation is now in review.` 
        : `Payment for booking ${bookingId} has been rejected. Check support chat.`,
      time: "Just now",
      type: isApproved ? "verified" : "rejected",
      read: false
    };
    setNotifications([newNotif, ...notifications]);

    // Admin replies in support chat
    const replyText = isApproved 
      ? `We have verified transaction details for Booking ${bookingId}. The payment is approved. The booking has moved to Admin Review for scheduling and assignment of pandits.`
      : `Transaction details for Booking ${bookingId} could not be verified. Please review the screenshot and try again.`;

    const chatMsg = {
      id: Date.now(),
      ticketId: activeTicketId || "TK-9402",
      sender: "admin",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "Payment Issues",
      read: false
    };
    setChats(prev => [...prev, chatMsg]);
  };

  // Admin requests clarification on payment
  const handleAdminRequestClarification = (bookingId) => {
    const replyText = `Regarding Booking ${bookingId}, the transaction ref ID does not match our bank ledger logs. Please upload a clearer payment screenshot or confirm the Transaction ID.`;
    
    const chatMsg = {
      id: Date.now(),
      ticketId: activeTicketId || "TK-9402",
      sender: "admin",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "Payment Issues",
      read: false
    };
    setChats(prev => [...prev, chatMsg]);

    const newNotif = {
      id: Date.now(),
      title: "Clarification Requested",
      body: `Admin requested clarification for payment of booking ${bookingId}.`,
      time: "Just now",
      type: "warning",
      read: false
    };
    setNotifications([newNotif, ...notifications]);
    alert("Clarification request sent to the astrologer in support chat.");
  };

  // Admin advances booking stage
  const handleAdminUpdateStatus = (bookingId, nextStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: nextStatus };
      }
      return b;
    }));

    let notifTitle = `Booking Update: ${nextStatus.toUpperCase()}`;
    let notifBody = `Booking ${bookingId} status is now: ${nextStatus}.`;
    let notifType = "info";

    if (nextStatus === "approved") {
      notifTitle = "Booking Approved";
      notifBody = `Booking ${bookingId} is approved, slot allocated, and pandits assigned.`;
      notifType = "approved";
    } else if (nextStatus === "scheduled") {
      notifTitle = "Ritual Scheduled";
      notifBody = `Pooja ritual for booking ${bookingId} is scheduled and pandits are ready.`;
      notifType = "info";
    } else if (nextStatus === "completed") {
      notifTitle = "Ritual Completed";
      notifBody = `Ritual for booking ${bookingId} was completed successfully. Blessings sent!`;
      notifType = "verified";
    }

    const newNotif = {
      id: Date.now(),
      title: notifTitle,
      body: notifBody,
      time: "Just now",
      type: notifType,
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Astrologer sends support message
  const handleAstroSendMessage = (attachedFileData = null) => {
    if (!astroChatMsg.trim() && !attachedFileData) return;

    const newMsg = {
      id: Date.now(),
      ticketId: activeTicketId || "TK-9402",
      sender: "astrologer",
      text: astroChatMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: astroChatCategory,
      read: false,
      attachment: attachedFileData
    };

    setChats(prev => [...prev, newMsg]);
    setAstroChatMsg("");
    setAttachedFile(null);

    // Update ticket's last update time
    setTickets(prev => prev.map(t => {
      if (t.id === activeTicketId) {
        return { ...t, lastUpdate: "Just now" };
      }
      return t;
    }));

    // Simulate Admin Typing & reply if admin tab isn't open
    setAdminTyping(true);
    setTimeout(() => {
      setAdminTyping(false);
      const adminReply = {
        id: Date.now() + 1,
        ticketId: activeTicketId || "TK-9402",
        sender: "admin",
        text: `Hare Krishna. We have received your query for Ticket ${activeTicketId || "TK-9402"}. Our support administrator is checking details.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: astroChatCategory,
        read: false
      };
      setChats(prev => [...prev, adminReply]);
    }, 3000);
  };

  // Admin sends support message
  const handleAdminSendMessage = () => {
    if (!adminChatMsg.trim()) return;

    const newMsg = {
      id: Date.now(),
      ticketId: activeTicketId || "TK-9402",
      sender: "admin",
      text: adminChatMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "General Queries",
      read: false
    };

    setChats(prev => [...prev, newMsg]);
    setAdminChatMsg("");

    // Trigger Notification for Astrologer
    const newNotif = {
      id: Date.now(),
      title: "New Support Reply",
      body: `Admin replied to support Ticket ${activeTicketId || "TK-9402"}.`,
      time: "Just now",
      type: "info",
      read: false
    };
    setNotifications([newNotif, ...notifications]);

    setTickets(prev => prev.map(t => {
      if (t.id === activeTicketId) {
        return { ...t, lastUpdate: "Just now" };
      }
      return t;
    }));
  };

  // Admin broadcasts system announcement
  const handleBroadcastAnnouncement = () => {
    if (!broadcastText.trim()) {
      alert("Please enter announcement text.");
      return;
    }
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
    alert("Broadcast announcement sent to all astrologers.");
  };

  // Clear unread notifications
  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
              ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDTuLVfFlIdG7O2IuP_bYErSDfHvdmJnN5o6fRLQ6eu_1osw1Wxq1CXioT-QGsiBQhD_eZZPotGJAt0b53g6We9UVwJeKJLb6Ud6lqfdemDHQUKFbGN_G4naaY9YpAxDov01slm000uHBGVzOrNXvUUw4DLnmSQUg--Jh7NUtF5fSQCCAFFqNI7CX9-Zx2BeY5lPwCcv4PDDBX-905ZMBSDFAQFEk7764LbkcgO5CxTa1zkZllh3zPQuYLA7SfJBs1Vx2P3CDOJ42jU" 
              : "https://lh3.googleusercontent.com/aida/AP1WRLudWhyozNFGz-MIo4RZ0tNp2UYwqek0T0spYYWhrJt-A2nr0hlPDDom-R3si0uTtFvoD1cVRfgLt9sXfYszE5_rYMe862fg3jRWtkfqyOItdd-A0_6Xi1gHXml3iMwMkQ1Gv-6YfsvHJ7as_AOhzCADb01wzl-rxbV6pfPI9ZnubSsGcZ9dp9FNNWe0OaXJoCsn8gbe71qk1qWX17re89ljSD1dn5zvid5AK6YYIA8BemgfhCySrrgSTzf9erEv-IqeiFXWD7JMgg"}
            alt="DevSetu Logo" 
            className="brand-logo-img"
          />
        </div>

        {/* View Switchers & Translation Toggles */}
        <div className="header-controls">
          {/* Dual Simulator Controller (only visible on wide screens) */}
          <div className="btn-secondary" style={{ display: "flex", gap: "8px", padding: "6px 12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700" }}>{t.roleSwitch}:</span>
            <select 
              value={simulatorView} 
              onChange={(e) => setSimulatorView(e.target.value)}
              className="form-select"
              style={{ padding: "2px 8px", fontSize: "11px", border: "none", background: "transparent", fontWeight: "700" }}
            >
              <option value="both">Split View (Both)</option>
              <option value="mobile">Astrologer App Only</option>
              <option value="admin">Admin Dashboard Only</option>
            </select>
          </div>

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
                          ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDTuLVfFlIdG7O2IuP_bYErSDfHvdmJnN5o6fRLQ6eu_1osw1Wxq1CXioT-QGsiBQhD_eZZPotGJAt0b53g6We9UVwJeKJLb6Ud6lqfdemDHQUKFbGN_G4naaY9YpAxDov01slm000uHBGVzOrNXvUUw4DLnmSQUg--Jh7NUtF5fSQCCAFFqNI7CX9-Zx2BeY5lPwCcv4PDDBX-905ZMBSDFAQFEk7764LbkcgO5CxTa1zkZllh3zPQuYLA7SfJBs1Vx2P3CDOJ42jU" 
                          : "https://lh3.googleusercontent.com/aida/AP1WRLudWhyozNFGz-MIo4RZ0tNp2UYwqek0T0spYYWhrJt-A2nr0hlPDDom-R3si0uTtFvoD1cVRfgLt9sXfYszE5_rYMe862fg3jRWtkfqyOItdd-A0_6Xi1gHXml3iMwMkQ1Gv-6YfsvHJ7as_AOhzCADb01wzl-rxbV6pfPI9ZnubSsGcZ9dp9FNNWe0OaXJoCsn8gbe71qk1qWX17re89ljSD1dn5zvid5AK6YYIA8BemgfhCySrrgSTzf9erEv-IqeiFXWD7JMgg"}
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
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--phone-card-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", marginBottom: "12px", padding: "8px" }}>
                      <img 
                        src={theme === "light" 
                          ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDTuLVfFlIdG7O2IuP_bYErSDfHvdmJnN5o6fRLQ6eu_1osw1Wxq1CXioT-QGsiBQhD_eZZPotGJAt0b53g6We9UVwJeKJLb6Ud6lqfdemDHQUKFbGN_G4naaY9YpAxDov01slm000uHBGVzOrNXvUUw4DLnmSQUg--Jh7NUtF5fSQCCAFFqNI7CX9-Zx2BeY5lPwCcv4PDDBX-905ZMBSDFAQFEk7764LbkcgO5CxTa1zkZllh3zPQuYLA7SfJBs1Vx2P3CDOJ42jU" 
                          : "https://lh3.googleusercontent.com/aida/AP1WRLudWhyozNFGz-MIo4RZ0tNp2UYwqek0T0spYYWhrJt-A2nr0hlPDDom-R3si0uTtFvoD1cVRfgLt9sXfYszE5_rYMe862fg3jRWtkfqyOItdd-A0_6Xi1gHXml3iMwMkQ1Gv-6YfsvHJ7as_AOhzCADb01wzl-rxbV6pfPI9ZnubSsGcZ9dp9FNNWe0OaXJoCsn8gbe71qk1qWX17re89ljSD1dn5zvid5AK6YYIA8BemgfhCySrrgSTzf9erEv-IqeiFXWD7JMgg"}
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
                    <div className="login-tabs">
                      <button 
                        type="button"
                        onClick={() => setLoginFormType("email")}
                        className={`login-tab-btn ${loginFormType === "email" ? "active" : ""}`}
                      >
                        Email
                      </button>
                      <button 
                        type="button"
                        onClick={() => setLoginFormType("mobile")}
                        className={`login-tab-btn ${loginFormType === "mobile" ? "active" : ""}`}
                      >
                        Mobile
                      </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                        <a href="#" style={{ color: "var(--temple-gold)", textDecoration: "none", fontWeight: "700" }} onClick={(e) => e.preventDefault()}>
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
                      <a href="#" style={{ color: "var(--primary-brown)", fontWeight: "800", textDecoration: "none" }} onClick={(e) => e.preventDefault()}>
                        {localTranslations[language]?.loginSignUp || localTranslations.en.loginSignUp}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              {astroTab === "home" && (
                <>
                  <div className="phone-nav-header">
                    <img 
                      src={theme === "light" 
                        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDTuLVfFlIdG7O2IuP_bYErSDfHvdmJnN5o6fRLQ6eu_1osw1Wxq1CXioT-QGsiBQhD_eZZPotGJAt0b53g6We9UVwJeKJLb6Ud6lqfdemDHQUKFbGN_G4naaY9YpAxDov01slm000uHBGVzOrNXvUUw4DLnmSQUg--Jh7NUtF5fSQCCAFFqNI7CX9-Zx2BeY5lPwCcv4PDDBX-905ZMBSDFAQFEk7764LbkcgO5CxTa1zkZllh3zPQuYLA7SfJBs1Vx2P3CDOJ42jU" 
                        : "https://lh3.googleusercontent.com/aida/AP1WRLudWhyozNFGz-MIo4RZ0tNp2UYwqek0T0spYYWhrJt-A2nr0hlPDDom-R3si0uTtFvoD1cVRfgLt9sXfYszE5_rYMe862fg3jRWtkfqyOItdd-A0_6Xi1gHXml3iMwMkQ1Gv-6YfsvHJ7as_AOhzCADb01wzl-rxbV6pfPI9ZnubSsGcZ9dp9FNNWe0OaXJoCsn8gbe71qk1qWX17re89ljSD1dn5zvid5AK6YYIA8BemgfhCySrrgSTzf9erEv-IqeiFXWD7JMgg"}
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
                      <div style={{ fontSize: "12px", opacity: 0.8 }}>{t.welcome}</div>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--temple-gold)", margin: "4px 0" }}>
                        {t.astroName}
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
                                  {/* Stylized QR mockup */}
                                  <div style={{ width: "100px", height: "100px", background: "repeating-conic-gradient(from 45deg, #2B1B12 0deg 30deg, transparent 0deg 60deg)", opacity: 0.85 }}></div>
                                  <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary-brown)", position: "absolute", bottom: "4px", backgroundColor: "#fff", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-color)" }}>
                                    {t.qrArea}
                                  </span>
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
                              <strong>{booking.id}</strong> | {booking.packageName}
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
                                    {t.bookingId} {booking.id}
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
                                <div className="ticket-meta">{ticket.category} • Updated {ticket.lastUpdate}</div>
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
                            <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--temple-gold)" }}>{activeTicketId}</span>
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
                    <div className="phone-nav-title">{t.profileTitle}</div>
                    <Settings size={18} color="var(--text-muted)" />
                  </div>

                  <div className="phone-screen-body">
                    {/* User Summary */}
                    <div className="premium-card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--warm-cream-darker)", display: "flex", alignItems: "center", justifycontent: "center", fontSize: "24px", border: "1px solid var(--temple-gold)" }}>
                        👴
                      </div>
                      <div>
                        <h4 style={{ fontSize: "14px", fontFamily: "var(--font-heading)" }}>Acharya Shastri</h4>
                        <p style={{ fontSize: "9px", color: "var(--text-muted)" }}>{t.license}</p>
                        <p style={{ fontSize: "10px", color: "var(--orange-accent)", fontWeight: "700" }}>⭐ 4.95 Rating</p>
                      </div>
                    </div>

                    {/* Quick Setting Options */}
                    <div className="premium-card" style={{ padding: 0 }}>
                      
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
                        setIsLoggedIn(false);
                        setIsSplash(false);
                      }}
                    >
                      <LogOut size={16} />
                      {t.logout}
                    </button>
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
                      src="https://lh3.googleusercontent.com/aida/AP1WRLudWhyozNFGz-MIo4RZ0tNp2UYwqek0T0spYYWhrJt-A2nr0hlPDDom-R3si0uTtFvoD1cVRfgLt9sXfYszE5_rYMe862fg3jRWtkfqyOItdd-A0_6Xi1gHXml3iMwMkQ1Gv-6YfsvHJ7as_AOhzCADb01wzl-rxbV6pfPI9ZnubSsGcZ9dp9FNNWe0OaXJoCsn8gbe71qk1qWX17re89ljSD1dn5zvid5AK6YYIA8BemgfhCySrrgSTzf9erEv-IqeiFXWD7JMgg"
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
                <form onSubmit={(e) => { e.preventDefault(); setIsAdminLoggedIn(true); }} style={{ padding: "40px", width: "60%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
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
                    <a href="#" style={{ color: "var(--temple-gold)", textDecoration: "none", fontWeight: "700" }} onClick={(e) => e.preventDefault()}>
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
                      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDTuLVfFlIdG7O2IuP_bYErSDfHvdmJnN5o6fRLQ6eu_1osw1Wxq1CXioT-QGsiBQhD_eZZPotGJAt0b53g6We9UVwJeKJLb6Ud6lqfdemDHQUKFbGN_G4naaY9YpAxDov01slm000uHBGVzOrNXvUUw4DLnmSQUg--Jh7NUtF5fSQCCAFFqNI7CX9-Zx2BeY5lPwCcv4PDDBX-905ZMBSDFAQFEk7764LbkcgO5CxTa1zkZllh3zPQuYLA7SfJBs1Vx2P3CDOJ42jU" 
                      : "https://lh3.googleusercontent.com/aida/AP1WRLudWhyozNFGz-MIo4RZ0tNp2UYwqek0T0spYYWhrJt-A2nr0hlPDDom-R3si0uTtFvoD1cVRfgLt9sXfYszE5_rYMe862fg3jRWtkfqyOItdd-A0_6Xi1gHXml3iMwMkQ1Gv-6YfsvHJ7as_AOhzCADb01wzl-rxbV6pfPI9ZnubSsGcZ9dp9FNNWe0OaXJoCsn8gbe71qk1qWX17re89ljSD1dn5zvid5AK6YYIA8BemgfhCySrrgSTzf9erEv-IqeiFXWD7JMgg"}
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
                          setIsAdminLoggedIn(false);
                        }}
                        style={{ background: "none", border: "none", color: "var(--error)", fontSize: "9px", fontWeight: "700", cursor: "pointer", padding: 0 }}
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--primary-brown)", display: "flex", alignItems: "center", justifycontent: "center", color: "var(--temple-gold)" }}>
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
                    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDTuLVfFlIdG7O2IuP_bYErSDfHvdmJnN5o6fRLQ6eu_1osw1Wxq1CXioT-QGsiBQhD_eZZPotGJAt0b53g6We9UVwJeKJLb6Ud6lqfdemDHQUKFbGN_G4naaY9YpAxDov01slm000uHBGVzOrNXvUUw4DLnmSQUg--Jh7NUtF5fSQCCAFFqNI7CX9-Zx2BeY5lPwCcv4PDDBX-905ZMBSDFAQFEk7764LbkcgO5CxTa1zkZllh3zPQuYLA7SfJBs1Vx2P3CDOJ42jU" 
                    : "https://lh3.googleusercontent.com/aida/AP1WRLudWhyozNFGz-MIo4RZ0tNp2UYwqek0T0spYYWhrJt-A2nr0hlPDDom-R3si0uTtFvoD1cVRfgLt9sXfYszE5_rYMe862fg3jRWtkfqyOItdd-A0_6Xi1gHXml3iMwMkQ1Gv-6YfsvHJ7as_AOhzCADb01wzl-rxbV6pfPI9ZnubSsGcZ9dp9FNNWe0OaXJoCsn8gbe71qk1qWX17re89ljSD1dn5zvid5AK6YYIA8BemgfhCySrrgSTzf9erEv-IqeiFXWD7JMgg"}
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

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    {mockAstrologers.map(astro => (
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
                            <strong>{bookings.filter(b => b.astrologerName === astro.name).length + astro.totalBookings}</strong>
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
                              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Requested by {b.astrologerName}</span>
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

            </div>
          </div>
        </>
      )}
    </section>

      </main>
    </div>
  );
}
