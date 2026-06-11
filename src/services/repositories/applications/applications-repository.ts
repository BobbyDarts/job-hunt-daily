// /src/services/repositories/applications/applications-repository.ts

import type {
  Application,
  ApplicationCreateData,
  ApplicationUpdateData,
  ApplicationHistory,
} from "@/types/applications";

import type { RepositoryState } from "./types";

export interface ApplicationsRepository {
  // state hydration
  setState(state: RepositoryState): Promise<void>;

  // queries
  getAll(): Promise<Application[]>;
  getById(id: string): Promise<Application | null>;

  getHistoryAll(): Promise<ApplicationHistory[]>;
  getHistoryById(applicationId: string): Promise<ApplicationHistory[]>;

  // mutations
  create(data: ApplicationCreateData): Promise<Application>;
  update(id: string, updates: ApplicationUpdateData): Promise<Application>;
  remove(id: string): Promise<void>;
}
