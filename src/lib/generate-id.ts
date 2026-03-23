// /src/lib/generate-id.ts

/**
 * Generates a unique, readable ID for a job site.
 * Format: {ats}-{name-slug} if ATS type is known,
 *         {name-slug} if name and domain are related,
 *         {domain}-{name-slug} otherwise.
 *
 * Examples:
 * - greenhouse-greenhouse-company  (atsType present)
 * - linkedin                       (name contains domain)
 * - dataman                        (domain contains name)
 * - ycombinator-hacker-news-who-is-hiring (no relation)
 */
export function generateSiteId(
  name: string,
  url: string,
  atsType?: string,
): string {
  let domain: string;
  try {
    domain = new URL(url).hostname.split(".").at(-2) ?? "";
  } catch {
    domain = "";
  }

  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const domainSlug = domain.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Strip hyphens before comparing to handle "robert-half" vs "roberthalf"
  const nameNormalized = nameSlug.replace(/-/g, "");
  const domainNormalized = domainSlug.replace(/-/g, "");
  const nameContainsDomain =
    nameNormalized.includes(domainNormalized) ||
    domainNormalized.includes(nameNormalized);

  if (atsType && nameSlug) {
    return `${atsType}-${nameSlug}`;
  } else if (atsType) {
    return atsType;
  } else if (nameContainsDomain || !domain) {
    return nameSlug || "unknown";
  } else {
    return `${domain}-${nameSlug}`;
  }
}

/**
 * Generates a unique, readable ID for a job category.
 * Format: {name-slug}
 *
 * Examples:
 * - general-job-boards
 * - tech-startup-boards
 */
export function generateCategoryId(
  name: string,
  existingIds: Set<string> = new Set(),
): string {
  const baseId =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown";

  if (!existingIds.has(baseId)) return baseId;

  let counter = 1;
  while (existingIds.has(`${baseId}-${counter}`)) {
    counter++;
  }
  return `${baseId}-${counter}`;
}

/**
 * Ensures unique site IDs across a collection, appending numbers on collision.
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

    while (usedIds.has(finalId)) {
      finalId = `${baseId}-${counter}`;
      counter++;
    }

    usedIds.add(finalId);
    idMap.set(site.url, finalId);
  });

  return idMap;
}
