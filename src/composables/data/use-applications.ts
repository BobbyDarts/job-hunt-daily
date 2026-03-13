// /src/composables/data/use-applications.ts

import { computed } from "vue";

import { compareInstants } from "@/lib/time";
import type {
  Application,
  ApplicationHistory,
  ApplicationStatus,
  ApplicationTag,
} from "@/types";

import type { UseApplicationsParams } from "./types";
import { useApplicationsRepository } from "./use-applications-repository";

export function useApplications(params: UseApplicationsParams = {}) {
  const repo = useApplicationsRepository(params);
  const applications = repo.applications;
  const applicationHistory = repo.applicationHistory;

  const addApplication = async (
    data: Omit<Application, "id" | "createdAt" | "updatedAt">,
  ): Promise<Application> => {
    if (!data.company?.trim()) throw new Error("Company name is required");
    if (!data.position?.trim()) throw new Error("Position is required");
    if (!data.jobSiteUrl?.trim()) throw new Error("Job site URL is required");

    const application = await repo.create(data);
    return application;
  };

  const updateApplication = async (
    id: string,
    updates: Partial<Omit<Application, "id" | "createdAt">>,
  ): Promise<Application | undefined> => {
    try {
      const updated = await repo.update(id, updates);
      return updated;
    } catch {
      return undefined;
    }
  };

  const deleteApplication = async (id: string): Promise<boolean> => {
    try {
      await repo.remove(id);
      return true;
    } catch {
      return false;
    }
  };

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

  const totalCount = computed(() => applications.value.length);

  const countByStatus = computed(() => {
    const counts: Partial<Record<ApplicationStatus, number>> = {};
    applications.value.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  });

  const filterByStatus = (status: ApplicationStatus): Application[] => {
    return applications.value.filter(app => app.status === status);
  };

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
    applications,
    applicationHistory,
    addApplication,
    updateApplication,
    deleteApplication,
    getApplication,
    getApplicationTimeline,
    getStatusChanges,
    totalCount,
    countByStatus,
    filterByStatus,
    filterByTag,
    search,
  };
}
