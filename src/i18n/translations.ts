export type SupportedLanguage = "en" | "mr" | "hi";

export interface TranslationSchema {
  // Legacy top-level keys for backward compatibility
  trustName: string;
  trustShort: string;
  tagline: string;
  academicNotice: string;
  demoDataBadge: string;
  navHome: string;
  navAbout: string;
  navCauses: string;
  navPassport: string;
  navVolunteer: string;
  navEvents: string;
  navContact: string;
  navLogin: string;
  navDashboard: string;
  ctaDonate: string;
  ctaSeeWork: string;
  heroNotice: string;

  whyTrustTitle: string;
  whyTrustSubtitle: string;
  trustPoint1Title: string;
  trustPoint1Desc: string;
  trustPoint2Title: string;
  trustPoint2Desc: string;
  trustPoint3Title: string;
  trustPoint3Desc: string;
  trustPoint4Title: string;
  trustPoint4Desc: string;

  ourWorkTitle: string;
  ourWorkSubtitle: string;
  learnMore: string;
  educationTitle: string;
  educationDesc: string;
  medicalTitle: string;
  medicalDesc: string;
  foodTitle: string;
  foodDesc: string;
  reliefTitle: string;
  reliefDesc: string;
  environmentTitle: string;
  environmentDesc: string;

  passportJourneyTitle: string;
  passportJourneySubtitle: string;
  stageDonation: string;
  stageDonationDesc: string;
  stageAllocation: string;
  stageAllocationDesc: string;
  stageVerification: string;
  stageVerificationDesc: string;
  stageImpact: string;
  stageImpactDesc: string;
  openPassport: string;
  samplePassportLabel: string;

  // New Comprehensive Translation Modules
  common: {
    trustName: string;
    trustShort: string;
    tagline: string;
    academicNotice: string;
    demoDataBadge: string;
    save: string;
    cancel: string;
    submit: string;
    close: string;
    loading: string;
    search: string;
    filter: string;
    all: string;
    viewAll: string;
    learnMore: string;
    readMore: string;
    donateNow: string;
    volunteer: string;
    exploreWork: string;
    contactUs: string;
    requestHelp: string;
    download: string;
    status: string;
    date: string;
    location: string;
    category: string;
    amount: string;
    success: string;
    error: string;
    verified: string;
    pending: string;
    completed: string;
    backToHome: string;
    noResults: string;
    share: string;
    copied: string;
  };

  nav: {
    home: string;
    about: string;
    causes: string;
    passport: string;
    volunteer: string;
    events: string;
    gallery: string;
    transparency: string;
    blog: string;
    contact: string;
    login: string;
    register: string;
    dashboard: string;
    admin: string;
    kumbh: string;
    requestHelp: string;
  };

  hero: {
    badge: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    namasteTag: string;
    namasteQuote: string;
    welcomeSpeakerPrompt: string;
    startWelcome: string;
    skip: string;
    replay: string;
    voiceOn: string;
    voiceOff: string;
    speechSentence1: string;
    speechSentence2: string;
    subtitle1: string;
    subtitle2: string;
    directSevaFood: string;
    directSevaHealth: string;
    directSevaEdu: string;
    directSevaVol: string;
    searchPassportPlaceholder: string;
    trackImpact: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    stat4Value: string;
    stat4Label: string;
  };

  about: {
    title: string;
    subtitle: string;
    missionTitle: string;
    missionDesc: string;
    visionTitle: string;
    visionDesc: string;
    valuesTitle: string;
    value1: string;
    value1Desc: string;
    value2: string;
    value2Desc: string;
    value3: string;
    value3Desc: string;
    boardTitle: string;
    governanceTitle: string;
    taxNotice: string;
  };

