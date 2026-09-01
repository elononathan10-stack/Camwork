import React, { createContext, useContext, useState, useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import {
  ApiError,
  createApplication,
  createJob as createJobApi,
  getApplications,
  getConversations,
  updateApplicationStatusApi,
  validateApplicationApi,
  uploadVerificationDocumentApi,
  getDirectOffersApi,
  updateDirectOfferStatusApi,
  updateJobStatusApi,
  createConversation,
  sendMessage,
  updateJob as updateJobApi,
} from "@/components/api";

export interface SkillItem {
  id: string;
  name: string;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Expert";
}

export interface WorkHistoryItem {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  verifiedByEmployer?: boolean;
}

export interface ReviewItem {
  id: string;
  employerName: string;
  companyName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedJobTitle: string;
}

export interface ApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  salary: string;
  type: "Formal" | "Gig";
  appliedDate: string;
  status: "Pending" | "Reviewed" | "Interviews" | "Accepted" | "Rejected";
  coverNote?: string;
  nextStep?: string;
  employerValidated?: boolean;
  seekerValidated?: boolean;
  paymentValidated?: boolean;
  employmentStatus?: "pending" | "active" | "rejected";
}

export interface DirectOfferItem {
  id: string;
  employerName: string;
  companyName: string;
  companyLogo?: string;
  jobTitle: string;
  location: string;
  rateOffered: string;
  contractType: string;
  startDate: string;
  message: string;
  status: "Pending" | "Accepted" | "Declined";
  dateReceived: string;
}

export interface VouchItem {
  id: string;
  endorserName: string;
  endorserRole: string;
  company: string;
  relationship: string;
  date: string;
  verifiedBadge: boolean;
  comment: string;
}

export interface NotificationItem {
  id: string;
  type: "job" | "application" | "message" | "verification" | "vouch";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  targetScreen?: string;
  targetId?: string;
}

export interface MessageItem {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ConversationItem {
  id: string;
  employerName: string;
  companyName: string;
  companyLogo?: string;
  jobContext: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: MessageItem[];
}

export const PLATFORM_CONTACT_BLOCK_MESSAGE =
  "For your safety, contact details and meeting arrangements must stay inside CamWork. Use the in-app transaction flow instead.";

export const containsRestrictedContact = (value: string) =>
  /(?:\+?\d[\d\s().-]{6,}\d|\b\d{7,}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:meet|meeting|address|location|come to|whatsapp|telegram|phone|call me|text me|contact me)\b)/i.test(
    value,
  );

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  category: string;
  type: "Formal" | "Gig";
  contractDuration?: string;
  salary: string;
  postedTime: string;
  matchScore: number;
  isPriorityMatch?: boolean;
  isUrgent?: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  employerVerified: boolean;
  rating: number;
  reviewCount: number;
  postedBy?: string;
  postedByRole?: "seeker" | "employer";
  isServiceRequest?: boolean;
  status?: "open" | "closed" | "filled" | "archived";
}

export type CreateJobInput = Pick<
  JobListing,
  | "title"
  | "company"
  | "location"
  | "category"
  | "type"
  | "contractDuration"
  | "salary"
  | "description"
  | "responsibilities"
  | "requirements"
  | "skills"
>;

export interface SeekerProfile {
  name: string;
  email: string;
  phone: string;
  role: "seeker" | "employer";
  headline: string;
  bio: string;
  avatar: string;
  location: string;
  availability: "Full-time" | "Part-time" | "Gig / Daily" | "Contract";
  expectedRate: string;
  isVerified: boolean;
  verificationStatus: "Verified" | "In Review" | "Unverified";
  vouchCount: number;
  rating: number;
  reviewCount: number;
  isProfileComplete: boolean;
  idDocumentUploaded: boolean;
  certificateUploaded: boolean;
  idDocumentUri?: string;
  certificateDocumentUri?: string;
}

