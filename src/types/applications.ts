// /src/types/applications.ts

import type { ATSType } from "./ats";

export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "accepted"
  | "withdrew";

export interface ApplicationStatusInfo {
  label: string;
  color: string;
  description?: string;
  icon?: string; // lucide icon name
}

const APPLICATION_STATUS_INFO: Record<
  ApplicationStatus,
  ApplicationStatusInfo
> = {
  applied: {
    label: "Applied",
    description: "Application submitted, awaiting response",
    color:
      "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300",
  },
  interviewing: {
    label: "Interviewing",
    description: "Currently in the interview process",
    color:
      "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-300",
  },
  offer: {
    label: "Offer Received",
    description: "Received an offer, considering next steps",
    color:
      "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-300",
  },
  accepted: {
    label: "Accepted",
    description: "You accepted their offer",
    color:
      "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  rejected: {
    label: "Rejected",
    description: "Application or interview rejected by the employer",
    color:
      "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-300",
  },
  withdrew: {
    label: "Withdrew",
    description: "You withdrew from the process",
    color:
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950/30 dark:text-gray-300",
  },
};

export const getStatusInfo = (
  status: ApplicationStatus,
): ApplicationStatusInfo => {
  return APPLICATION_STATUS_INFO[status];
};

type StatusWithKey = ApplicationStatusInfo & {
  status: ApplicationStatus;
};

export const getStatuses = (): StatusWithKey[] =>
  (
    Object.entries(APPLICATION_STATUS_INFO) as [
      ApplicationStatus,
      ApplicationStatusInfo,
    ][]
  ).map(([status, info]) => ({
    status,
    ...info,
  }));

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

export type ApplicationTagCategory = "interview" | "action";

export interface ApplicationTagInfo {
  label: string;
  color: string;
  description?: string;
  category: ApplicationTagCategory;
}

const APPLICATION_TAG_INFO: Record<ApplicationTag, ApplicationTagInfo> = {
  // Interview format
  virtual: {
    label: "Virtual",
    description: "Interview conducted remotely",
    color:
      "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700",
    category: "interview",
  },
  onsite: {
    label: "On-site",
    description: "Interview conducted in person",
    color:
      "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-700",
    category: "interview",
  },

  // Interview type
  technical: {
    label: "Technical",
    description: "Technical assessment or coding interview",
    color:
      "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-700",
    category: "interview",
  },
  behavioral: {
    label: "Behavioral",
    description: "Behavioral or culture fit interview",
    color:
      "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-700",
    category: "interview",
  },

  // Action needed
  follow_up_needed: {
    label: "Follow Up",
    description: "Follow up with the employer",
    color:
      "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-700",
    category: "action",
  },
  offer_negotiation: {
    label: "Negotiation",
    description: "Offer received and under negotiation",
    color:
      "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-700",
    category: "action",
  },
};

export const getTagInfo = (tag: ApplicationTag): ApplicationTagInfo => {
  return APPLICATION_TAG_INFO[tag];
};

type TagWithKey = ApplicationTagInfo & {
  tag: ApplicationTag;
};

export const getTags = (): TagWithKey[] =>
  (
    Object.entries(APPLICATION_TAG_INFO) as [
      ApplicationTag,
      ApplicationTagInfo,
    ][]
  ).map(([tag, info]) => ({
    tag,
    ...info,
  }));

type TagCategory = ApplicationTagInfo["category"];

export const getTagsGroupedByCategory = (): Record<
  TagCategory,
  TagWithKey[]
> => {
  const grouped: Record<TagCategory, TagWithKey[]> = {
    interview: [],
    action: [],
  };

  getTags().forEach(tag => {
    grouped[tag.category].push(tag);
  });

  return grouped;
};

export interface Application {
  id: string;
  company: string;
  position: string;
  jobSiteId: string; // NEW: Reference to JobSite.id
  jobSiteUrl: string; // DEPRECATED: Keep for backwards compatibility, remove later
  atsType?: ATSType;
  jobPostingUrl?: string; // Actual job posting
  appliedDate: string; // defaults to today
  status: ApplicationStatus; // defaults to "applied"
  tags?: ApplicationTag[];
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationHistory extends Omit<Application, "id"> {
  historyTimestamp: string;
  applicationId: string; // Points to the original application
  id: string; // Unique ID for this history record
}
