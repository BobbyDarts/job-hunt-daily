export type ATSType =
  | "workday"
  | "greenhouse"
  | "lever"
  | "bamboohr"
  | "polymer"
  | "custom";

export interface JobSite {
  name: string;
  url: string;
  atsType?: ATSType;
}

export interface JobCategory {
  name: string;
  sites: JobSite[];
}

export interface JobHuntData {
  categories: JobCategory[];
}

export interface VisitedSites {
  date: string;
  visited: string[]; // array of site URLs
}
