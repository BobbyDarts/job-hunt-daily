// /src/lib/application-utils.ts

import type { Application, ApplicationTag, ATSType } from "@/types";

interface ApplicationFormData {
  company: string;
  position: string;
  jobPostingUrl: string;
  notes: string;
  tags: ApplicationTag[];
}

interface ApplicationContext {
  jobSiteId: string;
  jobSiteUrl: string;
  atsType?: ATSType;
  appliedDate: string;
  status: "applied";
}

export function buildApplicationPayload(
  formData: ApplicationFormData,
  context: ApplicationContext,
): Omit<Application, "id" | "createdAt" | "updatedAt"> {
  return {
    ...context,
    company: formData.company.trim(),
    position: formData.position.trim(),
    jobPostingUrl: formData.jobPostingUrl.trim() || undefined,
    notes: formData.notes.trim() || undefined,
    tags: formData.tags.length > 0 ? [...formData.tags] : undefined,
  };
}
