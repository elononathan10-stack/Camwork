import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "EN" | "FR";

export interface Translations {
  common: {
    back: string;
    save: string;
    cancel: string;
    continue: string;
    apply: string;
    close: string;
    confirm: string;
    search: string;
    filter: string;
    all: string;
    viewAll: string;
    loading: string;
    success: string;
    error: string;
    urgent: string;
    verified: string;
    formal: string;
    gig: string;
    fullTime: string;
    partTime: string;
    contract: string;
  };
  onboarding: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    chooseLang: string;
    enDesc: string;
    frDesc: string;
    getStarted: string;
    alreadyHaveAccount: string;
    login: string;
  };
  auth: {
    brand: string;
    loginTitle: string;
    loginSub: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    loginBtn: string;
    noAccount: string;
    signUp: string;
    registerTitle: string;
    roleLabel: string;
    seekerRole: string;
    seekerRoleDesc: string;
    employerRole: string;
    employerRoleDesc: string;
    fullName: string;
    namePlaceholder: string;
    terms: string;
    createAccountBtn: string;
    hasAccount: string;
    loginHere: string;
    resetTitle: string;
    resetSub: string;
    sendResetBtn: string;
    backToLogin: string;
    resetSentSuccess: string;
  };
  wizard: {
    title: string;
    step1Title: string;
    step1Sub: string;
    step2Title: string;
    step2Sub: string;
    step3Title: string;
    step3Sub: string;
    step4Title: string;
    step4Sub: string;
    headlineLabel: string;
    headlinePlaceholder: string;
    cityLabel: string;
    availabilityLabel: string;
    skillsLabel: string;
    addCustomSkill: string;
    addSkillPlaceholder: string;
    bioLabel: string;
    bioPlaceholder: string;
    rateLabel: string;
    ratePlaceholder: string;
    finishBtn: string;
    nextBtn: string;
    prevBtn: string;
    skipBtn: string;
  };
  home: {
    greeting: string;
    verifiedPro: string;
    matchesToday: string;
    searchPlaceholder: string;
    statApplied: string;
    statInterviews: string;
    statOffers: string;
    statViews: string;
    priorityMatchTitle: string;
    priorityMatchBadge: string;
    applyNow: string;
    myApplications: string;
    viewHistory: string;
    recommendedJobs: string;
  };
  search: {
    title: string;
    placeholder: string;
    filters: string;
    categories: string;
    locations: string;
    jobType: string;
    payRange: string;
    resultsFound: string;
    clearFilters: string;
    applyFilters: string;
    noJobsFound: string;
    noJobsFoundSub: string;
  };
  jobDetail: {
    aboutRole: string;
    responsibilities: string;
    requirements: string;
    requiredSkills: string;
    matchingSkills: string;
    aboutCompany: string;
    postedBy: string;
    location: string;
    salary: string;
    jobType: string;
    applyNow: string;
    appliedAlready: string;
    saved: string;
    saveJob: string;
  };
  applyFlow: {
    title: string;
    subtitle: string;
    contactInfo: string;
    coverNoteLabel: string;
    coverNotePlaceholder: string;
    rateExpectation: string;
    submitBtn: string;
    submitting: string;
    successTitle: string;
    successSubtitle: string;
    goToApplications: string;
    browseMore: string;
  };
  applications: {
    title: string;
    tabs: {
      all: string;
      pending: string;
      reviewed: string;
      interviews: string;
      accepted: string;
      rejected: string;
    };
    appliedOn: string;
    statusTimeline: string;
    contactEmployer: string;
    emptyTitle: string;
    emptySub: string;
  };
  directOffers: {
    title: string;
    subtitle: string;
    bannerTitle: string;
    bannerSub: string;
    offeredRate: string;
    startDate: string;
    acceptBtn: string;
    declineBtn: string;
    chatBtn: string;
    emptyTitle: string;
    emptySub: string;
  };
  messages: {
    title: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptySub: string;
    typeMessage: string;
    online: string;
    offline: string;
    videoCall: string;
    voiceCall: string;
    discussing: string;
  };
  profile: {
    title: string;
    editSkillsBtn: string;
    editProfileBtn: string;
    profileCompleteness: string;
    completeProfileTip: string;
    aboutMe: string;
    skills: string;
    workHistory: string;
    addWorkHistory: string;
    ratingsTitle: string;
    verificationSection: string;
    vouchingSection: string;
    directOffersSection: string;
    settingsSection: string;
    logout: string;
  };
  verification: {
    title: string;
    subtitle: string;
    idCardTitle: string;
    idCardDesc: string;
    certificateTitle: string;
    certificateDesc: string;
    policeTitle: string;
    policeDesc: string;
    statusApproved: string;
    statusReview: string;
    statusPending: string;
    uploadDocument: string;
  };
  vouching: {
    title: string;
    subtitle: string;
    bannerTitle: string;
    bannerDesc: string;
    vouchesReceived: string;
    requestVouchBtn: string;
    requestModalTitle: string;
    contactPlaceholder: string;
    relationPlaceholder: string;
    sendRequestBtn: string;
    noVouchesYet: string;
  };
  notifications: {
    title: string;
    markAllRead: string;
    emptyTitle: string;
    emptySub: string;
    tabs: {
      all: string;
      jobs: string;
      messages: string;
      system: string;
    };
  };
  settings: {
    title: string;
    language: string;
    notifications: string;
    pushNotifs: string;
    jobAlerts: string;
    privacy: string;
    profilePublic: string;
    helpSupport: string;
    faq: string;
    terms: string;
    version: string;
    logoutConfirm: string;
  };
}

