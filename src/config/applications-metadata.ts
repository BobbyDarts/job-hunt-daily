// /src/config/applications-metadata.ts

import type { ApplicationStatus, ApplicationTag } from "@/types/applications";

// ------------------ STATUS ------------------

export interface ApplicationStatusInfo {
  label: string;
  color: string;
  description?: string;
  icon?: string;
  terminal?: boolean;
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
    label: "Offered",
    description: "Received an offer, considering next steps",
    color:
      "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-300",
  },
  accepted: {
    label: "Accepted",
    description: "You accepted their offer",
    color:
      "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300",
    terminal: true,
  },
  rejected: {
    label: "Rejected",
    description: "Application or interview rejected by the employer",
    color:
      "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-300",
    terminal: true,
  },
  withdrew: {
    label: "Withdrew",
    description: "You withdrew from the process",
    color:
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950/30 dark:text-gray-300",
    terminal: true,
  },
};

export const getStatusInfo = (
  status: ApplicationStatus,
): ApplicationStatusInfo => {
  return APPLICATION_STATUS_INFO[status];
};

export const getStatuses = () =>
  Object.entries(APPLICATION_STATUS_INFO).map(([status, info]) => ({
    status: status as ApplicationStatus,
    ...info,
  }));

// ------------------ TAGS ------------------

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

export const getTags = () =>
  Object.entries(APPLICATION_TAG_INFO).map(([tag, info]) => ({
    tag: tag as ApplicationTag,
    ...info,
  }));

export const getTagsGroupedByCategory = (): Record<
  ApplicationTagCategory,
  (ApplicationTagInfo & { tag: ApplicationTag })[]
> => {
  const grouped = {
    interview: [],
    action: [],
  } as Record<
    ApplicationTagCategory,
    (ApplicationTagInfo & { tag: ApplicationTag })[]
  >;

  getTags().forEach(tag => {
    grouped[tag.category].push(tag);
  });

  return grouped;
};
