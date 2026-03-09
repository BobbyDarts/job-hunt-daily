// /src/composables/data/use-applications.ts

import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";

import {
  APPLICATIONS_HISTORY_STORAGE_KEY,
  APPLICATIONS_STORAGE_KEY,
} from "@/composables/keys";
import { compareInstants, getNow } from "@/lib/time";
import type {
  Application,
  ApplicationHistory,
  ApplicationStatus,
  ApplicationTag,
} from "@/types";

type UseApplicationsParams = {
  storageKey?: string;
  historyStorageKey?: string;
};

export function useApplications(params: UseApplicationsParams = {}) {
  const {
    storageKey = APPLICATIONS_STORAGE_KEY,
    historyStorageKey = APPLICATIONS_HISTORY_STORAGE_KEY,
  } = params;

  const applications = useLocalStorage<Application[]>(storageKey, [], {
    flush: "sync",
  });

  const applicationHistory = useLocalStorage<ApplicationHistory[]>(
    historyStorageKey,
    [],
    {
      flush: "sync",
    },
  );

  // Helper to generate unique ID
  const generateId = (): string => {
    return `app_${getNow().epochMilliseconds}_${Math.random().toString(36).substring(2, 9)}`;
  };

  // Create a new application
  const addApplication = (
    data: Omit<Application, "id" | "createdAt" | "updatedAt">,
  ): Application => {
    // Validation
    if (!data.company?.trim()) {
      throw new Error("Company name is required");
    }
    if (!data.position?.trim()) {
      throw new Error("Position is required");
    }
    if (!data.jobSiteUrl?.trim()) {
      throw new Error("Job site URL is required");
    }

    const newApplication: Application = {
      ...data,
      id: generateId(),
      createdAt: getNow().toString(),
      updatedAt: getNow().toString(),
    };

    applications.value = [...applications.value, newApplication];
    return newApplication;
  };

  // Update an existing application
  const updateApplication = (
    id: string,
    updates: Partial<Omit<Application, "id" | "createdAt">>,
  ): Application | undefined => {
    const index = applications.value.findIndex(app => app.id === id);
    if (index === -1) return undefined;

    const currentApp = applications.value[index];

    // Save current state to history BEFORE updating
    const snapshot: ApplicationHistory = {
      ...currentApp,
      id: generateId(), // Unique ID for this history record
      applicationId: currentApp.id, // Reference to original application
      historyTimestamp: getNow().toString(),
    };
    applicationHistory.value = [...applicationHistory.value, snapshot];

    const updatedApplication: Application = {
      ...currentApp,
      ...updates,
      updatedAt: getNow().toString(),
    };

    applications.value = [
      ...applications.value.slice(0, index),
      updatedApplication,
      ...applications.value.slice(index + 1),
    ];

    return updatedApplication;
  };

  // Delete an application
  const deleteApplication = (id: string): boolean => {
    const initialLength = applications.value.length;
    applications.value = applications.value.filter(app => app.id !== id);
    return applications.value.length < initialLength;
  };

  // Get a single application by ID
  const getApplication = (id: string): Application | undefined => {
    return applications.value.find(app => app.id === id);
  };

  const getApplicationTimeline = (
    appId: string,
  ): (Application | ApplicationHistory)[] => {
    const history = applicationHistory.value
      .filter(h => h.applicationId === appId)
      .sort((a, b) =>
        compareInstants(
          a.historyTimestamp ?? a.updatedAt,
          b.historyTimestamp ?? b.updatedAt,
        ),
      );

    const current = applications.value.find(a => a.id === appId);
    return current ? [...history, current] : history;
  };

  const getStatusChanges = (appId: string) => {
    const timeline = getApplicationTimeline(appId);
    const changes: {
      from: ApplicationStatus;
      to: ApplicationStatus;
      timestamp: string;
    }[] = [];

    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].status !== timeline[i - 1].status) {
        const current = timeline[i];
        changes.push({
          from: timeline[i - 1].status,
          to: timeline[i].status,
          timestamp:
            "historyTimestamp" in current
              ? current.historyTimestamp
              : current.updatedAt,
        });
      }
    }

    return changes;
  };

  // Computed: Total count
  const totalCount = computed(() => applications.value.length);

  // Computed: Count by status
  const countByStatus = computed(() => {
    const counts: Partial<Record<ApplicationStatus, number>> = {};
    applications.value.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  });

  // Filter by status
  const filterByStatus = (status: ApplicationStatus): Application[] => {
    return applications.value.filter(app => app.status === status);
  };

  // Filter by tag
  const filterByTag = (tag: ApplicationTag): Application[] => {
    return applications.value.filter(app => app.tags?.includes(tag));
  };

  // Search by company or position
  const search = (query: string): Application[] => {
    const lowerQuery = query.toLowerCase();
    return applications.value.filter(
      app =>
        app.company.toLowerCase().includes(lowerQuery) ||
        app.position.toLowerCase().includes(lowerQuery),
    );
  };

  return {
    // State
    applications,
    applicationHistory,

    // CRUD
    addApplication,
    updateApplication,
    deleteApplication,
    getApplication,

    // History
    getApplicationTimeline,
    getStatusChanges,

    // Computed
    totalCount,
    countByStatus,

    // Filters
    filterByStatus,
    filterByTag,
    search,
  };
}
