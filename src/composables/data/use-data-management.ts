// /src/composables/data/use-data-management.ts

import { toast } from "vue-sonner";

import { getNow } from "@/lib/time";
import type {
  Application,
  ApplicationHistory,
  VisitedSites,
  JobHuntData,
} from "@/types";

import {
  APPLICATIONS_STORAGE_KEY,
  APPLICATIONS_HISTORY_STORAGE_KEY,
  VISITED_SITES_STORAGE_KEY,
  JOB_SITES_STORAGE_KEY,
} from "./keys";
import { useApplicationsRepository } from "./use-applications-repository";
import { useJobSitesRepository } from "./use-job-sites-repository";
import { useVisitedSitesRepository } from "./use-visited-sites-repository";

interface ExportData {
  version: string;
  exportedAt: string;
  dailyChecklist?: VisitedSites;
  applications?: Application[];
  applicationHistory?: ApplicationHistory[];
  jobSites?: JobHuntData;
}

export type UseDataManagementParams = {
  applicationStorageKey?: string;
  applicationHistoryStorageKey?: string;
  visitedSitesStorageKey?: string;
  jobSitesStorageKey?: string;
};

export function useDataManagement(params: UseDataManagementParams = {}) {
  const {
    applicationStorageKey = APPLICATIONS_STORAGE_KEY,
    applicationHistoryStorageKey = APPLICATIONS_HISTORY_STORAGE_KEY,
    visitedSitesStorageKey = VISITED_SITES_STORAGE_KEY,
    jobSitesStorageKey = JOB_SITES_STORAGE_KEY,
  } = params;

  const appRepo = useApplicationsRepository({
    storageKey: applicationStorageKey,
    historyStorageKey: applicationHistoryStorageKey,
  });

  const visitedRepo = useVisitedSitesRepository({
    storageKey: visitedSitesStorageKey,
    skipInitReset: true,
  });

  const jobSitesRepo = useJobSitesRepository({
    storageKey: jobSitesStorageKey,
  });

  const exportAllData = async (): Promise<void> => {
    const applications = await appRepo.getAll();
    const applicationHistory = await appRepo.getAllHistory();
    const dailyChecklist = await visitedRepo.serialize();
    const jobSites = jobSitesRepo.jobHuntData.value;

    const data: ExportData = {
      version: "1.2",
      exportedAt: getNow().toString(),
      ...(dailyChecklist.visited.length > 0 && { dailyChecklist }),
      ...(applications.length > 0 && { applications }),
      ...(applicationHistory.length > 0 && { applicationHistory }),
      ...(jobSites.sites.length > 0 && { jobSites }),
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

    if (!["1.1", "1.2"].includes(data.version)) {
      throw new Error(`Unsupported version: ${data.version}`);
    }

    if (data.applications !== undefined && !Array.isArray(data.applications)) {
      throw new Error("Invalid applications format");
    }

    if (
      data.applicationHistory !== undefined &&
      !Array.isArray(data.applicationHistory)
    ) {
      throw new Error("Invalid application history format");
    }

    if (
      data.dailyChecklist !== undefined &&
      (!data.dailyChecklist.date || !Array.isArray(data.dailyChecklist.visited))
    ) {
      throw new Error("Invalid dailyChecklist format");
    }

    if (
      data.jobSites !== undefined &&
      (!Array.isArray(data.jobSites.categories) ||
        !Array.isArray(data.jobSites.sites))
    ) {
      throw new Error("Invalid jobSites format");
    }

    return data;
  }

  const importAllData = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const data = parseImportData(text);

      if (data.dailyChecklist) {
        await visitedRepo.hydrate(data.dailyChecklist);
      }

      if (data.applications !== undefined) {
        await appRepo.setAll(data.applications, data.applicationHistory ?? []);
      }

      if (data.jobSites !== undefined) {
        await jobSitesRepo.setAll(data.jobSites);
      }

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
