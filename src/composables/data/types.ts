// /src/composables/data/types.ts

export type UseApplicationsParams = {
  storageKey?: string;
  historyStorageKey?: string;
};

export type UseVisitedSitesParams = {
  storageKey?: string;
  skipInitReset?: boolean;
};
