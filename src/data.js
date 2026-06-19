// DEVSETU Mock Data & Localization Dictionary

export const servicesData = [
  {
    id: "mahamrityunjaya",
    title: "महामृत्युंजय",
    titleEN: "Mahamrityunjaya Pooja",
    titleHI: "महामृत्युंजय पूजा",
    titleMR: "महामृत्युंजय पूजा",
    startingPrice: 5100,
    pattern: "pattern-shiva",
    descriptionEN: "A powerful ritual dedicated to Lord Shiva for health, longevity, and conquering fears.",
    descriptionHI: "दीर्घायु, उत्तम स्वास्थ्य और भय पर विजय प्राप्त करने के लिए भगवान शिव को समर्पित एक शक्तिशाली अनुष्ठान।",
    descriptionMR: "आरोग्य, दीर्घायुष्य आणि भीतीवर विजय मिळवण्यासाठी भगवान शिवाला समर्पित एक शक्तिशाली विधी.",
    benefits: {
      en: ["Restores physical and mental health", "Protects against accidental mishaps", "Brings peace and mental clarity"],
      hi: ["शारीरिक और मानसिक स्वास्थ्य को पुनः प्राप्त करें", "आकस्मिक दुर्घटनाओं से रक्षा करता है", "शांति और मानसिक स्पष्टता लाता है"],
      mr: ["शारीरिक आणि मानसिक आरोग्य पुनर्संचयित करा", "अपघाती संकटांपासून संरक्षण करते", "शांती आणि मानसिक स्पष्टता आणते"]
    },
    packages: [
      {
        id: "mm-basic",
        name: { en: "Ekam Shanti (1 Pandit)", hi: "एकम शांति (1 पंडित)", mr: "एकम शांती (1 पंडित)" },
        price: 5100,
        astroFee: 500,
        duration: { en: "3 Hours", hi: "3 घंटे", mr: "3 तास" },
        details: {
          en: "Mantra Japa (1100 recitations), offering of Bel patra, standard pooja samagri, single priest setup.",
          hi: "मंत्र जप (1100 पाठ), बेलपत्र अर्पण, मानक पूजा सामग्री, एक पंडित द्वारा अनुष्ठान।",
          mr: "मंत्र जप (1100 पाठ), बेलपत्र अर्पण, प्रमाण पूजा साहित्य, एक गुरुजींद्वारे विधी."
        }
      },
      {
        id: "mm-standard",
        name: { en: "Pancha Shanti (3 Pandits)", hi: "पंच शांति (3 पंडित)", mr: "पंच शांती (3 पंडित)" },
        price: 11000,
        astroFee: 1200,
        duration: { en: "4 Hours", hi: "4 घंटे", mr: "4 तास" },
        details: {
          en: "Mantra Japa (5100 recitations), Panchamrut Abhishek, extended homam (fire ritual), three priests setup.",
          hi: "मंत्र जप (5100 पाठ), पंचामृत अभिषेक, विस्तृत हवन (अग्नि अनुष्ठान), तीन पंडितों द्वारा अनुष्ठान।",
          mr: "मंत्र जप (5100 पाठ), पंचामृत अभिषेक, सविस्तर हवन (अग्नि विधी), तीन गुरुजींद्वारे विधी."
        }
      },
      {
        id: "mm-premium",
        name: { en: "Maha Kalyan (5 Pandits)", hi: "महा कल्याण (5 पंडित)", mr: "महा कल्याण (5 पंडित)" },
        price: 21000,
        astroFee: 2500,
        duration: { en: "6 Hours", hi: "6 घंटे", mr: "6 तास" },
        details: {
          en: "Maha Rudra Abhishek, Maha Mrityunjaya Japa (11000 recitations), comprehensive homam, five priests setup.",
          hi: "महा रुद्र अभिषेक, महा मृत्युंजय जप (11000 पाठ), व्यापक हवन, पांच पंडितों द्वारा अनुष्ठान।",
          mr: "महा रुद्र अभिषेक, महा मृत्युंजय जप (11000 पाठ), व्यापक हवन, पाच गुरुजींद्वारे विधी."
        }
      }
    ]
  },
  {
    id: "kaalsarp",
    title: "कालसर्प दोष निवारण",
    titleEN: "Kaalsarp Dosh Nivaran",
    titleHI: "कालसर्प दोष निवारण",
    titleMR: "कालसर्प दोष निवारण",
    startingPrice: 4500,
    pattern: "pattern-om",
    descriptionEN: "Specially organized ritual to resolve obstacles in career, finance, and family caused by Kaalsarp yoga.",
    descriptionHI: "कालसर्प योग के कारण करियर, वित्त और परिवार में आने वाली बाधाओं को दूर करने के लिए विशेष अनुष्ठान।",
    descriptionMR: "कालसर्प योगामुळे करिअर, वित्त आणि कुटुंबातील अडथळे दूर करण्यासाठी विशेष विधी.",
    benefits: {
      en: ["Removes professional stagnation", "Restores family peace & marriage prospects", "Brings positive energy inflow"],
      hi: ["व्यावसायिक रुकावटों को दूर करता है", "पारिवारिक शांति और विवाह योग बहाल करता है", "सकारात्मक ऊर्जा के प्रवाह को बढ़ाता है"],
      mr: ["व्यावसायिक अडथळे दूर करते", "कौटुंबिक शांतता आणि विवाह योग पुनर्संचयित करते", "सकारात्मक ऊर्जा प्रवाह आणते"]
    },
    packages: [
      {
        id: "ks-basic",
        name: { en: "Standard Rahu-Ketu Shanti", hi: "मानक राहु-केतु शांति", mr: "प्रमाण राहू-केतू शांती" },
        price: 4500,
        astroFee: 400,
        duration: { en: "2.5 Hours", hi: "2.5 घंटे", mr: "2.5 तास" },
        details: {
          en: "Rahu-Ketu mantra recitation, silver snake pair offering in sacred river, single priest setup.",
          hi: "राहु-केतु मंत्र जाप, पवित्र नदी में चांदी के नाग-नागिन जोड़े का अर्पण, एक पंडित द्वारा अनुष्ठान।",
          mr: "राहू-केतू मंत्र जप, पवित्र नदीत चांदीच्या नाग-नागीण जोडीचे अर्पण, एक गुरुजींद्वारे विधी."
        }
      },
      {
        id: "ks-premium",
        name: { en: "Trimbakeshwar Special Vidhi", hi: "त्र्यंबकेश्वर विशेष विधि", mr: "त्र्यंबकेश्वर विशेष विधी" },
        price: 9500,
        astroFee: 1000,
        duration: { en: "4 Hours", hi: "4 घंटे", mr: "4 तास" },
        details: {
          en: "Authentic Nashik Trimbakeshwar style puja, special metal snake rituals, grand homam, two priests.",
          hi: "प्रामाणिक नासिक त्र्यंबकेश्वर शैली पूजा, विशेष धातु सर्प अनुष्ठान, भव्य हवन, दो पंडितों द्वारा।",
          mr: "अस्सल नाशिक त्र्यंबकेश्वर पद्धतीची पूजा, विशेष धातू सर्प विधी, भव्य हवन, दोन गुरुजींद्वारे."
        }
      }
    ]
  },
  {
    id: "navgrah",
    title: "नवग्रह शांति",
    titleEN: "Navgrah Shanti Pooja",
    titleHI: "नवग्रह शांति पूजा",
    titleMR: "नवग्रह शांती पूजा",
    startingPrice: 6500,
    pattern: "pattern-navgrah",
    descriptionEN: "A holistic prayer to all nine planetary deities to seek blessings and pacify negative planetary alignments.",
    descriptionHI: "आशीर्वाद प्राप्त करने और नकारात्मक ग्रहों के प्रभाव को शांत करने के लिए सभी नौ ग्रहों को समर्पित प्रार्थना।",
    descriptionMR: "आशीर्वाद मिळवण्यासाठी आणि नकारात्मक ग्रहांचे प्रभाव शांत करण्यासाठी सर्व नऊ ग्रहांची एकत्रित प्रार्थना.",
    benefits: {
      en: ["Balances negative dasha periods", "Improves mental focus and business success", "Improves overall harmony"],
      hi: ["नकारात्मक दशा अवधियों को संतुलित करता है", "मानसिक ध्यान और व्यावसायिक सफलता में सुधार", "समग्र सद्भाव लाता है"],
      mr: ["नकारात्मक दशा काळ संतुलित करते", "मानसिक एकाग्रता आणि व्यवसायात यश सुधारते", "एकूणच सुसंवाद वाढवते"]
    },
    packages: [
      {
        id: "ng-standard",
        name: { en: "Navgrah Homam & Abhishek", hi: "नवग्रह हवन और अभिषेक", mr: "नवग्रह हवन आणि अभिषेक" },
        price: 6500,
        astroFee: 650,
        duration: { en: "3 Hours", hi: "3 घंटे", mr: "3 तास" },
        details: {
          en: "Individual planetary offerings, 9 grains donation, standard havan, two priests setup.",
          hi: "व्यक्तिगत ग्रह मंत्र आहुति, 9 अनाजों का दान, मानक हवन, दो पंडितों द्वारा पूजा।",
          mr: "वैयक्तिक ग्रह मंत्र आहुती, ९ धान्यांचे दान, प्रमाण हवन, दोन गुरुजींद्वारे विधी."
        }
      },
      {
        id: "ng-premium",
        name: { en: "Grand Navgrah Mahapuja", hi: "भव्य नवग्रह महापूजा", mr: "भव्य नवग्रह महापूजा" },
        price: 13500,
        astroFee: 1500,
        duration: { en: "5 Hours", hi: "5 घंटे", mr: "5 तास" },
        details: {
          en: "Extensive planetary chants (9000 total japa), individual colored cloth offerings, grand homam, four priests.",
          hi: "विस्तृत ग्रह जप (कुल 9000 मंत्र), व्यक्तिगत रंगीन वस्त्र अर्पण, भव्य हवन, चार पंडितों द्वारा।",
          mr: "सविस्तर ग्रह जप (एकूण ९००० मंत्र), वैयक्तिक रंगीत वस्त्र अर्पण, भव्य हवन, चार गुरुजींद्वारे."
        }
      }
    ]
  },
  {
    id: "rudrabhishek",
    title: "रुद्राभिषेक",
    titleEN: "Rudrabhishek Pooja",
    titleHI: "रुद्राभिषेक पूजा",
    titleMR: "रुद्राभिषेक पूजा",
    startingPrice: 3800,
    pattern: "pattern-shiva",
    descriptionEN: "A sacred bathing ritual of Lord Shiva's Lingam with holy items to fulfill desires and clean karma.",
    descriptionHI: "इच्छाओं की पूर्ति और कर्म शुद्धि के लिए पवित्र सामग्रियों से भगवान शिव के शिवलिंग का अभिषेक।",
    descriptionMR: "इच्छा पूर्तीसाठी आणि कर्म शुद्धीसाठी पवित्र साहित्याने भगवान शिवच्या शिवलिंगाचा अभिषेक.",
    benefits: {
      en: ["Clears negative ancestral karma", "Bestows financial prosperity & good health", "Purifies the environment"],
      hi: ["नकारात्मक पैतृक कर्मों को साफ करता है", "वित्तीय समृद्धि और अच्छे स्वास्थ्य प्रदान करता है", "वातावरण को शुद्ध करता है"],
      mr: ["नकारात्मक पूर्वजांचे कर्म साफ करते", "आर्थिक समृद्धी आणि चांगले आरोग्य प्रदान करते", "वातावरण शुद्ध करते"]
    },
    packages: [
      {
        id: "ra-basic",
        name: { en: "Jal & Panchamrut Abhishek", hi: "जल और पंचामृत अभिषेक", mr: "जल आणि पंचामृत अभिषेक" },
        price: 3800,
        astroFee: 350,
        duration: { en: "2 Hours", hi: "2 घंटे", mr: "2 तास" },
        details: {
          en: "Bathing with Ganges water, milk, curd, honey, ghee, sugar. Traditional chanting of Rudri Path, one priest.",
          hi: "गंगाजल, दूध, दही, शहद, घी, शक्कर से अभिषेक। रुद्री पाठ का पारंपरिक पाठ, एक पंडित द्वारा।",
          mr: "गंगाजल, दूध, दही, मध, तूप, साखर यांनी अभिषेक. रुद्री पाठाचे पारंपरिक पठण, एक गुरुजी."
        }
      },
      {
        id: "ra-standard",
        name: { en: "Ekadashani Rudrabhishek", hi: "एकादशणी रुद्राभिषेक", mr: "एकादशणी रुद्राभिषेक" },
        price: 7800,
        astroFee: 800,
        duration: { en: "3.5 Hours", hi: "3.5 घंटे", mr: "3.5 तास" },
        details: {
          en: "11 rounds of Rudra Path recitation, grand dynamic liquid offering, standard havan, two priests setup.",
          hi: "रुद्र पाठ के 11 आवर्तन, भव्य अभिषेक तरल धारा, मानक हवन, दो पंडितों द्वारा।",
          mr: "रुद्र पाठाचे ११ आवर्तन, भव्य अभिषेक, प्रमाण हवन, दोन गुरुजींद्वारे विधी."
        }
      }
    ]
  },
  {
    id: "chandi",
    title: "चंडी पाठ",
    titleEN: "Durga Chandi Path",
    titleHI: "दुर्गा चंडी पाठ",
    titleMR: "दुर्गा चंडी पाठ",
    startingPrice: 8500,
    pattern: "pattern-chandi",
    descriptionEN: "A powerful recitation of Durga Saptashati to invoke Goddess Durga's protective armor and win over adversaries.",
    descriptionHI: "मां दुर्गा के सुरक्षा कवच का आह्वान करने और विरोधियों पर विजय प्राप्त करने के लिए दुर्गा सप्तशती का शक्तिशाली पाठ।",
    descriptionMR: "देवी दुर्गेच्या संरक्षणाचे आवाहन करण्यासाठी आणि विरोधकांवर विजय मिळवण्यासाठी दुर्गा सप्तशतीचे शक्तिशाली पठण.",
    benefits: {
      en: ["Protects from evil eye & black magic", "Wins court cases & business disputes", "Brings courage and power"],
      hi: ["बुरी नजर और नकारात्मक शक्तियों से बचाता है", "अदालती मामलों और व्यापार विवादों में विजय", "साहस और शक्ति लाता है"],
      mr: ["वाईट नजर आणि नकारात्मक शक्तींपासून रक्षण करते", "न्यायालयीन खटल्यांमध्ये आणि व्यवसाय वादात विजय", "धैर्य आणि शक्ती आणते"]
    },
    packages: [
      {
        id: "cp-standard",
        name: { en: "Durga Saptashati Path", hi: "दुर्गा सप्तशती पाठ", mr: "दुर्गा सप्तशती पाठ" },
        price: 8500,
        astroFee: 900,
        duration: { en: "4 Hours", hi: "4 घंटे", mr: "4 तास" },
        details: {
          en: "Complete recitation of 13 chapters of Saptashati, Pushparchana, Kumari Puja mock representation, two priests.",
          hi: "सप्तशती के 13 अध्यायों का पूर्ण पाठ, पुष्पार्चन, कुमारी पूजा का प्रतीक प्रतिनिधित्व, दो पंडितों द्वारा।",
          mr: "सप्तशतीचे १३ अध्यायांचे पूर्ण पठण, पुष्पार्चन, कुमारी पूजेचे प्रतीक प्रतिनिधित्व, दोन गुरुजींद्वारे."
        }
      },
      {
        id: "cp-premium",
        name: { en: "Chandi Yagna / Havan", hi: "चंडी यज्ञ / हवन", mr: "चंडी यज्ञ / हवन" },
        price: 18500,
        astroFee: 2000,
        duration: { en: "6 Hours", hi: "6 घंटे", mr: "6 तास" },
        details: {
          en: "Grand Chandi recitation followed by full fire ritual (homam) with special sweet offering, four priests setup.",
          hi: "भव्य चंडी पाठ और उसके बाद विशेष मधुर आहुति के साथ पूर्ण अग्नि अनुष्ठान (हवन), चार पंडितों द्वारा।",
          mr: "भव्य चंडी पठण आणि त्यानंतर विशेष गोड आहुतीसह पूर्ण अग्नि विधी (हवन), चार गुरुजींद्वारे विधी."
        }
      }
    ]
  },
  {
    id: "pitru",
    title: "पितृ दोष निवारण",
    titleEN: "Pitri Dosh Nivaran",
    titleHI: "पितृ दोष निवारण",
    titleMR: "पितृ दोष निवारण",
    startingPrice: 5500,
    pattern: "pattern-pitru",
    descriptionEN: "A quiet, reverent ritual to pray for deceased ancestors, seeking their forgiveness and liberation.",
    descriptionHI: "दिवंगत पूर्वजों की शांति, उनकी क्षमा और मुक्ति के लिए प्रार्थना करने का एक श्रद्धापूर्ण अनुष्ठान।",
    descriptionMR: "दिवंगत पूर्वजांच्या शांततेसाठी, त्यांची क्षमा आणि मुक्तीसाठी प्रार्थना करण्याचा एक आदरयुक्त विधी.",
    benefits: {
      en: ["Resolves constant hurdles in family growth", "Brings peace to ancestral souls", "Bestows progeny & lineage blessings"],
      hi: ["पारिवारिक वृद्धि में निरंतर आने वाली बाधाओं को दूर करता है", "पूर्वजों की आत्माओं को शांति देता है", "संतान और वंश वृद्धि के आशीर्वाद देता है"],
      mr: ["कौटुंबिक वाढीतील सततचे अडथळे दूर करते", "पूर्वजांच्या आत्म्यांना शांती मिळते", "संतान आणि वंशवृद्धीचे आशीर्वाद देते"]
    },
    packages: [
      {
        id: "pd-standard",
        name: { en: "Shraddha & Tarpan Ritual", hi: "श्राद्ध और तर्पण अनुष्ठान", mr: "श्राद्ध आणि तर्पण विधी" },
        price: 5500,
        astroFee: 600,
        duration: { en: "3 Hours", hi: "3 घंटे", mr: "3 तास" },
        details: {
          en: "Pind Daan representation, sesame seeds tarpan, pitru devata mantra chants, single priest.",
          hi: "पिंडदान प्रतीक, तिल तर्पण, पितृ देव मंत्र जाप, एक पंडित द्वारा अनुष्ठान।",
          mr: "पिंडदान प्रतीक, तीळ तर्पण, पितृ देव मंत्र जप, एक गुरुजींद्वारे विधी."
        }
      },
      {
        id: "pd-premium",
        name: { en: "Narayan Bali Special Vidhi", hi: "नारायण बलि विशेष विधि", mr: "नारायण बली विशेष विधी" },
        price: 12500,
        astroFee: 1400,
        duration: { en: "5 Hours", hi: "5 घंटे", mr: "5 तास" },
        details: {
          en: "Grand Narayan Bali puja at holy riverbank or temple, targeted ancestral release homam, two priests.",
          hi: "पवित्र नदी तट या मंदिर में भव्य नारायण बलि पूजा, लक्षित पितृ शांति हवन, दो पंडितों द्वारा।",
          mr: "पवित्र नदीकाठी किंवा मंदिरात भव्य नारायण बली पूजा, पूर्वज शांती हवन, दोन गुरुजींद्वारे."
        }
      }
    ]
  }
];

