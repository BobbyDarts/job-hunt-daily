// /src/types/applications.ts

import type { ATSType } from "@/types";

export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "accepted"
  | "withdrew";

export type ApplicationTag =
  // Interview format
  | "virtual"
  | "onsite"

  // Interview type
  | "technical"
  | "behavioral"

  // Action needed
  | "follow_up_needed"
  | "offer_negotiation";

export interface Application {
  id: string;
  company: string;
  position: string;
  jobSiteId: string;
  jobSiteUrl: string; // DEPRECATED: Keep for backwards compatibility
  atsType?: ATSType;
  jobPostingUrl?: string;
  appliedDate: string;
  status: ApplicationStatus;
  tags?: ApplicationTag[];
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationCreateData = Omit<
  Application,
  "id" | "createdAt" | "updatedAt"
>;

export type ApplicationUpdateData = Partial<
  Omit<Application, "id" | "createdAt">
>;

export interface ApplicationDb {
  id: string;
  user_id: string;
  company: string;
  position: string;
  job_site_id: string;
  job_site_url: string; // DEPRECATED: Keep for backwards compatibility
  ats_type?: ATSType;
  job_posting_url?: string;
  applied_date: string;
  status: ApplicationStatus;
  tags?: ApplicationTag[];
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationHistory extends Omit<Application, "id"> {
  historyTimestamp: string;
  applicationId: string;
  id: string;
  reason: "updated" | "deleted";
}

export interface ApplicationHistoryDb extends Omit<ApplicationDb, "id"> {
  id: string;
  history_timestamp: string;
  application_id: string;
  reason: "updated" | "deleted";
}
