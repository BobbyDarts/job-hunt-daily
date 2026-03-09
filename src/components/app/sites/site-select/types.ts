// /src/components/app/sites/site-select/types.ts
import type { JobSite } from "@/types";

export interface SiteWithCategory extends JobSite {
  category?: string;
}
