// /src/main.ts

import { createApp } from "vue";

import App from "./App.vue";
import {
  useApplications,
  useJobSites,
  useVisitedSites,
} from "./composables/data";
import { useAppMode } from "./composables/ui/use-app-mode";
import router from "./router";
import { initApplicationsRepository } from "./services/repositories/applications/create-applications-repository";
import { initJobSitesRepository } from "./services/repositories/job-sites/create-job-sites-repository";
import { initVisitedSitesRepository } from "./services/repositories/visited-sites/create-visited-sites-repository";
import "./style.css";

async function bootstrap() {
  // Initialize repositories based on resolved mode
  initJobSitesRepository();
  initVisitedSitesRepository();
  initApplicationsRepository();

  // Bootstrap composables in order
  await useJobSites().init();
  await useVisitedSites().init();
  await useApplications().init();
}

async function main() {
  const { isSet } = useAppMode();

  // If no mode preference is set, mount the app and let the
  // router guard handle redirecting to /welcome
  if (isSet.value) {
    await bootstrap();
  }

  const app = createApp(App);
  app.use(router);
  app.mount("#app");
}

await main();
