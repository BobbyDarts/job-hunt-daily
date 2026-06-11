// /src/services/repositories/applications/types.ts

import type { Application, ApplicationHistory } from "@/types/applications";

export type RepositoryState = {
  applications: Application[];
  history: ApplicationHistory[];
};
