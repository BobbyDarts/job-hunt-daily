// /src/composables/data/use-data-management.ts

import { toast } from "vue-sonner";

import {
  APPLICATIONS_STORAGE_KEY,
  APPLICATIONS_HISTORY_STORAGE_KEY,
  VISITED_SITES_STORAGE_KEY,
} from "@/composables/keys";
import { getNow } from "@/lib/time";
import type { Application, ApplicationHistory, VisitedSites } from "@/types";

import { useApplications } from "./use-applications";
import { useVisitedSites } from "./use-visited-sites";

export interface ExportData {
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

  const { applications, applicationHistory } = useApplications({
    storageKey: applicationStorageKey,
    historyStorageKey: applicationHistoryStorageKey,
  });

  const { serialize, hydrate } = useVisitedSites({
    storageKey: visitedSitesStorageKey,
    skipInitReset: true,
  });

  const exportAllData = (): void => {
    const data: ExportData = {
      applications: applications.value,
      applicationHistory: applicationHistory.value,
      dailyChecklist: serialize(),
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

      hydrate(data.dailyChecklist);
      applications.value = data.applications;
      applicationHistory.value = data.applicationHistory ?? [];

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