const translations: Record<Language, Translations> = {
  EN: {
    common: {
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      continue: "Continue",
      apply: "Apply",
      close: "Close",
      confirm: "Confirm",
      search: "Search",
      filter: "Filter",
      all: "All",
      viewAll: "View All",
      loading: "Loading...",
      success: "Success",
      error: "Error",
      urgent: "Urgent",
      verified: "Verified",
      formal: "Formal Job",
      gig: "Informal / Gig",
      fullTime: "Full-time",
      partTime: "Part-time",
      contract: "Contract",
    },
    onboarding: {
      welcomeTitle: "Empowering Cameroonian Talent",
      welcomeSubtitle: "Find verified formal jobs, skilled trades, and informal gigs with portable reputation & fast matching.",
      chooseLang: "Choose your preferred language",
      enDesc: "Continue in English",
      frDesc: "Continuer en Français",
      getStarted: "Get Started",
      alreadyHaveAccount: "Already have an account?",
      login: "Log in",
    },
    auth: {
      brand: "CamWork",
      loginTitle: "Welcome back",
      loginSub: "Enter your details to access your professional workspace.",
      email: "Email Address",
      emailPlaceholder: "e.g. jean.dupont@example.cm",
      password: "Password",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Forgot password?",
      loginBtn: "Log In",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      registerTitle: "Create Account",
      roleLabel: "I am joining as a",
      seekerRole: "Job Seeker",
      seekerRoleDesc: "Looking for jobs, skilled gigs, and career reputation",
      employerRole: "Employer / Recruiter",
      employerRoleDesc: "Hiring verified talent and local workers",
      fullName: "Full Name",
      namePlaceholder: "e.g. Jean Dupont Ngono",
      terms: "I agree to the Terms of Service and Privacy Policy.",
      createAccountBtn: "Create Account",
      hasAccount: "Already have an account?",
      loginHere: "Log in here",
      resetTitle: "Forgot Password",
      resetSub: "Enter your registered email address. We'll send you a link to securely reset your password.",
      sendResetBtn: "Send Reset Link",
      backToLogin: "Back to Login",
      resetSentSuccess: "Reset link has been sent to your email.",
    },
    wizard: {
      title: "Profile Setup",
      step1Title: "Who are you?",
      step1Sub: "Add your photo and professional title so employers recognize you.",
      step2Title: "Where & How do you work?",
      step2Sub: "Set your city and work availability across Cameroon.",
      step3Title: "Your Skills & Talents",
      step3Sub: "Add skills to get matched with high-paying formal and gig opportunities.",
      step4Title: "About & Expectations",
      step4Sub: "Tell employers why they should hire you and set your rate.",
      headlineLabel: "Professional Headline / Trade",
      headlinePlaceholder: "e.g. Senior Logistics Planner or Certified Electrician",
      cityLabel: "Primary City / Location",
      availabilityLabel: "Availability",
      skillsLabel: "Select or Add Skills",
      addCustomSkill: "Add a custom skill",
      addSkillPlaceholder: "Type skill and press Add",
      bioLabel: "Short Bio / Summary",
      bioPlaceholder: "Experienced professional with 5+ years in logistics, warehouse distribution, and supply chain...",
      rateLabel: "Expected Rate (XAF)",
      ratePlaceholder: "e.g. 150,000 FCFA / month or 10,000 FCFA / day",
      finishBtn: "Complete Profile & Start",
      nextBtn: "Next Step",
      prevBtn: "Back",
      skipBtn: "Skip for now",
    },
    home: {
      greeting: "Hello",
      verifiedPro: "Verified Pro",
      matchesToday: "You have new matches tailored for your skills today.",
      searchPlaceholder: "Search jobs, skills, or companies...",
      statApplied: "Applied",
      statInterviews: "Interviews",
      statOffers: "Direct Offers",
      statViews: "Profile Views",
      priorityMatchTitle: "Priority Match for You",
      priorityMatchBadge: "98% Fit",
      applyNow: "Quick Apply",
      myApplications: "My Applications",
      viewHistory: "View All History",
      recommendedJobs: "Recommended For You",
    },
    search: {
      title: "Explore Jobs & Gigs",
      placeholder: "Title, keywords, or company...",
      filters: "Filters",
      categories: "Category",
      locations: "Location",
      jobType: "Job Type",
      payRange: "Pay Range",
      resultsFound: "opportunities found",
      clearFilters: "Clear all",
      applyFilters: "Apply Filters",
      noJobsFound: "No jobs matching your filters",
      noJobsFoundSub: "Try adjusting your search criteria or reset filters.",
    },
    jobDetail: {
      aboutRole: "About the Role",
      responsibilities: "Key Responsibilities",
      requirements: "Requirements & Qualifications",
      requiredSkills: "Skills Required",
      matchingSkills: "Matching your profile",
      aboutCompany: "About the Employer",
      postedBy: "Posted by",
      location: "Location",
      salary: "Compensation",
      jobType: "Contract Type",
      applyNow: "Apply for this Position",
      appliedAlready: "Application Submitted",
      saved: "Saved",
      saveJob: "Save Job",
    },
    applyFlow: {
      title: "Apply for Position",
      subtitle: "Review your applicant profile and attach a message to the employer.",
      contactInfo: "Your Verified Information",
      coverNoteLabel: "Cover Note / Introduction (Optional)",
      coverNotePlaceholder: "Introduce yourself, mention key strengths, and explain why you're a great fit for this role...",
      rateExpectation: "Confirmed Availability & Rate Expectation",
      submitBtn: "Submit Application",
      submitting: "Submitting...",
      successTitle: "Application Submitted!",
      successSubtitle: "Your application has been received by the employer. You will receive real-time notifications on status updates.",
      goToApplications: "View My Applications",
      browseMore: "Browse More Jobs",
    },
    applications: {
      title: "My Applications",
      tabs: {
        all: "All",
        pending: "Pending",
        reviewed: "Reviewed",
        interviews: "Interviews",
        accepted: "Accepted",
        rejected: "Archived",
      },
      appliedOn: "Applied on",
      statusTimeline: "Application Status Track",
      contactEmployer: "Message Employer",
      emptyTitle: "No applications found",
      emptySub: "You haven't submitted any applications under this category yet.",
    },
    directOffers: {
      title: "Direct Offers",
      subtitle: "Invitations sent specifically to you by employers searching the talent pool.",
      bannerTitle: "Two-Way Talent Match",
      bannerSub: "Employers reviewed your reputation & profile and sent you these direct hiring offers.",
      offeredRate: "Offered Compensation",
      startDate: "Proposed Start Date",
      acceptBtn: "Accept Offer",
      declineBtn: "Decline",
      chatBtn: "Discuss with Recruiter",
      emptyTitle: "No direct offers yet",
      emptySub: "Complete your profile and gain vouches to receive direct hiring invitations.",
    },
    messages: {
      title: "Messages",
      searchPlaceholder: "Search conversations...",
      emptyTitle: "No conversations yet",
      emptySub: "When you apply to jobs or employers contact you, chats will appear here.",
      typeMessage: "Type a message...",
      online: "Online",
      offline: "Offline",
      videoCall: "Video Call",
      voiceCall: "Call",
      discussing: "Discussing",
    },
    profile: {
      title: "My Profile",
      editSkillsBtn: "+ Edit Skills",
      editProfileBtn: "Edit Profile",
      profileCompleteness: "Profile Strength",
      completeProfileTip: "Add certifications and get vouched to reach 100%",
      aboutMe: "About Me",
      skills: "Skills & Specialties",
      workHistory: "Work History & Reputation",
      addWorkHistory: "+ Add Experience",
      ratingsTitle: "Ratings & Employer References",
      verificationSection: "ID & Skill Verification",
      vouchingSection: "Community Vouching",
      directOffersSection: "Direct Offers Received",
      settingsSection: "Settings & Preferences",
      logout: "Log Out",
    },
    verification: {
      title: "ID & Skill Verification",
      subtitle: "Build trust with employers by verifying your identity and professional qualifications.",
      idCardTitle: "National ID / Passport Verification",
      idCardDesc: "Upload front and back of your Cameroon CNI or Passport.",
      certificateTitle: "Trade or Academic Certification",
      certificateDesc: "Upload your diploma, trade certificate, or apprenticeship proof.",
      policeTitle: "Background / Police Extract (Optional)",
      policeDesc: "Extrait de Casier Judiciaire to boost trust score.",
      statusApproved: "Verified & Active",
      statusReview: "Under Review",
      statusPending: "Not Submitted",
      uploadDocument: "Upload Document",
    },
    vouching: {
      title: "Community Vouching",
      subtitle: "Leverage Cameroon's community trust network. Get verified peers, masters, or colleagues to vouch for your character and skills.",
      bannerTitle: "Portable Reputation",
      bannerDesc: "Each verified vouch increases your ranking in employer searches by 35%.",
      vouchesReceived: "Vouches Received",
      requestVouchBtn: "Request a Vouch",
      requestModalTitle: "Request Vouch from a Colleague",
      contactPlaceholder: "Colleague's Phone (+237) or Email",
      relationPlaceholder: "Relationship (e.g. Former Supervisor, Master Craftsman)",
      sendRequestBtn: "Send Vouch Request",
      noVouchesYet: "No vouches received yet. Request your first vouch from a trusted peer!",
    },
    notifications: {
      title: "Notifications",
      markAllRead: "Mark all as read",
      emptyTitle: "No notifications",
      emptySub: "You are all caught up!",
      tabs: {
        all: "All",
        jobs: "Job Alerts",
        messages: "Messages",
        system: "Updates",
      },
    },
    settings: {
      title: "Settings",
      language: "Language Preference",
      notifications: "Notification Preferences",
      pushNotifs: "Push Notifications",
      jobAlerts: "Instant Job Match Alerts",
      privacy: "Privacy & Visibility",
      profilePublic: "Show Profile in Employer Talent Search",
      helpSupport: "Help & Support",
      faq: "Frequently Asked Questions",
      terms: "Terms & Privacy Policy",
      version: "CamWork v1.0.0 (Expo SDK 54)",
      logoutConfirm: "Are you sure you want to log out of CamWork?",
    },
  },
  FR: {
    common: {
      back: "Retour",
      save: "Enregistrer",
      cancel: "Annuler",
      continue: "Continuer",
      apply: "Postuler",
      close: "Fermer",
      confirm: "Confirmer",
      search: "Rechercher",
      filter: "Filtrer",
      all: "Tout",
      viewAll: "Voir tout",
      loading: "Chargement...",
      success: "Succès",
      error: "Erreur",
      urgent: "Urgent",
      verified: "Vérifié",
      formal: "Emploi Formel",
      gig: "Informel / Mission",
      fullTime: "Temps plein",
      partTime: "Temps partiel",
      contract: "Contrat",
    },
    onboarding: {
      welcomeTitle: "Valorisons les Talents Camerounais",
      welcomeSubtitle: "Trouvez des emplois formels vérifiés, métiers qualifiés et missions informelles avec une réputation certifiée.",
      chooseLang: "Choisissez votre langue préférée",
      enDesc: "Continue in English",
      frDesc: "Continuer en Français",
      getStarted: "Commencer",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      login: "Se connecter",
    },
    auth: {
      brand: "CamWork",
      loginTitle: "Bon retour",
      loginSub: "Entrez vos coordonnées pour accéder à votre espace de travail professionnel.",
      email: "Adresse e-mail",
      emailPlaceholder: "ex. jean.dupont@example.cm",
      password: "Mot de passe",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Mot de passe oublié ?",
      loginBtn: "Se connecter",
      noAccount: "Vous n'avez pas de compte ?",
      signUp: "S'inscrire",
      registerTitle: "Créer un compte",
      roleLabel: "Je rejoins en tant que",
      seekerRole: "Chercheur d'emploi",
      seekerRoleDesc: "Recherche d'emplois, missions et développement de réputation",
      employerRole: "Employeur / Recruteur",
      employerRoleDesc: "Recrutez des talents et professionnels qualifiés vérifiés",
      fullName: "Nom complet",
      namePlaceholder: "ex. Jean Dupont Ngono",
      terms: "J'accepte les Conditions d'utilisation et la Politique de confidentialité.",
      createAccountBtn: "Créer mon compte",
      hasAccount: "Vous avez déjà un compte ?",
      loginHere: "Connectez-vous ici",
      resetTitle: "Mot de passe oublié",
      resetSub: "Entrez votre adresse e-mail. Nous vous enverrons un lien pour réinitialiser votre mot de passe.",
      sendResetBtn: "Envoyer le lien",
      backToLogin: "Retour à la connexion",
      resetSentSuccess: "Le lien de réinitialisation a été envoyé à votre adresse e-mail.",
    },
    wizard: {
      title: "Configuration du Profil",
      step1Title: "Qui êtes-vous ?",
      step1Sub: "Ajoutez votre photo et votre titre professionnel pour être visible des recruteurs.",
      step2Title: "Où et comment travaillez-vous ?",
      step2Sub: "Indiquez votre ville au Cameroun et votre disponibilité.",
      step3Title: "Vos compétences & Métiers",
      step3Sub: "Sélectionnez vos compétences clés pour des correspondances ciblées.",
      step4Title: "Présentation & Tarif",
      step4Sub: "Décrivez vos atouts et définissez votre rémunération souhaitée.",
      headlineLabel: "Titre professionnel / Métier",
      headlinePlaceholder: "ex. Responsable Logistique Senior ou Électricien Bâtiment",
      cityLabel: "Ville principale",
      availabilityLabel: "Disponibilité",
      skillsLabel: "Sélectionner ou ajouter des compétences",
      addCustomSkill: "Ajouter une compétence",
      addSkillPlaceholder: "Saisir la compétence puis Ajouter",
      bioLabel: "Courte biographie / Résumé",
      bioPlaceholder: "Professionnel expérimenté avec plus de 5 ans dans la gestion logistique, distribution et transport...",
      rateLabel: "Rémunération souhaitée (XAF)",
      ratePlaceholder: "ex. 150 000 FCFA / mois ou 10 000 FCFA / jour",
      finishBtn: "Finaliser le profil & Démarrer",
      nextBtn: "Étape suivante",
      prevBtn: "Précédent",
      skipBtn: "Passer pour l'instant",
    },
    home: {
      greeting: "Bonjour",
      verifiedPro: "Pro Vérifié",
      matchesToday: "Vous avez de nouvelles opportunités adaptées à votre profil aujourd'hui.",
      searchPlaceholder: "Rechercher un poste, compétence ou entreprise...",
      statApplied: "Postulés",
      statInterviews: "Entretiens",
      statOffers: "Offres Directes",
      statViews: "Vues Profil",
      priorityMatchTitle: "Correspondance Prioritaire",
      priorityMatchBadge: "98% Match",
      applyNow: "Postuler vite",
      myApplications: "Mes Candidatures",
      viewHistory: "Voir tout l'historique",
      recommendedJobs: "Recommandé pour vous",
    },
    search: {
      title: "Explorer les Offres & Missions",
      placeholder: "Titre, compétences ou entreprise...",
      filters: "Filtres",
      categories: "Catégorie",
      locations: "Localisation",
      jobType: "Type de contrat",
      payRange: "Salaire",
      resultsFound: "offres trouvées",
      clearFilters: "Réinitialiser",
      applyFilters: "Appliquer les filtres",
      noJobsFound: "Aucune offre trouvée",
      noJobsFoundSub: "Modifiez vos critères de recherche ou réinitialisez les filtres.",
    },
    jobDetail: {
      aboutRole: "À propos du poste",
      responsibilities: "Missions principales",
      requirements: "Profil recherché & Exigences",
      requiredSkills: "Compétences requises",
      matchingSkills: "Correspondant à votre profil",
      aboutCompany: "À propos de l'employeur",
      postedBy: "Publié par",
      location: "Localisation",
      salary: "Rémunération",
      jobType: "Type de contrat",
      applyNow: "Postuler à cette offre",
      appliedAlready: "Candidature envoyée",
      saved: "Enregistré",
      saveJob: "Enregistrer",
    },
    applyFlow: {
      title: "Postuler au poste",
      subtitle: "Vérifiez vos informations et joignez une note personnalisée au recruteur.",
      contactInfo: "Vos coordonnées certifiées",
      coverNoteLabel: "Message / Note de motivation (Optionnel)",
      coverNotePlaceholder: "Présentez brièvement vos points forts et pourquoi vous correspondez parfaitement à cette offre...",
      rateExpectation: "Disponibilité confirmée & Tarif souhaité",
      submitBtn: "Envoyer ma candidature",
      submitting: "Envoi en cours...",
      successTitle: "Candidature Envoyée !",
      successSubtitle: "Votre candidature a été transmise au recruteur. Vous recevrez des notifications en temps réel.",
      goToApplications: "Mes Candidatures",
      browseMore: "Voir d'autres offres",
    },
    applications: {
      title: "Mes Candidatures",
      tabs: {
        all: "Toutes",
        pending: "En attente",
        reviewed: "Examinées",
        interviews: "Entretiens",
        accepted: "Retenues",
        rejected: "Archivées",
      },
      appliedOn: "Postulé le",
      statusTimeline: "Suivi de la candidature",
      contactEmployer: "Écrire au recruteur",
      emptyTitle: "Aucune candidature",
      emptySub: "Vous n'avez pas encore de candidature dans cette catégorie.",
    },
    directOffers: {
      title: "Offres Directes",
      subtitle: "Invitations envoyées directement par les recruteurs ayant consulté votre profil.",
      bannerTitle: "Recrutement Direct",
      bannerSub: "Des employeurs ont apprécié votre réputation et vous proposent ces missions.",
      offeredRate: "Rémunération proposée",
      startDate: "Date de début souhaitée",
      acceptBtn: "Accepter l'offre",
      declineBtn: "Refuser",
      chatBtn: "Échanger avec le recruteur",
      emptyTitle: "Aucune offre directe pour le moment",
      emptySub: "Complétez votre profil et obtenez des recommandations pour attirer les recruteurs.",
    },
    messages: {
      title: "Messagerie",
      searchPlaceholder: "Rechercher une conversation...",
      emptyTitle: "Aucune conversation",
      emptySub: "Vos échanges avec les recruteurs apparaîtront ici.",
      typeMessage: "Écrivez un message...",
      online: "En ligne",
      offline: "Hors ligne",
      videoCall: "Appel Vidéo",
      voiceCall: "Appel",
      discussing: "Concerne",
    },
    profile: {
      title: "Mon Profil",
      editSkillsBtn: "+ Modifier Compétences",
      editProfileBtn: "Modifier le profil",
      profileCompleteness: "Complétude du Profil",
      completeProfileTip: "Ajoutez vos certifications et faites-vous recommander pour atteindre 100%",
      aboutMe: "À propos de moi",
      skills: "Compétences & Spécialités",
      workHistory: "Expériences & Réputation",
      addWorkHistory: "+ Ajouter une expérience",
      ratingsTitle: "Évaluations & Avis employeurs",
      verificationSection: "Vérification d'Identité & Diplômes",
      vouchingSection: "Recommandations Communautaires",
      directOffersSection: "Offres Directes Reçues",
      settingsSection: "Paramètres & Préférences",
      logout: "Se déconnecter",
    },
    verification: {
      title: "Vérification d'Identité & Métier",
      subtitle: "Renforcez la confiance des recruteurs en certifiant votre identité et vos qualifications.",
      idCardTitle: "Carte Nationale d'Identité / Passeport",
      idCardDesc: "Téléversez le recto et verso de votre CNI ou Passeport camerounais.",
      certificateTitle: "Diplôme ou Certificat Professionnel",
      certificateDesc: "Téléversez vos diplômes, CQP, attestation de fin d'apprentissage.",
      policeTitle: "Extrait de Casier Judiciaire (Optionnel)",
      policeDesc: "Document officiel pour maximiser votre indice de confiance.",
      statusApproved: "Vérifié & Actif",
      statusReview: "En cours d'examen",
      statusPending: "Non soumis",
      uploadDocument: "Téléverser le document",
    },
    vouching: {
      title: "Parrainage Communautaire",
      subtitle: "Bénéficiez du réseau de confiance camerounais. Demandez à des pairs, maîtres d'apprentissage ou collègues certifiés de vous parrainer.",
      bannerTitle: "Réputation Portative",
      bannerDesc: "Chaque recommandation vérifiée augmente votre visibilité auprès des recruteurs de 35%.",
      vouchesReceived: "Recommandations reçues",
      requestVouchBtn: "Demander un parrainage",
      requestModalTitle: "Demander une recommandation",
      contactPlaceholder: "Téléphone (+237) ou Email du contact",
      relationPlaceholder: "Lien (ex. Ancien Maître de stage, Superviseur)",
      sendRequestBtn: "Envoyer la demande",
      noVouchesYet: "Aucune recommandation pour l'instant. Invitez votre premier parrain !",
    },
    notifications: {
      title: "Notifications",
      markAllRead: "Tout marquer comme lu",
      emptyTitle: "Aucune notification",
      emptySub: "Vous êtes à jour !",
      tabs: {
        all: "Toutes",
        jobs: "Offres",
        messages: "Messages",
        system: "Mises à jour",
      },
    },
    settings: {
      title: "Paramètres",
      language: "Langue de l'application",
      notifications: "Préférences de notification",
      pushNotifs: "Notifications Push",
      jobAlerts: "Alertes d'offres en temps réel",
      privacy: "Confidentialité & Visibilité",
      profilePublic: "Rendre mon profil visible aux recruteurs",
      helpSupport: "Aide & Support",
      faq: "Foire aux questions (FAQ)",
      terms: "Conditions & Confidentialité",
      version: "CamWork v1.0.0 (Expo SDK 54)",
      logoutConfirm: "Voulez-vous vraiment vous déconnecter de CamWork ?",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("EN");

  useEffect(() => {
    const loadLang = async () => {
      try {
        const savedLang = await AsyncStorage.getItem("app_language");
        if (savedLang === "EN" || savedLang === "FR") {
          setLanguageState(savedLang);
        }
      } catch (e) {
        console.error("Error loading language preference:", e);
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem("app_language", lang);
    } catch (e) {
      console.error("Error saving language preference:", e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
