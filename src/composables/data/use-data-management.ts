// /src/composables/data/use-data-management.ts

import { toast } from "vue-sonner";

import { getNow } from "@/lib/time";
import { getApplicationsRepository } from "@/services/repositories/applications";
import { getJobSitesRepository } from "@/services/repositories/job-sites";
import { getVisitedSitesRepository } from "@/services/repositories/visited-sites";
import type {
  Application,
  ApplicationHistory,
  VisitedSiteHistory,
  VisitedSites,
  JobHuntData,
} from "@/types";

import { useApplications } from "./use-applications";
import { useJobSites } from "./use-job-sites";
import { useVisitedSites } from "./use-visited-sites";

interface ExportData {
  version: string;
  exportedAt: string;
  dailyChecklist?: VisitedSites;
  dailyChecklistHistory?: VisitedSiteHistory[];
  applications?: Application[];
  applicationHistory?: ApplicationHistory[];
  jobSites?: JobHuntData;
}

export type UseDataManagementParams = {
  visitedSitesStorageKey?: string;
  jobSitesStorageKey?: string;
};

export function useDataManagement(_params: UseDataManagementParams = {}) {
  const exportAllData = async (): Promise<void> => {
    const appsRepo = getApplicationsRepository();
    const jobSitesRepo = getJobSitesRepository();
    const visitedRepo = getVisitedSitesRepository();

    const applications = await appsRepo.getAll();
    const applicationHistory = await appsRepo.getHistoryAll();
    const { today: dailyChecklist, history: dailyChecklistHistory } =
      await visitedRepo.serialize();
    const jobSites: JobHuntData = {
      sites: await jobSitesRepo.getSites(),
      categories: await jobSitesRepo.getCategories(),
    };

    const data: ExportData = {
      version: "1.3",
      exportedAt: getNow().toString(),
      ...(dailyChecklist.visited.length > 0 && { dailyChecklist }),
      ...(dailyChecklistHistory.length > 0 && { dailyChecklistHistory }),
      ...(applications.length > 0 && { applications }),
      ...(applicationHistory.length > 0 && { applicationHistory }),
      ...((jobSites.sites.length > 0 || jobSites.categories.length > 0) && {
        jobSites,
      }),
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

    if (!["1.1", "1.2", "1.3"].includes(data.version)) {
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
      data.dailyChecklistHistory !== undefined &&
      !Array.isArray(data.dailyChecklistHistory)
    ) {
      throw new Error("Invalid dailyChecklistHistory format");
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
    const appsRepo = getApplicationsRepository();
    const jobSitesRepo = getJobSitesRepository();
    const visitedRepo = getVisitedSitesRepository();

    try {
      const text = await file.text();
      const data = parseImportData(text);

      if (data.dailyChecklist !== undefined) {
        await visitedRepo.hydrate({
          today: data.dailyChecklist,
          history: data.dailyChecklistHistory ?? [],
        });
      }

      if (data.applications !== undefined) {
        await appsRepo.setState({
          applications: data.applications ?? [],
          history: data.applicationHistory ?? [],
        });
      }

      if (data.jobSites !== undefined) {
        await jobSitesRepo.setState(data.jobSites);
      }

      await useJobSites().refresh();
      await useVisitedSites().refresh();
      await useApplications().refresh();
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
