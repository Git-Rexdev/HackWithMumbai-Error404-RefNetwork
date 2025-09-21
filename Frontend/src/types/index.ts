export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'fresher' | 'employee' | 'admin';
  isVerified: boolean;
  createdAt: string;
  resume?: string;
  phone?: string;
  location?: string;
  company?: string;
  bio?: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  deadline: string;
  skills: string[];
  url?: string;
  createdBy: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Referral {
  _id: string;
  job: Job;
  candidate?: User;
  candidateName?: string;
  candidateEmail?: string;
  fullName: string;
  coverLetter?: string;
  whyBetter: string;
  notes?: string;
  referredBy?: string;
  resumeFileName: string;
  resumePath: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  message: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'fresher' | 'employee';
}

export interface JobApplication {
  jobId: string;
  fullName: string;
  coverLetter?: string;
  whyBetter: string;
  resume: File;
}

export interface CreateJobData {
  title: string;
  company: string;
  description: string;
  location?: string;
  deadline: string;
  skills: string[];
  url?: string;
}

export interface CreateReferralData {
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  notes?: string;
  resume: File;
}

export interface OTPData {
  email: string;
  otp: string;
}

export interface ChatMessage {
  receiverId: string;
  message: string;
}

export interface AdminLogs {
  users: User[];
  jobs: Job[];
  referrals: Referral[];
}