export const translations = {
  en: {
    appName: "DEVSETU",
    tagline: "Connecting Astrologers to Spiritual Solutions",
    roleSwitch: "Switch Simulator View",
    viewMobile: "Astrologer Mobile",
    viewAdmin: "Admin Dashboard",
    
    // Bottom navigation
    navHome: "Home",
    navServices: "Services",
    navBookings: "Bookings",
    navSupport: "Support",
    navProfile: "Profile",
    
    // Home screen
    welcome: "Welcome,",
    astroName: "Acharya K. N. Shastri",
    todayStatus: "Today's Status",
    totalBookings: "Total Bookings",
    pendingApprovals: "Pending Approvals",
    approvedBookings: "Approved Bookings",
    quickActions: "Quick Actions",
    featuredServices: "Featured Services",
    startingFrom: "Starting from",
    viewPackages: "View Packages",
    
    // Services screen
    marketplaceTitle: "Pooja Marketplace",
    marketplaceSubtitle: "Browse and book verified Vedic rituals on behalf of your clients",
    categorySearch: "Search ritual categories...",
    
    // Details page
    benefitsTitle: "Ritual Benefits",
    packagesTitle: "Available Ritual Packages",
    durationLabel: "Duration:",
    astroFeeLabel: "Astro Commission Included:",
    bookNow: "Book Now",
    
    // Booking Form
    bookingFormTitle: "New Booking Request",
    clientName: "Client Name",
    clientMobile: "Client Mobile Number",
    city: "Performance City",
    selectCity: "Select City",
    preferredDate: "Preferred Pooja Date",
    notes: "Special Ritual Notes (Optional)",
    proceedPayment: "Proceed to Payment",
    
    // Payment screen
    paymentTitle: "Advance Booking Payment",
    qrArea: "UPI QR Code Area",
    advanceAmount: "Advance Amount Required:",
    paymentInstructions: "Scan the QR code above with any UPI App (GPay/PhonePe/Paytm). Pay the advance amount, enter the transaction ID, and upload the screenshot.",
    transactionId: "UPI Transaction ID (12-digit)",
    screenshot: "Upload Screenshot",
    chooseScreenshot: "Choose Mock Screenshot",
    submitPayment: "Submit Booking & Payment",
    
    // My Bookings
    bookingsTitle: "My Pooja Bookings",
    tabAll: "All",
    tabPending: "Pending",
    tabApproved: "Approved",
    tabCompleted: "Completed",
    tabCancelled: "Cancelled",
    bookingId: "Booking ID:",
    client: "Client:",
    date: "Date:",
    amount: "Paid:",
    status: "Status:",
    trackStatus: "Track Booking",
    
    // Timeline
    trackingTitle: "Booking Tracking Progress",
    stageCreated: "Booking Created",
    stageCreatedDesc: "Astrologer initiated the booking details.",
    stagePaid: "Payment Submitted",
    stagePaidDesc: "Advance payment transaction ID & screenshot uploaded.",
    stagePending: "Verification Pending",
    stagePendingDesc: "Admin checking bank logs for transaction verification.",
    stageAdmin: "Admin Review",
    stageAdminDesc: "Ritual slot availability and pandit scheduling verify.",
    stageApproved: "Booking Approved",
    stageApprovedDesc: "Booking verified, slot allocated, and pandits assigned.",
    stageScheduled: "Ritual Scheduled",
    stageScheduledDesc: "Ritual details shared with pandits, materials ready.",
    stageCompleted: "Ritual Completed",
    stageCompletedDesc: "Ritual concluded successfully, blessings dispatched.",
    
    // Support
    supportTitle: "Devsetu Support Desk",
    supportSubtitle: "Direct communication with Devsetu Administrator",
    chatPlaceholder: "Type your query here...",
    ticketCategory: "Ticket Category",
    paymentIssue: "Payment Issues",
    bookingIssue: "Booking Issues",
    techSupport: "Technical Support",
    generalHelp: "General Queries",
    aiSupportTitle: "AI Support Assistant",
    aiSupportSubtitle: "Predictive Help Agent – Coming Soon",
    online: "Online",
    offline: "Offline",
    typing: "Admin is typing...",
    
    // Profile
    profileTitle: "My Profile Settings",
    detailsTitle: "Astrologer Details",
    certified: "Verified Platinum Astrologer",
    license: "ID: DS-ASTRO-2089",
    language: "App Language",
    theme: "App Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    notifPref: "Notification Preferences",
    notifSMS: "SMS updates for clients",
    notifApp: "Push notifications for approvals",
    logout: "Log Out Account",
    
    // Notifications
    notifTitle: "Notifications Hub",
    clearAll: "Clear",
    
    // Contact Support
    contactUsTitle: "Contact Devsetu Support",
    contactUsDesc: "Need immediate help with slot scheduling, pandit allocation, or payments? Connect with our dedicated support desk.",
    
    // Common / Buttons
    back: "Back",
    confirm: "Confirm",
    cancel: "Cancel"
  },
  hi: {
    appName: "DEVSETU",
    tagline: "ज्योतिषियों को आध्यात्मिक समाधानों से जोड़ना",
    roleSwitch: "सिम्युलेटर व्यू बदलें",
    viewMobile: "ज्योतिषी मोबाइल",
    viewAdmin: "एडमिन डैशबोर्ड",
    
    navHome: "मुख्य",
    navServices: "सेवाएं",
    navBookings: "बुकिंग",
    navSupport: "सहायता",
    navProfile: "प्रोफ़ाइल",
    
    welcome: "स्वागत है,",
    astroName: "आचार्य के. एन. शास्त्री",
    todayStatus: "आज की स्थिति",
    totalBookings: "कुल बुकिंग",
    pendingApprovals: "लंबित अनुमोदन",
    approvedBookings: "स्वीकृत बुकिंग",
    quickActions: "त्वरित कार्रवाई",
    featuredServices: "विशेष पूजा सेवाएं",
    startingFrom: "प्रारंभिक मूल्य",
    viewPackages: "पैकेज देखें",
    
    marketplaceTitle: "पूजा मार्केटप्लेस",
    marketplaceSubtitle: "अपने ग्राहकों की ओर से सत्यापित वैदिक अनुष्ठान ब्राउज़ और बुक करें",
    categorySearch: "पूजा श्रेणी खोजें...",
    
    benefitsTitle: "अनुष्ठान के लाभ",
    packagesTitle: "उपलब्ध पूजा पैकेज",
    durationLabel: "समय अवधि:",
    astroFeeLabel: "कमीशन शामिल:",
    bookNow: "बुक करें",
    
    bookingFormTitle: "नया बुकिंग अनुरोध",
    clientName: "ग्राहक का नाम",
    clientMobile: "ग्राहक का मोबाइल नंबर",
    city: "अनुष्ठान का शहर",
    selectCity: "शहर चुनें",
    preferredDate: "पसंदीदा पूजा तिथि",
    notes: "विशेष पूजा निर्देश (वैकल्पिक)",
    proceedPayment: "भुगतान के लिए आगे बढ़ें",
    
    paymentTitle: "अग्रिम बुकिंग भुगतान",
    qrArea: "UPI QR कोड क्षेत्र",
    advanceAmount: "आवश्यक अग्रिम राशि:",
    paymentInstructions: "किसी भी UPI ऐप (GPay/PhonePe/Paytm) से ऊपर दिए गए QR कोड को स्कैन करें। अग्रिम भुगतान करें, लेनदेन आईडी दर्ज करें, और स्क्रीनशॉट अपलोड करें।",
    transactionId: "UPI लेनदेन आईडी (12-अंक)",
    screenshot: "स्क्रीनशॉट अपलोड करें",
    chooseScreenshot: "मॉक स्क्रीनशॉट चुनें",
    submitPayment: "बुकिंग और भुगतान जमा करें",
    
    bookingsTitle: "मेरी पूजा बुकिंग",
    tabAll: "सभी",
    tabPending: "लंबित",
    tabApproved: "स्वीकृत",
    tabCompleted: "पूर्ण",
    tabCancelled: "रद्द",
    bookingId: "बुकिंग आईडी:",
    client: "ग्राहक:",
    date: "तिथि:",
    amount: "भुगतान:",
    status: "स्थिति:",
    trackStatus: "बुकिंग ट्रैक करें",
    
    trackingTitle: "बुकिंग ट्रैकिंग प्रगति",
    stageCreated: "बुकिंग बनाई गई",
    stageCreatedDesc: "ज्योतिषी ने बुकिंग विवरण शुरू किया।",
    stagePaid: "भुगतान जमा किया गया",
    stagePaidDesc: "अग्रिम भुगतान लेनदेन आईडी और स्क्रीनशॉट अपलोड किया गया।",
    stagePending: "सत्यापन लंबित",
    stagePendingDesc: "एडमिन लेनदेन सत्यापन के लिए बैंक लॉग की जांच कर रहे हैं।",
    stageAdmin: "एडमिन समीक्षा",
    stageAdminDesc: "अनुष्ठान स्लॉट की उपलब्धता और पंडितों की उपलब्धता सत्यापित करें।",
    stageApproved: "बुकिंग स्वीकृत",
    stageApprovedDesc: "बुकिंग सत्यापित, स्लॉट आवंटित, और पंडित नियुक्त।",
    stageScheduled: "पूजा निर्धारित",
    stageScheduledDesc: "पंडितों के साथ विवरण साझा किया गया, पूजा सामग्री तैयार।",
    stageCompleted: "पूजा संपन्न",
    stageCompletedDesc: "अनुष्ठान सफलतापूर्वक संपन्न हुआ, आशीर्वाद प्रेषित।",
    
    supportTitle: "देवसेतु सहायता डेस्क",
    supportSubtitle: "देवसेतु एडमिनिस्ट्रेटर के साथ सीधा संवाद",
    chatPlaceholder: "अपनी समस्या यहाँ लिखें...",
    ticketCategory: "टिकट श्रेणी",
    paymentIssue: "भुगतान संबंधी समस्याएं",
    bookingIssue: "बुकिंग संबंधी समस्याएं",
    techSupport: "तकनीकी सहायता",
    generalHelp: "सामान्य प्रश्न",
    aiSupportTitle: "एआई सपोर्ट सहायक",
    aiSupportSubtitle: "प्रेडिक्टिव हेल्प एजेंट - जल्द ही आ रहा है",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन",
    typing: "एडमिन टाइप कर रहे हैं...",
    
    profileTitle: "मेरी प्रोफ़ाइल सेटिंग्स",
    detailsTitle: "ज्योतिषी का विवरण",
    certified: "सत्यापित प्लैटिनम ज्योतिषी",
    license: "आईडी: DS-ASTRO-2089",
    language: "ऐप भाषा",
    theme: "ऐप थीम",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    notifPref: "अधिसूचना प्राथमिकताएं",
    notifSMS: "ग्राहकों के लिए एसएमएस अपडेट",
    notifApp: "स्वीकृति के लिए पुश नोटिफिकेशन",
    logout: "खाता लॉग आउट करें",
    
    notifTitle: "अधिसूचना हब",
    clearAll: "साफ करें",
    
    // Contact Support
    contactUsTitle: "देवसेतु सहायता से संपर्क करें",
    contactUsDesc: "स्लॉट शेड्यूलिंग, पंडित आवंटन या भुगतान के संबंध में सहायता चाहिए? हमारी समर्पित सहायता टीम से जुड़ें।",
    
    back: "पीछे",
    confirm: "पुष्टि करें",
    cancel: "रद्द करें"
  },
  mr: {
    appName: "DEVSETU",
    tagline: "ज्योतिषांना आध्यात्मिक उपायांशी जोडणे",
    roleSwitch: "सिम्युलेटर व्ह्यू बदला",
    viewMobile: "ज्योतिषी मोबाईल",
    viewAdmin: "एडमिन डॅशबोर्ड",
    
    navHome: "मुख्य",
    navServices: "सेवा",
    navBookings: "बुकिंग",
    navSupport: "मदत",
    navProfile: "प्रोफाइल",
    
    welcome: "स्वागत आहे,",
    astroName: "आचार्य के. एन. शास्त्री",
    todayStatus: "आजची स्थिती",
    totalBookings: "एकूण बुकिंग",
    pendingApprovals: "प्रलंबित मंजूरी",
    approvedBookings: "मंजूर बुकिंग",
    quickActions: "त्वरित कृती",
    featuredServices: "विशेष पूजा सेवा",
    startingFrom: "प्रारंभिक किंमत",
    viewPackages: "पॅकेज पहा",
    
    marketplaceTitle: "पूजा मार्केटप्लेस",
    marketplaceSubtitle: "तुमच्या ग्राहकांच्या वतीने सत्यापित वैदिक विधी ब्राउझ आणि बुक करा",
    categorySearch: "पूजा श्रेणी शोधा...",
    
    benefitsTitle: "विधीचे फायदे",
    packagesTitle: "उपलब्ध पूजा पॅकेज",
    durationLabel: "कालावधी:",
    astroFeeLabel: "कमिशन समाविष्ट:",
    bookNow: "बुक करा",
    
    bookingFormTitle: "नवीन बुकिंग विनंती",
    clientName: "ग्राहकाचे नाव",
    clientMobile: "ग्राहकाचा मोबाईल नंबर",
    city: "विधीचे शहर",
    selectCity: "शहर निवडा",
    preferredDate: "पसंतीची पूजा तारीख",
    notes: "विशेष पूजा सूचना (पर्यायी)",
    proceedPayment: "पेमेंटसाठी पुढे जा",
    
    paymentTitle: "अगाऊ बुकिंग पेमेंट",
    qrArea: "UPI QR कोड क्षेत्र",
    advanceAmount: "आवश्यक अगाऊ रक्कम:",
    paymentInstructions: "कोणत्याही UPI ॲपसह (GPay/PhonePe/Paytm) वरील QR कोड स्कॅन करा. अगाऊ पेमेंट करा, व्यवहार आयडी प्रविष्ट करा आणि स्क्रीनशॉट अपलोड करा.",
    transactionId: "UPI व्यवहार आयडी (१२-अंकी)",
    screenshot: "स्क्रीनशॉट अपलोड करा",
    chooseScreenshot: "मॉक स्क्रीनशॉट निवडा",
    submitPayment: "बुकिंग आणि पेमेंट सबमिट करा",
    
    bookingsTitle: "माझे पूजा बुकिंग",
    tabAll: "सर्व",
    tabPending: "प्रलंबित",
    tabApproved: "मंजूर",
    tabCompleted: "पूर्ण",
    tabCancelled: "रद्द",
    bookingId: "बुकिंग आयडी:",
    client: "ग्राहक:",
    date: "तारीख:",
    amount: "पेमेंट:",
    status: "स्थिती:",
    trackStatus: "बुकिंग ट्रॅक करा",
    
    trackingTitle: "बुकिंग ट्रॅकिंग प्रगती",
    stageCreated: "बुकिंग तयार केले",
    stageCreatedDesc: "ज्योतिषाने बुकिंग तपशील सुरू केला.",
    stagePaid: "पेमेंट सबमिट केले",
    stagePaidDesc: "अगाऊ पेमेंट व्यवहार आयडी आणि स्क्रीनशॉट अपलोड केला.",
    stagePending: "पडताळणी प्रलंबित",
    stagePendingDesc: "एडमिन व्यवहार पडताळणीसाठी बँक लॉग तपासत आहेत.",
    stageAdmin: "एडमिन पुनरावलोकन",
    stageAdminDesc: "विधी स्लॉटची उपलब्धता आणि गुरुजींची उपलब्धता सत्यापित करा.",
    stageApproved: "बुकिंग मंजूर",
    stageApprovedDesc: "बुकिंग सत्यापित, स्लॉट वाटप आणि गुरुजी नियुक्त.",
    stageScheduled: "पूजा नियोजित",
    stageScheduledDesc: "गुरुजींसोबत तपशील शेअर केला, पूजा साहित्य तयार.",
    stageCompleted: "पूजा संपन्न",
    stageCompletedDesc: "अनुष्ठान यशस्वीरित्या संपन्न झाले, आशीर्वाद पाठवले.",
    
    supportTitle: "देवसेतू मदत केंद्र",
    supportSubtitle: "देवसेतू एडमिनिस्ट्रेटरशी थेट संवाद",
    chatPlaceholder: "तुमचा प्रश्न येथे लिहा...",
    ticketCategory: "तिकीट श्रेणी",
    paymentIssue: "पेमेंट संबंधी समस्या",
    bookingIssue: "बुकिंग संबंधी समस्या",
    techSupport: "तांत्रिक मदत",
    generalHelp: "सामान्य प्रश्न",
    aiSupportTitle: "एआय सपोर्ट सहाय्यक",
    aiSupportSubtitle: "प्रेडिक्टिव हेल्प एजंट - लवकरच येत आहे",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    typing: "एडमिन टाईप करत आहेत...",
    
    profileTitle: "माझी प्रोफाइल सेटिंग्ज",
    detailsTitle: "ज्योतिषाचे तपशील",
    certified: "सत्यापित प्लॅटिनम ज्योतिषी",
    license: "आयडी: DS-ASTRO-2089",
    language: "ॲप भाषा",
    theme: "ॲप थीम",
    lightMode: "लाईट मोड",
    darkMode: "डार्क मोड",
    notifPref: "अधिसूचना प्राधान्ये",
    notifSMS: "ग्राहकांसाठी एसएमएस अपडेट",
    notifApp: "मंजूरीसाठी पुश अधिसूचना",
    logout: "खाते लॉग आउट करा",
    
    notifTitle: "अधिसूचना हब",
    clearAll: "साफ करा",
    
    // Contact Support
    contactUsTitle: "देवसेतू मदतीसाठी संपर्क साधा",
    contactUsDesc: "स्लॉट शेड्यूलिंग, गुरुजी वाटप किंवा पेमेंटच्या बाबतीत काही मदत हवी आहे का? आमच्या मदत केंद्राशी थेट संपर्क साधा.",
    
    back: "मागे",
    confirm: "पुष्टी करा",
    cancel: "रद्द करा"
  }
};

export const sampleScreenshots = [
  {
    id: "screenshot-gpay",
    name: "GPay Success Receipt (₹1,500)",
    url: "gpay"
  },
  {
    id: "screenshot-phonepe",
    name: "PhonePe Completed Status (₹3,000)",
    url: "phonepe"
  },
  {
    id: "screenshot-paytm",
    name: "Paytm Txn ID Recieved (₹5,000)",
    url: "paytm"
  }
];

export const mockAstrologers = [
  {
    id: "ASTRO01",
    name: "Acharya K. N. Shastri",
    location: "Varanasi",
    rating: "4.9",
    avatar: "🧘",
    joined: "June 2024",
    experience: "15 Years",
    totalBookings: 142
  },
  {
    id: "ASTRO02",
    name: "Pandit Rahul Dwivedi",
    location: "Ujjain",
    rating: "4.8",
    avatar: "☸️",
    joined: "Aug 2024",
    experience: "12 Years",
    totalBookings: 98
  },
  {
    id: "ASTRO03",
    name: "Guruji Anand Joshi",
    location: "Nashik",
    rating: "4.75",
    avatar: "🔱",
    joined: "Jan 2025",
    experience: "18 Years",
    totalBookings: 204
  }
];
