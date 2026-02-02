import type { ATSInfo } from "@/lib/ats-detection";
import { getATSInfo, getATSType } from "@/lib/ats-detection";
import type { JobHuntData, JobSite } from "@/types";

/**
 * useATSDetection composable
 * Build a map of site URLs -> ATS info for fast lookup
 * Returns helper functions: getATS(site) and isATS(site)
 */
export function useATSDetection(data: JobHuntData) {
  // Precompute map URL -> ATSInfo | undefined
  const atsMap = new Map<string, ATSInfo | undefined>();

  data.categories.forEach(category => {
    category.sites.forEach(site => {
      const type = getATSType(site);
      atsMap.set(site.url, type ? getATSInfo(type) : undefined);
    });
  });

  /** Return ATSInfo for a site, or undefined */
  const getATS = (site: JobSite): ATSInfo | undefined => {
    return atsMap.get(site.url);
  };

  /** Boolean helper: is this site backed by an ATS? */
  const isATS = (site: JobSite): boolean => {
    return !!atsMap.get(site.url);
  };

  return { getATS, isATS, atsMap };
}
