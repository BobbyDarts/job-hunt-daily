// /src/composables/data/use-applications-repository.ts

import { useLocalStorage } from "@vueuse/core";

import { getNow } from "@/lib/time";
import type { Application, ApplicationHistory } from "@/types";

import {
  APPLICATIONS_HISTORY_STORAGE_KEY,
  APPLICATIONS_STORAGE_KEY,
} from "./keys";
import type { UseApplicationsParams } from "./types";

export function useApplicationsRepository(params: UseApplicationsParams = {}) {
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

  /**
   * Helpers
   */

  // Helper to generate unique ID
  const generateId = (): string => {
    return `app_${getNow().epochMilliseconds}_${Math.random().toString(36).substring(2, 9)}`;
  };

  // Helper — finds app and snapshots to history, returns index
  async function snapshotToHistory(
    id: string,
    reason: "updated" | "deleted",
  ): Promise<number> {
    const index = applications.value.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Application ${id} not found`);

    const currentApp = applications.value[index];
    applicationHistory.value = [
      ...applicationHistory.value,
      {
        ...currentApp,
        id: generateId(),
        applicationId: currentApp.id,
        historyTimestamp: getNow().toString(),
        reason,
      },
    ];

    return index;
  }

  /**
   * CRUD
   */
  async function getAll(): Promise<Application[]> {
    return applications.value;
  }

  async function setAll(
    apps: Application[],
    history: ApplicationHistory[],
  ): Promise<void> {
    applications.value = apps;
    applicationHistory.value = history;
  }

  async function getById(id: string): Promise<Application | null> {
    return applications.value.find(a => a.id === id) ?? null;
  }

  async function create(
    data: Omit<Application, "id" | "createdAt" | "updatedAt">,
  ): Promise<Application> {
    const now = getNow().toString();
    const application: Application = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    applications.value = [...applications.value, application];
    return application;
  }

  async function update(
    id: string,
    updates: Partial<Omit<Application, "id" | "createdAt">>,
  ): Promise<Application> {
    const index = await snapshotToHistory(id, "updated");

    const updatedApplication: Application = {
      ...applications.value[index],
      ...updates,
      updatedAt: getNow().toString(),
    };
    applications.value = applications.value.with(index, updatedApplication);

    return updatedApplication;
  }

  async function remove(id: string): Promise<void> {
    const index = await snapshotToHistory(id, "deleted");
    applications.value = applications.value.filter((_, i) => i !== index);
  }

  async function getAllHistory(): Promise<ApplicationHistory[]> {
    return applicationHistory.value;
  }

  async function getHistory(
    applicationId: string,
  ): Promise<ApplicationHistory[]> {
    return applicationHistory.value.filter(
      a => a.applicationId === applicationId,
    );
  }

  return {
    applications,
    applicationHistory,
    getAll,
    setAll,
    getById,
    create,
    update,
    remove,
    getAllHistory,
    getHistory,
  };
}