interface UserContextType {
  user: SeekerProfile | null;
  skills: SkillItem[];
  workHistory: WorkHistoryItem[];
  reviews: ReviewItem[];
  applications: ApplicationItem[];
  directOffers: DirectOfferItem[];
  savedJobIds: string[];
  notifications: NotificationItem[];
  conversations: ConversationItem[];
  jobs: JobListing[];
  createJob: (job: CreateJobInput, isServiceRequest?: boolean) => Promise<void>;
  updateJob: (
    jobId: string,
    job: CreateJobInput,
    isServiceRequest?: boolean,
  ) => Promise<void>;
  updateJobStatus: (
    jobId: string,
    status: NonNullable<JobListing["status"]>,
  ) => Promise<void>;
  switchRole: (role: "seeker" | "employer") => Promise<void>;
  startConversation: (
    recipientName: string,
    companyName: string,
    jobContext: string,
    recipientEmail?: string,
  ) => Promise<string>;
  isLoading: boolean;
  setUser: (user: Partial<SeekerProfile>) => Promise<void>;
  updateProfile: (updates: Partial<SeekerProfile>) => Promise<void>;
  addSkill: (skill: string) => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
  addWorkHistory: (history: Omit<WorkHistoryItem, "id">) => Promise<void>;
  applyToJob: (job: JobListing, coverNote?: string) => Promise<void>;
  updateApplicationStatus: (
    applicationId: string,
    status: ApplicationItem["status"],
  ) => Promise<void>;
  validateApplication: (
    applicationId: string,
    validated: boolean,
  ) => Promise<void>;
  toggleSaveJob: (jobId: string) => Promise<void>;
  acceptOffer: (offerId: string) => Promise<void>;
  declineOffer: (offerId: string) => Promise<void>;
  requestVouch: (contact: string, relation: string) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendChatMessage: (conversationId: string, text: string) => Promise<void>;
  uploadVerificationDocument: (
    docType: "id" | "certificate",
    documentUri: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

// Initial Mock Data
const INITIAL_JOBS: JobListing[] = [
  {
    id: "job-1",
    title: "Senior Logistics & Fleet Planner",
    company: "Bolloré Africa Logistics",
    location: "Douala, Littoral",
    category: "Logistics & Transport",
    type: "Formal",
    contractDuration: "Full-time CDI",
    salary: "450,000 - 600,000 FCFA / mo",
    postedTime: "2 hours ago",
    matchScore: 98,
    isPriorityMatch: true,
    isUrgent: true,
    description:
      "We are seeking an experienced Logistics Planner to oversee port container transit, fleet scheduling, and warehouse supply chain tracking across Douala Port and Central Africa corridors.",
    responsibilities: [
      "Coordinate freight dispatching between Douala Autonomous Port and regional hubs",
      "Manage GPS tracking systems and optimize driver delivery routes",
      "Ensure customs documentation compliance and port clearance workflows",
      "Lead a logistics support team of 12 dispatchers and warehouse agents",
    ],
    requirements: [
      "3+ years experience in freight, supply chain, or port logistics in Cameroon",
      "Strong knowledge of ERP inventory tools (SAP, Odoo, or similar)",
      "Bilingual in French and English is strongly preferred",
      "Problem-solving mindset and strong team leadership",
    ],
    skills: [
      "Supply Chain",
      "Fleet Management",
      "Douala Port Clearance",
      "ERP Systems",
      "Inventory Control",
    ],
    employerVerified: true,
    rating: 4.9,
    reviewCount: 34,
  },
  {
    id: "job-2",
    title: "Solar Installation Lead Technician",
    company: "Cameroon Green Power SARL",
    location: "Yaoundé, Centre",
    category: "Skilled Trades",
    type: "Gig",
    contractDuration: "2-Month Project",
    salary: "25,000 FCFA / day",
    postedTime: "5 hours ago",
    matchScore: 92,
    isPriorityMatch: false,
    isUrgent: true,
    description:
      "Urgent contract for a lead solar installation technician to configure 50kW residential and commercial rooftop solar panel arrays with inverter battery setups.",
    responsibilities: [
      "Assemble solar panel racking systems and wire photovoltaic strings",
      "Install and calibrate hybrid lithium inverters and charge controllers",
      "Test AC/DC isolation, earthing, and grid-tie synchronization",
    ],
    requirements: [
      "Certification in Electrical Engineering or Renewable Energy installations",
      "Experience with high voltage solar arrays and safety standards",
    ],
    skills: [
      "Solar PV",
      "Electrical Wiring",
      "Inverter Calibration",
      "Safety Compliance",
    ],
    employerVerified: true,
    rating: 4.8,
    reviewCount: 19,
  },
  {
    id: "job-3",
    title: "Regional Sales & Distribution Rep",
    company: "Brasseries du Cameroun (SABC)",
    location: "Bafoussam, Ouest",
    category: "Sales & Marketing",
    type: "Formal",
    contractDuration: "Full-time",
    salary: "280,000 FCFA + Commission",
    postedTime: "1 day ago",
    matchScore: 88,
    isPriorityMatch: false,
    isUrgent: false,
    description:
      "Manage relationships with key wholesalers and retail outlets in the West region, monitoring stock levels and driving commercial promotions.",
    responsibilities: [
      "Grow sales volume across assigned distributor territory",
      "Track inventory rotations and report stock-outs",
      "Negotiate merchandising displays and point-of-sale visibility",
    ],
    requirements: [
      "Degree in Commerce, Marketing, or 2 years field sales experience",
      "Valid driving license (Cat. B or A)",
    ],
    skills: ["B2B Sales", "Client Negotiation", "Route Planning", "CRM"],
    employerVerified: true,
    rating: 4.7,
    reviewCount: 52,
  },
  {
    id: "job-4",
    title: "Certified Heavy Equipment Mechanic",
    company: "Razel-BEC Construction",
    location: "Kribi, Sud",
    category: "Construction & Engineering",
    type: "Formal",
    contractDuration: "Contract CDD",
    salary: "500,000 FCFA / mo",
    postedTime: "2 days ago",
    matchScore: 85,
    isPriorityMatch: false,
    isUrgent: false,
    description:
      "Perform hydraulic, engine, and transmission diagnostics on Caterpillar excavators, graders, and dump trucks at coastal infrastructure sites.",
    responsibilities: [
      "Execute scheduled preventive maintenance on diesel heavy machinery",
      "Troubleshoot electronic hydraulic control systems",
      "Maintain tool inventory and safety compliance logs",
    ],
    requirements: [
      "Technical diploma (CAP/CQP/BT) in Diesel or Heavy Machinery Mechanics",
      "4+ years hands-on field experience",
    ],
    skills: [
      "Diesel Diagnostics",
      "Hydraulic Systems",
      "Heavy Machinery",
      "Equipment Safety",
    ],
    employerVerified: true,
    rating: 4.9,
    reviewCount: 28,
  },
  {
    id: "job-5",
    title: "Full-Stack React Native / Node Developer",
    company: "Silicon Mountain Tech Hub",
    location: "Buea, South-West (Hybrid)",
    category: "Technology",
    type: "Formal",
    contractDuration: "Full-time",
    salary: "400,000 - 550,000 FCFA / mo",
    postedTime: "3 days ago",
    matchScore: 95,
    isPriorityMatch: false,
    isUrgent: false,
    description:
      "Build cutting-edge fintech and marketplace mobile applications using React Native, TypeScript, and microservices.",
    responsibilities: [
      "Design and maintain cross-platform mobile apps for iOS and Android",
      "Integrate mobile money payment gateways (MTN MoMo, Orange Money)",
      "Collaborate with UX designers and backend engineers",
    ],
    requirements: [
      "Proficiency in TypeScript, React Native, Node.js, and REST/GraphQL APIs",
      "Experience with offline-first local storage and state management",
    ],
    skills: [
      "React Native",
      "TypeScript",
      "Node.js",
      "Mobile Money APIs",
      "Git",
    ],
    employerVerified: true,
    rating: 5.0,
    reviewCount: 15,
  },
];

const INITIAL_PROFILE: SeekerProfile = {
  name: "",
  email: "",
  phone: "",
  role: "seeker",
  headline: "",
  bio: "",
  avatar: "",
  location: "",
  availability: "Full-time",
  expectedRate: "",
  isVerified: false,
  verificationStatus: "Unverified",
  vouchCount: 0,
  rating: 0,
  reviewCount: 0,
  isProfileComplete: false,
  idDocumentUploaded: false,
  certificateUploaded: false,
};

const INITIAL_SKILLS: SkillItem[] = [
  { id: "s1", name: "Logistics Planning", level: "Expert" },
  { id: "s2", name: "Douala Port Customs", level: "Expert" },
  { id: "s3", name: "Fleet Coordination", level: "Intermediate" },
  { id: "s4", name: "Inventory Management (ERP)", level: "Expert" },
  { id: "s5", name: "Supply Chain Strategy", level: "Intermediate" },
  { id: "s6", name: "Bilingual (FR/EN)", level: "Expert" },
];

const INITIAL_WORK_HISTORY: WorkHistoryItem[] = [
  {
    id: "w1",
    title: "Logistics Operations Lead",
    company: "CFAO Motors Cameroon",
    location: "Douala",
    period: "2022 - Present",
    description:
      "Supervised regional vehicle parts distribution across 10 depots. Reduced delivery transit delays by 28%.",
    verifiedByEmployer: true,
  },
  {
    id: "w2",
    title: "Freight Dispatch Coordinator",
    company: "Transimex Douala Port",
    location: "Douala Port",
    period: "2020 - 2022",
    description:
      "Managed clearing agents and coordinated 200+ TEU container dispatches weekly along the Douala-Bangui corridor.",
    verifiedByEmployer: true,
  },
  {
    id: "w3",
    title: "Warehouse Inventory Controller",
    company: "Nestlé Cameroun",
    location: "Bonabéri, Douala",
    period: "2018 - 2020",
    description:
      "Conducted daily FIFO cycle audits, managed SAP inventory modules, and ensured zero stock discrepancy.",
    verifiedByEmployer: true,
  },
];

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    employerName: "Alain Mbekou",
    companyName: "CFAO Motors Cameroon",
    rating: 5.0,
    date: "May 2024",
    comment:
      "Jean is an outstanding logistics strategist. His grasp of local transport corridors and calm under port congestion pressure is unmatched.",
    verifiedJobTitle: "Logistics Operations Lead",
  },
  {
    id: "r2",
    employerName: "Claire Ewandé",
    companyName: "Transimex Freight",
    rating: 4.8,
    date: "Dec 2022",
    comment:
      "Punctual, rigorously organized, and deeply respected by truck drivers and customs agents alike.",
    verifiedJobTitle: "Freight Dispatch Coordinator",
  },
];

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: "app-1",
    jobId: "job-1",
    jobTitle: "Senior Logistics & Fleet Planner",
    companyName: "Bolloré Africa Logistics",
    location: "Douala, Littoral",
    salary: "550,000 FCFA",
    type: "Formal",
    appliedDate: "Today",
    status: "Reviewed",
    nextStep: "Interview invitation scheduled for Thursday 10:00 AM",
  },
  {
    id: "app-2",
    jobId: "job-2",
    jobTitle: "Solar Installation Lead Technician",
    companyName: "Cameroon Green Power SARL",
    location: "Yaoundé, Centre",
    salary: "25,000 FCFA / day",
    type: "Gig",
    appliedDate: "2 days ago",
    status: "Interviews",
    nextStep: "Technical call confirmed via in-app video",
  },
  {
    id: "app-3",
    jobId: "job-3",
    jobTitle: "Regional Sales & Distribution Rep",
    companyName: "Brasseries du Cameroun (SABC)",
    location: "Bafoussam, Ouest",
    salary: "280,000 FCFA",
    type: "Formal",
    appliedDate: "Last week",
    status: "Accepted",
    nextStep: "Contract offer letter sent to your email",
  },
  {
    id: "app-4",
    jobId: "job-4",
    jobTitle: "Certified Heavy Equipment Mechanic",
    companyName: "Razel-BEC Construction",
    location: "Kribi, Sud",
    salary: "500,000 FCFA",
    type: "Formal",
    appliedDate: "2 weeks ago",
    status: "Pending",
    nextStep: "Under initial recruiter profile review",
  },
];