  causes: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterEdu: string;
    filterHealth: string;
    filterFood: string;
    filterRelief: string;
    filterEnv: string;
    filterKumbh: string;
    raisedOf: string;
    donors: string;
    target: string;
    donateToCause: string;
    viewDetails: string;
    daysLeft: string;
    verifiedCause: string;
  };

  donate: {
    title: string;
    subtitle: string;
    frequency: string;
    oneTime: string;
    monthly: string;
    selectAmount: string;
    customAmount: string;
    selectCause: string;
    generalFund: string;
    donorInfo: string;
    fullName: string;
    email: string;
    phone: string;
    pan: string;
    anonymous: string;
    paymentMethod: string;
    upi: string;
    card: string;
    netBanking: string;
    taxDeductibleBadge: string;
    proceedPayment: string;
    receiptPromise: string;
    successTitle: string;
    successSubtitle: string;
  };

  volunteer: {
    title: string;
    subtitle: string;
    openRoles: string;
    applyNow: string;
    roleLocation: string;
    roleCommitment: string;
    roleSkills: string;
    volunteerFormTitle: string;
    availability: string;
    weekends: string;
    weekdays: string;
    flexible: string;
    motivation: string;
    submitVolunteer: string;
    portalHeading: string;
    hoursLogged: string;
    shiftsDone: string;
    certificateTitle: string;
  };

  requestHelp: {
    title: string;
    subtitle: string;
    emergencyNotice: string;
    helpCategory: string;
    catMedical: string;
    catEducation: string;
    catFood: string;
    catDisaster: string;
    applicantName: string;
    applicantPhone: string;
    applicantCity: string;
    description: string;
    requiredAmount: string;
    uploadDocs: string;
    urgency: string;
    urgencyCritical: string;
    urgencyModerate: string;
    urgencyNormal: string;
    submitHelp: string;
    trackingNotice: string;
  };

  impactPassport: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    samplePassports: string;
    stage1: string;
    stage2: string;
    stage3: string;
    stage4: string;
    auditBadge: string;
    donor: string;
    amount: string;
    allocatedTo: string;
    fieldOfficer: string;
    auditDate: string;
    vendorBill: string;
  };

  kumbh: {
    title: string;
    subtitle: string;
    heroSubtitle: string;
    modeBadge: string;
    togglePrompt: string;
    waterKiosks: string;
    waterDesc: string;
    annachhatra: string;
    annachhatraDesc: string;
    medicalBooths: string;
    medicalDesc: string;
    lostFound: string;
    lostFoundDesc: string;
    volunteerCall: string;
    emergencyHelpline: string;
    disabledTitle: string;
    disabledDesc: string;
    adminSettingsBtn: string;
    preparatoryNoticeTitle: string;
    preparatoryNoticeDesc: string;
    demoPlanningBadge: string;
    metricsMeals: string;
    metricsMealsSub: string;
    metricsWater: string;
    metricsWaterSub: string;
    metricsVolunteers: string;
    metricsVolunteersSub: string;
    metricsMedical: string;
    metricsMedicalSub: string;
    pillarsTitle: string;
    pillarsSubtitle: string;
    pillarGhatTitle: string;
    pillarGhatDesc: string;
    pillarAnnachhatraTitle: string;
    pillarAnnachhatraDesc: string;
    pillarMedicalTitle: string;
    pillarMedicalDesc: string;
    pillarLostFoundTitle: string;
    pillarLostFoundDesc: string;
    campaignsTag: string;
    campaignsTitle: string;
    viewAllCauses: string;
    emptyCampaigns: string;
    volunteerBadge: string;
    volunteerTitle: string;
    volunteerSubtitle: string;
    requirementsLabel: string;
    openSlots: string;
    applyForRole: string;
    emptyRoles: string;
    eventsTitle: string;
    eventsSubtitle: string;
    eventDetails: string;
    registeredCount: string;
    emptyEvents: string;
    announcementsBadge: string;
    announcementsTitle: string;
    announcementsSubtitle: string;
    readMore: string;
    viewAllNews: string;
    emptyAnnouncements: string;
    galleryBadge: string;
    galleryTitle: string;
    gallerySubtitle: string;
    viewFullGallery: string;
    emptyGallery: string;
    loadingText: string;
    loadErrorTitle: string;
    loadErrorDesc: string;
    retryBtn: string;
    modalApplyTitle: string;
    modalSuccessTitle: string;
    modalBriefingNote: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    cityLabel: string;
    cityPlaceholder: string;
    sevaAreaLabel: string;
    availabilityLabel: string;
    emergencyContactLabel: string;
    emergencyContactPlaceholder: string;
    skillsLabel: string;
    cancelBtn: string;
    submitRegistrationBtn: string;
    submittingBtn: string;
    regSuccessBadge: string;
    regRefLabel: string;
    regApplicantLabel: string;
    regRoleLabel: string;
    regSevaAreaLabel: string;
    regAvailabilityLabel: string;
    regSuccessNote: string;
    closeReturnBtn: string;
    areaGhatHygiene: string;
    areaAnnadan: string;
    areaWater: string;
    areaCrowdGuidance: string;
    areaFirstAid: string;
    availPeakDates: string;
    availFullDuration: string;
    availWeekends: string;
    availPreparatory: string;
    skillCrowd: string;
    skillMedical: string;
    skillLanguages: string;
    skillKitchen: string;
    skillRiver: string;
  };

  events: {
    title: string;
    subtitle: string;
    upcoming: string;
    past: string;
    rsvp: string;
    venue: string;
    capacity: string;
  };

  gallery: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterEdu: string;
    filterMedical: string;
    filterFood: string;
    filterKumbh: string;
  };

  transparency: {
    title: string;
    subtitle: string;
    financialYear: string;
    totalIncome: string;
    directUtilization: string;
    adminExpenses: string;
    downloadAuditedReport: string;
    allReports: string;
    annualReports: string;
    financialReports: string;
    auditReports: string;
    impactReports: string;
    utilizationReports: string;
    otherReports: string;
    noReports: string;
    noReportsDesc: string;
    loading: string;
    loadError: string;
    retry: string;
    viewDocument: string;
    downloadDocument: string;
    viewDossier: string;
    dossierDetails: string;
    auditor: string;
    statutoryType: string;
    auditRating: string;
    reportedDisbursal: string;
    close: string;
  };

  helpRequest: {
    title: string;
    subtitle: string;
    applyTab: string;
    trackTab: string;
    myRequestsTab: string;
    fullName: string;
    email: string;
    phone: string;
    requestType: string;
    urgency: string;
    description: string;
    location: string;
    submitApplication: string;
    submitting: string;
    submittedSuccess: string;
    submittedSuccessDesc: string;
    trackTitle: string;
    trackSubtitle: string;
    enterRequestId: string;
    trackButton: string;
    tracking: string;
    requestNotFound: string;
    loginRequiredTitle: string;
    loginRequiredDesc: string;
    loginBtn: string;
    registerBtn: string;
    noPersonalRequests: string;
    noPersonalRequestsDesc: string;
    statusPending: string;
    statusUnderReview: string;
    statusApproved: string;
    statusRejected: string;
    statusInProgress: string;
    statusResolved: string;
    statusClosed: string;
    urgencyLow: string;
    urgencyMedium: string;
    urgencyHigh: string;
    urgencyCritical: string;
    typeEducation: string;
    typeMedical: string;
    typeFood: string;
    typeShelter: string;
    typeEmergency: string;
    typeOther: string;
    adminNotes: string;
  };

  blog: {
    title: string;
    subtitle: string;
    recentPosts: string;
    minRead: string;
    author: string;
    noPosts: string;
    readStory: string;
    backToArchive: string;
    storyNotFound: string;
    storyNotFoundDesc: string;
    featuredNews: string;
    loading: string;
    loadError: string;
    retry: string;
    shareCopied: string;
  };

  contact: {
    title: string;
    subtitle: string;
    sendMessage: string;
    subject: string;
    message: string;
    sendBtn: string;
    officeHours: string;
    sentSuccess: string;
  };

  dashboard: {
    donorTitle: string;
    donorSubtitle: string;
    myDonations: string;
    downloadReceipt: string;
    volunteerPortalTitle: string;
    adminTitle: string;
    adminSubtitle: string;
    totalFundsRaised: string;
    pendingDisbursals: string;
    activeVolunteers: string;
    approve: string;
    reject: string;
  };

  chatbot: {
    title: string;
    online: string;
    greeting: string;
    prompt1: string;
    prompt2: string;
    prompt3: string;
    prompt4: string;
    promptKumbh: string;
    placeholder: string;
    send: string;
  };

  footer: {
    quickLinks: string;
    governance: string;
    secretariat: string;
    auditorDesk: string;
    contactHelpdesk: string;
    rights: string;
    academicNote: string;
    languageLabel: string;
  };

  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    password: string;
    createPassword: string;
    confirmPassword: string;
    passwordRequirements: string;
    forgotPassword: string;
    keepSignedIn: string;
    signInButton: string;
    registerButton: string;
    logout: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    donorRole: string;
    volunteerRole: string;
    adminRole: string;
    termsConsent: string;
    passwordsDoNotMatch: string;
    passwordTooShort: string;
    loginSuccess: string;
    registerSuccess: string;
    accessRestricted: string;
    sessionExpired: string;
    loggingIn: string;
    registering: string;
    loggingOut: string;
    profile: string;
    activeSession: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  en: {
    // Top-level legacy keys
    trustName: "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik",
    trustShort: "Icchapurti Vinayak Trust",
    tagline: "Serving our community with compassion, responsibility and transparency.",
    academicNotice: "Regd. Public Charitable Trust • E-9389 / Nashik",
    demoDataBadge: "Verified Record",
    navHome: "Home",
    navAbout: "About Trust",
    navCauses: "Our Work",
    navPassport: "Impact Passport",
    navVolunteer: "Volunteer",
    navEvents: "Events",
    navContact: "Contact",
    navLogin: "Login",
    navDashboard: "Dashboard",
    ctaDonate: "Donate Now",
    ctaSeeWork: "See Our Work",
    heroNotice: "Regd. Public Charitable Trust • Reg. No. E-9389 / Nashik",

    whyTrustTitle: "Why people trust us",
    whyTrustSubtitle:
      "A principled approach to charitable governance built on open records, verified disbursals, and direct community involvement.",
    trustPoint1Title: "Transparent donation process",
    trustPoint1Desc:
      "Every contribution receives an immediate digital record with clear allocation guidelines so you know exactly where funds are directed.",
    trustPoint2Title: "Clear records",
    trustPoint2Desc:
      "Itemized ledgers, vendor vouchers, and disbursal statements are maintained with strict accounting discipline.",
    trustPoint3Title: "Community-focused work",
    trustPoint3Desc:
      "Programs are planned in consultation with local community elders, rural schools, and government hospital superintendents.",
    trustPoint4Title: "Responsible use of contributions",
    trustPoint4Desc:
      "Contributions are dedicated directly to program procurement and community assistance, keeping administrative overhead strictly minimal.",

    ourWorkTitle: "Our Focus Areas",
    ourWorkSubtitle:
      "Targeted welfare programs designed to assist students, elders, and families in need across Nashik.",
    learnMore: "Learn More",
    educationTitle: "Educational Support",
    educationDesc:
      "Providing notebook bundles, school stationery, stitched uniforms, and academic sponsorship for orphan and needy students in Nashik.",
    medicalTitle: "Community Healthcare",
    medicalDesc:
      "Organizing periodic free medical diagnostic camps, vital checks, doctor consultations, and voluntary blood donation drives.",
    foodTitle: "Food & Nutrition Relief",
    foodDesc:
      "Distributing staple food grains, dry rations, and festive Diwali Faral packets to economically disadvantaged families.",
    reliefTitle: "Community & Elderly Care",
    reliefDesc:
      "Distributing seasonal warm sweaters, clothing, and mobility walking sticks and monsoon umbrellas for senior citizens.",
    environmentTitle: "Environmental Conservation",
    environmentDesc:
      "Leading native tree plantation drives and environmental cleanliness initiatives across schools and public grounds in Nashik.",

    passportJourneyTitle: "Trace the Journey of Your Donation",
    passportJourneySubtitle:
      "A four-stage verification protocol ensuring complete accountability from receipt generation to beneficiary delivery.",
    stageDonation: "Donation",
    stageDonationDesc:
      "Your contribution is securely recorded with an immutable digital transaction token and numbered donation receipt.",
    stageAllocation: "Allocation",
    stageAllocationDesc:
      "Funds are matched directly with vetted supplier purchase orders or accredited hospital medical estimates.",
    stageVerification: "Verification",
    stageVerificationDesc:
      "Independent trust field coordinators inspect ground delivery, verify item count, and digitally sign delivery vouchers.",
    stageImpact: "Impact",
    stageImpactDesc:
      "Final outcome reports, beneficiary case logs, and photographic proofs are compiled into your permanent Impact Passport.",
    openPassport: "Open Impact Passport",
    samplePassportLabel: "Verified Public Demo Ledger Sample",

    // Modularized schema
    common: {
      trustName: "Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik",
      trustShort: "Icchapurti Vinayak Trust",
      tagline: "Serving our community with compassion, responsibility and transparency.",
      academicNotice: "Regd. Public Charitable Trust • E-9389 / Nashik",
      demoDataBadge: "Verified Record",
      save: "Save",
      cancel: "Cancel",
      submit: "Submit",
      close: "Close",
      loading: "Loading...",
      search: "Search",
      filter: "Filter",
      all: "All",
      viewAll: "View All",
      learnMore: "Learn More",
      readMore: "Read More",
      donateNow: "Donate Now",
      volunteer: "Volunteer",
      exploreWork: "Explore Our Work",
      contactUs: "Contact Us",
      requestHelp: "Request Help",
      download: "Download",
      status: "Status",
      date: "Date",
      location: "Location",
      category: "Category",
      amount: "Amount",
      success: "Success",
      error: "Error",
      verified: "Verified",
      pending: "Pending",
      completed: "Completed",
      backToHome: "Back to Home",
      noResults: "No records found matching your criteria.",
      share: "Share",
      copied: "Copied to clipboard!",
    },

    nav: {
      home: "Home",
      about: "About Trust",
      causes: "Our Work",
      passport: "Impact Passport",
      volunteer: "Volunteer",
      events: "Events",
      gallery: "Gallery",
      transparency: "Transparency",
      blog: "Blog & News",
      contact: "Contact",
      login: "Login",
      register: "Register",
      dashboard: "Donor Dashboard",
      admin: "Admin Audit Desk",
      kumbh: "Kumbh Seva 2027",
      requestHelp: "Request Help",
    },

    hero: {
      badge: "Regd. Public Charitable Trust • Est. 2012 (Demo Reference)",
      welcomeTitle: "Empowering Communities Through Transparent Charitable Action",
      welcomeSubtitle:
        "A legally governed public charitable trust dedicated to rural education, critical healthcare, emergency nutrition, and disaster relief with 100% auditable impact.",
      namasteTag: "Welcoming Host • नम्र अभिवादन",
      namasteQuote: "Serving with humility, transparency and devotion.",
      welcomeSpeakerPrompt: "🔊 Listen to Welcome",
      startWelcome: "Start Welcome",
      skip: "Skip",
      replay: "Replay",
      voiceOn: "Voice On",
      voiceOff: "Mute",
      speechSentence1: "Namaste! A warm welcome to Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik.",
      speechSentence2: "How may we help you today?",
      subtitle1: "A heartfelt welcome to Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik.",
      subtitle2: "Which noble seva or initiative brings you to us today?",
      directSevaFood: "🍲 Meals & Nutrition",
      directSevaHealth: "🩺 Medical Aid",
      directSevaEdu: "📚 Education",
      directSevaVol: "🤝 Volunteer",
      searchPassportPlaceholder: "Enter Impact Passport ID (e.g. SCT-2024-8821)",
      trackImpact: "Track",
      stat1Value: "₹42.8 Lakh",
      stat1Label: "Funds Disbursed",
      stat2Value: "18 Drives",
      stat2Label: "Active Campaigns",
      stat3Value: "650+ Active",
      stat3Label: "Registered Volunteers",
      stat4Value: "100%",
      stat4Label: "Audited Ledgers",
    },

    about: {
      title: "About Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik",
      subtitle:
        "A principled public trust founded on the bedrock of transparent service, verified disbursements, and grassroots community upliftment.",
      missionTitle: "Our Mission",
      missionDesc:
        "To alleviate poverty, advance girl-child education, deliver quality healthcare to underserved rural regions, and provide immediate disaster relief with complete fiscal accountability.",
      visionTitle: "Our Vision",
      visionDesc:
        "A compassionate, equitable society where every child learns, every patient receives dignified treatment, and every donor sees the verifiable fruit of their generosity.",
      valuesTitle: "Core Institutional Values",
      value1: "Radical Transparency",
      value1Desc:
        "Every rupee received is documented with public vendor vouchers, beneficiary geotags, and audit stamps.",
      value2: "Dignity in Giving",
      value2Desc:
        "We serve beneficiaries not as dependents, but as respected community members deserving equal opportunity.",
      value3: "Zero Waste Governance",
      value3Desc:
        "Over 92% of operational budgets directly reach ground procurement; administrative costs are kept strictly below 8%.",
      boardTitle: "Board of Trustees & Leadership",
      governanceTitle: "Legal & Statutory Compliance",
      taxNotice: "Statutory and tax-related information is subject to verification of the Trust's current official documentation.",
    },

    causes: {
      title: "Active Social Campaigns & Causes",
      subtitle: "Direct your contributions to verified grassroots drives with itemized fund utilization tracking.",
      filterAll: "All Causes",
      filterEdu: "Education",
      filterHealth: "Healthcare",
      filterFood: "Nutrition & Meals",
      filterRelief: "Emergency Relief",
      filterEnv: "Environment",
      filterKumbh: "Kumbh Seva",
      raisedOf: "raised of",
      donors: "donors",
      target: "Target",
      donateToCause: "Contribute to this Cause",
      viewDetails: "View Audit Details",
      daysLeft: "days left",
      verifiedCause: "Verified Ground Cause",
    },

    donate: {
      title: "Make a Contribution to Grassroots Seva",
      subtitle: "Every contribution is issued an official numbered donation receipt and a verifiable ledger entry.",
      frequency: "Donation Frequency",
      oneTime: "One-Time Donation",
      monthly: "Monthly Seva Pledge",
      selectAmount: "Choose an Amount",
      customAmount: "Or enter custom amount (₹)",
      selectCause: "Allocate Contribution To",
      generalFund: "General Seva & Greatest Need",
      donorInfo: "Donor Information",
      fullName: "Full Name (as per PAN)",
      email: "Email Address (for donation receipt)",
      phone: "Mobile Number",
      pan: "PAN Number (for statutory records)",
      anonymous: "Make my contribution anonymous on the public donor roll",
      paymentMethod: "Select Payment Method",
      upi: "UPI / QR Code / GPay / PhonePe",
      card: "Debit / Credit Card",
      netBanking: "Net Banking (All Indian Banks)",
      taxDeductibleBadge: "Official Receipt with Reg. No. E-9389 / Nashik",
      proceedPayment: "Proceed to Secure Payment",
      receiptPromise: "Instant digital receipt & SMS confirmation issued.",
      successTitle: "Thank You for Your Sacred Contribution!",
      successSubtitle: "Your contribution reference has been generated and queued for ground allocation.",
    },

    volunteer: {
      title: "Join Our Compassionate Volunteer Network",
      subtitle: "Contribute your time, skills, and energy to transform vulnerable communities on the ground.",
      openRoles: "Open Field Volunteer Opportunities",
      applyNow: "Register as a Volunteer",
      roleLocation: "Location / Mode",
      roleCommitment: "Time Commitment",
      roleSkills: "Recommended Skills",
      volunteerFormTitle: "Volunteer Enrollment Application",
      availability: "Weekly Availability",
      weekends: "Weekends Only",
      weekdays: "Weekdays",
      flexible: "Flexible / On-Call for Emergencies",
      motivation: "Why do you wish to volunteer with us?",
      submitVolunteer: "Submit Volunteer Application",
      portalHeading: "Volunteer Activity Portal",
      hoursLogged: "Hours Logged",
      shiftsDone: "Drives Attended",
      certificateTitle: "Civic Service Certificate",
    },

    requestHelp: {
      title: "Request Community Support & Medical Aid",
      subtitle:
        "If you or your community requires urgent humanitarian assistance, submit your request here for verification.",
      emergencyNotice:
        "For acute medical crises requiring ICU admission, call our emergency helpline directly: +91 (022) 5550-0192.",
      helpCategory: "Assistance Category",
      catMedical: "Critical Surgery / Hospitalization",
      catEducation: "School / College Tuition Support",
      catFood: "Family Ration & Nutrition Kit",
      catDisaster: "Disaster / Fire / Flood Rehabilitation",
      applicantName: "Applicant / Patient Full Name",
      applicantPhone: "Contact Mobile Number",
      applicantCity: "City / Village & District",
      description: "Describe the situation and required support",
      requiredAmount: "Estimated Financial Assistance Needed (₹)",
      uploadDocs: "Upload Doctor's Prescription / Income Certificate (Simulated)",
      urgency: "Urgency Level",
      urgencyCritical: "Immediate (within 48 hours)",
      urgencyModerate: "Within 1 to 2 weeks",
      urgencyNormal: "General Educational/Monthly Support",
      submitHelp: "Submit Assistance Request",
      trackingNotice:
        "You will receive a unique tracking token and our local field officer will verify the case.",
    },

    impactPassport: {
      title: "Impact Passport • Transparency Verification Ledger",
      subtitle:
        "Track your contribution end-to-end from receipt generation to field disbursal, vendor vouchers, and verified beneficiary outcomes.",
      searchPlaceholder: "Enter Passport Token (e.g., SCT-2024-8821)",
      samplePassports: "Or inspect verified public demo audit records:",
      stage1: "Stage 1: Contribution Logged",
      stage2: "Stage 2: Fund Allocation",
      stage3: "Stage 3: Field Verification",
      stage4: "Stage 4: Verified Impact",
      auditBadge: "Cryptographic Hash Verified",
      donor: "Donor",
      amount: "Amount",
      allocatedTo: "Allocated To",
      fieldOfficer: "Field Officer",
      auditDate: "Audit Date",
      vendorBill: "Itemized Vendor Voucher",
    },

    kumbh: {
      title: "Nashik Simhastha Kumbh Seva 2027",
      subtitle:
        "Decentralized humanitarian infrastructure, pure drinking water kiosks, 24/7 mega Annachhatra, and pilgrim welfare for millions of devotees.",
      heroSubtitle:
        "Nashik–Trimbakeshwar Simhastha 2027 • Advance Humanitarian Seva Infrastructure",
      modeBadge: "Kumbh Active Mode",
      togglePrompt: "Simulate Kumbh Mode On / Off",
      waterKiosks: "Pure Drinking Water Hubs",
      waterDesc: "20 RO-filtered cold water distribution points along Ramkund and Tapovan.",
      annachhatra: "24/7 Mega Annachhatra",
      annachhatraDesc:
        "Hygienic, warm sattvic meals served continuously to sadhus, pilgrims, and sanitation workers.",
      medicalBooths: "Emergency Ghat First-Aid",
      medicalDesc: "Volunteer paramedics and doctors equipped with oxygen and basic trauma response.",
      lostFound: "Lost & Found Pilgrim Support",
      lostFoundDesc: "Public announcement systems and digital child tagging to prevent family separation.",
      volunteerCall: "Register for Kumbh Field Duty",
      emergencyHelpline: "24/7 Pilgrim Emergency Helpline",
      disabledTitle: "Simhastha Kumbh 2027 Seva Module Offline",
      disabledDesc:
        "The dedicated Kumbh Seva module is currently deactivated in site settings. Trust administrators can activate this module from the Admin Settings desk.",
      adminSettingsBtn: "Go to Admin Settings",
      preparatoryNoticeTitle: "Preparatory Planning Phase (Demo Reference)",
      preparatoryNoticeDesc:
        "Nashik Simhastha Kumbh occurs in 2027. The initiatives, infrastructure targets, and volunteer deployment drives shown below represent preparatory planning blueprints and illustrative demonstration figures.",
      demoPlanningBadge: "Demo / Planning Phase",
      metricsMeals: "Daily Satvik Meals (Target)",
      metricsMealsSub: "Across 4 Annachhatra hubs",
      metricsWater: "Clean Water Points (Target)",
      metricsWaterSub: "Along Ramkund & Godavari",
      metricsVolunteers: "Volunteers Needed (Target)",
      metricsVolunteersSub: "Trained ground sevadars",
      metricsMedical: "First-Aid Booths (Target)",
      metricsMedicalSub: "Round-the-clock emergency support",
      pillarsTitle: "Four Pillars of Simhastha Pilgrim Seva",
      pillarsSubtitle:
        "Engineered in consultation with civic administrators to prevent stampedes, maintain river purity, and care for every devotee.",
      pillarGhatTitle: "Ghat Purity & Clean Water",
      pillarGhatDesc:
        "High-capacity automated RO filtration kiosks along Ramkund & Kushavarta, plus floating silt and waste collection boats.",
      pillarAnnachhatraTitle: "24/7 Mega Annachhatra",
      pillarAnnachhatraDesc:
        "Free hot satvik meals and herbal tea served in biodegradable leaf pattals with zero food wastage.",
      pillarMedicalTitle: "Medical Triage & ORS Booths",
      pillarMedicalDesc:
        "Immediate first-aid, CPR defibrillators, glucose hydration sachets, and dedicated transport for emergency patients.",
      pillarLostFoundTitle: "Lost-and-Found Assistance",
      pillarLostFoundDesc:
        "Multilingual public address booths and RFID pilgrim wristbands for children and seniors to prevent separation.",
      campaignsTag: "Specific Contribution Drives",
      campaignsTitle: "Simhastha Kumbh Focused Initiatives",
      viewAllCauses: "View All Trust Causes",
      emptyCampaigns: "No dedicated Kumbh Seva campaigns currently registered in the database.",
      volunteerBadge: "Volunteer Call • Simhastha 2027",
      volunteerTitle: "Register as a Kumbh Sevadar",
      volunteerSubtitle:
        "Be the welcoming smile and helping hand for sadhus, pilgrims, and elderly devotees visiting Maharashtra.",
      requirementsLabel: "Requirements:",
      openSlots: "open volunteer slots",
      applyForRole: "Apply for Role",
      emptyRoles: "No volunteer roles currently published for Kumbh Seva. Check back soon.",
      eventsTitle: "Upcoming Kumbh Field Drives & Orientations",
      eventsSubtitle:
        "Preliminary volunteer workshops and Godavari river hygiene drives scheduled ahead of Simhastha.",
      eventDetails: "Event Details",
      registeredCount: "registered",
      emptyEvents: "There are no preparatory Kumbh Seva events scheduled at this moment. Orientation sessions will be announced closer to the festival.",
      announcementsBadge: "Field Updates & Dispatches",
      announcementsTitle: "Kumbh Seva News & Announcements",
      announcementsSubtitle:
        "Official updates, field surveys, and planning dispatches for Simhastha Kumbh 2027.",
      readMore: "Read Dispatch",
      viewAllNews: "View All News",
      emptyAnnouncements: "No Kumbh field dispatches published at this time.",
      galleryBadge: "Ground Archives & Survey Proofs",
      galleryTitle: "Kumbh Preparatory Field Gallery",
      gallerySubtitle:
        "Visual records of ghat inspections, hygiene reconnaissance, and seva station survey sites.",
      viewFullGallery: "View Full Gallery",
      emptyGallery: "No photo records uploaded for Kumbh Seva at this time.",
      loadingText: "Loading Kumbh Seva 2027 records...",
      loadErrorTitle: "Unable to Load Kumbh Records",
      loadErrorDesc:
        "Could not retrieve public Kumbh data from the server. Please check your network connection and retry.",
      retryBtn: "Retry Loading",
      modalApplyTitle: "Apply as Kumbh Sevadar:",
      modalSuccessTitle: "Jai Godavari! Registration Recorded",
      modalBriefingNote: "Advance briefing sessions will be held in Nashik and online.",
      fullNameLabel: "Full Name *",
      fullNamePlaceholder: "e.g. Ramesh S. Shinde",
      phoneLabel: "Mobile / WhatsApp *",
      phonePlaceholder: "+91 98200 00000",
      emailLabel: "Email Address (Optional)",
      cityLabel: "City / Home Town *",
      cityPlaceholder: "e.g. Nashik / Mumbai / Pune",
      sevaAreaLabel: "Preferred Seva Area",
      availabilityLabel: "Availability Window",
      emergencyContactLabel: "Emergency Contact (Name & Phone)",
      emergencyContactPlaceholder: "e.g. Suresh Shinde (+91 98211 11111)",
      skillsLabel: "Skills / Experience (Select relevant)",
      cancelBtn: "Cancel",
      submitRegistrationBtn: "Submit Registration",
      submittingBtn: "Registering...",
      regSuccessBadge: "Simhastha Kumbh 2027 • Sevadar Roster",
      regRefLabel: "Official Reference No:",
      regApplicantLabel: "Applicant:",
      regRoleLabel: "Assigned Role:",
      regSevaAreaLabel: "Seva Preference:",
      regAvailabilityLabel: "Availability:",
      regSuccessNote:
        "Your details have been saved to the Sevadar database. Our Nashik liaison team will connect via WhatsApp for orientation and ground badges.",
      closeReturnBtn: "Close & Return",
      areaGhatHygiene: "Ghat Hygiene & Cleanliness",
      areaAnnadan: "Annadan & Satvik Kitchen",
      areaWater: "Water Booths & RO Stations",
      areaCrowdGuidance: "Crowd Guidance & Senior Citizen Help",
      areaFirstAid: "First Aid & Medical Station",
      availPeakDates: "Peak Shahi Snan Dates",
      availFullDuration: "Full Festival Duration (Aug - Sep 2027)",
      availWeekends: "Weekends Only",
      availPreparatory: "Preparatory Seva (2026-2027)",
      skillCrowd: "Crowd & Queue Management",
      skillMedical: "First Aid / Medical",
      skillLanguages: "Local Languages (Marathi/Hindi)",
      skillKitchen: "Cooking & Kitchen Service",
      skillRiver: "River Sanitation & Cleanup",
    },

    events: {
      title: "Community Events & Field Drives",
      subtitle: "Upcoming health camps, educational workshops, tree plantation drives, and seva volunteer gatherings.",
      upcoming: "Upcoming Events",
      past: "Completed Drives",
      rsvp: "RSVP / Register Attendance",
      venue: "Venue",
      capacity: "Registered Participants",
    },

    gallery: {
      title: "Field Action Gallery & Visual Records",
      subtitle:
        "High-resolution photographic documentation of our field drives, medical camps, and educational interventions.",
      filterAll: "All Photos",
      filterEdu: "Education",
      filterMedical: "Medical Camps",
      filterFood: "Annadaan",
      filterKumbh: "Kumbh Seva",
    },

    transparency: {
      title: "Public Transparency & Financial Governance",
      subtitle:
        "Uncompromising openness with public ledgers, statutory audit balance sheets, and itemized utilization reports.",
      financialYear: "Financial Year",
      totalIncome: "Total Receipts (Donations)",
      directUtilization: "Direct Program Spending (92.4%)",
      adminExpenses: "Administrative Overhead (7.6%)",
      downloadAuditedReport: "Download Audited Financial Statement (PDF)",
      allReports: "All Reports",
      annualReports: "Annual Reports",
      financialReports: "Financial Statements",
      auditReports: "Statutory Audits",
      impactReports: "Impact Dossiers",
      utilizationReports: "80G Utilization",
      otherReports: "Other Filings",
      noReports: "No Transparency Reports Published Yet",
      noReportsDesc: "Published audit dockets, statutory filings, and annual governance reports will appear here once released by the board.",
      loading: "Loading verified transparency reports from ledger...",
      loadError: "Unable to load transparency reports. Please check connectivity.",
      retry: "Retry Connection",
      viewDocument: "View Document",
      downloadDocument: "Download Document",
      viewDossier: "View Docket",
      dossierDetails: "Report & Docket Disclosures",
      auditor: "Auditor Firm",
      statutoryType: "Statutory Type",
      auditRating: "Audit Opinion / Rating",
      reportedDisbursal: "Reported Program Spend",
      close: "Close",
    },

    helpRequest: {
      title: "Community Aid & Hardship Assistance Portal",
      subtitle: "Families facing medical emergencies, educational hardship, or urgent relief needs can submit applications for verified trust assistance.",
      applyTab: "Submit Aid Application",
      trackTab: "Track Application Status",
      myRequestsTab: "My Submitted Requests",
      fullName: "Full Name (Applicant / Beneficiary)",
      email: "Email Address",
      phone: "Contact Phone Number",
      requestType: "Category of Assistance",
      urgency: "Urgency Level",
      description: "Detailed Description of Hardship & Assistance Needed",
      location: "Location / Address (City, Taluka, District)",
      submitApplication: "Submit Assistance Application",
      submitting: "Submitting to Trust Board...",
      submittedSuccess: "Help Request Submitted Successfully",
      submittedSuccessDesc: "Your application has been received into our system. Your unique Tracking ID is displayed below.",
      trackTitle: "Track Application Status",
      trackSubtitle: "Enter your registered Help Request ID to check the current review stage and field verification status.",
      enterRequestId: "Enter 24-character Help Request ID",
      trackButton: "Track Docket",
      tracking: "Checking status...",
      requestNotFound: "Help request not found. Please verify your ID and ensure you are logged into the submitting account.",
      loginRequiredTitle: "Authentication Required to Apply for Aid",
      loginRequiredDesc: "To ensure legitimate beneficiary records, prevent identity duplication, and enable secure status tracking, please log in or register before submitting an application.",
      loginBtn: "Log In to Continue",
      registerBtn: "Create New Account",
      noPersonalRequests: "No Aid Applications Found",
      noPersonalRequestsDesc: "You haven't submitted any hardship or community assistance applications yet.",
      statusPending: "Pending Verification",
      statusUnderReview: "Under Review",
      statusApproved: "Sanctioned / Approved",
      statusRejected: "Declined",
      statusInProgress: "In Progress / Field Action",
      statusResolved: "Resolved / Disbursed",
      statusClosed: "Closed",
      urgencyLow: "Low Priority",
      urgencyMedium: "Standard",
      urgencyHigh: "Urgent",
      urgencyCritical: "Critical Emergency",
      typeEducation: "Education Support",
      typeMedical: "Medical Hardship",
      typeFood: "Food Relief",
      typeShelter: "Shelter & Housing",
      typeEmergency: "Emergency Disaster",
      typeOther: "Other Hardship",
      adminNotes: "Trust Secretariat Notes",
    },

    blog: {
      title: "Field Stories, Updates & Humanitarian Perspectives",
      subtitle: "In-depth reflections from our field officers, community coordinators, and medical volunteers.",
      recentPosts: "Recent Publications",
      minRead: "min read",
      author: "Author",
      noPosts: "No news available at the moment.",
      readStory: "Read Story",
      backToArchive: "Back to News Archive",
      storyNotFound: "Story Not Found",
      storyNotFoundDesc: "The requested chronicle could not be located in our archive.",
      featuredNews: "News, Field Stories & Seva Updates",
      loading: "Loading news articles...",
      loadError: "Unable to load news updates at this time.",
      retry: "Try Again",
      shareCopied: "Story link copied to clipboard.",
    },

    contact: {
      title: "Connect with Our Secretariat & Helpdesk",
      subtitle:
        "Have questions about donations, 80G tax exemptions, volunteering, or verified audits? Reach out to us.",
      sendMessage: "Send an Official Inquiry",
      subject: "Subject",
      message: "Your Message",
      sendBtn: "Transmit Message",
      officeHours: "Visiting Hours: Mon - Sat 9:30 AM to 5:30 PM",
      sentSuccess: "Thank you! Your message has been received by our office coordinator.",
    },

    dashboard: {
      donorTitle: "Donor Personal Portal & 80G Receipts",
      donorSubtitle:
        "View your lifetime philanthropic record, download tax deduction certificates, and track allocated impact.",
      myDonations: "Donation History",
      downloadReceipt: "Download 80G Receipt",
      volunteerPortalTitle: "Volunteer Field Command Desk",
      adminTitle: "Trust Governance & Administrative Control",
      adminSubtitle:
        "Verify assistance requests, authorize supplier disbursals, update ledger, and manage Kumbh deployment.",
      totalFundsRaised: "Total Funds Tracked",
      pendingDisbursals: "Pending Disbursal Audits",
      activeVolunteers: "Enrolled Volunteers",
      approve: "Approve",
      reject: "Reject",
    },

    chatbot: {
      title: "SevaSahayak • Virtual Assistant",
      online: "Trust Helpdesk Online",
      greeting:
        "Namaste! I am SevaSahayak, your verified assistant for Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik. How may I assist your charitable journey today?",
      prompt1: "How do 80G tax receipts work?",
      prompt2: "How can I track my donation?",
      prompt3: "How to volunteer?",
      prompt4: "Where is the trust office?",
      promptKumbh: "Tell me about Kumbh Seva 2027",
      placeholder: "Ask about donations, tax exemption, volunteering, or causes...",
      send: "Send",
    },

    footer: {
      quickLinks: "Quick Links",
      governance: "Governance & Desk",
      secretariat: "Trust Secretariat",
      auditorDesk: "Auditor Verification Desk",
      contactHelpdesk: "Contact & Helpdesk",
      rights: "All rights reserved.",
      academicNote: "Registered Public Charitable Trust. Committed to auditable social philanthropy and verified grassroots empowerment.",
      languageLabel: "Language / भाषा:",
    },

    auth: {
      loginTitle: "Sign In to Trust Portal",
      loginSubtitle: "Access your verified Impact Passports, tax receipts, and volunteer records.",
      registerTitle: "Create Supporter Account",
      registerSubtitle: "Join thousands of transparent supporters with persistent Impact Passports.",
      fullName: "Full Legal Name",
      fullNamePlaceholder: "e.g. Sanya Kapoor",
      email: "Email Address",
      emailPlaceholder: "name@example.com",
      phone: "Phone Number",
      phonePlaceholder: "+91 98765 43210",
      password: "Password",
      createPassword: "Create Password",
      confirmPassword: "Confirm Password",
      passwordRequirements: "At least 8 characters with 1 uppercase, 1 lowercase & 1 number",
      forgotPassword: "Forgot?",
      keepSignedIn: "Keep signed in",
      signInButton: "Sign In",
      registerButton: "Create Account",
      logout: "Sign Out",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account yet?",
      donorRole: "Philanthropist / Donor",
      volunteerRole: "Student / Volunteer",
      adminRole: "Trust Administrator",
      termsConsent: "I agree to the Trust Transparency Charter and consent to verified recordkeeping.",
      passwordsDoNotMatch: "Passwords do not match.",
      passwordTooShort: "Password must be at least 8 characters with letters and numbers.",
      loginSuccess: "Signed in successfully!",
      registerSuccess: "Account registered successfully! Welcome to the Trust.",
      accessRestricted: "Access Restricted",
      sessionExpired: "Session expired. Please sign in again.",
      loggingIn: "Signing in...",
      registering: "Creating account...",
      loggingOut: "Signing out...",
      profile: "Profile",
      activeSession: "Active Session",
    },
  },

  mr: {
    // Top-level legacy keys in natural Marathi
    trustName: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चॅरिटेबल ट्रस्ट, नाशिक",
    trustShort: "इच्छापूर्ती विनायक ट्रस्ट",
    tagline: "करुणा, सामाजिक जबाबदारी आणि पारदर्शकतेने समाजसेवा.",
    academicNotice: "नोंदणीकृत सार्वजनिक चॅरिटेबल ट्रस्ट • ई-९३८९ / नाशिक",
    demoDataBadge: "सत्यापित नोंद",
    navHome: "मुख्य पृष्ठ",
    navAbout: "ट्रस्टविषयी",
    navCauses: "आमचे कार्य",
    navPassport: "इम्पॅक्ट पासपोर्ट",
    navVolunteer: "स्वयंसेवक",
    navEvents: "कार्यक्रम",
    navContact: "संपर्क",
    navLogin: "प्रवेश",
    navDashboard: "डॅशबोर्ड",
    ctaDonate: "आत्ताच देणगी द्या",
    ctaSeeWork: "आमचे कार्य जाणून घ्या",
    heroNotice: "नोंदणीकृत सार्वजनिक चॅरिटेबल ट्रस्ट • नोंदणी क्र. ई-९३८९ / नाशिक",

    whyTrustTitle: "लोक आमच्यावर विश्वास का ठेवतात?",
    whyTrustSubtitle:
      "खुली हिशेबवही, प्रत्येक खर्चाची स्वतंत्र पडताळणी आणि समाजातील थेट सहभागावर आधारलेली विश्वासार्ह संस्था.",
    trustPoint1Title: "पारदर्शक देणगी व्यवस्था",
    trustPoint1Desc:
      "प्रत्येक देणगीची तात्काळ डिजिटल पावती दिली जाते आणि निधी नेमका कुठे वापरला गेला याचा स्पष्ट तपशील मिळतो.",
    trustPoint2Title: "अचूक व सुरक्षित हिशेब",
    trustPoint2Desc:
      "खरेदी पावत्या, देयके आणि खर्चाचा तपशील कठोर लेखापरीक्षणासह सर्वांसाठी उपलब्ध ठेवला जातो.",
    trustPoint3Title: "समाजाभिमुख सेवाकार्य",
    trustPoint3Desc:
      "स्थानिक शिक्षक, ज्येष्ठ नागरिक आणि शासकीय रुग्णालय प्रमुखांच्या सल्ल्याने प्रत्यक्ष गरजू घटकांपर्यंत पोहोचतो.",
    trustPoint4Title: "निधीचा जबाबदार वापर",
    trustPoint4Desc:
      "९२% पेक्षा अधिक निधी थेट सेवा साहित्यासाठी वापरला जातो, प्रशासकीय खर्च अत्यल्प ठेवला जातो.",

    ourWorkTitle: "आमचे सेवाकार्य",
    ourWorkSubtitle:
      "गरजू समाजघटकांसाठी शिक्षण, आरोग्य, पोषण आणि आपत्कालीन मदत या क्षेत्रांतील प्रामाणिक कार्य.",
    learnMore: "अधिक जाणून घ्या",
    educationTitle: "शिक्षण सहाय्य",
    educationDesc:
      "ग्रामीण शाळांमध्ये संगणक प्रयोगशाळा, शैक्षणिक साहित्य आणि मुलींच्या उच्च शिक्षणासाठी शिष्यवृत्ती सहाय्य.",
    medicalTitle: "वैद्यकीय मदत व शस्त्रक्रिया",
    medicalDesc:
      "बालकांवरील शस्त्रक्रिया, कर्करोग निदान आणि दुर्गम ग्रामीण भागात मोफत आरोग्य तपासणी शिबिरे.",
    foodTitle: "अन्नछत्र व पोषण",
    foodDesc:
      "रुग्णालयाबाहेरील नातेवाईक, निराधार वृद्ध आणि कष्टकरी कुटुंबांसाठी अखंड अन्नछत्र व धान्य वाटप.",
    reliefTitle: "आपत्कालीन मदत",
    reliefDesc:
      "पूर आणि नैसर्गिक आपत्तीच्या काळात अन्नधान्य किट, औषधे आणि तात्पुरता निवारा सहाय्य.",
    environmentTitle: "पर्यावरण संवर्धन",
    environmentDesc:
      "देशी झाडांचे वृक्षारोपण, गावांमध्ये पाणी अडवा-पाणी जिरवा उपक्रम आणि स्वच्छता मोहीम.",

    passportJourneyTitle: "तुमच्या योगदानाचा प्रवास जाणून घ्या",
    passportJourneySubtitle:
      "दात्याच्या प्रत्येक रुपयाचा प्रत्यक्ष लाभ गरजूपर्यंत कसा पोहोचतो हे दाखवणारी पारदर्शक व्यवस्था.",
    stageDonation: "दान",
    stageDonationDesc:
      "आपली देणगी विशिष्ट संदर्भ क्रमांकासह नोंदवून अधिकृत डिजिटल पावती दिली जाते.",
    stageAllocation: "वाटप",
    stageAllocationDesc:
      "निधी थेट रुग्णालयाचे बिल, शालेय साहित्याचे चलन किंवा धान्य खरेदीशी जोडला जातो.",
    stageVerification: "पडताळणी",
    stageVerificationDesc:
      "स्वतंत्र प्रतिनिधी जागेवर जाऊन साहित्याची प्रत्यक्ष पोहोच तपासतात आणि स्वाक्षरी करतात.",
    stageImpact: "प्रत्यक्ष परिणाम",
    stageImpactDesc:
      "रुग्णाचा सुधारलेला उपचार, विद्यार्थ्यांचा अभ्यास किंवा जेवण मिळालेल्या व्यक्तींची नोंद.",
    openPassport: "इम्पॅक्ट पासपोर्ट उघडा",
    samplePassportLabel: "पडताळणी केलेल्या प्रवासाचा नमुना",

    // Modularized schema
    common: {
      trustName: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चॅरिटेबल ट्रस्ट, नाशिक",
      trustShort: "इच्छापूर्ती विनायक ट्रस्ट",
      tagline: "करुणा, सामाजिक जबाबदारी आणि पारदर्शकतेने समाजसेवा.",
      academicNotice: "नोंदणीकृत सार्वजनिक चॅरिटेबल ट्रस्ट • ई-९३८९ / नाशिक",
      demoDataBadge: "सत्यापित नोंद",
      save: "जतन करा",
      cancel: "रद्द करा",
      submit: "सादर करा",
      close: "बंद करा",
      loading: "लोड होत आहे...",
      search: "शोधा",
      filter: "फिल्टर",
      all: "सर्व",
      viewAll: "सर्व पहा",
      learnMore: "अधिक जाणून घ्या",
      readMore: "पुढे वाचा",
      donateNow: "आत्ताच देणगी द्या",
      volunteer: "स्वयंसेवक बना",
      exploreWork: "आमचे कार्य जाणून घ्या",
      contactUs: "आमच्याशी संपर्क साधा",
      requestHelp: "मदतीची विनंती करा",
      download: "डाउनलोड करा",
      status: "स्थिती",
      date: "दिनांक",
      location: "ठिकाण",
      category: "विभाग",
      amount: "रक्कम",
      success: "यशस्वी",
      error: "त्रुटी",
      verified: "पडताळणी पूर्ण",
      pending: "प्रलंबित",
      completed: "पूर्ण",
      backToHome: "मुख्य पृष्ठावर परत जा",
      noResults: "आपल्या निकषांशी जुळणारी कोणतीही माहिती आढळली नाही.",
      share: "शेअर करा",
      copied: "क्लिपबोर्डवर कॉपी केले!",
    },

    nav: {
      home: "मुख्य पृष्ठ",
      about: "ट्रस्टविषयी",
      causes: "आमचे कार्य",
      passport: "इम्पॅक्ट पासपोर्ट",
      volunteer: "स्वयंसेवक",
      events: "कार्यक्रम",
      gallery: "छायाचित्र दालन",
      transparency: "पारदर्शकता",
      blog: "वृत्त व लेख",
      contact: "संपर्क",
      login: "प्रवेश",
      register: "नोंदणी",
      dashboard: "दाता डॅशबोर्ड",
      admin: "प्रशासक डेस्क",
      kumbh: "कुंभ सेवा २०२७",
      requestHelp: "मदत विनंती",
    },

    hero: {
      badge: "नोंदणीकृत सार्वजनिक धर्मादाय ट्रस्ट • स्था. २०१२ (डेमो संदर्भ)",
      welcomeTitle: "पारदर्शक समाजकार्यातून वंचित घटकांना सशक्त बनवणारे व्यासपीठ",
      welcomeSubtitle:
        "ग्रामीण शिक्षण, आरोग्य उपचार, आपत्कालीन अन्नछत्र आणि आपत्ती निवारणासाठी समर्पित अधिकृत चॅरिटेबल ट्रस्ट. प्रत्येक योगदानाचा संपूर्ण पारदर्शक हिशोब.",
      namasteTag: "स्वागताध्यक्ष • नम्र अभिवादन",
      namasteQuote: "परमेश्वर प्रत्येक जीवात वास करतो — सेवा हीच खरी भक्ती.",
      welcomeSpeakerPrompt: "🔊 स्वागत ऐका",
      startWelcome: "स्वागत सुरू करा",
      skip: "पुढे जा",
      replay: "पुन्हा ऐका",
      voiceOn: "ध्वनी सुरू",
      voiceOff: "ध्वनी बंद",
      speechSentence1: "नमस्कार! इच्छापूर्ती ऋद्धी सिद्धी विनायक चॅरिटेबल ट्रस्टमध्ये आपले मनःपूर्वक स्वागत आहे.",
      speechSentence2: "आपण आज कोणत्या सेवेसाठी आला आहात?",
      subtitle1: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चॅरिटेबल ट्रस्टमध्ये आपले मनःपूर्वक स्वागत आहे.",
      subtitle2: "आपण आज कोणत्या सेवेसाठी आला आहात?",
      directSevaFood: "🍲 अन्नदान",
      directSevaHealth: "🩺 आरोग्य सेवा",
      directSevaEdu: "📚 शिक्षण",
      directSevaVol: "🤝 स्वयंसेवक",
      searchPassportPlaceholder: "पासपोर्ट आयडी प्रविष्ट करा (उदा. SCT-2024-8821)",
      trackImpact: "तपासा",
      stat1Value: "₹४२.८ लाख",
      stat1Label: "वाटप केलेला निधी",
      stat2Value: "१८ मोहिमा",
      stat2Label: "सक्रिय सेवा मोहिमा",
      stat3Value: "६५०+ सक्रिय",
      stat3Label: "नोंदणीकृत स्वयंसेवक",
      stat4Value: "१००%",
      stat4Label: "लेखापरीक्षित हिशेब",
    },

    about: {
      title: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चॅरिटेबल ट्रस्टविषयी",
      subtitle:
        "पारदर्शक समाजसेवा, प्रत्यक्ष पडताळणी आणि वंचित घटकांच्या सर्वांगीण विकासासाठी कटिबद्ध असलेली विश्वस्त संस्था.",
      missionTitle: "आमचे ध्येय",
      missionDesc:
        "दारिद्र्य निर्मूलन, मुलींचे शिक्षण, ग्रामीण भागात मोफत आरोग्य सुविधा आणि आपत्तीच्या काळात तत्काळ साहाय्य पुरवणे.",
      visionTitle: "आमची दृष्टी",
      visionDesc:
        "असा समताधिष्ठित समाज जिथे प्रत्येक बालकाला दर्जेदार शिक्षण मिळेल, प्रत्येकाला वेळेवर उपचार मिळतील आणि प्रत्येक दात्याला आपल्या दानाचा योग्य विनियोग दिसेल.",
      valuesTitle: "आमची मूलभूत मूल्ये",
      value1: "संपूर्ण पारदर्शकता",
      value1Desc:
        "प्रत्येक रुपयाच्या देणगीचा तपशील, खरेदी पावत्या आणि लाभार्थी नोंदीसह उपलब्ध केला जातो.",
      value2: "सन्मानपूर्वक सेवा",
      value2Desc:
        "गरजू व्यक्तींची सेवा करताना त्यांच्या आत्मसन्मानाला सर्वोच्च प्राधान्य दिले जाते.",
      value3: "काटकसर आणि प्रामाणिकपणा",
      value3Desc:
        "९२% पेक्षा अधिक निधी थेट सेवा साहित्यासाठी वापरला जातो, प्रशासकीय खर्च अत्यल्प ठेवला जातो.",
      boardTitle: "विश्वस्त मंडळ आणि नेतृत्व",
      governanceTitle: "वैधानिक व प्रशासकीय नोंदणी",
      taxNotice: "आयकर कायदा १९६१ च्या कलम ८०जी अंतर्गत ५०% कर सवलत",
    },

    causes: {
      title: "सक्रिय सेवा मोहिमा आणि प्रकल्प",
      subtitle: "आपली देणगी थेट पडताळणी केलेल्या सेवा उपक्रमांसाठी द्या आणि निधी वाटपाचा तपशील पहा.",
      filterAll: "सर्व प्रकल्प",
      filterEdu: "शिक्षण",
      filterHealth: "आरोग्य",
      filterFood: "अन्नदान",
      filterRelief: "आपत्कालीन मदत",
      filterEnv: "पर्यावरण",
      filterKumbh: "कुंभ सेवा",
      raisedOf: "रक्कम जमा (लक्ष्य:",
      donors: "दाते",
      target: "ध्येय",
      donateToCause: "या कार्यासाठी देणगी द्या",
      viewDetails: "तपशील व हिशोब पहा",
      daysLeft: "दिवस शिल्लक",
      verifiedCause: "पडताळणी केलेला प्रकल्प",
    },

    donate: {
      title: "दान करा • समाजकार्यात सहभागी व्हा",
      subtitle: "प्रत्येक देणगीसाठी अधिकृत पावती आणि डिजिटल ऑडिट नोंद तात्काळ जारी केली जाते.",
      frequency: "देणगीचा प्रकार",
      oneTime: "एक वेळ देणगी",
      monthly: "मासिक सेवा संकल्प",
      selectAmount: "रक्कम निवडा",
      customAmount: "किंवा इच्छित रक्कम भरा (₹)",
      selectCause: "देणगी कोणत्या कार्यासाठी द्यायची?",
      generalFund: "सामान्य सेवा निधी (सर्वात गरजू कार्यासाठी)",
      donorInfo: "दात्याची माहिती",
      fullName: "संपूर्ण नाव (पॅन कार्डानुसार)",
      email: "ईमेल पत्ता (देणगी पावतीसाठी)",
      phone: "मोबाईल क्रमांक",
      pan: "पॅन क्रमांक (अधिकृत नोंदीसाठी)",
      anonymous: "सार्वजनिक दाता सूचीमध्ये माझे नाव गुप्त ठेवा",
      paymentMethod: "पेमेंट पद्धत निवडा",
      upi: "युपीआय / क्यूआर कोड / फोनपे / गुगल पे",
      card: "डेबिट किंवा क्रेडिट कार्ड",
      netBanking: "नेट बँकिंग",
      taxDeductibleBadge: "अधिकृत नोंदणी क्रमांक E-9389 / नाशिक",
      proceedPayment: "सुरक्षित पेमेंटसाठी पुढे जा",
      receiptPromise: "अधिकृत डिजिटल पावती आणि एसएमएस तात्काळ पाठवला जाईल.",
      successTitle: "आपल्या उदार देणगीबद्दल मनःपूर्वक धन्यवाद!",
      successSubtitle: "आपला देणगी संदर्भ क्रमांक तयार झाला असून निधी योग्य सेवेसाठी वर्ग करण्यात आला आहे.",
    },

    volunteer: {
      title: "आमच्या स्वयंसेवक चळवळीत सहभागी व्हा",
      subtitle: "आपला वेळ, कौशल्य आणि सेवाभावाने गरजू बांधवांच्या जीवनात सकारात्मक बदल घडवा.",
      openRoles: "सक्रिय स्वयंसेवक संधी",
      applyNow: "स्वयंसेवक म्हणून नोंदणी करा",
      roleLocation: "ठिकाण / स्वरूप",
      roleCommitment: "वेळेची आवश्यकता",
      roleSkills: "अपेक्षित कौशल्ये",
      volunteerFormTitle: "स्वयंसेवक नोंदणी अर्ज",
      availability: "उपलब्ध वेळ",
      weekends: "फक्त शनिवार-रविवार",
      weekdays: "आठवड्याचे इतर दिवस",
      flexible: "लवचिक / आपत्कालीन वेळी",
      motivation: "आपण आमच्या ट्रस्टसोबत सेवा करण्यास का उत्सुक आहात?",
      submitVolunteer: "नोंदणी अर्ज पाठवा",
      portalHeading: "स्वयंसेवक कार्य पोर्टल",
      hoursLogged: "नोंदवलेले सेवा तास",
      shiftsDone: "सहभागी झालेले उपक्रम",
      certificateTitle: "समाजसेवा प्रशस्तिपत्रक",
    },

    requestHelp: {
      title: "मदत व वैद्यकीय उपचारांसाठी विनंती अर्ज",
      subtitle:
        "आपल्याला किंवा आपल्या कुटुंबास वैद्यकीय अथवा आपत्कालीन मदतीची गरज असल्यास येथे विनंती नोंदवा.",
      emergencyNotice:
        "तातडीच्या वैद्यकीय मदतीसाठी किंवा अतिदक्षता उपचारांसाठी थेट संपर्क साधा: +91 (022) 5550-0192.",
      helpCategory: "मदतीचा प्रकार",
      catMedical: "शस्त्रक्रिया / गंभीर आजार उपचार",
      catEducation: "शालेय किंवा महाविद्यालयीन शैक्षणिक फी",
      catFood: "कौटुंबिक धान्य व किराणा किट",
      catDisaster: "पूर / आग / नैसर्गिक आपत्ती पुनर्वसन",
      applicantName: "अर्जदार किंवा रुग्णाचे संपूर्ण नाव",
      applicantPhone: "मोबाईल क्रमांक",
      applicantCity: "गाव किंवा शहर आणि जिल्हा",
      description: "समस्या आणि अपेक्षित मदतीचा सविस्तर तपशील",
      requiredAmount: "अपेक्षित अंदाजे मदत रक्कम (₹)",
      uploadDocs: "वैद्यकीय कागदपत्रे किंवा उत्पन्नाचा दाखला जोडा",
      urgency: "तातडीचे स्वरूप",
      urgencyCritical: "अत्यंत तातडीचे (४८ तासांत)",
      urgencyModerate: "१ ते २ आठवड्यांत",
      urgencyNormal: "सर्वसाधारण मासिक सहाय्य",
      submitHelp: "मदत विनंती सादर करा",
      trackingNotice:
        "आपल्याला ट्रॅकिंग क्रमांक मिळेल व स्थानिक प्रतिनिधी कागदपत्रांची प्रत्यक्ष पडताळणी करतील.",
    },

    impactPassport: {
      title: "इम्पॅक्ट पासपोर्ट • देणगी वाटप व पडताळणी वही",
      subtitle:
        "आपल्या देणगीच्या प्रत्येक टप्प्याची नोंद: पावती, खरेदी पावती, प्रत्यक्ष जागेवर पडताळणी आणि लाभार्थ्यांचे छायाचित्र.",
      searchPlaceholder: "पासपोर्ट टोकन प्रविष्ट करा (उदा. SCT-2024-8821)",
      samplePassports: "किंवा सार्वजनिक पडताळणी नमुना तपासा:",
      stage1: "टप्पा १: देणगी नोंदवली",
      stage2: "टप्पा २: निधी वर्ग केला",
      stage3: "टप्पा ३: प्रत्यक्ष जागेवर पडताळणी",
      stage4: "टप्पा ४: प्रत्यक्ष परिणाम व पोहोच",
      auditBadge: "क्रिप्टोग्राफिक हॅश पडताळणी पूर्ण",
      donor: "दाता",
      amount: "रक्कम",
      allocatedTo: "कार्यासाठी वाटप",
      fieldOfficer: "पडताळणी अधिकारी",
      auditDate: "तपासणी दिनांक",
      vendorBill: "खरेदी पावती व देयक",
    },

    kumbh: {
      title: "नाशिक सिंहस्थ कुंभ सेवा २०२७",
      subtitle:
        "पवित्र गोदावरी तीरावर येणाऱ्या भाविकांसाठी शुद्ध पिण्याचे पाणी, २४ तास महा-अन्नछत्र, घाट स्वच्छता आणि आरोग्य सहाय्य.",
      heroSubtitle: "नाशिक–त्र्यंबकेश्वर सिंहस्थ २०२७ • अग्रिम मानवतावादी सेवा नियोजन",
      modeBadge: "कुंभ सेवा सक्रिय",
      togglePrompt: "कुंभ मोड सुरू / बंद करा",
      waterKiosks: "शुद्ध पेयजल केंद्रे",
      waterDesc: "रामकुंड व तपोवन परिसरात २० फिरती व कायमस्वरूपी शुद्ध पिण्याच्या पाण्याचे बूथ.",
      annachhatra: "२४ तास महा-अन्नछत्र",
      annachhatraDesc:
        "साधू, भाविक आणि स्वच्छता कर्मचाऱ्यांसाठी मोफत सकस व शुद्ध महाप्रसाद भोजन.",
      medicalBooths: "घाट प्रथमोपचार व रुग्णवाहिका",
      medicalDesc: "प्रशिक्षित डॉक्टर, पॅरामेडिक्स आणि प्राथमिक उपचार किटसह सज्ज फिरते वैद्यकीय पथक.",
      lostFound: "हरवले-सापडले सहायता केंद्र",
      lostFoundDesc: "गर्दीत कुटुंबीय ताटातूट होऊ नये म्हणून डिजिटल ओळख आणि ध्वनिक्षेपक सहायता कक्ष.",
      volunteerCall: "कुंभ सेवेसाठी स्वयंसेवक बना",
      emergencyHelpline: "कुंभ २४/७ भाविक हेल्पलाइन",
      disabledTitle: "सिंहस्थ कुंभ सेवा २०२७ विभाग सध्या बंद आहे",
      disabledDesc:
        "वेबसाईट सेटिंग्जमध्ये कुंभ सेवा विभाग सध्या निष्क्रिय आहे. संस्था व्यवस्थापक ॲडमिन डेस्कवरून हा विभाग पुन्हा सुरू करू शकतात.",
      adminSettingsBtn: "ॲडमिन सेटिंग्जवर जा",
      preparatoryNoticeTitle: "पूर्वतयारी नियोजन टप्पा (डेमो संदर्भ)",
      preparatoryNoticeDesc:
        "नाशिक सिंहस्थ कुंभमेळा २०२७ मध्ये आयोजित होत आहे. खालील उपक्रम, पायाभूत सुविधांची उद्दिष्टे आणि स्वयंसेवक नियोजन हे पूर्वतयारी आराखडा व प्रात्यक्षिक स्वरूपाचे आहेत.",
      demoPlanningBadge: "डेमो / नियोजन टप्पा",
      metricsMeals: "दैनिक सात्विक भोजन (उद्दिष्ट)",
      metricsMealsSub: "४ मुख्य महा-अन्नछत्र केंद्रांमध्ये",
      metricsWater: "शुद्ध पाणी केंद्रे (उद्दिष्ट)",
      metricsWaterSub: "रामकुंड व गोदावरी घाटावर",
      metricsVolunteers: "आवश्यक स्वयंसेवक (उद्दिष्ट)",
      metricsVolunteersSub: "प्रशिक्षित भूमी सेवेकरी",
      metricsMedical: "प्रथमोपचार केंद्रे (उद्दिष्ट)",
      metricsMedicalSub: "२४ तास तत्पर वैद्यकीय मदत",
      pillarsTitle: "सिंहस्थ भाविक सेवेचे चार मुख्य स्तंभ",
      pillarsSubtitle:
        "गर्दी नियंत्रण, नदीचे पावित्र्य रक्षण आणि प्रत्येक वारकरी-भाविकाच्या सुविधेसाठी प्रशासनाच्या समन्वयाने नियोजित.",
      pillarGhatTitle: "घाट स्वच्छता आणि शुद्ध पाणी",
      pillarGhatDesc:
        "रामकुंड व कुशावर्त घाटावर स्वयंचलित आरओ वॉटर कियोस्क आणि कचरा संकलन बोट प्रणाली.",
      pillarAnnachhatraTitle: "२४ तास महा-अन्नछत्र",
      pillarAnnachhatraDesc:
        "पर्यावरणपूरक पत्रावळ्यांवर मोफत ताजे सात्विक भोजन, खिचडी, चहा आणि शून्य अन्न नासाडी व्यवस्था.",
      pillarMedicalTitle: "तातडीचे प्रथमोपचार व ओआरएस बूथ",
      pillarMedicalDesc:
        "तातडीची प्राथमिक मदत, सीपीआर उपकरणे, जलसंजीवन पाकिटे आणि ज्येष्ठ नागरिकांसाठी गोल्फ कार्ट व्यवस्था.",
      pillarLostFoundTitle: "हरवले-सापडले व मदत केंद्र",
      pillarLostFoundDesc:
        "अनेक भाषांतील ध्वनिक्षेपक उद्घोषणा आणि लहान मुले व वृद्धांसाठी आरएफ़आयडी रिस्टबँड सुविधा.",
      campaignsTag: "विशिष्ट योगदान मोहिमा",
      campaignsTitle: "सिंहस्थ कुंभ केंद्रित सेवा उपक्रम",
      viewAllCauses: "संस्थेचे सर्व उपक्रम पहा",
      emptyCampaigns: "सध्या डेटाबेसमध्ये कोणतेही कुंभ सेवा उपक्रम नोंदणीकृत नाहीत.",
      volunteerBadge: "स्वयंसेवक आवाहन • सिंहस्थ २०२७",
      volunteerTitle: "कुंभ सेवेकरी म्हणून नावनोंदणी करा",
      volunteerSubtitle:
        "महाराष्ट्रात येणाऱ्या साधू, वारकरी आणि ज्येष्ठ भाविकांचे स्वागत आणि सेवेसाठी पुढे या.",
      requirementsLabel: "आवश्यक अटी:",
      openSlots: "जागा उपलब्ध",
      applyForRole: "या सेवेसाठी अर्ज करा",
      emptyRoles: "सध्या कुंभ सेवेसाठी कोणतीही स्वयंसेवक पदे उपलब्ध नाहीत. कृपया लवकरच पुन्हा तपासा.",
      eventsTitle: "आगामी कुंभ पूर्वतयारी मोहिमा आणि प्रशिक्षण",
      eventsSubtitle:
        "सिंहस्थ पर्वापूर्वी आयोजित गोदावरी स्वच्छता मोहीम आणि सेवेकरी मार्गदर्शन शिबिरे.",
      eventDetails: "तपशील पहा",
      registeredCount: "नोंदणीकृत",
      emptyEvents: "सध्या कोणतीही पूर्वतयारी शिबिरे नियोजित नाहीत. लवकरच वेळापत्रक जाहीर केले जाईल.",
      announcementsBadge: "क्षेत्रीय अहवाल आणि घोषणा",
      announcementsTitle: "कुंभ सेवा बातम्या आणि घोषणा",
      announcementsSubtitle:
        "सिंहस्थ कुंभ २०२७ संबंधी अधिकृत माहिती, क्षेत्रीय पाहणी आणि नियोजन अहवाल.",
      readMore: "अहवाल वाचा",
      viewAllNews: "सर्व बातम्या पहा",
      emptyAnnouncements: "सध्या कुंभ सेवेसंबंधी कोणतीही घोषणा उपलब्ध नाही.",
      galleryBadge: "प्रत्यक्ष पाहणी आणि छायाचित्रे",
      galleryTitle: "कुंभ पूर्वतयारी छायाचित्र दालन",
      gallerySubtitle:
        "घाट पाहणी, स्वच्छता सर्वेक्षण आणि प्रस्तावित अन्नछत्र जागांची प्रत्यक्ष छायाचित्रे.",
      viewFullGallery: "संपूर्ण गॅलरी पहा",
      emptyGallery: "सध्या कुंभ सेवेची छायाचित्रे उपलब्ध नाहीत.",
      loadingText: "कुंभ सेवा २०२७ ची माहिती लोड होत आहे...",
      loadErrorTitle: "माहिती लोड करण्यात अडचण आली",
      loadErrorDesc:
        "सर्व्हरवरून कुंभ सेवेची माहिती मिळवता आली नाही. कृपया इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
      retryBtn: "पुन्हा प्रयत्न करा",
      modalApplyTitle: "कुंभ सेवेकरी अर्ज:",
      modalSuccessTitle: "जय गोदावरी! नोंदणी यशस्वीरीत्या झाली",
      modalBriefingNote: "नाशिक येथे व ऑनलाइन माध्यमातून मार्गदर्शन सत्रे आयोजित केली जातील.",
      fullNameLabel: "पूर्ण नाव *",
      fullNamePlaceholder: "उदा. रमेश स. शिंदे",
      phoneLabel: "मोबाईल / व्हॉट्सॲप *",
      phonePlaceholder: "+९१ ९८२०० ०००००",
      emailLabel: "ईमेल पत्ता (ऐच्छिक)",
      cityLabel: "शहर / गाव *",
      cityPlaceholder: "उदा. नाशिक / मुंबई / पुणे",
      sevaAreaLabel: "पसंतीचे सेवा क्षेत्र",
      availabilityLabel: "उपलब्धता कालावधी",
      emergencyContactLabel: "आपत्कालीन संपर्क (नाव आणि फोन)",
      emergencyContactPlaceholder: "उदा. सुरेश शिंदे (+९१ ९८२११ १११११)",
      skillsLabel: "कौशल्ये / अनुभव (लागू असल्यास निवडा)",
      cancelBtn: "रद्द करा",
      submitRegistrationBtn: "अर्ज सादर करा",
      submittingBtn: "नोंदणी होत आहे...",
      regSuccessBadge: "सिंहस्थ कुंभ २०२७ • सेवेकरी यादी",
      regRefLabel: "अधिकृत संदर्भ क्र:",
      regApplicantLabel: "अर्जदार:",
      regRoleLabel: "निवडलेली सेवा:",
      regSevaAreaLabel: "सेवा क्षेत्र:",
      regAvailabilityLabel: "उपलब्धता:",
      regSuccessNote:
        "आपली माहिती सेवेकरी डेटाबेसमध्ये जतन करण्यात आली आहे. आमची नाशिक समन्वय समिती व्हॉट्सॲपद्वारे संपर्क साधेल.",
      closeReturnBtn: "बंद करा",
      areaGhatHygiene: "घाट स्वच्छता आणि पर्यावरण",
      areaAnnadan: "अन्नदान आणि स्वयंपाकघर सेवा",
      areaWater: "पाणी वाटप आणि आरओ केंद्र",
      areaCrowdGuidance: "गर्दी नियंत्रण आणि ज्येष्ठ नागरिक मदत",
      areaFirstAid: "प्रथमोपचार आणि वैद्यकीय मदत",
      availPeakDates: "शाही स्नान मुख्य दिवस",
      availFullDuration: "संपूर्ण कुंभमेळा कालावधी (ऑगस्ट - सप्टेंबर २०२७)",
      availWeekends: "फक्त शनिवार-रविवार",
      availPreparatory: "पूर्वतयारी सेवा (२०२६-२०२७)",
      skillCrowd: "गर्दी आणि रांग व्यवस्थापन",
      skillMedical: "प्रथमोपचार / वैद्यकीय ज्ञान",
      skillLanguages: "स्थानिक भाषा (मराठी/हिंदी)",
      skillKitchen: "स्वयंपाक आणि अन्न वाटप",
      skillRiver: "नदी स्वच्छता आणि पर्यावरण",
    },

    events: {
      title: "कार्यक्रम आणि सेवा उपक्रम",
      subtitle: "आरोग्य शिबिरे, शैक्षणिक कार्यशाळा, रक्तदान मोहीम आणि वृक्षारोपण उपक्रम.",
      upcoming: "आगामी कार्यक्रम",
      past: "पूर्ण झालेले कार्यक्रम",
      rsvp: "उपस्थिती नोंदवा",
      venue: "स्थळ",
      capacity: "नोंदणीकृत सहभागी",
    },

    gallery: {
      title: "छायाचित्र दालन • प्रत्यक्ष सेवाकार्य",
      subtitle: "आमच्या सेवा उपक्रमांची, मोफत आरोग्य शिबिरांची आणि मदतीची सत्य छायाचित्रे.",
      filterAll: "सर्व छायाचित्रे",
      filterEdu: "शिक्षण",
      filterMedical: "आरोग्य शिबिरे",
      filterFood: "अन्नदान",
      filterKumbh: "कुंभ सेवा",
    },

    transparency: {
      title: "सार्वजनिक पारदर्शकता आणि वित्तीय अहवाल",
      subtitle: "वार्षिक लेखापरीक्षण अहवाल, प्राप्त देणग्या आणि प्रत्यक्ष खर्चाचा तपशीलवार पारदर्शक हिशोब.",
      financialYear: "आर्थिक वर्ष",
      totalIncome: "एकूण जमा देणगी निधी",
      directUtilization: "थेट सेवा कार्यावरील खर्च (९२.४%)",
      adminExpenses: "प्रशासकीय खर्च (७.६%)",
      downloadAuditedReport: "लेखापरीक्षित ताळेबंद अहवाल डाउनलोड करा (PDF)",
      allReports: "सर्व अहवाल",
      annualReports: "वार्षिक अहवाल",
      financialReports: "वित्तीय विवरण",
      auditReports: "वैधानिक लेखापरीक्षण",
      impactReports: "सेवा प्रभाव अहवाल",
      utilizationReports: "८०जी विनियोग",
      otherReports: "इतर नोंदणी",
      noReports: "अद्याप कोणतेही पारदर्शकता अहवाल प्रकाशित नाहीत",
      noReportsDesc: "विश्वस्त मंडळाने जाहीर केलेले लेखापरीक्षण अहवाल व ताळेबंद येथे उपलब्ध होतील.",
      loading: "लेखापरीक्षण अहवाल लोड होत आहेत...",
      loadError: "अहवाल लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.",
      retry: "पुन्हा प्रयत्न करा",
      viewDocument: "दस्तऐवज पहा",
      downloadDocument: "दस्तऐवज डाउनलोड करा",
      viewDossier: "तपशील पहा",
      dossierDetails: "अहवाल व वैधानिक खुलासे",
      auditor: "लेखापरीक्षक संस्था",
      statutoryType: "वैधानिक प्रकार",
      auditRating: "ऑडिट दर्जा / मत",
      reportedDisbursal: "नोंदणीकृत सेवा खर्च",
      close: "बंद करा",
    },

    helpRequest: {
      title: "सामुदायिक साहाय्य व आपत्कालीन मदत पोर्टल",
      subtitle: "वैद्यकीय उपचार, शैक्षणिक शुल्क किंवा इतर संकटात सापडलेल्या गरजू व्यक्ती ट्रस्टकडे थेट मदतीसाठी अर्ज करू शकतात.",
      applyTab: "मदत अर्ज दाखल करा",
      trackTab: "अर्जाची स्थिती तपासा",
      myRequestsTab: "माझे दाखल अर्ज",
      fullName: "पूर्ण नाव (अर्जदार / लाभार्थी)",
      email: "ईमेल पत्ता",
      phone: "मोबाईल क्रमांक",
      requestType: "मदतीचा प्रकार",
      urgency: "तातडीची पातळी",
      description: "संकटाचे सविस्तर वर्णन व आवश्यक मदत",
      location: "पत्ता / ठिकाण (गाव, तालुका, जिल्हा)",
      submitApplication: "मदतीचा अर्ज सादर करा",
      submitting: "अर्ज नोंदवला जात आहे...",
      submittedSuccess: "मदत अर्ज यशस्वीरीत्या प्राप्त झाला",
      submittedSuccessDesc: "आपला अर्ज आमच्या डेटाबेसमध्ये नोंदवला गेला आहे. खाली दिलेला ट्रॅकिंग आयडी जतन करून ठेवा.",
      trackTitle: "अर्जाची स्थिती तपासा",
      trackSubtitle: "आपला २४-अंकी मदत अर्ज आयडी प्रविष्ट करून प्रत्यक्ष पडताळणीची स्थिती जाणून घ्या.",
      enterRequestId: "२४-अंकी मदत अर्ज आयडी टाका",
      trackButton: "स्थिती तपासा",
      tracking: "माहिती तपासत आहोत...",
      requestNotFound: "अर्ज सापडला नाही. कृपया आयडी तपासा किंवा आपण त्याच खात्यातून लॉगिन केले आहे का याची खात्री करा.",
      loginRequiredTitle: "मदतीसाठी अर्ज करण्यासाठी लॉगिन आवश्यक आहे",
      loginRequiredDesc: "सुरक्षितता, पडताळणी आणि थेट पाठपुराव्यासाठी कृपया लॉगिन किंवा नोंदणी करून अर्ज सादर करा.",
      loginBtn: "लॉगिन करा",
      registerBtn: "नवीन नोंदणी",
      noPersonalRequests: "कोणताही अर्ज सापडला नाही",
      noPersonalRequestsDesc: "आपण अद्याप कोणताही साहाय्य अर्ज सादर केलेला नाही.",
      statusPending: "प्रलंबित",
      statusUnderReview: "तपासणी सुरू",
      statusApproved: "मंजूर",
      statusRejected: "नाकारला",
      statusInProgress: "कार्यवाही सुरू",
      statusResolved: "साहाय्य वितरित / पूर्ण",
      statusClosed: "बंद केले",
      urgencyLow: "सामान्य",
      urgencyMedium: "मध्यम",
      urgencyHigh: "तातडीचे",
      urgencyCritical: "अत्यंत आणीबाणी",
      typeEducation: "शैक्षणिक साहाय्य",
      typeMedical: "वैद्यकीय उपचार",
      typeFood: "अन्नधान्य मदत",
      typeShelter: "निवारा साहाय्य",
      typeEmergency: "आपत्कालीन मदत",
      typeOther: "इतर साहाय्य",
      adminNotes: "सचिवालय शेरा",
    },

    blog: {
      title: "वृत्त, यशोगाथा आणि सेवा विचार",
      subtitle: "आमचे प्रतिनिधी, डॉक्टर आणि समाजसेवकांचे अनुभव व सविस्तर वृत्तांत.",
      recentPosts: "ताजी प्रकाशने",
      minRead: "मिनिटे वाचन",
      author: "लेखक",
      noPosts: "सध्या कोणतीही बातमी उपलब्ध नाही.",
      readStory: "सविस्तर वाचा",
      backToArchive: "सर्व बातम्यांकडे परत",
      storyNotFound: "वृत्त सापडले नाही",
      storyNotFoundDesc: "विनंती केलेले वृत्त आमच्या संग्रहात सापडले नाही.",
      featuredNews: "बातम्या, क्षेत्रीय अहवाल व सेवा विचार",
      loading: "बातम्या लोड होत आहेत...",
      loadError: "या वेळी बातम्या लोड करण्यात अडचण आली.",
      retry: "पुन्हा प्रयत्न करा",
      shareCopied: "वृत्ताची लिंक क्लिपबोर्डवर कॉपी केली आहे.",
    },

    contact: {
      title: "आमच्याशी संपर्क साधा • मध्यवर्ती कार्यालय",
      subtitle: "देणगी, कर सवलत, स्वयंसेवक नोंदणी किंवा सेवाकार्याबद्दल काही शंका असल्यास संपर्क साधा.",
      sendMessage: "संदेश पाठवा",
      subject: "विषय",
      message: "आपला संदेश",
      sendBtn: "संदेश पाठवा",
      officeHours: "भेटण्याची वेळ: सोमवार ते शनिवार सकाळी ९:३० ते ५:३०",
      sentSuccess: "धन्यवाद! आपला संदेश आमच्या कार्यालयास मिळाला आहे. आम्ही लवकरच संपर्क करू.",
    },

    dashboard: {
      donorTitle: "दाता पोर्टल आणि ८०जी पावत्या",
      donorSubtitle:
        "आपला देणगी इतिहास पहा, आयकर वजावटीसाठी ८०जी पावत्या डाउनलोड करा आणि निधीचा मागोवा घ्या.",
      myDonations: "देणगी इतिहास",
      downloadReceipt: "८०जी पावती डाउनलोड करा",
      volunteerPortalTitle: "स्वयंसेवक नियंत्रण डेस्क",
      adminTitle: "ट्रस्ट प्रशासकीय व्यवस्थापन कक्ष",
      adminSubtitle: "मदत अर्ज तपासणी, खरेदी देयके मंजुरी, ऑडिट नोंदी आणि कुंभ सेवा व्यवस्थापन.",
      totalFundsRaised: "एकूण जमा निधी",
      pendingDisbursals: "प्रलंबित वाटप तपासणी",
      activeVolunteers: "नोंदणीकृत स्वयंसेवक",
      approve: "मंजूर करा",
      reject: "नाकारा",
    },

    chatbot: {
      title: "सेवा सहायक • मदतनीस",
      online: "मदत कक्ष सक्रिय",
      greeting:
        "नमस्कार! मी इच्छापूर्ती ऋद्धी सिद्धी विनायक चॅरिटेबल ट्रस्टचा 'सेवा सहायक' आहे. मी आज आपल्या सेवा प्रवासात कशी मदत करू?",
      prompt1: "८०जी कर सवलत पावती कशी मिळेल?",
      prompt2: "माझ्या देणगीचा मागोवा कसा घ्यावा?",
      prompt3: "स्वयंसेवक कसे व्हावे?",
      prompt4: "ट्रस्टचे कार्यालय कुठे आहे?",
      promptKumbh: "कुंभ सेवा २०२७ बद्दल सांगा",
      placeholder: "देणगी, कर सवलत, स्वयंसेवक किंवा कार्याबद्दल विचारा...",
      send: "पाठवा",
    },

    footer: {
      quickLinks: "महत्त्वाचे दुवे",
      governance: "प्रशासन व नियंत्रण कक्ष",
      secretariat: "ट्रस्ट मुख्य कार्यालय",
      auditorDesk: "लेखापरीक्षक डेस्क",
      contactHelpdesk: "संपर्क आणि मदत केंद्र",
      rights: "सर्व हक्क सुरक्षित.",
      academicNote: "नोंदणीकृत सार्वजनिक धर्मादाय ट्रस्ट. पारदर्शक समाजकार्य आणि ग्रामीण सक्षमीकरणासाठी वचनबद्ध.",
      languageLabel: "भाषा:",
    },

    auth: {
      loginTitle: "विश्वस्त पोर्टल लॉगिन",
      loginSubtitle: "आपले पडताळलेले इम्पॅक्ट पासपोर्ट्स, ८०-जी कर पावती आणि स्वयंसेवक नोंदी पहा.",
      registerTitle: "नवीन समर्थक खाते तयार करा",
      registerSubtitle: "पारदर्शक इम्पॅक्ट पासपोर्ट्ससह हजारो समर्थकांमध्ये सामील व्हा.",
      fullName: "पूर्ण कायदेशीर नाव",
      fullNamePlaceholder: "उदा. सान्या कपूर",
      email: "ईमेल पत्ता",
      emailPlaceholder: "name@example.com",
      phone: "फोन नंबर",
      phonePlaceholder: "+९१ ९८७६५ ४३२१०",
      password: "पासवर्ड",
      createPassword: "पासवर्ड तयार करा",
      confirmPassword: "पासवर्डची पुष्टी करा",
      passwordRequirements: "किमान ८ अक्षरे, १ मोठे अक्षर, १ लहान अक्षर आणि १ अंक आवश्यक",
      forgotPassword: "विसरलात?",
      keepSignedIn: "लॉगिन सुरू ठेवा",
      signInButton: "साइन इन करा",
      registerButton: "खाते तयार करा",
      logout: "लॉग आउट",
      alreadyHaveAccount: "आधीच खाते आहे?",
      dontHaveAccount: "अद्याप खाते नाही?",
      donorRole: "दानशूर / देणगीदार",
      volunteerRole: "विद्यार्थी / स्वयंसेवक",
      adminRole: "विश्वस्त प्रशासक",
      termsConsent: "मी विश्वस्त संस्थेच्या पारदर्शकता सनद आणि अटींना संमती देतो/देते.",
      passwordsDoNotMatch: "दोन्ही पासवर्ड जुळत नाहीत.",
      passwordTooShort: "पासवर्ड किमान ८ अक्षरांचा आणि मजबूत असावा.",
      loginSuccess: "यशस्वीरीत्या साइन इन झाले!",
      registerSuccess: "खाते यशस्वीरीत्या तयार झाले! विश्वस्त संस्थेत स्वागत आहे.",
      accessRestricted: "प्रवेश मर्यादित आहे",
      sessionExpired: "सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.",
      loggingIn: "साइन इन होत आहे...",
      registering: "खाते तयार होत आहे...",
      loggingOut: "लॉग आउट होत आहे...",
      profile: "प्रोफाइल",
      activeSession: "सक्रिय सत्र",
    },
  },

  hi: {
    // Top-level legacy keys in Hindi
    trustName: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चैरिटेबल ट्रस्ट, नाशिक",
    trustShort: "इच्छापूर्ती विनायक ट्रस्ट",
    tagline: "करुणा, सामाजिक उत्तरदायित्व और पारदर्शिता के साथ समाज सेवा।",
    academicNotice: "पंजीकृत सार्वजनिक चैरिटेबल ट्रस्ट • ई-९३८९ / नाशिक",
    demoDataBadge: "सत्यापित रिकॉर्ड",
    navHome: "होम",
    navAbout: "ट्रस्ट के बारे में",
    navCauses: "हमारा कार्य",
    navPassport: "इम्पैक्ट पासपोर्ट",
    navVolunteer: "स्वयंसेवक",
    navEvents: "कार्यक्रम",
    navContact: "संपर्क",
    navLogin: "लॉगिन",
    navDashboard: "डैशबोर्ड",
    ctaDonate: "अभी दान करें",
    ctaSeeWork: "हमारा कार्य देखें",
    heroNotice: "पंजीकृत सार्वजनिक चैरिटेबल ट्रस्ट • पंजीकरण संख्या ई-९३८९ / नाशिक",

    whyTrustTitle: "लोग हम पर विश्वास क्यों करते हैं?",
    whyTrustSubtitle: "खुली खाता-बही, सत्यापित व्यय और सीधे सामुदायिक सहभागिता पर आधारित एक अनुशासित संस्था।",
    trustPoint1Title: "पारदर्शी दान प्रक्रिया",
    trustPoint1Desc: "प्रत्येक योगदान का तत्काल डिजिटल रिकॉर्ड बनता है जिससे आपको पता चलता है कि फंड कहाँ जा रहा है।",
    trustPoint2Title: "स्पष्ट और सुरक्षित रिकॉर्ड",
    trustPoint2Desc: "खरीद बिल, वाउचर और खर्च विवरण सख्त ऑडिट के साथ सुरक्षित रखे जाते हैं।",
    trustPoint3Title: "समुदाय-केंद्रित कार्य",
    trustPoint3Desc: "स्थानीय बुजुर्गों, ग्रामीण शिक्षकों और सरकारी अस्पताल प्रमुखों की सलाह से जरूरतमंदों तक पहुंचते हैं।",
    trustPoint4Title: "निधि का जिम्मेदार उपयोग",
    trustPoint4Desc: "९२% से अधिक फंड सीधे सेवा सामग्री के लिए उपयोग होता है, प्रशासनिक खर्च न्यूनतम रखा जाता है।",

    ourWorkTitle: "हमारी सेवा पहल",
    ourWorkSubtitle: "शिक्षा, स्वास्थ्य, पोषण और आपातकालीन राहत के क्षेत्र में समर्पित मानवीय सेवा।",
    learnMore: "और जानें",
    educationTitle: "शिक्षा सहायता",
    educationDesc: "ग्रामीण स्कूलों में डिजिटल लैब, अध्ययन सामग्री और बालिकाओं के लिए छात्रवृत्ति।",
    medicalTitle: "चिकित्सा और सर्जरी",
    medicalDesc: "बाल शल्य चिकित्सा, कैंसर जांच और दूरदराज के क्षेत्रों में मुफ्त स्वास्थ्य शिविर।",
    foodTitle: "अन्नदान और पोषण",
    foodDesc: "अस्पतालों के बाहर अन्नक्षेत्र और जरूरतमंद परिवारों को सूखा राशन किट वितरण।",
    reliefTitle: "आपातकालीन राहत",
    reliefDesc: "बाढ़ और प्राकृतिक आपदाओं के दौरान तत्काल भोजन, दवा और आश्रय किट सहायता।",
    environmentTitle: "पर्यावरण संरक्षण",
    environmentDesc: "वृक्षारोपण, जल संरक्षण ढाँचे और ग्रामीण स्वच्छता अभियान।",

    passportJourneyTitle: "अपने दान की यात्रा को ट्रैक करें",
    passportJourneySubtitle: "रसीद से लेकर लाभार्थी तक पहुँचने का संपूर्ण चार-चरणीय पारदर्शी विवरण।",
    stageDonation: "दान",
    stageDonationDesc: "आपके योगदान को डिजिटल टोकन और अधिकृत पावती के साथ सुरक्षित दर्ज किया जाता है।",
    stageAllocation: "आवंटन",
    stageAllocationDesc: "फंड सीधे अस्पताल के बिल या अधिकृत सामग्री खरीद से जोड़ा जाता है।",
    stageVerification: "सत्यापन",
    stageVerificationDesc: "स्वतंत्र प्रतिनिधि मौके पर जाकर वितरण की प्रत्यक्ष जांच करते हैं।",
    stageImpact: "प्रत्यक्ष प्रभाव",
    stageImpactDesc: "मरीज का उपचार, छात्रों की पढ़ाई या भोजन वितरण का अंतिम सत्यापन।",
    openPassport: "इम्पैक्ट पासपोर्ट खोलें",
    samplePassportLabel: "सत्यापित सार्वजनिक डेमो ऑडिट रिकॉर्ड",

    common: {
      trustName: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चैरिटेबल ट्रस्ट, नाशिक",
      trustShort: "इच्छापूर्ती विनायक ट्रस्ट",
      tagline: "करुणा, सामाजिक उत्तरदायित्व और पारदर्शिता के साथ समाज सेवा।",
      academicNotice: "पंजीकृत सार्वजनिक चैरिटेबल ट्रस्ट • ई-९३८९ / नाशिक",
      demoDataBadge: "सत्यापित रिकॉर्ड",
      save: "सुरक्षित करें",
      cancel: "रद्द करें",
      submit: "जमा करें",
      close: "बंद करें",
      loading: "लोड हो रहा है...",
      search: "खोजें",
      filter: "फ़िल्टर",
      all: "सभी",
      viewAll: "सभी देखें",
      learnMore: "और जानें",
      readMore: "आगे पढ़ें",
      donateNow: "अभी दान करें",
      volunteer: "स्वयंसेवक बनें",
      exploreWork: "हमारा कार्य देखें",
      contactUs: "हमसे संपर्क करें",
      requestHelp: "मदद का अनुरोध करें",
      download: "डाउनलोड करें",
      status: "स्थिति",
      date: "दिनांक",
      location: "स्थान",
      category: "श्रेणी",
      amount: "राशि",
      success: "सफल",
      error: "त्रुटि",
      verified: "सत्यापित",
      pending: "लंबित",
      completed: "पूर्ण",
      backToHome: "मुख्य पृष्ठ पर लौटें",
      noResults: "कोई रिकॉर्ड नहीं मिला।",
      share: "साझा करें",
      copied: "कॉपी किया गया!",
    },

    nav: {
      home: "होम",
      about: "ट्रस्ट के बारे में",
      causes: "हमारा कार्य",
      passport: "इम्पैक्ट पासपोर्ट",
      volunteer: "स्वयंसेवक",
      events: "कार्यक्रम",
      gallery: "गैलरी",
      transparency: "पारदर्शिता",
      blog: "समाचार व ब्लॉग",
      contact: "संपर्क",
      login: "लॉगिन",
      register: "पंजीकरण",
      dashboard: "दाता डैशबोर्ड",
      admin: "प्रशासक डेस्क",
      kumbh: "कुंभ सेवा २०२७",
      requestHelp: "मदद अनुरोध",
    },

    hero: {
      badge: "पंजीकृत सार्वजनिक धर्मार्थ ट्रस्ट • स्था. २०१२ (डेमो संदर्भ)",
      welcomeTitle: "पारदर्शी सामाजिक कार्यों से जरूरतमंदों को सशक्त बनाना",
      welcomeSubtitle:
        "ग्रामीण शिक्षा, स्वास्थ्य, पोषण और आपदा राहत के लिए समर्पित अधिकृत चैरिटेबल ट्रस्ट। हर एक रुपये का स्पष्ट हिसाब।",
      namasteTag: "स्वागत कर्ता • सादर प्रणाम",
      namasteQuote: "जीव सेवा ही सच्ची ईश्वर भक्ति है।",
      welcomeSpeakerPrompt: "🔊 स्वागत सुनें",
      startWelcome: "स्वागत शुरू करें",
      skip: "छोड़ें",
      replay: "दोबारा सुनें",
      voiceOn: "ध्वनि चालू",
      voiceOff: "ध्वनि बंद",
      speechSentence1: "नमस्ते! इच्छापूर्ती ऋद्धी सिद्धी विनायक चैरिटेबल ट्रस्ट में आपका हार्दिक स्वागत है।",
      speechSentence2: "आज हम आपकी क्या सेवा कर सकते हैं?",
      subtitle1: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चैरिटेबल ट्रस्ट में आपका हार्दिक स्वागत है।",
      subtitle2: "आप आज किस सेवा के लिए पधारे हैं?",
      directSevaFood: "🍲 अन्नदान",
      directSevaHealth: "🩺 चिकित्सा सहायता",
      directSevaEdu: "📚 शिक्षा",
      directSevaVol: "🤝 स्वयंसेवक",
      searchPassportPlaceholder: "इम्पैक्ट पासपोर्ट आईडी दर्ज करें (उदा. SCT-2024-8821)",
      trackImpact: "ट्रैक करें",
      stat1Value: "₹४२.८ लाख",
      stat1Label: "वितरित फंड",
      stat2Value: "१८ अभियान",
      stat2Label: "सक्रिय सेवा अभियान",
      stat3Value: "६५०+ सक्रिय",
      stat3Label: "पंजीकृत स्वयंसेवक",
      stat4Value: "१००%",
      stat4Label: "ऑडिटेड खाता-बही",
    },

    about: {
      title: "इच्छापूर्ती ऋद्धी सिद्धी विनायक चैरिटेबल ट्रस्ट के बारे में",
      subtitle: "पारदर्शी सेवा, सत्यापित वितरण और सामाजिक उत्थान के आधार पर स्थापित ट्रस्ट।",
      missionTitle: "हमारा उद्देश्य",
      missionDesc: "गरीबी उन्मूलन, बालिका शिक्षा, ग्रामीण स्वास्थ्य और आपदा राहत में पूर्ण वित्तीय पारदर्शिता।",
      visionTitle: "हमारा दृष्टिकोण",
      visionDesc: "एक ऐसा समतामूलक समाज जहाँ हर बच्चे को शिक्षा और हर मरीज को समय पर उपचार मिले।",
      valuesTitle: "हमारे मूल मूल्य",
      value1: "पूर्ण पारदर्शिता",
      value1Desc: "हर रुपये के खर्च की रसीद और लाभार्थी विवरण सार्वजनिक रूप से उपलब्ध।",
      value2: "सम्मानपूर्वक सेवा",
      value2Desc: "सेवा कार्य करते समय हर व्यक्ति के स्वाभिमान का सर्वोच्च ध्यान।",
      value3: "जिम्मेदार प्रबंधन",
      value3Desc: "९२% से अधिक निधि सीधे जमीनी राहत कार्यों में व्यय।",
      boardTitle: "ट्रस्टी बोर्ड और नेतृत्व",
      governanceTitle: "कानूनी व वैधानिक पंजीकरण",
      taxNotice: "आयकर अधिनियम १९६१ की धारा 80G के तहत ५०% कर छूट",
    },

    causes: {
      title: "सक्रिय सामाजिक अभियान एवं सेवा प्रकल्प",
      subtitle: "सत्यापित अभियानों में अपना योगदान दें और फंड के उपयोग की सीधी जानकारी पाएं।",
      filterAll: "सभी प्रकल्प",
      filterEdu: "शिक्षा",
      filterHealth: "स्वास्थ्य",
      filterFood: "अन्नदान",
      filterRelief: "आपदा राहत",
      filterEnv: "पर्यावरण",
      filterKumbh: "कुंभ सेवा",
      raisedOf: "एकत्रित (लक्ष्य:",
      donors: "दाता",
      target: "लक्ष्य",
      donateToCause: "इस कार्य में योगदान दें",
      viewDetails: "विवरण और ऑडिट देखें",
      daysLeft: "दिन शेष",
      verifiedCause: "सत्यापित जमीनी प्रकल्प",
    },

    donate: {
      title: "दान करें • समाज सेवा में भागीदार बनें",
      subtitle: "हर योगदान के लिए तुरंत अधिकृत रसीद और डिजिटल ऑडिट लेजर प्रविष्टि जारी की जाती है।",
      frequency: "दान का प्रकार",
      oneTime: "एकमुश्त दान",
      monthly: "मासिक सेवा संकल्प",
      selectAmount: "राशि चुनें",
      customAmount: "या अन्य राशि दर्ज करें (₹)",
      selectCause: "दान किस कार्य के लिए देना चाहते हैं?",
      generalFund: "सामान्य सेवा कोष (सर्वाधिक जरूरतमंद कार्य हेतु)",
      donorInfo: "दाता का विवरण",
      fullName: "पूरा नाम (पैन कार्ड के अनुसार)",
      email: "ईमेल पता (दान रसीद हेतु)",
      phone: "मोबाइल नंबर",
      pan: "पैन नंबर (वैधानिक रिकॉर्ड हेतु)",
      anonymous: "सार्वजनिक सूची में मेरा नाम गुप्त रखें",
      paymentMethod: "भुगतान का माध्यम चुनें",
      upi: "यूपीआई / क्यूआर कोड / फोनपे / गूगल पे",
      card: "डेबिट या क्रेडिट कार्ड",
      netBanking: "नेट बैंकिंग",
      taxDeductibleBadge: "अधिकृत पंजीकरण क्रमांक E-9389 / नाशिक",
      proceedPayment: "सुरक्षित भुगतान के लिए आगे बढ़ें",
      receiptPromise: "डिजिटल रसीद और एसएमएस तुरंत भेजा जाएगा।",
      successTitle: "आपके उदार दान के लिए हार्दिक धन्यवाद!",
      successSubtitle: "आपका दान संदर्भ क्रमांक उत्पन्न हो गया है और फंड सेवा कार्य हेतु सुरक्षित है।",
    },

    volunteer: {
      title: "हमारी स्वयंसेवक टीम से जुड़ें",
      subtitle: "अपना समय और कौशल देकर जरूरतमंद परिवारों के जीवन में बदलाव लाएं।",
      openRoles: "सक्रिय स्वयंसेवक अवसर",
      applyNow: "स्वयंसेवक पंजीकरण करें",
      roleLocation: "स्थान / स्वरूप",
      roleCommitment: "समय की आवश्यकता",
      roleSkills: "अपेक्षित कौशल",
      volunteerFormTitle: "स्वयंसेवक पंजीकरण फॉर्म",
      availability: "साप्ताहिक उपलब्धता",
      weekends: "केवल शनिवार-रविवार",
      weekdays: "सप्ताह के अन्य दिन",
      flexible: "लचीला / आपात स्थिति में",
      motivation: "आप हमारे साथ क्यों जुड़ना चाहते हैं?",
      submitVolunteer: "पंजीकरण फॉर्म भेजें",
      portalHeading: "स्वयंसेवक पोर्टल",
      hoursLogged: "सेवा के घंटे",
      shiftsDone: "अभियानों में सहभागिता",
      certificateTitle: "समाज सेवा प्रशस्ति पत्र",
    },

    requestHelp: {
      title: "मदद व चिकित्सा सहायता हेतु अनुरोध",
      subtitle: "यदि आपको या आपके परिवार को तात्कालिक सहायता चाहिए तो यहाँ विवरण दर्ज करें।",
      emergencyNotice: "अति गंभीर चिकित्सा सहायता हेतु आपातकालीन नंबर पर कॉल करें: +91 (022) 5550-0192.",
      helpCategory: "सहायता की श्रेणी",
      catMedical: "गंभीर सर्जरी / अस्पताल उपचार",
      catEducation: "स्कूल / कॉलेज फीस सहायता",
      catFood: "राशन व पोषण किट",
      catDisaster: "आपदा / बाढ़ राहत",
      applicantName: "आवेदक / मरीज का पूरा नाम",
      applicantPhone: "संपर्क मोबाइल नंबर",
      applicantCity: "शहर / गांव और जिला",
      description: "समस्या और अपेक्षित मदद का विवरण",
      requiredAmount: "अपेक्षित सहायता राशि (₹)",
      uploadDocs: "चिकित्सा रिपोर्ट या आय प्रमाण पत्र जोड़ें",
      urgency: "आपात स्तर",
      urgencyCritical: "अति तात्कालिक (48 घंटे में)",
      urgencyModerate: "1 से 2 सप्ताह में",
      urgencyNormal: "सामान्य मासिक सहायता",
      submitHelp: "अनुरोध जमा करें",
      trackingNotice: "आपको ट्रैकिंग नंबर दिया जाएगा और हमारे प्रतिनिधि प्रत्यक्ष जांच करेंगे।",
    },

    impactPassport: {
      title: "इम्पैक्ट पासपोर्ट • दान सत्यापन लेजर",
      subtitle: "दान से लेकर वितरण, बिल वाउचर और अंतिम परिणाम तक का पारदर्शी ब्योरा।",
      searchPlaceholder: "पासपोर्ट टोकन दर्ज करें (उदा. SCT-2024-8821)",
      samplePassports: "या सत्यापित सार्वजनिक डेमो रिकॉर्ड देखें:",
      stage1: "चरण 1: दान दर्ज हुआ",
      stage2: "चरण 2: फंड का आवंटन",
      stage3: "चरण 3: जमीनी सत्यापन",
      stage4: "चरण 4: प्रत्यक्ष परिणाम",
      auditBadge: "क्रिप्टोग्राफिक हैश सत्यापित",
      donor: "दाता",
      amount: "राशि",
      allocatedTo: "आवंटित कार्य",
      fieldOfficer: "सत्यापन अधिकारी",
      auditDate: "ऑडिट तिथि",
      vendorBill: "क्रय बिल व वाउचर",
    },

    kumbh: {
      title: "नासिक सिंहस्थ कुंभ सेवा २०२७",
      subtitle: "पवित्र गोदावरी तट पर श्रद्धालुओं के लिए स्वच्छ पेयजल, २४ घंटे महा-अन्नक्षेत्र और चिकित्सा राहत।",
      heroSubtitle: "नासिक–त्र्यंबकेश्वर सिंहस्थ २०२७ • अग्रिम मानवतावादी सेवा योजना",
      modeBadge: "कुंभ सेवा सक्रिय",
      togglePrompt: "कुंभ मोड चालू / बंद करें",
      waterKiosks: "स्वच्छ पेयजल केंद्र",
      waterDesc: "रामकुंड और तपोवन में 20 शुद्ध पेयजल वितरण बूथ।",
      annachhatra: "२४ घंटे महा-अन्नक्षेत्र",
      annachhatraDesc: "साधु-संतों, श्रद्धालुओं और स्वच्छता कर्मियों के लिए अनवरत शुद्ध सात्विक भोजन।",
      medicalBooths: "घाट प्राथमिक चिकित्सा केंद्र",
      medicalDesc: "डॉक्टरों और पैरामेडिक्स की आपातकालीन त्वरित चिकित्सा टीम।",
      lostFound: "खोया-पाया सहायता केंद्र",
      lostFoundDesc: "परिवारों के बिछड़ने से रोकने हेतु डिजिटल टैगिंग और उद्घोषणा प्रणाली।",
      volunteerCall: "कुंभ सेवा हेतु स्वयंसेवक बनें",
      emergencyHelpline: "कुंभ २४/७ तीर्थयात्री हेल्पलाइन",
      disabledTitle: "सिंहस्थ कुंभ सेवा २०२७ अनुभाग वर्तमान में बंद है",
      disabledDesc: "साइट सेटिंग्स में कुंभ सेवा अनुभाग निष्क्रिय है। व्यवस्थापक एडमिन डेस्क से इसे पुनः सक्रिय कर सकते हैं।",
      adminSettingsBtn: "एडमिन सेटिंग्स पर जाएं",
      preparatoryNoticeTitle: "प्रारंभिक योजना चरण (डेमो संदर्भ)",
      preparatoryNoticeDesc: "नासिक सिंहस्थ कुंभ २०२७ में आयोजित हो रहा है। नीचे प्रदर्शित पहल और स्वयंसेवक योजनाएं प्रदर्शन उद्देश्य हेतु हैं।",
      demoPlanningBadge: "डेमो / योजना चरण",
      metricsMeals: "दैनिक सात्विक भोजन (लक्ष्य)",
      metricsMealsSub: "४ मुख्य महा-अन्नक्षेत्र केंद्रों में",
      metricsWater: "शुद्ध जल केंद्र (लक्ष्य)",
      metricsWaterSub: "रामकुंड एवं गोदावरी तट पर",
      metricsVolunteers: "आवश्यक स्वयंसेवक (लक्ष्य)",
      metricsVolunteersSub: "प्रशिक्षित सेवादार",
      metricsMedical: "प्राथमिक चिकित्सा केंद्र (लक्ष्य)",
      metricsMedicalSub: "२४ घंटे आपातकालीन सेवा",
      pillarsTitle: "सिंहस्थ तीर्थयात्री सेवा के चार मुख्य स्तंभ",
      pillarsSubtitle: "प्रशासन के सहयोग से भीड़ नियंत्रण, नदी की स्वच्छता और प्रत्येक श्रद्धालु की सेवा हेतु सुनियोजित।",
      pillarGhatTitle: "घाट स्वच्छता एवं शुद्ध जल",
      pillarGhatDesc: "रामकुंड एवं कुशावर्त घाट पर स्वचालित आरओ जल केंद्र एवं नौका सफाई व्यवस्था।",
      pillarAnnachhatraTitle: "२४ घंटे महा-अन्नक्षेत्र",
      pillarAnnachhatraDesc: "पत्तलों में निःशुल्क ताजा सात्विक भोजन और शून्य अपव्यय प्रबंधन।",
      pillarMedicalTitle: "आपातकालीन प्राथमिक चिकित्सा एवं ओआरएस",
      pillarMedicalDesc: "त्वरित प्राथमिक उपचार, सीपीआर किट और बुजुर्गों हेतु गोल्फ कार्ट सहायता।",
      pillarLostFoundTitle: "खोया-पाया एवं सहायता केंद्र",
      pillarLostFoundDesc: "बहुभाषी उद्घोषणा और बच्चों व बुजुर्गों के लिए आरएफआईडी पहचान बैंड।",
      campaignsTag: "विशिष्ट योगदान अभियान",
      campaignsTitle: "सिंहस्थ कुंभ केंद्रित सेवा अभियान",
      viewAllCauses: "ट्रस्ट के सभी अभियान देखें",
      emptyCampaigns: "डेटाबेस में वर्तमान में कोई कुंभ सेवा अभियान उपलब्ध नहीं है।",
      volunteerBadge: "स्वयंसेवक आमंत्रण • सिंहस्थ २०२७",
      volunteerTitle: "कुंभ सेवादार के रूप में पंजीकरण करें",
      volunteerSubtitle: "महाराष्ट्र पधारने वाले साधु-संतों, तीर्थयात्रियों और बुजुर्गों की सेवा हेतु सहभागी बनें।",
      requirementsLabel: "आवश्यक योग्यताएं:",
      openSlots: "स्थान उपलब्ध",
      applyForRole: "इस सेवा हेतु आवेदन करें",
      emptyRoles: "वर्तमान में कुंभ सेवा हेतु कोई पद रिक्त नहीं है। कृपया शीघ्र पुनः देखें।",
      eventsTitle: "आगामी कुंभ पूर्व-अभियान एवं कार्यशालाएं",
      eventsSubtitle: "सिंहस्थ से पूर्व आयोजित गोदावरी स्वच्छता अभियान और स्वयंसेवक प्रशिक्षण कार्यशालाएं।",
      eventDetails: "विवरण देखें",
      registeredCount: "पंजीकृत",
      emptyEvents: "वर्तमान में कोई पूर्व-कार्यक्रम निर्धारित नहीं है। शीघ्र ही तिथियां घोषित की जाएंगी।",
      announcementsBadge: "क्षेत्रीय रिपोर्ट एवं विज्ञप्तियां",
      announcementsTitle: "कुंभ सेवा समाचार एवं विज्ञप्तियां",
      announcementsSubtitle: "सिंहस्थ कुंभ २०२७ से संबंधित आधिकारिक अपडेट और योजना रिपोर्ट।",
      readMore: "पूरी रिपोर्ट पढ़ें",
      viewAllNews: "सभी समाचार देखें",
      emptyAnnouncements: "वर्तमान में कोई कुंभ विज्ञप्ति प्रकाशित नहीं है।",
      galleryBadge: "प्रत्यक्ष निरीक्षण एवं चित्र संग्रह",
      galleryTitle: "कुंभ पूर्व-तैयारी चित्र दीर्घा",
      gallerySubtitle: "घाट निरीक्षण, स्वच्छता सर्वेक्षण एवं प्रस्तावित सेवा स्थलों के प्रत्यक्ष चित्र।",
      viewFullGallery: "पूरी गैलरी देखें",
      emptyGallery: "वर्तमान में कुंभ सेवा का कोई छायाचित्र उपलब्ध नहीं है।",
      loadingText: "कुंभ सेवा २०२७ का विवरण लोड हो रहा है...",
      loadErrorTitle: "विवरण लोड करने में समस्या आई",
      loadErrorDesc: "सर्वर से कुंभ सेवा डेटा प्राप्त नहीं हो सका। कृपया नेटवर्क जांचें और पुनः प्रयास करें।",
      retryBtn: "पुनः प्रयास करें",
      modalApplyTitle: "कुंभ सेवादार आवेदन:",
      modalSuccessTitle: "जय गोदावरी! पंजीकरण दर्ज हुआ",
      modalBriefingNote: "नासिक में एवं ऑनलाइन माध्यम से प्रारंभिक मार्गदर्शन सत्र आयोजित किए जाएंगे।",
      fullNameLabel: "पूरा नाम *",
      fullNamePlaceholder: "उदा. रमेश स. शिंदे",
      phoneLabel: "मोबाइल / व्हाट्सएप *",
      phonePlaceholder: "+९१ ९८२०० ०००००",
      emailLabel: "ईमेल पता (वैकल्पिक)",
      cityLabel: "शहर / कस्बा *",
      cityPlaceholder: "उदा. नासिक / मुंबई / पुणे",
      sevaAreaLabel: "पसंदीदा सेवा क्षेत्र",
      availabilityLabel: "उपलब्धता अवधि",
      emergencyContactLabel: "आपातकालीन संपर्क (नाम एवं फोन)",
      emergencyContactPlaceholder: "उदा. सुरेश शिंदे (+९१ ९८२११ १११११)",
      skillsLabel: "कौशल / अनुभव (उपयुक्त चुनें)",
      cancelBtn: "रद्द करें",
      submitRegistrationBtn: "पंजीकरण जमा करें",
      submittingBtn: "पंजीकरण जारी है...",
      regSuccessBadge: "सिंहस्थ कुंभ २०२७ • सेवादार सूची",
      regRefLabel: "आधिकारिक संदर्भ संख्या:",
      regApplicantLabel: "आवेदक:",
      regRoleLabel: "आवंटित सेवा:",
      regSevaAreaLabel: "सेवा क्षेत्र:",
      regAvailabilityLabel: "उपलब्धता:",
      regSuccessNote: "आपका विवरण सेवादार डेटाबेस में सुरक्षित कर लिया गया है। नासिक समन्वय टीम शीघ्र व्हाट्सएप पर संपर्क करेगी।",
      closeReturnBtn: "बंद करें",
      areaGhatHygiene: "घाट स्वच्छता एवं पर्यावरण",
      areaAnnadan: "अन्नदान एवं रसोई सेवा",
      areaWater: "पेयजल एवं आरओ केंद्र",
      areaCrowdGuidance: "भीड़ नियंत्रण एवं वरिष्ठ नागरिक सहायता",
      areaFirstAid: "प्राथमिक चिकित्सा केंद्र",
      availPeakDates: "शाही स्नान मुख्य तिथियां",
      availFullDuration: "संपूर्ण मेला अवधि (अगस्त - सितंबर २०२७)",
      availWeekends: "केवल सप्ताहांत",
      availPreparatory: "पूर्व-तैयारी सेवा (२०२६-२०२७)",
      skillCrowd: "भीड़ एवं कतार प्रबंधन",
      skillMedical: "प्राथमिक उपचार / चिकित्सा",
      skillLanguages: "स्थानीय भाषाएं (मराठी/हिंदी)",
      skillKitchen: "रसोई एवं भोजन वितरण",
      skillRiver: "नदी स्वच्छता अभियान",
    },

    events: {
      title: "सामुदायिक कार्यक्रम एवं सेवा अभियान",
      subtitle: "स्वास्थ्य शिविर, शैक्षणिक कार्यशालाएं और पौधारोपण अभियान।",
      upcoming: "आगामी कार्यक्रम",
      past: "संपन्न कार्यक्रम",
      rsvp: "उपस्थिति दर्ज करें",
      venue: "स्थान",
      capacity: "पंजीकृत प्रतिभागी",
    },

    gallery: {
      title: "गैलरी • प्रत्यक्ष सेवा कार्य",
      subtitle: "हमारे सेवा अभियानों, चिकित्सा शिविरों और राहत कार्यों के छायाचित्र।",
      filterAll: "सभी चित्र",
      filterEdu: "शिक्षा",
      filterMedical: "स्वास्थ्य शिविर",
      filterFood: "अन्नदान",
      filterKumbh: "कुंभ सेवा",
    },

    transparency: {
      title: "सार्वजनिक पारदर्शिता एवं वित्तीय रिपोर्ट",
      subtitle: "लेखापरीक्षित बैलेंस शीट, प्राप्त दान और प्रत्यक्ष खर्च का खुला हिसाब।",
      financialYear: "वित्तीय वर्ष",
      totalIncome: "कुल प्राप्त दान",
      directUtilization: "प्रत्यक्ष सेवा व्यय (९२.४%)",
      adminExpenses: "प्रशासनिक खर्च (७.६%)",
      downloadAuditedReport: "ऑडिटेड वित्तीय रिपोर्ट डाउनलोड करें (PDF)",
      allReports: "सभी रिपोर्ट",
      annualReports: "वार्षिक रिपोर्ट",
      financialReports: "वित्तीय विवरण",
      auditReports: "वैधानिक ऑडिट",
      impactReports: "प्रभाव रिपोर्ट",
      utilizationReports: "८०जी उपयोग प्रमाण",
      otherReports: "अन्य दस्तावेज",
      noReports: "अभी तक कोई पारदर्शिता रिपोर्ट प्रकाशित नहीं की गई है",
      noReportsDesc: "बोर्ड द्वारा जारी लेखापरीक्षित ऑडिट और वार्षिक रिपोर्ट यहां प्रदर्शित होंगी।",
      loading: "पारदर्शिता रिपोर्ट लोड हो रही हैं...",
      loadError: "रिपोर्ट लोड करने में त्रुटि। कृपया पुनः प्रयास करें।",
      retry: "पुनः प्रयास करें",
      viewDocument: "दस्तावेज़ देखें",
      downloadDocument: "दस्तावेज़ डाउनलोड करें",
      viewDossier: "विवरण देखें",
      dossierDetails: "रिपोर्ट एवं वैधानिक विवरण",
      auditor: "ऑडिटर फर्म",
      statutoryType: "वैधानिक प्रकार",
      auditRating: "ऑडिट राय / रेटिंग",
      reportedDisbursal: "दर्ज सेवा व्यय",
      close: "बंद करें",
    },

    helpRequest: {
      title: "सामुदायिक सहायता एवं राहत पोर्टल",
      subtitle: "गंभीर चिकित्सा, शिक्षा शुल्क या आपातकालीन स्थिति में पीड़ित नागरिक ट्रस्ट सहायता हेतु आवेदन कर सकते हैं।",
      applyTab: "सहायता हेतु आवेदन करें",
      trackTab: "आवेदन की स्थिति जांचें",
      myRequestsTab: "मेरे आवेदन",
      fullName: "पूरा नाम (आवेदक / लाभार्थी)",
      email: "ईमेल पता",
      phone: "मोबाइल नंबर",
      requestType: "सहायता की श्रेणी",
      urgency: "प्राथमिकता",
      description: "कठिनाई का विवरण एवं आवश्यक सहायता",
      location: "स्थान / पता (शहर, तहसील, जिला)",
      submitApplication: "आवेदन जमा करें",
      submitting: "आवेदन जमा हो रहा है...",
      submittedSuccess: "सहायता आवेदन सफलतापूर्वक प्राप्त हुआ",
      submittedSuccessDesc: "आपका आवेदन सुरक्षित रूप से दर्ज कर लिया गया है। आपका ट्रैकिंग आईडी नीचे दिया गया है।",
      trackTitle: "आवेदन की स्थिति जांचें",
      trackSubtitle: "समीक्षा और सत्यापन स्थिति जानने के लिए अपना हेल्प रिक्वेस्ट आईडी दर्ज करें।",
      enterRequestId: "२४-अंकीय रिक्वेस्ट आईडी दर्ज करें",
      trackButton: "स्थिति देखें",
      tracking: "स्थिति जांची जा रही है...",
      requestNotFound: "आवेदन नहीं मिला। कृपया आईडी जांचें या सुनिश्चित करें कि आप संबंधित खाते से लॉगिन हैं।",
      loginRequiredTitle: "सहायता आवेदन हेतु लॉगिन अनिवार्य है",
      loginRequiredDesc: "विश्वसनीय सत्यापन और सुरक्षित ट्रैकिंग के लिए कृपया आवेदन जमा करने से पहले लॉगिन या पंजीकरण करें।",
      loginBtn: "लॉगिन करें",
      registerBtn: "नया खाता बनाएं",
      noPersonalRequests: "कोई सहायता आवेदन नहीं मिला",
      noPersonalRequestsDesc: "आपने अभी तक कोई सहायता आवेदन दर्ज नहीं किया है।",
      statusPending: "समीक्षा लंबित",
      statusUnderReview: "समीक्षाधीन",
      statusApproved: "स्वीकृत",
      statusRejected: "अस्वीकृत",
      statusInProgress: "प्रक्रिया जारी",
      statusResolved: "सहायता वितरित / संपन्न",
      statusClosed: "समाप्त",
      urgencyLow: "सामान्य",
      urgencyMedium: "मध्यम",
      urgencyHigh: "अति आवश्यक",
      urgencyCritical: "आपातकालीन",
      typeEducation: "शिक्षा सहायता",
      typeMedical: "चिकित्सा सहायता",
      typeFood: "राशन व भोजन सहायता",
      typeShelter: "आवास एवं आश्रय",
      typeEmergency: "आपदा एवं आपात राहत",
      typeOther: "अन्य सहायता",
      adminNotes: "ट्रस्ट कार्यालय टिप्पणी",
    },

    blog: {
      title: "समाचार, प्रेरणादायक कहानियां एवं विचार",
      subtitle: "हमारे कार्यकर्ताओं और डॉक्टरों के अनुभव।",
      recentPosts: "हाल के लेख",
      minRead: "मिनट पठन",
      author: "लेखक",
      noPosts: "फिलहाल कोई समाचार उपलब्ध नहीं है।",
      readStory: "पूरा पढ़ें",
      backToArchive: "सभी समाचारों पर वापस",
      storyNotFound: "समाचार नहीं मिला",
      storyNotFoundDesc: "अनुरोधित समाचार हमारे संग्रह में नहीं मिला।",
      featuredNews: "समाचार, क्षेत्रीय रिपोर्ट एवं सेवा विचार",
      loading: "समाचार लोड हो रहे हैं...",
      loadError: "इस समय समाचार लोड करने में समस्या आई।",
      retry: "पुनः प्रयास करें",
      shareCopied: "समाचार लिंक कॉपी कर ली गई है।",
    },

    contact: {
      title: "संपर्क करें • मुख्य कार्यालय",
      subtitle: "दान, 80G कर छूट या सेवा कार्य से जुड़े प्रश्नों के लिए संपर्क करें।",
      sendMessage: "संदेश भेजें",
      subject: "विषय",
      message: "आपका संदेश",
      sendBtn: "संदेश प्रेषित करें",
      officeHours: "कार्यालय समय: सोम - शनि सुबह ९:३० से शाम ५:३०",
      sentSuccess: "धन्यवाद! आपका संदेश हमें प्राप्त हो गया है।",
    },

    dashboard: {
      donorTitle: "दाता पोर्टल एवं 80G रसीदें",
      donorSubtitle: "दान इतिहास देखें, कर छूट रसीदें डाउनलोड करें और प्रभाव ट्रैक करें।",
      myDonations: "दान इतिहास",
      downloadReceipt: "80G रसीद डाउनलोड करें",
      volunteerPortalTitle: "स्वयंसेवक नियंत्रण डेस्क",
      adminTitle: "ट्रस्ट प्रशासनिक प्रबंधन",
      adminSubtitle: "सहायता अनुरोध सत्यापन, क्रय बिल स्वीकृति और कुंभ व्यवस्था।",
      totalFundsRaised: "कुल संकलित फंड",
      pendingDisbursals: "लंबित वितरण सत्यापन",
      activeVolunteers: "पंजीकृत स्वयंसेवक",
      approve: "स्वीकृत करें",
      reject: "अस्वीकृत करें",
    },

    chatbot: {
      title: "सेवा सहायक • वर्चुअल असिस्टेंट",
      online: "मदद डेस्क ऑनलाइन",
      greeting: "नमस्ते! मैं इच्छापूर्ती ऋद्धी सिद्धी विनायक चैरिटेबल ट्रस्ट का 'सेवा सहायक' हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
      prompt1: "80G कर छूट रसीद कैसे मिलेगी?",
      prompt2: "मैं अपने दान को कैसे ट्रैक कर सकता हूँ?",
      prompt3: "स्वयंसेवक कैसे बनें?",
      prompt4: "ट्रस्ट का कार्यालय कहाँ है?",
      promptKumbh: "कुंभ सेवा २०२७ के बारे में बताएं",
      placeholder: "दान, कर छूट, स्वयंसेवक या सेवा प्रकल्पों के बारे में पूछें...",
      send: "भेजें",
    },

    footer: {
      quickLinks: "त्वरित लिंक",
      governance: "प्रशासन व नियंत्रण",
      secretariat: "ट्रस्ट मुख्य कार्यालय",
      auditorDesk: "लेखापरीक्षक डेस्क",
      contactHelpdesk: "संपर्क एवं सहायता",
      rights: "सर्वाधिकार सुरक्षित।",
      academicNote: "पंजीकृत सार्वजनिक धर्मार्थ ट्रस्ट। पारदर्शी समाज सेवा और ग्रामीण सशक्तिकरण हेतु समर्पित।",
      languageLabel: "भाषा:",
    },

    auth: {
      loginTitle: "ट्रस्ट पोर्टल में साइन इन करें",
      loginSubtitle: "अपने सत्यापित इम्पैक्ट पासपोर्ट, कर रसीदें और स्वयंसेवक रिकॉर्ड देखें।",
      registerTitle: "समर्थक खाता बनाएं",
      registerSubtitle: "पारदर्शी इम्पैक्ट पासपोर्ट के साथ समर्थकों से जुड़ें।",
      fullName: "पूरा कानूनी नाम",
      fullNamePlaceholder: "उदा. सान्या कपूर",
      email: "ईमेल पता",
      emailPlaceholder: "name@example.com",
      phone: "फ़ोन नंबर",
      phonePlaceholder: "+91 98765 43210",
      password: "पासवर्ड",
      createPassword: "पासवर्ड बनाएं",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      passwordRequirements: "कम से कम 8 अक्षर, 1 बड़ा अक्षर, 1 छोटा अक्षर और 1 संख्या",
      forgotPassword: "भूल गए?",
      keepSignedIn: "लॉगिन रखें",
      signInButton: "साइन इन करें",
      registerButton: "खाता बनाएं",
      logout: "लॉग आउट",
      alreadyHaveAccount: "पहले से खाता है?",
      dontHaveAccount: "अभी तक खाता नहीं है?",
      donorRole: "दानवीर / दानदाता",
      volunteerRole: "छात्र / स्वयंसेवक",
      adminRole: "ट्रस्ट प्रशासक",
      termsConsent: "मैं ट्रस्ट के पारदर्शिता चार्टर और शर्तों से सहमत हूँ।",
      passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते।",
      passwordTooShort: "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
      loginSuccess: "सफलतापूर्वक साइन इन हुआ!",
      registerSuccess: "खाता सफलतापूर्वक बन गया! ट्रस्ट में आपका स्वागत है।",
      accessRestricted: "पहुंच प्रतिबंधित",
      sessionExpired: "सत्र समाप्त हो गया। कृपया पुन: साइन इन करें।",
      loggingIn: "साइन इन हो रहा है...",
      registering: "खाता बनाया जा रहा है...",
      loggingOut: "लॉग आउट हो रहा है...",
      profile: "प्रोफाइल",
      activeSession: "सक्रिय सत्र",
    },
  },
};
