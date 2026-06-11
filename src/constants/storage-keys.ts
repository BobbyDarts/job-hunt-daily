// /src/constants/storage-keys.ts

const PREFIX = "job-hunt";
const TEST_PREFIX = `test-${PREFIX}`;

export const STORAGE_KEYS = {
  APP_MODE: `${PREFIX}-mode`,

  APPLICATIONS: `${PREFIX}-applications`,
  APPLICATIONS_HISTORY: `${PREFIX}-applications-history`,

  JOB_SITES: `${PREFIX}-job-sites`,

  VISITED_SITES: `${PREFIX}-visited`,
  VISITED_SITES_HISTORY: `${PREFIX}-visited-history`,
} as const;

export const TEST_STORAGE_KEYS = {
  APPLICATIONS: `${TEST_PREFIX}-applications`,
  APPLICATIONS_HISTORY: `${TEST_PREFIX}-applications-history`,

  JOB_SITES: `${TEST_PREFIX}-job-sites`,

  VISITED_SITES: `${TEST_PREFIX}-visited`,
  VISITED_SITES_HISTORY: `${TEST_PREFIX}-visited-history`,
} as const;
