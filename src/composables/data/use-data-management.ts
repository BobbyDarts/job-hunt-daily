// /src/composables/data/use-data-management.ts

import { toast } from "vue-sonner";

import { getNow } from "@/lib/time";
import type { Application, ApplicationHistory, VisitedSites } from "@/types";

import {
  APPLICATIONS_STORAGE_KEY,
  APPLICATIONS_HISTORY_STORAGE_KEY,
  VISITED_SITES_STORAGE_KEY,
} from "./keys";
import { useApplicationsRepository } from "./use-applications-repository";
import { useVisitedSitesRepository } from "./use-visited-sites-repository";

interface ExportData {
  version: string;
  exportedAt: string;
  dailyChecklist: VisitedSites;
  applications: Application[];
  applicationHistory: ApplicationHistory[];
}

export type UseDataManagementParams = {
  applicationStorageKey?: string;
  applicationHistoryStorageKey?: string;
  visitedSitesStorageKey?: string;
};

export function useDataManagement(params: UseDataManagementParams = {}) {
  const {
    applicationStorageKey = APPLICATIONS_STORAGE_KEY,
    applicationHistoryStorageKey = APPLICATIONS_HISTORY_STORAGE_KEY,
    visitedSitesStorageKey = VISITED_SITES_STORAGE_KEY,
  } = params;

  const appRepo = useApplicationsRepository({
    storageKey: applicationStorageKey,
    historyStorageKey: applicationHistoryStorageKey,
  });

  const visitedRepo = useVisitedSitesRepository({
    storageKey: visitedSitesStorageKey,
    skipInitReset: true,
  });

  const exportAllData = async (): Promise<void> => {
    const data: ExportData = {
      applications: await appRepo.getAll(),
      applicationHistory: await appRepo.getAllHistory(),
      dailyChecklist: await visitedRepo.serialize(),
      exportedAt: getNow().toString(),
      version: "1.1",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-hunt-backup-${getNow().epochMilliseconds}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  function parseImportData(raw: string): ExportData {
    const data: ExportData = JSON.parse(raw);

    if (data.version !== "1.1") {
      throw new Error(`Unsupported version: ${data.version}`);
    }

    if (!data.dailyChecklist) {
      throw new Error("Missing dailyChecklist");
    }

    if (!data.applications || !Array.isArray(data.applications)) {
      throw new Error("Missing or invalid applications");
    }

    if (data.applicationHistory && !Array.isArray(data.applicationHistory)) {
      throw new Error("Invalid application history");
    }

    return data;
  }

  const importAllData = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const data = parseImportData(text);

      await visitedRepo.hydrate(data.dailyChecklist);
      await appRepo.setAll(data.applications, data.applicationHistory ?? []);

      toast.success("Data imported successfully");
    } catch (error) {
      toast.error("Failed to import data. Invalid file format.");
      throw error;
    }
  };

  const triggerImport = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.onchange = async () => {
      if (fileInput.files?.[0]) {
        await importAllData(fileInput.files[0]);
      }
    };
    fileInput.click();
  };

  return {
    exportAllData,
    importAllData,
    triggerImport,
  };
}
