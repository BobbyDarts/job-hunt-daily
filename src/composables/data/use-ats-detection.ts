// /src/composables/data/use-ats-detection.ts

import type { ATSInfo } from "@/lib/ats-detection";
import { getATSInfo, getATSType } from "@/lib/ats-detection";
import type { JobSite } from "@/types";

/**
 * useATSDetection composable
 * Returns helper functions: getATS(site) and isATS(site)
 * Now directly calls getATSType instead of using a pre-computed map
 * to ensure it always works with the latest site data
 */
export function useATSDetection() {
  /** Return ATSInfo for a site, or undefined */
  const getATS = (site: JobSite): ATSInfo | undefined => {
    const type = getATSType(site);
    return type ? getATSInfo(type) : undefined;
  };

  /** Boolean helper: is this site backed by an ATS? */
  const isATS = (site: JobSite): boolean => {
    return !!getATSType(site);
  };

  return { getATS, isATS };
}
