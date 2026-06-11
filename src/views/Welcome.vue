<!-- /src/views/Welcome.vue -->

<script setup lang="ts">
import { Database, HardDrive, CheckCircle } from "@lucide/vue";
import { useRouter } from "vue-router";

import { Button } from "@/components/ui/button";
import {
  useApplications,
  useJobSites,
  useVisitedSites,
} from "@/composables/data";
import { useAppMode } from "@/composables/ui/use-app-mode";
import { initApplicationsRepository } from "@/services/repositories/applications";
import { initJobSitesRepository } from "@/services/repositories/job-sites";
import { initVisitedSitesRepository } from "@/services/repositories/visited-sites";

const router = useRouter();
const { setMode } = useAppMode();

async function chooseLocal() {
  setMode("local");
  initJobSitesRepository();
  initVisitedSitesRepository();
  initApplicationsRepository();
  await useJobSites().init();
  await useVisitedSites().init();
  await useApplications().init();
  router.push({ name: "Home" });
}

function chooseSupabase() {
  setMode("supabase");
  router.push({ name: "Login" });
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-2xl space-y-10 p-8">
      <div class="space-y-3 text-center">
        <h1 class="text-3xl font-bold tracking-tight">Job Hunt Daily</h1>
        <p class="text-muted-foreground max-w-md mx-auto">
          Stay consistent with your job search. Track sites, log applications,
          and follow your pipeline — all in one place.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Local mode -->
        <button
          class="group flex flex-col gap-4 p-6 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
          @click="chooseLocal"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors"
            >
              <HardDrive class="size-5" />
            </div>
            <span class="font-semibold">Local only</span>
          </div>
          <p class="text-sm text-muted-foreground">
            Data stays in this browser. No account needed. Best for
            single-device use.
          </p>
          <ul class="space-y-1.5 text-sm">
            <li class="flex items-center gap-2 text-muted-foreground">
              <CheckCircle class="size-3.5 text-green-500 shrink-0" />
              No sign-up required
            </li>
            <li class="flex items-center gap-2 text-muted-foreground">
              <CheckCircle class="size-3.5 text-green-500 shrink-0" />
              Works offline
            </li>
            <li class="flex items-center gap-2 text-muted-foreground">
              <CheckCircle class="size-3.5 text-green-500 shrink-0" />
              Export/import to back up
            </li>
          </ul>
          <Button class="w-full mt-auto" variant="outline">
            Get started
          </Button>
        </button>

        <!-- Supabase mode -->
        <button
          class="group flex flex-col gap-4 p-6 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
          @click="chooseSupabase"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors"
            >
              <Database class="size-5 text-blue-500" />
            </div>
            <span class="font-semibold">Supabase sync</span>
          </div>
          <p class="text-sm text-muted-foreground">
            Data syncs to the cloud. Access from any device. Requires a free
            account.
          </p>
          <ul class="space-y-1.5 text-sm">
            <li class="flex items-center gap-2 text-muted-foreground">
              <CheckCircle class="size-3.5 text-green-500 shrink-0" />
              Sync across devices
            </li>
            <li class="flex items-center gap-2 text-muted-foreground">
              <CheckCircle class="size-3.5 text-green-500 shrink-0" />
              Data backed up automatically
            </li>
            <li class="flex items-center gap-2 text-muted-foreground">
              <CheckCircle class="size-3.5 text-green-500 shrink-0" />
              Free Supabase account
            </li>
          </ul>
          <Button class="w-full mt-auto"> Sign in to continue </Button>
        </button>
      </div>
    </div>
  </div>
</template>
