// /src/services/repositories/applications/local-applications-repository.ts

import { useLocalStorage } from "@vueuse/core";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { generateAppId } from "@/lib/generate-id";
import { getNow } from "@/lib/time";
import type {
  Application,
  ApplicationHistory,
  ApplicationCreateData,
  ApplicationUpdateData,
} from "@/types";

import type { ApplicationsRepository } from "./applications-repository";
import type { RepositoryState } from "./types";

type Params = {
  storageKey?: string;
  historyStorageKey?: string;
};

export function createLocalApplicationsRepository({
  storageKey = STORAGE_KEYS.APPLICATIONS,
  historyStorageKey = STORAGE_KEYS.APPLICATIONS_HISTORY,
}: Params = {}): ApplicationsRepository {
  // PRIVATE MEMBERS
  const applications = useLocalStorage<Application[]>(storageKey, [], {
    flush: "sync",
  });

  const applicationHistory = useLocalStorage<ApplicationHistory[]>(
    historyStorageKey,
    [],
    { flush: "sync" },
  );

  async function archive(
    app: Application,
    reason: "updated" | "deleted",
  ): Promise<void> {
    applicationHistory.value.push({
      ...app,
      id: generateAppId(),
      applicationId: app.id,
      historyTimestamp: getNow().toString(),
      reason,
    });

    return Promise.resolve();
  }

  // state hydration
  async function setState(state: RepositoryState): Promise<void> {
    applications.value = [...state.applications];
    applicationHistory.value = [...state.history];
  }

  // queries
  async function getAll(): Promise<Application[]> {
    return applications.value;
  }

  async function getById(id: string): Promise<Application | null> {
    return applications.value.find(a => a.id === id) ?? null;
  }

  async function getHistoryAll(): Promise<ApplicationHistory[]> {
    return applicationHistory.value;
  }

  async function getHistoryById(
    applicationId: string,
  ): Promise<ApplicationHistory[]> {
    return applicationHistory.value.filter(
      h => h.applicationId === applicationId,
    );
  }

  // mutations
  async function create(data: ApplicationCreateData): Promise<Application> {
    const now = getNow().toString();

    const application: Application = {
      ...data,
      id: generateAppId(),
      createdAt: now,
      updatedAt: now,
    };

    applications.value.push(application);

    return application;
  }

  async function update(
    id: string,
    updates: ApplicationUpdateData,
  ): Promise<Application> {
    const existing = await getById(id);
    if (!existing) throw new Error(`Application ${id} not found`);

    await archive(existing, "updated");

    const updated: Application = {
      ...existing,
      ...updates,
      updatedAt: getNow().toString(),
    };

    const index = applications.value.findIndex(a => a.id === id);
    applications.value[index] = updated;

    return updated;
  }

  async function remove(id: string): Promise<void> {
    const existing = await getById(id);
    if (!existing) throw new Error(`Application ${id} not found`);

    await archive(existing, "deleted");

    applications.value = applications.value.filter(a => a.id !== id);
  }

  return {
    // state hydration
    setState,

    // queries
    getAll,
    getById,

    getHistoryAll,
    getHistoryById,

    // mutations
    create,
    update,
    remove,
  };
}
