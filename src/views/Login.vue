<!-- /src/views/Login.vue -->

<script setup lang="ts">
import { HardDrive } from "@lucide/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useApplications,
  useJobSites,
  useVisitedSites,
} from "@/composables/data";
import { useAppMode } from "@/composables/ui/use-app-mode";
import { initApplicationsRepository } from "@/services/repositories/applications";
import { initJobSitesRepository } from "@/services/repositories/job-sites";
import { initVisitedSitesRepository } from "@/services/repositories/visited-sites";
import { signInWithEmail, signUpWithEmail } from "@/services/supabase/auth";

const router = useRouter();
const { clearMode } = useAppMode();

const email = ref("");
const password = ref("");
const mode = ref<"login" | "signup">("login");
const error = ref<string | null>(null);
const loading = ref(false);

async function handleSubmit() {
  error.value = null;
  loading.value = true;

  try {
    const fn = mode.value === "login" ? signInWithEmail : signUpWithEmail;
    const result = await fn(email.value, password.value);

    if (result.error) {
      error.value = result.error;
      return;
    }

    // Bootstrap Supabase repositories and composables
    initJobSitesRepository();
    initVisitedSitesRepository();
    initApplicationsRepository();
    await useJobSites().init();
    await useVisitedSites().init();
    await useApplications().init();

    router.push({ name: "Home" });
  } finally {
    loading.value = false;
  }
}

function goBack() {
  clearMode();
  router.push({ name: "Welcome" });
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-sm space-y-6 p-8">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold">Job Hunt Daily</h1>
        <p class="text-sm text-muted-foreground">
          {{
            mode === "login" ? "Sign in to your account" : "Create an account"
          }}
        </p>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
          />
        </div>

        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            @keydown.enter="handleSubmit"
          />
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <Button
          class="w-full"
          :disabled="loading || !email || !password"
          @click="handleSubmit"
        >
          {{
            loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"
          }}
        </Button>
      </div>

      <p class="text-center text-sm text-muted-foreground">
        {{
          mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"
        }}
        <button
          class="underline underline-offset-4 hover:text-foreground"
          @click="mode = mode === 'login' ? 'signup' : 'login'"
        >
          {{ mode === "login" ? "Sign up" : "Sign in" }}
        </button>
      </p>

      <div class="pt-2 border-t border-border">
        <Button
          variant="ghost"
          class="w-full text-muted-foreground"
          @click="goBack"
        >
          <HardDrive class="mr-2 size-4" />
          Use local mode instead
        </Button>
      </div>
    </div>
  </div>
</template>