const INITIAL_DIRECT_OFFERS: DirectOfferItem[] = [
  {
    id: "off-1",
    employerName: "Marcelle Tchakounte (HR Director)",
    companyName: "Orange Cameroun Logistics Hub",
    jobTitle: "Regional Warehouse Supervisor",
    location: "Douala, Akwa",
    rateOffered: "480,000 FCFA / month",
    contractType: "Permanent (CDI)",
    startDate: "1st of Next Month",
    message:
      "Hello Jean, we noticed your top ratings in supply chain and port dispatching. We'd love to invite you directly to head our Akwa telecom distribution facility.",
    status: "Pending",
    dateReceived: "Yesterday",
  },
  {
    id: "off-2",
    employerName: "Paul Ndip",
    companyName: "Douala Cold Chain Express",
    jobTitle: "Perishable Fleet Routing Specialist",
    location: "Douala Port",
    rateOffered: "35,000 FCFA / day",
    contractType: "1-Month Intensive Gig",
    startDate: "Immediate",
    message:
      "Jean, our supervisor recommended your reputation. We need urgent fleet routing for refrigerated maritime containers starting this Monday.",
    status: "Pending",
    dateReceived: "3 days ago",
  },
];

const INITIAL_VOUCHES: VouchItem[] = [
  {
    id: "v1",
    endorserName: "Henriette Ntone",
    endorserRole: "Supply Chain Director",
    company: "Maersk Line Cameroon",
    relationship: "Former Department Manager",
    date: "3 months ago",
    verifiedBadge: true,
    comment:
      "I mentored Jean for 3 years. His integrity, meticulous customs paperwork, and team leadership are exemplary.",
  },
  {
    id: "v2",
    endorserName: "Dr. Samuel Foko",
    endorserRole: "President",
    company: "Cameroon Logistics & Freight Association",
    relationship: "Trade Guild Peer",
    date: "5 months ago",
    verifiedBadge: true,
    comment:
      "Jean is a certified member in good standing with verified peer track record across regional corridors.",
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "job",
    title: "Priority Match Found (98% Fit)",
    body: "Bolloré Africa Logistics posted 'Senior Logistics Planner' matching your verified skills.",
    time: "2h ago",
    unread: true,
    targetScreen: "job-detail",
    targetId: "job-1",
  },
  {
    id: "n2",
    type: "application",
    title: "Application Reviewed!",
    body: "Bolloré Africa has reviewed your application and requested an interview.",
    time: "4h ago",
    unread: true,
    targetScreen: "applications",
  },
  {
    id: "n3",
    type: "message",
    title: "Direct Offer from Orange Cameroun",
    body: "HR Director Marcelle sent you a direct hiring invitation for Warehouse Supervisor.",
    time: "Yesterday",
    unread: false,
    targetScreen: "direct-offers",
  },
  {
    id: "n4",
    type: "verification",
    title: "Identity Verified ✅",
    body: "Your Cameroon National ID has been verified. Verified Pro badge is now active!",
    time: "2 days ago",
    unread: false,
    targetScreen: "verification",
  },
];

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: "conv-1",
    employerName: "Sandrine Mbarga (Recruiter)",
    companyName: "Bolloré Africa Logistics",
    jobContext: "Senior Logistics & Fleet Planner",
    lastMessage:
      "Hello Jean! We reviewed your profile and would love to schedule a video call this Thursday.",
    lastMessageTime: "11:42 AM",
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: "m1",
        senderId: "employer",
        text: "Hello Jean, thank you for applying to the Senior Logistics Planner role.",
        timestamp: "10:30 AM",
        isMe: false,
      },
      {
        id: "m2",
        senderId: "me",
        text: "Hello Sandrine! Thank you for reviewing my profile. I am very enthusiastic about this opportunity.",
        timestamp: "10:45 AM",
        isMe: true,
      },
      {
        id: "m3",
        senderId: "employer",
        text: "Hello Jean! We reviewed your profile and would love to schedule a video call this Thursday at 10 AM. Would that work for you?",
        timestamp: "11:42 AM",
        isMe: false,
      },
    ],
  },
  {
    id: "conv-2",
    employerName: "Marcelle Tchakounte",
    companyName: "Orange Cameroun Logistics",
    jobContext: "Regional Warehouse Supervisor",
    lastMessage:
      "Please check the direct offer details we attached to your profile.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: "m4",
        senderId: "employer",
        text: "Hi Jean, we sent a direct offer for the Akwa depot supervisor position.",
        timestamp: "Yesterday 3:15 PM",
        isMe: false,
      },
      {
        id: "m5",
        senderId: "employer",
        text: "Please check the direct offer details we attached to your profile.",
        timestamp: "Yesterday 3:16 PM",
        isMe: false,
      },
    ],
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

