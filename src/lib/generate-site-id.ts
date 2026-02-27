// /src/lib/generate-site-id.ts

/**
 * Generates a unique, readable ID for a job site
 * Format: {ats}-{company-slug}
 *
 * Examples:
 * - workday-duke-health
 * - greenhouse-anthropic
 * - lever-stripe
 * - indeed (for sites without ATS)
 */
export function generateSiteId(
  name: string,
  url: string,
  atsType?: string,
): string {
  // Extract domain for uniqueness if needed
  let domain: string;
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname.split(".")[0];
  } catch {
    domain = "";
  }

  // Slugify the name
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // Build the ID
  if (atsType && nameSlug) {
    return `${atsType}-${nameSlug}`;
  } else if (atsType) {
    return atsType;
  } else if (domain && nameSlug) {
    return `${domain}-${nameSlug}`;
  } else if (domain) {
    return domain;
  } else {
    return nameSlug || "unknown";
  }
}

/**
 * Generates IDs for all sites in the job hunt data
 * Ensures uniqueness by appending numbers if needed
 */
export function ensureUniqueSiteIds(
  sites: Array<{ name: string; url: string; atsType?: string }>,
): Map<string, string> {
  const idMap = new Map<string, string>(); // url -> id
  const usedIds = new Set<string>();

  sites.forEach(site => {
    const baseId = generateSiteId(site.name, site.url, site.atsType);
    let finalId = baseId;
    let counter = 1;

    // Handle collisions by appending numbers
    while (usedIds.has(finalId)) {
      finalId = `${baseId}-${counter}`;
      counter++;
    }

    usedIds.add(finalId);
    idMap.set(site.url, finalId);
  });

  return idMap;
}
