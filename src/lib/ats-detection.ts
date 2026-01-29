import type { ATSType, JobSite } from "@/types";

export type ATSInfo = {
  type: ATSType;
  patterns: string[];
  initials: string;
  classes: string;
};

export const ATS_TABLE: ATSInfo[] = [
  {
    type: "workday",
    patterns: ["myworkdayjobs.com", "wd1.", "wd5."],
    initials: "WD",
    classes:
      "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300",
  },
  {
    type: "greenhouse",
    patterns: ["greenhouse.io"],
    initials: "GH",
    classes:
      "border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-300",
  },
  {
    type: "lever",
    patterns: ["lever.co"],
    initials: "LV",
    classes:
      "border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-300",
  },
  {
    type: "bamboohr",
    patterns: ["bamboohr.com"],
    initials: "BH",
    classes:
      "border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-300",
  },
  {
    type: "custom",
    patterns: [],
    initials: "CT",
    classes:
      "border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-950/30 dark:text-gray-300",
  },
];

export function detectATS(url: string): ATSType | undefined {
  const urlLower = url.toLowerCase();

  for (const ats of ATS_TABLE) {
    if (ats.patterns.some(pattern => urlLower.includes(pattern))) {
      return ats.type;
    }
  }
  return;
}

export const getATSType = (site: JobSite): ATSType | undefined =>
  site.atsType ?? detectATS(site.url);

export const getATSInfo = (atsType: ATSType | undefined): ATSInfo | undefined =>
  ATS_TABLE.find(a => a.type === atsType);

export const getATSClasses = (atsType: ATSType | undefined): string =>
  getATSInfo(atsType)?.classes ?? "border-muted-foreground";

export const getATSInitials = (atsType: ATSType | undefined): string =>
  getATSInfo(atsType)?.initials ??
  (atsType ? atsType.substring(0, 2).toUpperCase() : "");