type AccountSnapshot = {
  skills: SkillItem[];
  workHistory: WorkHistoryItem[];
  applications: ApplicationItem[];
  directOffers: DirectOfferItem[];
  savedJobIds: string[];
  notifications: NotificationItem[];
  conversations: ConversationItem[];
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<SeekerProfile | null>(null);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [reviews] = useState<ReviewItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [directOffers, setDirectOffers] = useState<DirectOfferItem[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>(INITIAL_JOBS);
  const [isLoading, setIsLoading] = useState(true);

  const accountStorageKey = (email: string) =>
    `camwork_account_${email.trim().toLowerCase()}`;

  const saveAccountSnapshot = async (email: string) => {
    const snapshot: AccountSnapshot = {
      skills,
      workHistory,
      applications,
      directOffers,
      savedJobIds,
      notifications,
      conversations,
    };
    await AsyncStorage.setItem(
      accountStorageKey(email),
      JSON.stringify(snapshot),
    );
  };

  const restoreAccountSnapshot = async (email: string) => {
    const savedAccount = await AsyncStorage.getItem(accountStorageKey(email));
    if (!savedAccount) return;
    const account = JSON.parse(savedAccount) as Partial<AccountSnapshot>;
    setSkills(account.skills || []);
    setWorkHistory(account.workHistory || []);
    setApplications(account.applications || []);
    setDirectOffers(account.directOffers || []);
    setSavedJobIds(account.savedJobIds || []);
    setNotifications(account.notifications || []);
    setConversations(account.conversations || []);
  };

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("camwork_user");
        if (savedUser) {
          const savedProfile = JSON.parse(savedUser) as SeekerProfile;
          // Removes the old development account that was previously persisted
          // on every test device. New installs always start with empty fields.
          if (
            savedProfile.email?.trim().toLowerCase() ===
            "elononathan10@gmail.com"
          ) {
            await AsyncStorage.multiRemove(["camwork_user", "camwork_token"]);
          } else {
            setUserState(savedProfile);
          }
          if (
            savedProfile.email &&
            savedProfile.email.trim().toLowerCase() !==
              "elononathan10@gmail.com"
          )
            await restoreAccountSnapshot(savedProfile.email);
        }
        setJobs(INITIAL_JOBS);
      } catch (error) {
        console.error("Failed to load user state from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    setJobs((currentJobs) =>
      currentJobs.length > 0 ? currentJobs : INITIAL_JOBS,
    );
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && user?.email) {
      saveAccountSnapshot(user.email).catch((error) =>
        console.error("Error saving account messages:", error),
      );
    }
  }, [applications, conversations, directOffers, isLoading, user?.email]);

  const clearExpiredSession = async (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      await AsyncStorage.multiRemove(["camwork_user", "camwork_token"]);
      setUserState(null);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (isLoading || !user?.email) return;
    getApplications(user.role)
      .then(setApplications)
      .catch(async (error) => {
        if (!(await clearExpiredSession(error))) {
          console.error("Failed to load shared applications:", error);
        }
      });
  }, [isLoading, user?.email, user?.role]);

  useEffect(() => {
    if (isLoading || !user?.email) return;
    getConversations()
      .then((remoteConversations) => {
        if (remoteConversations.length > 0)
          setConversations(remoteConversations);
      })
      .catch((error) =>
        clearExpiredSession(error).then((wasExpired) => {
          if (!wasExpired)
            console.error("Failed to load shared conversations:", error);
        }),
      );
  }, [isLoading, user?.email]);

  useEffect(() => {
    if (isLoading || !user?.email) return;
    getDirectOffersApi(user.role)
      .then((remoteOffers) => {
        if (remoteOffers.length > 0) setDirectOffers(remoteOffers);
      })
      .catch((error) =>
        clearExpiredSession(error).then((wasExpired) => {
          if (!wasExpired)
            console.error("Failed to load direct offers:", error);
        }),
      );
  }, [isLoading, user?.email, user?.role]);

  const setUser = async (userData: Partial<SeekerProfile>) => {
    const updated = {
      ...(user || INITIAL_PROFILE),
      ...userData,
    } as SeekerProfile;
    setUserState(updated);
    try {
      await AsyncStorage.setItem("camwork_user", JSON.stringify(updated));
      if (updated.email) await restoreAccountSnapshot(updated.email);
    } catch (e) {
      console.error("Error saving user:", e);
    }
  };

  const updateProfile = async (updates: Partial<SeekerProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUserState(updated);
    try {
      await AsyncStorage.setItem("camwork_user", JSON.stringify(updated));
    } catch (e) {
      console.error("Error updating profile:", e);
    }
  };

  const switchRole = async (role: "seeker" | "employer") => {
    await updateProfile({ role });
  };

  const createJob = async (job: CreateJobInput, isServiceRequest = false) => {
    if (!user) return;
    const listingText = [
      job.title,
      job.description,
      job.location,
      job.salary,
    ].join(" ");
    if (containsRestrictedContact(listingText)) {
      throw new Error(PLATFORM_CONTACT_BLOCK_MESSAGE);
    }
    const savedJob = await createJobApi({
      ...job,
      employerVerified: user.isVerified,
      isServiceRequest,
    });
    setJobs((previous) => [savedJob, ...previous]);
  };

  const updateJob = async (
    jobId: string,
    job: CreateJobInput,
    isServiceRequest = false,
  ) => {
    if (!user) return;
    const text = [job.title, job.description, job.location, job.salary].join(
      " ",
    );
    if (containsRestrictedContact(text))
      throw new Error(PLATFORM_CONTACT_BLOCK_MESSAGE);
    const savedJob = await updateJobApi(jobId, {
      ...job,
      employerVerified: user.isVerified,
      isServiceRequest,
    });
    setJobs((previous) =>
      previous.map((item) => (item.id === jobId ? savedJob : item)),
    );
  };

  const updateJobStatus = async (
    jobId: string,
    status: NonNullable<JobListing["status"]>,
  ) => {
    const savedJob = await updateJobStatusApi(jobId, status);
    setJobs((previous) =>
      previous.map((item) => (item.id === jobId ? savedJob : item)),
    );
  };

  const addSkill = async (skillName: string) => {
    if (!skillName.trim()) return;
    const newSkill: SkillItem = {
      id: `s-${Date.now()}`,
      name: skillName.trim(),
      level: "Intermediate",
    };
    const next = [...skills, newSkill];
    setSkills(next);
    try {
      await AsyncStorage.setItem("camwork_skills", JSON.stringify(next));
    } catch (e) {
      console.error("Error saving skills:", e);
    }
  };

  const removeSkill = async (skillId: string) => {
    const next = skills.filter((s) => s.id !== skillId);
    setSkills(next);
    try {
      await AsyncStorage.setItem("camwork_skills", JSON.stringify(next));
    } catch (e) {
      console.error("Error deleting skill:", e);
    }
  };

  const addWorkHistory = async (item: Omit<WorkHistoryItem, "id">) => {
    const newItem: WorkHistoryItem = {
      id: `w-${Date.now()}`,
      ...item,
      verifiedByEmployer: false,
    };
    const next = [newItem, ...workHistory];
    setWorkHistory(next);
    try {
      await AsyncStorage.setItem("camwork_work_history", JSON.stringify(next));
    } catch (e) {
      console.error("Error saving work history:", e);
    }
  };

  const applyToJob = async (job: JobListing, coverNote?: string) => {
    if (
      job.postedBy?.trim().toLowerCase() === user?.email?.trim().toLowerCase()
    ) {
      throw new Error("You cannot apply to your own job posting.");
    }
    const exists = applications.find((a) => a.jobId === job.id);
    if (exists) return;

    const savedApplication = await createApplication({
      jobId: job.id,
      coverNote,
    });
    const next = [savedApplication, ...applications];
    setApplications(next);
    try {
      await AsyncStorage.setItem("camwork_applications", JSON.stringify(next));
    } catch (e) {
      console.error("Error saving application:", e);
    }

    // Add a notification
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      type: "application",
      title: "Application Submitted",
      body: `You applied for ${job.title} at ${job.company}.`,
      time: "Just now",
      unread: true,
      targetScreen: "applications",
    };
    setNotifications([newNotif, ...notifications]);
  };

  const toggleSaveJob = async (jobId: string) => {
    let next: string[];
    if (savedJobIds.includes(jobId)) {
      next = savedJobIds.filter((id) => id !== jobId);
    } else {
      next = [...savedJobIds, jobId];
    }
    setSavedJobIds(next);
    try {
      await AsyncStorage.setItem("camwork_saved_jobs", JSON.stringify(next));
    } catch (e) {
      console.error("Error toggling saved job:", e);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: ApplicationItem["status"],
  ) => {
    await updateApplicationStatusApi(applicationId, status);
    const next = applications.map((application) =>
      application.id === applicationId
        ? {
            ...application,
            status,
            nextStep:
              status === "Accepted"
                ? "Application validated. Continue the conversation in Messages."
                : status === "Rejected"
                  ? "Application declined by the employer."
                  : application.nextStep,
          }
        : application,
    );
    setApplications(next);
    if (user?.email) {
      await AsyncStorage.setItem(
        accountStorageKey(user.email),
        JSON.stringify({
          skills,
          workHistory,
          applications: next,
          directOffers,
          savedJobIds,
          notifications,
          conversations,
        } satisfies AccountSnapshot),
      );
    }
  };

  const validateApplication = async (
    applicationId: string,
    validated: boolean,
  ) => {
    const savedApplication = await validateApplicationApi(
      applicationId,
      validated,
    );
    setApplications((previous) =>
      previous.map((application) =>
        application.id === applicationId ? savedApplication : application,
      ),
    );
  };

  const acceptOffer = async (offerId: string) => {
    const savedOffer = await updateDirectOfferStatusApi(offerId, "Accepted");
    setDirectOffers((prev) =>
      prev.map((o) => (o.id === offerId ? savedOffer : o)),
    );
  };

  const declineOffer = async (offerId: string) => {
    const savedOffer = await updateDirectOfferStatusApi(offerId, "Declined");
    setDirectOffers((prev) =>
      prev.map((o) => (o.id === offerId ? savedOffer : o)),
    );
  };

  const requestVouch = async (contact: string, relation: string) => {
    // Simulated vouch request
    const notif: NotificationItem = {
      id: `vouch-${Date.now()}`,
      type: "vouch",
      title: "Vouch Request Sent",
      body: `Vouch invitation sent to ${contact} (${relation}).`,
      time: "Just now",
      unread: true,
      targetScreen: "community-vouching",
    };
    setNotifications([notif, ...notifications]);
  };

  const markNotificationRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n)),
    );
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const sendChatMessage = async (conversationId: string, text: string) => {
    if (!text.trim()) return;
    if (containsRestrictedContact(text)) {
      throw new Error(PLATFORM_CONTACT_BLOCK_MESSAGE);
    }
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: text.trim(),
      timestamp: "Just now",
      isMe: true,
    };

    await sendMessage(conversationId, text.trim()).catch(() => undefined);

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text.trim(),
            lastMessageTime: "Just now",
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      }),
    );
  };

  const startConversation = async (
    recipientName: string,
    companyName: string,
    jobContext: string,
    recipientEmail?: string,
  ) => {
    if (recipientEmail) {
      const remoteConversation = await createConversation({
        recipientEmail,
        recipientName,
        companyName,
        jobContext,
      });
      setConversations((previous) => [remoteConversation, ...previous]);
      return remoteConversation.id;
    }
    const conversationId = `conv-${Date.now()}`;
    const conversation: ConversationItem = {
      id: conversationId,
      employerName: recipientName,
      companyName,
      jobContext,
      lastMessage: "New conversation",
      lastMessageTime: "Just now",
      unreadCount: 0,
      isOnline: false,
      messages: [],
    };
    setConversations((previous) => [conversation, ...previous]);
    return conversationId;
  };

  const uploadVerificationDocument = async (
    docType: "id" | "certificate",
    documentUri: string,
  ) => {
    const data = await FileSystem.readAsStringAsync(documentUri, {
      encoding: "base64",
    });
    const fileName = documentUri.split("/").pop() || `${docType}.upload`;
    await uploadVerificationDocumentApi({
      documentType: docType,
      fileName,
      mimeType: fileName.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "image/jpeg",
      data,
    });
    if (docType === "id") {
      await updateProfile({
        idDocumentUploaded: true,
        idDocumentUri: documentUri,
        isVerified: false,
        verificationStatus: "In Review",
      });
    } else {
      await updateProfile({
        certificateUploaded: true,
        certificateDocumentUri: documentUri,
      });
    }
  };

  const visibleJobs = jobs.filter((job) => {
    if (!user || user.role !== "seeker" || skills.length === 0) return true;
    const aptitudeText = [
      user.headline,
      user.bio,
      ...skills.map((skill) => skill.name),
    ]
      .join(" ")
      .toLowerCase();
    const jobText = [
      job.title,
      job.category,
      job.description,
      ...job.skills,
      ...job.requirements,
    ]
      .join(" ")
      .toLowerCase();
    return (
      skills.some((skill) => jobText.includes(skill.name.toLowerCase())) ||
      aptitudeText
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3)
        .some((word) => jobText.includes(word))
    );
  });

  const logout = async () => {
    if (user?.email) {
      try {
        await saveAccountSnapshot(user.email);
      } catch (e) {
        console.error("Error saving account data:", e);
      }
    }
    setUserState(null);
    setSkills([]);
    setWorkHistory([]);
    setApplications([]);
    setDirectOffers([]);
    setSavedJobIds([]);
    setNotifications([]);
    setConversations([]);
    try {
      await AsyncStorage.multiRemove([
        "camwork_user",
        "camwork_token",
        "camwork_applications",
        "camwork_skills",
        "camwork_work_history",
        "camwork_saved_jobs",
      ]);
    } catch (e) {
      console.error("Error logging out:", e);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        skills,
        workHistory,
        reviews,
        applications,
        directOffers,
        savedJobIds,
        notifications,
        conversations,
        jobs: visibleJobs,
        createJob,
        updateJob,
        updateJobStatus,
        switchRole,
        startConversation,
        isLoading,
        setUser,
        updateProfile,
        addSkill,
        removeSkill,
        addWorkHistory,
        applyToJob,
        updateApplicationStatus,
        validateApplication,
        toggleSaveJob,
        acceptOffer,
        declineOffer,
        requestVouch,
        markNotificationRead,
        markAllNotificationsRead,
        sendChatMessage,
        uploadVerificationDocument,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
