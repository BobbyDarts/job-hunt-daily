// /src/router/index.ts

import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import { useAppMode } from "@/composables/ui/use-app-mode";
import { getSession } from "@/services/supabase/auth";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/applications",
    name: "Applications",
    component: () => import("@/views/Applications.vue"),
  },
  {
    path: "/categories",
    name: "Categories",
    component: () => import("@/views/Categories.vue"),
  },
  {
    path: "/reports",
    name: "Reports",
    component: () => import("@/views/Reports.vue"),
  },
  {
    path: "/job-sites",
    name: "JobSites",
    component: () => import("@/views/JobSites.vue"),
  },
  {
    path: "/welcome",
    name: "Welcome",
    component: () => import("@/views/Welcome.vue"),
    meta: { public: true },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { public: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: { public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async to => {
  if (to.meta.public) return true;

  const { isSet, isSupabase } = useAppMode();

  // No mode chosen yet — send to welcome
  if (!isSet.value) {
    return { name: "Welcome" };
  }

  // Supabase mode — require session
  if (isSupabase.value) {
    const session = await getSession();
    if (!session) {
      return { name: "Login" };
    }
  }

  return true;
});

export default router;
