// /src/composables/data/use-applications.ts

import { computed, ref } from "vue";

import { compareInstants } from "@/lib/time";
import { getApplicationsRepository } from "@/services/repositories/applications";
import type {
  Application,
  ApplicationHistory,
  ApplicationCreateData,
  ApplicationUpdateData,
  ApplicationStatus,
  ApplicationTag,
} from "@/types";

// singleton state
const applications = ref<Application[]>([]);
const applicationHistory = ref<ApplicationHistory[]>([]);
const initialized = ref(false);

export function useApplications() {
  async function refresh(): Promise<void> {
    const repo = getApplicationsRepository();
    const [apps, history] = await Promise.all([
      repo.getAll(),
      repo.getHistoryAll(),
    ]);
    applications.value = apps;
    applicationHistory.value = history;
  }

  async function init(): Promise<void> {
    await refresh();
    initialized.value = true;
  }

  function assertInitialized() {
    if (!initialized.value) {
      throw new Error("useApplications not initialized. Call init() first.");
    }
  }

  async function createApplication(
    data: ApplicationCreateData,
  ): Promise<Application> {
    const repo = getApplicationsRepository();
    const created = await repo.create(data);
    await refresh();
    return getApplication(created.id)!;
  }

  async function updateApplication(
    id: string,
    updates: ApplicationUpdateData,
  ): Promise<Application | undefined> {
    try {
      const repo = getApplicationsRepository();
      const updated = await repo.update(id, updates);
      await refresh();
      return getApplication(updated.id);
    } catch {
      return undefined;
    }
  }

  async function removeApplication(id: string): Promise<boolean> {
    try {
      const repo = getApplicationsRepository();
      await repo.remove(id);
      await refresh();
      return !applications.value.some(a => a.id === id);
    } catch {
      return false;
    }
  }

  function getApplication(id: string): Application | undefined {
    assertInitialized();
    return applications.value.find(app => app.id === id);
  }

  function getApplicationTimeline(
    appId: string,
  ): (Application | ApplicationHistory)[] {
    assertInitialized();
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
  }

  function getStatusChanges(appId: string) {
    assertInitialized();
    const timeline = getApplicationTimeline(appId);
    const changes: Array<{
      from: ApplicationStatus;
      to: ApplicationStatus;
      timestamp: string;
    }> = [];

    for (let i = 1; i < timeline.length; i++) {
      const prev = timeline[i - 1];
      const curr = timeline[i];
      if (curr.status !== prev.status) {
        changes.push({
          from: prev.status,
          to: curr.status,
          timestamp:
            "historyTimestamp" in curr ? curr.historyTimestamp : curr.updatedAt,
        });
      }
    }

    return changes;
  }

  const totalCount = computed(() => applications.value.length);

  const countByStatus = computed(() => {
    const counts: Partial<Record<ApplicationStatus, number>> = {};
    for (const app of applications.value) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }
    return counts;
  });

  function filterByStatus(status: ApplicationStatus): Application[] {
    return applications.value.filter(a => a.status === status);
  }

  function filterByTag(tag: ApplicationTag): Application[] {
    return applications.value.filter(a => a.tags?.includes(tag));
  }

  function search(query: string): Application[] {
    const q = query.toLowerCase();
    return applications.value.filter(
      a =>
        a.company.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q),
    );
  }

  return {
    refresh,
    applications,
    applicationHistory,
    initialized,
    init,
    createApplication,
    updateApplication,
    removeApplication,
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
