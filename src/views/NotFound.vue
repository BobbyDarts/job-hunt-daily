<!-- // /src/views/NotFound.vue -->

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => router.push("/");
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-8">
    <div class="flex flex-col items-center gap-6 max-w-md w-full text-center">
      <div
        class="grid w-full rounded-xl border border-border bg-card p-5 text-left font-mono text-sm gap-y-1"
        style="grid-template-columns: 1.5rem 1fr; column-gap: 0.75rem"
      >
        <span class="text-right text-muted-foreground select-none">1</span>
        <span class="text-foreground whitespace-nowrap">
          <span class="text-blue-400">const</span>
          <span class="text-foreground"> page = </span>
          <span class="text-cyan-400">find</span>
          <span class="text-foreground">(</span>
          <span class="text-green-400">"{{ $route.path }}"</span>
          <span class="text-foreground">);</span>
        </span>
        <span class="text-right text-muted-foreground select-none">2</span>
        <span class="text-muted-foreground italic whitespace-nowrap"
          >// ❌ TypeError: page is undefined</span
        >
        <span class="text-right text-muted-foreground select-none">3</span>
        <span class="text-foreground whitespace-nowrap">
          <span class="text-blue-400">return</span>
          <span class="text-orange-400"> 404</span>
          <span class="text-foreground">;</span>
        </span>
      </div>

      <h1 class="text-2xl font-semibold text-foreground">Page Not Found</h1>
      <p class="text-sm text-muted-foreground -mt-3">
        Looks like this URL didn't make it past the ATS screening.
      </p>

      <button
        class="mt-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
        @click="goHome"
      >
        Back to Job Hunt
      </button>
    </div>
  </div>
</template>
