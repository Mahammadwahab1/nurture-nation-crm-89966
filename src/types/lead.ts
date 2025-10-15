import { LeadStage } from '@/constants/leadStages';

export interface Lead {
  id: string;
  uid: string; // External UID
  name: string;
  email: string;
  phone: string;
  country: string;
  intake: string;
  source: string;
  stage: LeadStage;
  counselorId?: string;
  counselorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  leadId: string;
  taskType: string;
  callStatus?: string;
  connectStatus?: string;
  notInterestedReason?: string;
  trackingStatus?: string;
  followUpDate?: string;
  remarks?: string;
  createdBy: string;
  createdAt: string;
}

export interface StageHistory {
  id: string;
  leadId: string;
  fromStage: string;
  toStage: string;
  changedBy: string;
  changedAt: string;
}

export interface Remark {
  id: string;
  leadId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface UniversityApplication {
  id: string;
  leadId: string;
  universityName: string;
  program: string;
  status: string;
  createdAt: string;
}

export interface Document {
  id: string;
  leadId: string;
  documentType: string;
  link: string;
  uploadedBy: string;
  uploadedAt: string;
}

export const DOCUMENT_TYPES = [
  'Passport',
  'Birth Certificate',
  'Academic Transcripts',
  'Degree Certificate',
  'English Test Results',
  'Resume/CV',
  'Statement of Purpose',
  'Recommendation Letters',
  'Bank Statements',
  'Work Experience Letters',
  'Medical Certificate',
  'Police Clearance',
  'Visa Application Form',
  'Other Documents'
] as const;
