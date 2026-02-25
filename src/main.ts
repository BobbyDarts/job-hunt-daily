// /src/main.ts

import { createApp } from "vue";

import * as appTypes from "@/types/applications";

import App from "./App.vue";
import router from "./router";
import "./style.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).appTypes = appTypes;

createApp(App).use(router).mount("#app");
